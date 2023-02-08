
/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';
import {ProcedureBase, ProcedureBaseJson} from './events_procedure_base';


/**
 * The base event for an event associated with a procedure parameter.
 */
export abstract class ProcedureParameterBase extends ProcedureBase {
  /**
   * Constructs the procedure parameter base event.
   * @param workspace The workspace the parameter model exists in.
   * @param procedure The procedure model the parameter model belongs to.
   * @param parameter The parameter model associated with this event.
   */
  constructor(
      workspace: Blockly.Workspace,
      procedure: Blockly.procedures.IProcedureModel,
      readonly parameter: Blockly.procedures.IParameterModel) {
    super(workspace, procedure);
  }

  /**
   * Returns true if the given parameter is identical to this parameter.
   * @param param The parameter to check for equivalence.
   * @returns True if the parameter matches, false if it does not.
   * @internal
   */
  protected parameterMatches(
      param?: Blockly.procedures.IParameterModel): boolean {
    return param && param.getId() === this.parameter.getId();
  }

  /**
   * Finds the parameter with the given ID in the procedure model with the given
   * ID, if both things exist.
   * @param workspace The workspace to search for the parameter.
   * @param modelId The ID of the model to search for the parameter.
   * @param paramId The ID of the parameter to search for.
   * @returns The parameter model that was found.
   * @internal
   */
  static findMatchingParameter(
      workspace: Blockly.Workspace,
      modelId: string,
      paramId: string
  ): ProcedureParameterPair {
    const procedure = workspace.getProcedureMap().get(modelId);
    if (!procedure) {
      throw new Error(
          'Cannot find the parameter of a procedure that does not exist ' +
          'in the procedure map');
    }
    const parameter = procedure.getParameters()
        .find((p) => p.getId() === paramId);
    if (!parameter) {
      throw new Error(
          'Cannot find a parameter that does not exist in ' +
          'its associated procedure');
    }
    return {procedure, parameter};
  }

  /**
   * Encode the event as JSON.
   * @returns JSON representation.
   */
  toJson(): ProcedureParameterBaseJson {
    const json = super.toJson() as ProcedureParameterBaseJson;
    json['parameterId'] = this.parameter.getId();
    return json;
  }
}

export interface ProcedureParameterPair {
  procedure: Blockly.procedures.IProcedureModel;
  parameter: Blockly.procedures.IParameterModel;
}

export interface ProcedureParameterBaseJson extends ProcedureBaseJson {
  parameterId: string;
}
