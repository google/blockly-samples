/* eslint-disable guard-for-in */
/* eslint-disable jsdoc/require-returns */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript for Blockly's DevSite demo.
 */
'use strict';

let language = 'en'; // Default to English.

// Run this setup code once while still rendering the head.
(function () {
  const m = location.search.match(/[?&]hl=([^&]+)($|&)/);
  if (m) {
    if (LANGUAGE_NAME[m[1]]) {
      language = m[1];
    }
  }
  // Load Blockly's language strings.
  document.write(
    '<script src="./node_modules/blockly/msg/' + language + '.js"></script>\n',
  );
})();

/**
 * Initialize the page once everything is loaded.
 */
function init() {
  // Sort languages alphabetically.
  const languages = [];
  for (const lang in LANGUAGE_NAME) {
    languages.push([LANGUAGE_NAME[lang], lang]);
  }
  /**
   *
   * @param a
   * @param b
   */
  function comp_(a, b) {
    // Sort based on first argument ('English', 'Русский', '简体字', etc).
    if (a[0] > b[0]) return 1;
    if (a[0] < b[0]) return -1;
    return 0;
  }
  languages.sort(comp_);
  // Populate the language selection dropdown.
  const languageMenu = document.getElementById('languageDropdown');
  for (let i = 0; i < languages.length; i++) {
    const tuple = languages[i];
    const lang = tuple[tuple.length - 1];
    const option = new Option(tuple[0], lang);
    if (lang === language) {
      option.selected = true;
    }
    languageMenu.options.add(option);
  }

  // Changing languages involves reloading the page.  To not lose the blocks,
  // they were stored in sessionStorage.  Here we retrieve that data.
  let loadOnce = null;
  try {
    loadOnce = window.sessionStorage.getItem('loadOnceBlocks');
    window.sessionStorage.removeItem('loadOnceBlocks');
    loadOnce = JSON.parse(loadOnce);
  } catch (e) {
    // Storage can be flakey.
    console.log(e);
  }

  // Inject localized category names.
  toolboxJson['contents'].forEach(function (part) {
    part.name = getMsg(part.name);
  });

  // Inject default variable name.
  // https://github.com/google/blockly/issues/5238
  let toolboxString = JSON.stringify(toolboxJson);
  toolboxString = toolboxString.replace(
    /%\{BKY_VARIABLES_DEFAULT_NAME\}/g,
    Blockly.Msg.VARIABLES_DEFAULT_NAME,
  );
  const toolbox = JSON.parse(toolboxString);

  // Inject Blockly.
  const workspace = Blockly.inject('blocklyDiv', {
    media: './node_modules/blockly/media/',
    toolbox,
    rtl: LANGUAGE_RTL.includes(language),
    renderer: 'thrasos',
    zoom: {
      maxScale: 1.8,
      minScale: 0.6,
      scaleSpeed: 1.2,
      pinch: true,
    },
    trashcan: false,
    theme: Blockly.Theme.defineTheme('modest', {
      fontStyle: {
        family: 'Google Sans',
        weight: 'bold',
        size: 16,
      },
      blockStyles: {
        logic_blocks: {
          colourPrimary: '#D1C4E9',
          colourSecondary: '#EDE7F6',
          colorTertiary: '#B39DDB',
        },
        loop_blocks: {
          colourPrimary: '#A5D6A7',
          colourSecondary: '#E8F5E9',
          colorTertiary: '#66BB6A',
        },
        math_blocks: {
          colourPrimary: '#2196F3',
          colourSecondary: '#1E88E5',
          colorTertiary: '#0D47A1',
        },
        text_blocks: {
          colourPrimary: '#FFCA28',
          colourSecondary: '#FFF8E1',
          colorTertiary: '#FF8F00',
        },
        list_blocks: {
          colourPrimary: '#4DB6AC',
          colourSecondary: '#B2DFDB',
          colorTertiary: '#009688',
        },
        variable_blocks: {
          colourPrimary: '#EF9A9A',
          colourSecondary: '#FFEBEE',
          colorTertiary: '#EF5350',
        },
        variable_dynamic_blocks: {
          colourPrimary: '#EF9A9A',
          colourSecondary: '#FFEBEE',
          colorTertiary: '#EF5350',
        },
        procedure_blocks: {
          colourPrimary: '#D7CCC8',
          colourSecondary: '#EFEBE9',
          colorTertiary: '#BCAAA4',
        },
      },
    }),
  });
  Blockly.serialization.workspaces.load(loadOnce || startBlocks, workspace);
  workspace.addChangeListener(regenerate);
  workspace.zoomToFit();
}

