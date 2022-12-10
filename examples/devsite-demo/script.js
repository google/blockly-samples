/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript for Blockly's DevSite demo.
 */
'use strict';


/**
 * Lookup for names of languages.  Keys should be in ISO 639 format.
 */
const LANGUAGE_NAME = {
//  'ace': 'بهسا اچيه',  // RTL
//  'af': 'Afrikaans',
  'am': 'አማርኛ',
  'ar': 'العربية',  // RTL
//  'az': 'Azərbaycanca',
  'be': 'беларускі',
  'be-tarask': 'Taraškievica',
  'bg': 'български език',
  'bn': 'বাংলা',
  'br': 'Brezhoneg',
  'ca': 'Català',
//  'cdo': '閩東語',
  'cs': 'Česky',
  'da': 'Dansk',
  'de': 'Deutsch',
  'el': 'Ελληνικά',
  'en': 'English',
  'eo': 'Esperanto',
  'es': 'Español',
  'eu': 'Euskara',
  'fa': 'فارسی',  // RTL
  'fi': 'Suomi',
  'fo': 'Føroyskt',
  'fr': 'Français',
//  'frr': 'Frasch',
  'gl': 'Galego',
  'ha': 'Hausa',
//  'hak': '客家話',
  'he': 'עברית',  // RTL
  'hi': 'हिन्दी',
  'hr': 'Hrvatski',
//  'hrx': 'Hunsrik',
  'hu': 'Magyar',
  'hy': 'հայերէն',
  'ia': 'Interlingua',
  'id': 'Bahasa Indonesia',
  'ig': 'Asụsụ Igbo',
  'is': 'Íslenska',
  'it': 'Italiano',
  'ja': '日本語',
//  'ka': 'ქართული',
  'kab': 'Taqbaylit',
//  'km': 'ភាសាខ្មែរ',
  'kn': 'ಕನ್ನಡ',
  'ko': '한국어',
//  'ksh': 'Ripoarėsch',
//  'ky': 'Кыргызча',
//  'la': 'Latine',
//  'lb': 'Lëtzebuergesch',
  'lt': 'Lietuvių',
  'lv': 'Latviešu',
//  'mg': 'Malagasy',
//  'ml': 'മലയാളം',
//  'mk': 'Македонски',
//  'mr': 'मराठी',
  'ms': 'Bahasa Melayu',
  'my': 'မြန်မာစာ',
//  'mzn': 'مازِرونی',  // RTL
  'nb': 'Norsk (bokmål)',
  'nl': 'Nederlands, Vlaams',
//  'oc': 'Lenga d\'òc',
//  'pa': 'पंजाबी',
  'pl': 'Polski',
  'pms': 'Piemontèis',
//  'ps': 'پښتو',  // RTL
  'pt': 'Português',
  'pt-br': 'Português Brasileiro',
  'ro': 'Română',
  'ru': 'Русский',
  'sc': 'Sardu',
//  'sco': 'Scots',
//  'si': 'සිංහල',
  'sk': 'Slovenčina',
  'sl': 'Slovenščina',
//  'smn': 'Anarâškielâ',
  'sq': 'Shqip',
  'sr': 'Српски',
  'sr-latn': 'Srpski',
  'sv': 'Svenska',
//  'sw': 'Kishwahili',
//  'ta': 'தமிழ்',
  'th': 'ภาษาไทย',
  'ti': 'ትግርኛ',
//  'tl': 'Tagalog',
  'tr': 'Türkçe',
  'uk': 'Українська',
  'ur': 'اُردُو‬',  // RTL
  'vi': 'Tiếng Việt',
  'yo': 'Èdè Yorùbá',
  'zh-hans': '简体中文',
  'zh-hant': '正體中文',
};

/**
 * List of RTL languages.
 */
const LANGUAGE_RTL = [/*'ace',*/ 'ar', 'fa', 'he', /*'mzn', 'ps',*/ 'ur'];


let language = 'en';  // Default to English.

// Run this setup code once while still rendering the head.
(function() {
  const m = location.search.match(/[?&]hl=([^&]+)($|&)/);
  if (m) {
    if (LANGUAGE_NAME[m[1]]) {
      language = m[1];
    }
  }
  // Load Blockly's language strings.
  document.write('<script src="./node_modules/blockly/msg/' + language + '.js"></script>\n');
})();

