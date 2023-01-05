/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Defines inline_text_join, which is an alternative
 * version of the text_join block that specifies inline input mode and
 * adds dummy inputs between value inputs.
 */

import * as Blockly from 'blockly/core';

declare interface TextJoinBlock extends Blockly.Block {
  /* eslint-disable @typescript-eslint/naming-convention */
  itemCount_: number;
  updateShape_(): void;
  newQuote_(open: boolean): Blockly.FieldImage;
  /* eslint-enable @typescript-eslint/naming-convention */
}

// Define a new block that is like the built-in block, but with an extension
// that enables inline input mode and overrides the updateShape_ method to
// insert dummy inputs between value inputs.
Blockly.defineBlocksWithJsonArray([
  {
    'type': 'inline_text_join',
    'message0': '',
    'output': 'String',
    'style': 'text_blocks',
    'helpUrl': '%{BKY_TEXT_JOIN_HELPURL}',
    'tooltip': '%{BKY_TEXT_JOIN_TOOLTIP}',
    'mutator': 'text_join_mutator',
    'extensions': [
      'inline_text_join_extension',
    ],
  },
]);

// An extension that enables inline input mode and overrides the updateShape_
// method to insert dummy inputs between value inputs.
const inlineTextJoinExtension = function(this: TextJoinBlock) {
  this.inputsInline = true;

  this.updateShape_ = function(this: TextJoinBlock) {
    if (this.itemCount_ && this.getInput('EMPTY')) {
      this.removeInput('EMPTY');
    } else if (!this.itemCount_ && !this.getInput('EMPTY')) {
      this.appendDummyInput('EMPTY')
          .appendField(this.newQuote_(true))
          .appendField(this.newQuote_(false));
    }

    // Add new inputs.
    for (let i = 0; i < this.itemCount_; i++) {
      // If the block was already rendered with value inputs but not dummy
      // inputs, delete and recreate the inputs to ensure the dummy inputs
      // are properly inserted between the value inputs.
      if (this.getInput('ADD' + i) && !this.getInput('DUMMY' + i)) {
        this.removeInput('ADD' + i);
      }

      if (!this.getInput('ADD' + i)) {
        const dummy = this.appendDummyInput('DUMMY' + i);
        if (i === 0) {
          dummy.appendField(Blockly.Msg['TEXT_JOIN_TITLE_CREATEWITH']);
        }
        this.appendValueInput('ADD' + i).setAlign(Blockly.Input.Align.LEFT);
      }
    }

    // Remove deleted inputs.
    for (let i = this.itemCount_; this.getInput('ADD' + i); i++) {
      this.removeInput('DUMMY' + i);
      this.removeInput('ADD' + i);
    }
  };
  this.updateShape_();
};

Blockly.Extensions.register(
    'inline_text_join_extension', inlineTextJoinExtension);
