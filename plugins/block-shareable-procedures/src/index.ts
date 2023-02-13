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
import {ProcedureBase, ProcedureBaseJson} from './events_procedure_base';
import {ProcedureChangeReturn, ProcedureChangeReturnJson} from './events_procedure_change_return';
import {ProcedureCreate, ProcedureCreateJson} from './events_procedure_create';
import {ProcedureDelete, ProcedureDeleteJson} from './events_procedure_delete';
import {ProcedureParameterBase, ProcedureParameterBaseJson} from './events_procedure_parameter_base';
import {ProcedureParameterCreate, ProcedureParameterCreateJson} from './events_procedure_parameter_create';
import {ProcedureParameterDelete, ProcedureParameterDeleteJson} from './events_procedure_parameter_delete';
import {ProcedureParameterRename, ProcedureParameterRenameJson} from './events_procedure_parameter_rename';
import {ProcedureRename, ProcedureRenameJson} from './events_procedure_rename';
import {triggerProceduresUpdate} from './update_procedures';

export {
  blocks,
  IProcedureBlock,
  isProcedureBlock,
  ObservableParameterModel,
  ObservableProcedureModel,
  ProcedureBase,
  ProcedureBaseJson,
  ProcedureChangeReturn,
  ProcedureChangeReturnJson,
  ProcedureCreate,
  ProcedureCreateJson,
  ProcedureDelete,
  ProcedureDeleteJson,
  ProcedureParameterBase,
  ProcedureParameterBaseJson,
  ProcedureParameterCreate,
  ProcedureParameterCreateJson,
  ProcedureParameterDelete,
  ProcedureParameterDeleteJson,
  ProcedureParameterRename,
  ProcedureParameterRenameJson,
  ProcedureRename,
  ProcedureRenameJson,
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
