/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Defines inline_procedures_defreturn, which is an alternative
 * version of the procedures_defreturn block that specifies inline input mode.
 */

import * as Blockly from 'blockly/core';

// Define a new block that is based on the built-in block, but overriding the
// init method to enabline inline input mode.
const builtInProcedureBlock = Blockly.Blocks['procedures_defreturn'];
Blockly.Blocks['inline_procedures_defreturn'] = Object.assign(
    {},
    builtInProcedureBlock,
    {
      init: function(this: Blockly.Block) {
        builtInProcedureBlock.init.apply(this);
        this.inputsInline = true;
        this.getInput('RETURN')?.setAlign(Blockly.Input.Align.LEFT);
      },
    }
);
