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
const inputNameCheck = function(referenceBlock: Blockly.Block) {
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
};

// Inputs that should take a "type" input for connection checks
const inputsWithTypeInputs = new Set(['input_value', 'input_statement']);

const inputTypeValidator = function(value: string): string {
  if (inputsWithTypeInputs.has(value)) {
    if (!this.getInput('TYPE')) {
      this.appendValueInput('TYPE')
          .setCheck(null)
          .setAlign(Blockly.inputs.Align.RIGHT)
          .appendField('type');
    }
  } else {
    if (this.getInput('TYPE')) {
      this.removeInput('TYPE');
    }
  }

  return value;
};

export const input = {
  init: function(this: Blockly.Block) {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['value', 'input_value'],
          ['statement', 'input_statement'],
          ['dummy', 'input_dummy'],
          ['end-row', 'input_end_row'],
        ], inputTypeValidator.bind(this)), 'INPUT_TYPE')
        .appendField('input')
        .appendField(new Blockly.FieldTextInput('NAME'), 'INPUTNAME');
    this.appendStatementInput('FIELDS')
        .setCheck(null)
        .appendField('fields')
        .appendField(new Blockly.FieldDropdown([
          ['left', 'LEFT'],
          ['right', 'RIGHT'],
          ['centre', 'CENTRE'],
        ]), 'ALIGNMENT');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip('');
    this.setHelpUrl('');
  },
  onchange: function() {
    inputNameCheck(this);
  },
};