function init() {
  // Sort languages alphabetically.
  const languages = [];
  for (const lang in LANGUAGE_NAME) {
    languages.push([LANGUAGE_NAME[lang], lang]);
  }
  function comp_(a, b) {
    // Sort based on first argument ('English', 'Русский', '简体字', etc).
    if (a[0] > b[0]) return 1;
    if (a[0] < b[0]) return -1;
    return 0;
  };
  languages.sort(comp_);
  // Populate the language selection dropdown.
  var languageMenu = document.getElementById('languageDropdown');
  for (let i = 0; i < languages.length; i++) {
    var tuple = languages[i];
    var lang = tuple[tuple.length - 1];
    var option = new Option(tuple[0], lang);
    if (lang === language) {
      option.selected = true;
    }
    languageMenu.options.add(option);
  }

  let loadOnce = null;
  try {
    loadOnce = window.sessionStorage.getItem('loadOnceBlocks');
    window.sessionStorage.removeItem('loadOnceBlocks');
    loadOnce = JSON.parse(loadOnce);
  } catch(e) {
    // Storage can be flakey.
    console.log(e);
  }

  // Inject localized category names.
  toolboxJson['contents'][0].name = getMsg('Logic');
  toolboxJson['contents'][1].name = getMsg('Loops');
  toolboxJson['contents'][2].name = getMsg('Math');
  toolboxJson['contents'][3].name = getMsg('Text');
  toolboxJson['contents'][4].name = getMsg('Lists');
  toolboxJson['contents'][5].name = getMsg('Colour');
  // Separator.
  toolboxJson['contents'][7].name = getMsg('Variables');
  toolboxJson['contents'][8].name = getMsg('Procedures');

  // Inject default variable name.
  let toolboxString = JSON.stringify(toolboxJson);
  toolboxString = toolboxString.replace(/%\{BKY_VARIABLES_DEFAULT_NAME\}/g,
      Blockly.Msg.VARIABLES_DEFAULT_NAME);
  toolboxJson = JSON.parse(toolboxString);

  const workspace = Blockly.inject('blocklyDiv',
      {
        toolbox: toolboxJson,
        rtl: LANGUAGE_RTL.includes(language),
      });
  Blockly.serialization.workspaces.load(loadOnce || startBlocks, workspace);
  workspace.addChangeListener(regenerate);
}

function getMsg(name) {
  let msg = msgs['en'][name];
  try {
    msg = msgs[language][name];
  } catch (_e) {
    // Stay with english default.
  }
  return msg;
}

function languageChange() {
  // Store the blocks for the duration of the reload.
  const text = JSON.stringify(
      Blockly.serialization.workspaces.save(Blockly.getMainWorkspace()));
  try {
    window.sessionStorage.setItem('loadOnceBlocks', text);
  } catch(e) {
    // Storage can be flakey.
    console.log(e);
  }

  const newLang = document.getElementById('languageDropdown').value;
  window.location.search = '?hl=' + encodeURIComponent(newLang);
}

function regenerate(_e) {
  const generateDropdown = document.getElementById('generateDropdown');
  const generator = Blockly[generateDropdown.value];
  const code = generator.workspaceToCode(Blockly.getMainWorkspace());
  const codeHolder = document.getElementById('codeHolder');
  codeHolder.innerHTML = '';  // Delete old code.
  codeHolder.classList.remove('prettyprinted');
  codeHolder.appendChild(document.createTextNode(code));
  if (typeof PR === 'object') {
    PR.prettyPrint();
  }
}

function execute() {
  const initFunc = function(interpreter, globalObject) {
    const alertWrapper = function alert(text) {
      return window.alert(arguments.length ? text : '');
    };
    interpreter.setProperty(globalObject, 'alert',
        interpreter.createNativeFunction(alertWrapper));

    const promptWrapper = function prompt(text, defaultValue) {
      return window.prompt(arguments.length > 0 ? text : '',
                            arguments.length > 1 ? defaultValue : '');
    };
    interpreter.setProperty(globalObject, 'prompt',
        interpreter.createNativeFunction(promptWrapper));
  };

  const code = Blockly.JavaScript.workspaceToCode(Blockly.getMainWorkspace());
  const myInterpreter = new Interpreter(code, initFunc);
  let stepsAllowed = 10000;
  while (myInterpreter.step() && stepsAllowed) {
    stepsAllowed--;
  }
  if (!stepsAllowed) {
    throw EvalError('Infinite loop.');
  }
}

const startBlocks = {
  "blocks": {
    "languageVersion": 0,
    "blocks": [
      {
        "type": "variables_set",
        "x": 10,
        "y": 10,
        "fields": {
          "VAR": {"id": "Count"}
        },
        "inputs": {
          "VALUE": {
            "block": {
              "type": "math_number",
              "fields": {"NUM": 1}
            }
          }
        },
        "next": {
          "block": {
            "type": "controls_whileUntil",
            "fields": {"MODE": "WHILE"},
            "inputs": {
              "BOOL": {
                "block": {
                  "type": "logic_compare",
                  "fields": {"OP": "LTE"},
                  "inputs": {
                    "A": {
                      "block": {
                        "type": "variables_get",
                        "fields": {
                          "VAR": {"id": "Count"}
                        }
                      }
                    },
                    "B": {
                      "block": {
                        "type": "math_number",
                        "fields": {"NUM": 3}
                      }
                    }
                  }
                }
              },
              "DO": {
                "block": {
                  "type": "text_print",
                  "inputs": {
                    "TEXT": {
                      "block": {
                        "type": "text",
                        "fields": {"TEXT": "Hello World!"}
                      }
                    }
                  },
                  "next": {
                    "block": {
                      "type": "variables_set",
                      "fields": {
                        "VAR": {"id": "Count"}
                      },
                      "inputs": {
                        "VALUE": {
                          "block": {
                            "type": "math_arithmetic",
                            "fields": {"OP": "ADD"},
                            "inputs": {
                              "A": {
                                "block": {
                                  "type": "variables_get",
                                  "fields": {
                                    "VAR": {"id": "Count"}
                                  }
                                }
                              },
                              "B": {
                                "block": {
                                  "type": "math_number",
                                  "fields": {"NUM": 1}
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    ]
  },
  "variables": [
    {
      "name": "Count",
      "id": "Count"
    }
  ]
};
