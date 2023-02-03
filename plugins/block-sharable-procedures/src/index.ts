/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';
import {ObservableParameterModel} from './observable_parameter_model';
import {ObservableProcedureModel} from './observable_procedure_model';
import {blocks} from './blocks';

console.log(blocks);

export {
  ObservableParameterModel,
  ObservableProcedureModel,
  blocks,
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
