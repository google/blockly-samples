/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';
import {blocks} from './blocks';
import {IProcedureBlock, isProcedureBlock} from './i_procedure_block';
import {ObservableParameterModel} from './observable_parameter_model';
import {ObservableProcedureModel} from './observable_procedure_model';
import {triggerProceduresUpdate} from './update_procedures';

export {
  blocks,
  IProcedureBlock,
  isProcedureBlock,
  ObservableParameterModel,
  ObservableProcedureModel,
  triggerProceduresUpdate,
};

/**
 * Unregisters all of the procedure blocks.
 *
 * Usually used to unregister the built-in blocks, before register the
 * blocks provided by this plugin.
 */
export function unregisterProcedureBlocks() {
  delete Blockly.Blocks['procedures_defnoreturn'];
  delete Blockly.Blocks['procedures_callnoreturn'];
  delete Blockly.Blocks['procedures_defreturn'];
  delete Blockly.Blocks['procedures_callreturn'];
}
