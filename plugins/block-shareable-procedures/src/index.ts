/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';
export {blocks} from './blocks';
export {IProcedureBlock, isProcedureBlock} from './i_procedure_block';
export {ObservableParameterModel} from './observable_parameter_model';
export {ObservableProcedureModel} from './observable_procedure_model';
export {ProcedureBase, ProcedureBaseJson} from './events_procedure_base';
export {
  ProcedureChangeReturn,
  ProcedureChangeReturnJson,
} from './events_procedure_change_return';
export {ProcedureCreate, ProcedureCreateJson} from './events_procedure_create';
export {ProcedureDelete, ProcedureDeleteJson} from './events_procedure_delete';
export {
  ProcedureParameterBase,
  ProcedureParameterBaseJson,
} from './events_procedure_parameter_base';
export {
  ProcedureParameterCreate,
  ProcedureParameterCreateJson,
} from './events_procedure_parameter_create';
export {
  ProcedureParameterDelete,
  ProcedureParameterDeleteJson,
} from './events_procedure_parameter_delete';
export {
  ProcedureParameterRename,
  ProcedureParameterRenameJson,
} from './events_procedure_parameter_rename';
export {ProcedureRename, ProcedureRenameJson} from './events_procedure_rename';
export {triggerProceduresUpdate} from './update_procedures';

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