/**
 * Look up a category name in the current (human) language.
 * @param name
 */
function getMsg(name) {
  let msg = msgs['en'][name];
  try {
    msg = msgs[language][name] || msg;
  } catch (_e) {
    // Stay with english default.
  }
  return msg;
}

/**
 * Change the (human) language.  Reloads the page.
 */
function languageChange() {
  // Store the blocks in sessionStorage for the duration of the reload.
  const text = JSON.stringify(
    Blockly.serialization.workspaces.save(Blockly.getMainWorkspace()),
  );
  try {
    window.sessionStorage.setItem('loadOnceBlocks', text);
  } catch (e) {
    // Storage can be flakey.
    console.log(e);
  }

  const newLang = document.getElementById('languageDropdown').value;
  window.location.search = '?hl=' + encodeURIComponent(newLang);
}

/**
 * Regenerate the blocks into a (computer) language.
 * Called when the blocks change, or when the target language changes.
 * @param _e
 */
function regenerate(_e) {
  if (Blockly.getMainWorkspace().isDragging()) {
    return; // Don't update code mid-drag.
  }
  const generateLang = document.getElementById('generateDropdown').value;
  const generator = window[generateLang][`${generateLang}Generator`];
  const playButton = document.getElementById('playButton');
  playButton.style.display = generateLang === 'javascript' ? 'block' : 'none';
  const code = generator.workspaceToCode(Blockly.getMainWorkspace());
  const codeHolder = document.getElementById('codeHolder');
  codeHolder.innerHTML = ''; // Delete old code.
  codeHolder.classList.remove('prettyprinted');
  codeHolder.appendChild(document.createTextNode(code));
  if (typeof PR === 'object') {
    PR.prettyPrint();
  }
}

/**
 * Generate JavaScript from the blocks, then execute it using JS-Interpreter.
 */
function execute() {
  const initFunc = function (interpreter, globalObject) {
    const alertWrapper = function alert(text) {
      return window.alert(arguments.length ? text : '');
    };
    interpreter.setProperty(
      globalObject,
      'alert',
      interpreter.createNativeFunction(alertWrapper),
    );

    const promptWrapper = function prompt(text, defaultValue) {
      return window.prompt(
        arguments.length > 0 ? text : '',
        arguments.length > 1 ? defaultValue : '',
      );
    };
    interpreter.setProperty(
      globalObject,
      'prompt',
      interpreter.createNativeFunction(promptWrapper),
    );
  };

  const code = javascript.javascriptGenerator.workspaceToCode(
    Blockly.getMainWorkspace(),
  );
  const myInterpreter = new Interpreter(code, initFunc);
  let stepsAllowed = 10000;
  while (myInterpreter.step() && stepsAllowed) {
    stepsAllowed--;
  }
  if (!stepsAllowed) {
    throw EvalError('Infinite loop.');
  }
}

/**
 * Initial blocks when loading page.
 */
const startBlocks = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'variables_set',
        x: 10,
        y: 10,
        fields: {
          VAR: {id: 'Count'},
        },
        inputs: {
          VALUE: {
            block: {
              type: 'math_number',
              fields: {NUM: 1},
            },
          },
        },
        next: {
          block: {
            type: 'controls_whileUntil',
            fields: {MODE: 'WHILE'},
            inputs: {
              BOOL: {
                block: {
                  type: 'logic_compare',
                  fields: {OP: 'LTE'},
                  inputs: {
                    A: {
                      block: {
                        type: 'variables_get',
                        fields: {
                          VAR: {id: 'Count'},
                        },
                      },
                    },
                    B: {
                      block: {
                        type: 'math_number',
                        fields: {NUM: 3},
                      },
                    },
                  },
                },
              },
              DO: {
                block: {
                  type: 'text_print',
                  inputs: {
                    TEXT: {
                      block: {
                        type: 'text',
                        fields: {TEXT: 'Hello World!'},
                      },
                    },
                  },
                  next: {
                    block: {
                      type: 'variables_set',
                      fields: {
                        VAR: {id: 'Count'},
                      },
                      inputs: {
                        VALUE: {
                          block: {
                            type: 'math_arithmetic',
                            fields: {OP: 'ADD'},
                            inputs: {
                              A: {
                                block: {
                                  type: 'variables_get',
                                  fields: {
                                    VAR: {id: 'Count'},
                                  },
                                },
                              },
                              B: {
                                block: {
                                  type: 'math_number',
                                  fields: {NUM: 1},
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ],
  },
  variables: [
    {
      name: 'Count',
      id: 'Count',
    },
  ],
};
