/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';
import {ProcedureBase, ProcedureBaseJson} from './events_procedure_base';
import {ObservableParameterModel} from './observable_parameter_model';
import {ObservableProcedureModel} from './observable_procedure_model';


const TYPE = 'procedure_create';

/**
 * Notifies listeners that a procedure data model has been created.
 */
export class ProcedureCreate extends ProcedureBase {
  /** A string used to check the type of the event. */
  type = TYPE;

  /**
   * Replays the event in the workspace.
   * @param forward if true, play the event forward (redo), otherwise play it
   *     backward (undo).
   */
  run(forward: boolean) {
    const workspace = this.getEventWorkspace_();
    const procedureMap = workspace.getProcedureMap();
    if (forward) {
      procedureMap.add(this.procedure);
    } else {
      procedureMap.delete(this.procedure.getId());
    }
  }

  /**
   * Encode the event as JSON.
   * @returns JSON representation.
   */
  toJson(): ProcedureCreateJson {
    const json = super.toJson() as ProcedureCreateJson;
    json['procedure'] =
        Blockly.serialization.procedures.saveProcedure(this.procedure);
    return json;
  }

  /**
   * Deserializes the JSON event.
   * @param json The JSON representation of a procedure create event.
   * @param workspace The workspace to deserialize the event into.
   * @returns The new procedure create event.
   * @internal
   */
  static fromJson(json: ProcedureCreateJson, workspace: Blockly.Workspace):
      ProcedureCreate {
    return new ProcedureCreate(
        workspace,
        Blockly.serialization.procedures.loadProcedure(
            ObservableProcedureModel,
            ObservableParameterModel,
            json['procedure'],
            workspace));
  }
}

export interface ProcedureCreateJson extends ProcedureBaseJson {
  procedure: Blockly.serialization.procedures.State;
}

Blockly.registry.register(
    Blockly.registry.Type.EVENT, TYPE, ProcedureCreate);
