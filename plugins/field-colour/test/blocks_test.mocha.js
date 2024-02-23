/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import * as Blockly from 'blockly';

import {javascriptGenerator} from 'blockly/javascript';
import {dartGenerator} from 'blockly/dart';
import {phpGenerator} from 'blockly/php';
import {pythonGenerator} from 'blockly/python';
import {luaGenerator} from 'blockly/lua';
import {installAllBlocks} from '../src/index';
import {assert} from 'chai';

const blockJson = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'colour_picker',
        id: '+g[iA}db.}w:CQV#k-p@',
        x: 13,
        y: 13,
        fields: {
          COLOUR: '#ff0000',
        },
      },
      {
        type: 'colour_random',
        id: 'b^8w0?$T=nknkxAJ-k/,',
        x: 13,
        y: 113,
      },
      {
        type: 'colour_rgb',
        id: '5So^sE~[0ZBX{rh6_xpS',
        x: 13,
        y: 263,
        inputs: {
          RED: {
            shadow: {
              type: 'math_number',
              id: '/$GQXp~[}?aF~Y/;IwXE',
              fields: {
                NUM: 0,
              },
            },
          },
          GREEN: {
            shadow: {
              type: 'math_number',
              id: 'Zu8R8Q?Kv#eS;[z}wiwv',
              fields: {
                NUM: 1,
              },
            },
          },
          BLUE: {
            shadow: {
              type: 'math_number',
              id: '4#}%st2@J5.1PUKmrPun',
              fields: {
                NUM: 20,
              },
            },
          },
        },
      },
      {
        type: 'colour_blend',
        id: 'rRW^zDApg:3fRbX+(gY8',
        x: 13,
        y: 363,
        inputs: {
          COLOUR1: {
            shadow: {
              type: 'colour_picker',
              id: 'BaG$fQn,_f5pw(l6p$Xc',
              fields: {
                COLOUR: '#ff0000',
              },
            },
          },
          COLOUR2: {
            shadow: {
              type: 'colour_picker',
              id: '~pU~8+2B,l6Z?hAGDZB$',
              fields: {
                COLOUR: '#3333ff',
              },
            },
          },
          RATIO: {
            shadow: {
              type: 'math_number',
              id: ';5A^q?k8F:$u%n((AY`^',
              fields: {
                NUM: 0.5,
              },
            },
          },
        },
      },
      {
        type: 'colour_picker',
        id: ';CgIP)-U]0;%NC#ir7c}',
        x: 13,
        y: 63,
        fields: {
          COLOUR: '#3333ff',
        },
      },
      {
        type: 'colour_rgb',
        id: 'VwLow%0*OyQY!dTRDPau',
        x: 13,
        y: 163,
        inputs: {
          RED: {
            shadow: {
              type: 'math_number',
              id: 'kRmNRDkkfK%vji-|s/Z!',
              fields: {
                NUM: 100,
              },
            },
          },
          GREEN: {
            shadow: {
              type: 'math_number',
              id: '$~6Sa+y$EC=gSI=JDZ_5',
              fields: {
                NUM: 50,
              },
            },
          },
          BLUE: {
            shadow: {
              type: 'math_number',
              id: '=KN[19-TRP#;BU9;u((8',
              fields: {
                NUM: 0,
              },
            },
          },
        },
      },
      {
        type: 'colour_blend',
        id: 'Q}mY1lOEXCle2MtW%Oc/',
        x: 13,
        y: 463,
        inputs: {
          COLOUR1: {
            shadow: {
              type: 'colour_picker',
              id: 'fm~AH|r,z03k|+SNT%95',
              fields: {
                COLOUR: '#000000',
              },
            },
          },
          COLOUR2: {
            shadow: {
              type: 'colour_picker',
              id: 'emM{3eME*okoN3lFMsWu',
              fields: {
                COLOUR: '#ffffff',
              },
            },
          },
          RATIO: {
            shadow: {
              type: 'math_number',
              id: 'V={|jm2-O9i}9NPE5s)Z',
              fields: {
                NUM: 0.3,
              },
            },
          },
        },
      },
    ],
  },
};

/**
 * Uninstall old blocks and generators, since they come pre-installed
 * with Blockly.
 * TODO(2194): Delete this function and calls to it.
 */
function uninstallBlocks() {
  delete Blockly.Blocks['colour_blend'];
  delete Blockly.Blocks['colour_rgb'];
  delete Blockly.Blocks['colour_random'];
  delete Blockly.Blocks['colour_picker'];

  const blockNames = [
    'colour_blend',
    'colour_rgb',
    'colour_random',
    'colour_picker',
  ];
  blockNames.forEach((name) => {
    delete javascriptGenerator.forBlock[name];
    delete dartGenerator.forBlock[name];
    delete luaGenerator.forBlock[name];
    delete pythonGenerator.forBlock[name];
    delete phpGenerator.forBlock[name];
  });
}

/**
 * Assert that the generated code matches the golden code for the specified
 * language.
 * @param {string} suffix The suffix of the golden file.
 * @param {string} generated The generated code to compare against the
 *     golden file.
 */
function checkResult(suffix, generated) {
  const fileName = `test/golden/golden.${suffix}`;
  const goldenContents = fs.readFileSync(fileName);
  // Normalize the line feeds.
  const normalized = goldenContents.toString().replace(/(?:\r\n|\r|\n)/g, '\n');
  assert.equal(generated, normalized);
}

suite('Colour Block Generators', function () {
  suiteSetup(function () {
    uninstallBlocks();
    installAllBlocks({
      javascript: javascriptGenerator,
      dart: dartGenerator,
      lua: luaGenerator,
      python: pythonGenerator,
      php: phpGenerator,
    });
  });
  setup(function () {
    this.workspace = new Blockly.Workspace();
    Blockly.serialization.workspaces.load(blockJson, this.workspace);
  });
  test('JavaScript', function () {
    const generated = javascriptGenerator.workspaceToCode(this.workspace);
    checkResult('js', generated);
  });
  test('Dart', function () {
    const generated = dartGenerator.workspaceToCode(this.workspace);
    checkResult('dart', generated);
  });
  test('Lua', function () {
    const generated = luaGenerator.workspaceToCode(this.workspace);
    checkResult('lua', generated);
  });
  test('Python', function () {
    const generated = pythonGenerator.workspaceToCode(this.workspace);
    checkResult('py', generated);
  });
  test('PHP', function () {
    const generated = phpGenerator.workspaceToCode(this.workspace);
    checkResult('php', generated);
  });
  teardown(function () {
    this.workspace.dispose();
  });
  suiteTeardown(function () {
    uninstallBlocks();
  });
});
