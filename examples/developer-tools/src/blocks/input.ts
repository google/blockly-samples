/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';


/**
 * Check to see if more than one input has this name.
 * Highly inefficient (On^2), but n is small.
 * @param referenceBlock Block to check.
 */
function inputNameCheck(referenceBlock: Blockly.Block) {
  if (!referenceBlock.workspace) {
    // Block has been deleted.
    return;
  }
  const name = referenceBlock.getFieldValue('INPUTNAME').toLowerCase();
  let count = 0;
  const blocks = referenceBlock.workspace.getAllBlocks(false);
  for (const block of blocks) {
    const otherName = block.getFieldValue('INPUTNAME');
    if (block.isEnabled() && !block.getInheritedDisabled() &&
        otherName && otherName.toLowerCase() === name) {
      count++;
    }
  }
  const msg = (count > 1) ?
      'There are ' + count + ' input blocks\n with this name.' : null;
  referenceBlock.setWarningText(msg);
}

export const input = {
  init: function() {
    this.jsonInit({
      'type': 'block_type',
      'message0': '%1 input %2 %3 fields %4 %5 type %6',
      'args0': [
        {
          'type': 'field_dropdown',
          'name': 'INPUT_TYPE',
          'options': [
            [
              'value',
              'input_value',
            ],
            [
              'statement',
              'input_statement',
            ],
            [
              'dummy',
              'input_dummy',
            ],
            [
              'end-row',
              'input_end_row',
            ],
          ],
        },
        {
          'type': 'field_input',
          'name': 'INPUTNAME',
          'text': 'NAME',
        },
        {
          'type': 'input_dummy',
        },
        {
          'type': 'field_dropdown',
          'name': 'ALIGNMENT',
          'options': [
            [
              'left',
              'LEFT',
            ],
            [
              'right',
              'RIGHT',
            ],
            [
              'centre',
              'CENTRE',
            ],
          ],
        },
        {
          'type': 'input_statement',
          'name': 'FIELDS',
          'check': 'Field',
        },
        {
          'type': 'input_value',
          'name': 'TYPE',
          'align': 'RIGHT',
          'check': ['Type', 'TypeArray'],
        },
      ],
      'previousStatement': 'Input',
      'nextStatement': 'Input',
      'colour': 210,
      'tooltip': 'A value socket for horizontal connections.',
      'helpUrl': 'https://www.youtube.com/watch?v=s2_xaEvcVI0#t=71',
    });
  },
  onchange: function() {
    inputNameCheck(this);
  },
};
