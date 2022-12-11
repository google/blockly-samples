/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Defines inline_lists_create_with, which is an alternative
 * version of the lists_create_with block that specifies inline input mode and
 * adds dummy inputs between value inputs.
 */

import * as Blockly from 'blockly/core';

declare interface ListBlock extends Blockly.Block {
  /* eslint-disable @typescript-eslint/naming-convention */
  itemCount_: number;
  /* eslint-enable @typescript-eslint/naming-convention */
}

const builtInListBlock = Blockly.Blocks['lists_create_with'];

// Define a new block that is based on the built-in block, but overriding the
// init and updateShape_ methods to enabline inline input mode and insert dummy
// inputs between value inputs.
Blockly.Blocks['inline_lists_create_with'] = Object.assign(
    {},
    builtInListBlock,
    {
      init: function(this: ListBlock) {
        builtInListBlock.init.apply(this);
        this.inputsInline = true;
      },

      /* eslint-disable @typescript-eslint/naming-convention */
      updateShape_: function(this: ListBlock) {
        /* eslint-enable @typescript-eslint/naming-convention */
        if (this.itemCount_ && this.getInput('EMPTY')) {
          this.removeInput('EMPTY');
        } else if (!this.itemCount_ && !this.getInput('EMPTY')) {
          this.appendDummyInput('EMPTY').appendField(
              Blockly.Msg['LISTS_CREATE_EMPTY_TITLE']);
        }

        // Add new inputs.
        for (let i = 0; i < this.itemCount_; i++) {
          if (!this.getInput('ADD' + i)) {
            const dummy = this.appendDummyInput('DUMMY' + i);
            if (i === 0) {
              dummy.appendField(Blockly.Msg['LISTS_CREATE_WITH_INPUT_WITH']);
            }
            this.appendValueInput('ADD' + i).setAlign(
                Blockly.Input.Align.LEFT);
          }
        }

        // Remove deleted inputs.
        for (let i = this.itemCount_; this.getInput('ADD' + i); i++) {
          this.removeInput('DUMMY' + i);
          this.removeInput('ADD' + i);
        }
      },
    }
);
