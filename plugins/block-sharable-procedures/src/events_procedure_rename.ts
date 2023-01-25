/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';
import {ProcedureBase, ProcedureBaseJson} from './events_procedure_base';


const TYPE = 'procedure_rename';

/** Notifies listeners that a procedure model has been renamed. */
export class ProcedureRename extends ProcedureBase {
  /** A string used to check the type of the event. */
  type = TYPE;

  private newName: string;

  /**
   * Constructs the procedure rename event.
   * @param workspace The workspace this event is associated with.
   * @param procedure The model this event is associated with.
   * @param oldName The old name of the procedure model.
   */
  constructor(
      workspace: Blockly.Workspace,
      procedure: Blockly.procedures.IProcedureModel,
      readonly oldName: string) {
    super(workspace, procedure);

    this.newName = procedure.getName();
  }

  /**
   * Replays the event in the workspace.
   * @param forward if true, play the event forward (redo), otherwise play it
   *     backward (undo).
   */
  run(forward: boolean) {
    const procedureModel =
        this.getEventWorkspace_().getProcedureMap().get(this.procedure.getId());
    if (!procedureModel) {
      throw new Error(
          'Cannot change the type of a procedure that does not exist ' +
          'in the procedure map');
    }
    if (forward) {
      procedureModel.setName(this.newName);
    } else {
      procedureModel.setName(this.oldName);
    }
  }

  /**
   * Encode the event as JSON.
   * @return JSON representation.
   */
  toJson(): ProcedureRenameJson {
    const json = super.toJson() as ProcedureRenameJson;
    json['oldName'] = this.oldName;
    return json;
  }

  /**
   * Deserializes the JSON event.
   * @param json The JSON representation of a procedure rename event.
   * @param workspace The workspace to deserialize the event into.
   * @return The new procedure rename event.
   * @internal
   */
  static fromJson(json: ProcedureRenameJson, workspace: Blockly.Workspace):
      ProcedureRename {
    const model = workspace.getProcedureMap().get(json['procedureId']);
    if (!model) {
      throw new Error(
          'Cannot deserialize procedure rename event because the ' +
          'target procedure does not exist');
    }
    return new ProcedureRename(workspace, model, json['oldName']);
  }
}

export interface ProcedureRenameJson extends ProcedureBaseJson {
  oldName: string;
}

Blockly.registry.register(
    Blockly.registry.Type.EVENT, TYPE, ProcedureRename);
