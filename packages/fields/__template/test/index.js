/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Field test.
 */

import * as Blockly from 'blockly';
import '../src/index.js';

Blockly.defineBlocksWithJsonArray([
  {
    'type': 'test_field',
    'message0': 'test: %1',
    'args0': [
      {
        'type': 'field_template',
        'name': 'FIELDNAME',
        'value': 0, // TODO: change default value
        'alt':
        {
          'type': 'field_label',
          'text': 'NO_SLIDER_FIELD',
        },
      },
    ],
    'style': 'math_blocks',
  }]);

/**
 * DOM loaded.
 */
function start() {
  Blockly.inject('blocklyDiv', {
    toolbox:
      `<xml xmlns="https://developers.google.com/blockly/xml">
      <block type='test_field'></block>
    </xml>`,
  });
}

document.addEventListener('DOMContentLoaded', start);
