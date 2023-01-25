/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';
import {ProcedureParameterBase, ProcedureParameterBaseJson} from './events_procedure_parameter_base';
import {ObservableParameterModel} from './observable_parameter_model';


const TYPE = 'procedure_parameter_create';

/**
 * Notifies listeners that a parameter has been added to a procedure model.
 */
export class ProcedureParameterCreate extends ProcedureParameterBase {
  /** A string used to check the type of the event. */
  type = TYPE;

  /**
   * Constructs the procedure parameter create event.js.
   * @param workspace The workspace this event is associated with.
   * @param procedure The procedure model this event is associated with.
   * @param parameter The parameter model that was just added to the procedure.
   * @param index The index the parameter was inserted at.
   */
  constructor(
      workspace: Blockly.Workspace,
      procedure: Blockly.procedures.IProcedureModel,
      parameter: Blockly.procedures.IParameterModel,
      readonly index: number) {
    super(workspace, procedure, parameter);
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
    if (!procedureModel) {
      throw new Error(
          'Cannot add a parameter to a procedure that does not exist ' +
          'in the procedure map');
    }
    const parameterModel = procedureModel.getParameter(this.index);
    if (forward) {
      if (this.parameterMatches(parameterModel)) return;
      procedureModel.insertParameter(this.parameter, this.index);
    } else {
      if (!this.parameterMatches(parameterModel)) return;
      procedureModel.deleteParameter(this.index);
    }
  }

  /**
   * Returns true if the given parameter is identical to this parameter.
   * @param param The parameter to check for equivalence.
   * @return True if the parameter matches, false if it does not.
   */
  parameterMatches(param: Blockly.procedures.IParameterModel) {
    return param && param.getId() === this.parameter.getId();
  }

  /**
   * Encode the event as JSON.
   * @return JSON representation.
   */
  toJson(): ProcedureParameterCreateJson {
    const json = super.toJson() as ProcedureParameterCreateJson;
    json['parameter'] =
        Blockly.serialization.procedures.saveParameter(this.parameter);
    json['index'] = this.index;
    return json;
  }

  /**
   * Deserializes the JSON event.
   * @param json The JSON representation of a procedure parameter create event.
   * @param workspace The workspace to deserialize the event into.
   * @return The new procedure parameter create event.
   * @internal
   */
  static fromJson(
      json: ProcedureParameterCreateJson,
      workspace: Blockly.Workspace
  ): ProcedureParameterCreate {
    const procedure = workspace.getProcedureMap().get(json['procedureId']);
    if (!procedure) {
      throw new Error(
          'Cannot deserialize parameter create event because the ' +
          'target procedure does not exist');
    }
    return new ProcedureParameterCreate(
        workspace, procedure,
        Blockly.serialization.procedures.loadParameter(
            ObservableParameterModel, json['parameter'], workspace),
        json['index']);
  }
}

export interface ProcedureParameterCreateJson extends
    ProcedureParameterBaseJson {
  parameter: Blockly.serialization.procedures.ParameterState;
  index: number;
}

Blockly.registry.register(
    Blockly.registry.Type.EVENT, TYPE, ProcedureParameterCreate);
