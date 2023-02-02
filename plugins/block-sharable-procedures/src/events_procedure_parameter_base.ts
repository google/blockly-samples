
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
   * Encode the event as JSON.
   * @returns JSON representation.
   */
  toJson(): ProcedureParameterBaseJson {
    const json = super.toJson() as ProcedureParameterBaseJson;
    json['parameterId'] = this.parameter.getId();
    return json;
  }
}

export interface ProcedureParameterBaseJson extends ProcedureBaseJson {
  parameterId: string;
}
