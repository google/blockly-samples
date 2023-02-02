
/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';
import {ProcedureBase, ProcedureBaseJson} from './events_procedure_base';
import {ObservableProcedureModel} from './observable_procedure_model';


const TYPE = 'procedure_delete';

/**
 * Notifies listeners that a procedure data model has been deleted.
 */
export class ProcedureDelete extends ProcedureBase {
  /** A string used to check the type of the event. */
  type = TYPE;

  /**
   * Constructs the procedure delete event.
   * @param workspace The workspace this event is associated with.
   * @param procedure The procedure model this event is associated with.
   */
  constructor(
      workspace: Blockly.Workspace,
      procedure: Blockly.procedures.IProcedureModel) {
    super(workspace, procedure);
  }

  /**
   * Replays the event in the workspace.
   * @param forward if true, play the event forward (redo), otherwise play it
   *     backward (undo).
   */
  run(forward: boolean) {
    const workspace = this.getEventWorkspace_();
    const procedureMap = workspace.getProcedureMap();
    const procedureModel = procedureMap.get(this.procedure.getId());
    if (forward) {
      if (!procedureModel) return;
      procedureMap.delete(this.procedure.getId());
    } else {
      if (procedureModel) return;
      procedureMap.add(new ObservableProcedureModel(
          workspace, this.procedure.getName(), this.procedure.getId()));
    }
  }

  /**
   * Encode the event as JSON.
   * @returns JSON representation.
   */
  toJson(): ProcedureDeleteJson {
    return super.toJson() as ProcedureDeleteJson;
  }

  /**
   * Deserializes the JSON event.
   * @param json The JSON representation of a procedure delete event.
   * @param workspace The workspace to deserialize the event into.
   * @returns The new procedure delete event.
   * @internal
   */
  static fromJson(json: ProcedureDeleteJson, workspace: Blockly.Workspace):
      ProcedureDelete {
    const model = workspace.getProcedureMap().get(json['procedureId']);
    if (!model) {
      throw new Error(
          'Cannot deserialize procedure delete event because the ' +
          'target procedure does not exist');
    }
    return new ProcedureDelete(workspace, model);
  }
}

export type ProcedureDeleteJson = ProcedureBaseJson;

Blockly.registry.register(
    Blockly.registry.Type.EVENT, TYPE, ProcedureDelete);
