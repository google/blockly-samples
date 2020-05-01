/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Date input field test.
 * @author samelh@google.com (Sam El-Husseini)
 */

Blockly.defineBlocksWithJsonArray([
  {
    'type': 'test_fields_date',
    'message0': 'date: %1',
    'args0': [
      {
        'type': 'field_date',
        'name': 'FIELDNAME',
        'date': '2020-02-20',
        'alt':
        {
          'type': 'field_label',
          'text': 'NO DATE FIELD',
        },
      },
    ],
    'style': 'math_blocks',
  }]);

document.addEventListener('DOMContentLoaded', function() {
  Blockly.inject('blocklyDiv',
      {
        toolbox: document.getElementById('blocklyToolbox'),
      });
});
