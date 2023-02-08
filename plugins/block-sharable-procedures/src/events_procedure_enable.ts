
/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';
import {ProcedureBase, ProcedureBaseJson} from './events_procedure_base';


const TYPE = 'procedure_enable';

/**
 * Notifies listeners that the procedure data model has been enabled or
 * disabled.
 */
export class ProcedureEnable extends ProcedureBase {
  /** A string used to check the type of the event. */
  type = TYPE;

  private oldState: boolean;
  private newState: boolean;

  /**
   * Constructs the procedure enable event.
   * @param workspace The workspace this event is associated with.
   * @param procedure The model this event is associated with.
   */
  constructor(
      workspace: Blockly.Workspace,
      procedure: Blockly.procedures.IProcedureModel) {
    super(workspace, procedure);

    this.oldState = !procedure.getEnabled();
    this.newState = procedure.getEnabled();
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
          'Cannot change the enabled state of a procedure that does not ' +
          'exist in the procedure map');
    }
    if (forward) {
      procedureModel.setEnabled(this.newState);
    } else {
      procedureModel.setEnabled(this.oldState);
    }
  }

  /**
   * Encode the event as JSON.
   * @returns JSON representation.
   */
  toJson(): ProcedureEnableJson {
    return super.toJson() as ProcedureEnableJson;
  }

  /**
   * Deserializes the JSON event.
   * @param json The JSON representation of a procedure enable event.
   * @param workspace The workspace to deserialize the event into.
   * @returns The new procedure enable event.
   * @internal
   */
  static fromJson(json: ProcedureEnableJson, workspace: Blockly.Workspace):
      ProcedureEnable {
    const model = workspace.getProcedureMap().get(json['procedureId']);
    if (!model) {
      throw new Error(
          'Cannot deserialize procedure enable event because the ' +
          'target procedure does not exist');
    }
    return new ProcedureEnable(workspace, model);
  }
}

export type ProcedureEnableJson = ProcedureBaseJson;

Blockly.registry.register(
    Blockly.registry.Type.EVENT, TYPE, ProcedureEnable);
