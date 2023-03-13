/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';
import {ProcedureParameterRename} from './events_procedure_parameter_rename';
import {triggerProceduresUpdate} from './update_procedures';

/** Represents a procedure parameter. */
export class ObservableParameterModel implements
    Blockly.procedures.IParameterModel {
  private id: string;
  private variable: Blockly.VariableModel;
  private shouldFireEvents = false;
  private procedureModel: Blockly.procedures.IProcedureModel|null = null;

  /**
   * Constructor for the procedure parameter.
   * @param workspace The workspace this parameter model exists in.
   * @param name The name of this parameter.
   * @param id The optional unique language-neutral ID of the parameter.
   * @param varId The optional ID of the variable this parameter should be
   *     associated with.
   */
  constructor(
      private readonly workspace: Blockly.Workspace, name: string, id?: string,
      varId?: string) {
    this.id = id ?? Blockly.utils.idGenerator.genUid();
    this.variable = this.workspace.getVariable(name) ??
        workspace.createVariable(name, '', varId);
  }

  /**
   * Sets the name of this parameter to the given name.
   * @param name The string to set the name to.
   * @param id The optional ID the backing variable should have.
   * @returns This parameter model.
   */
  setName(name: string, id?: string): this {
    if (name === this.variable.name) return this;
    const oldName = this.variable.name;
    this.variable =
        this.workspace.getVariable(name) ??
        this.workspace.createVariable(name, '', id);
    triggerProceduresUpdate(this.workspace);
    if (this.shouldFireEvents) {
      Blockly.Events.fire(
          new ProcedureParameterRename(
              this.workspace, this.procedureModel, this, oldName));
    }
    return this;
  }

  /**
   * Unimplemented. The built-in ParameterModel does not support typing.
   * If you want your procedure blocks to have typed parameters, you need to
   * implement your own ParameterModel.
   * @param types The types to set this parameter to.
   * @throws Throws for the ObservableParameterModel specifically because this
   *     method is unimplemented.
   */
  setTypes(types: string[]): this {
    throw new Error(
        'The built-in ParameterModel does not support typing. You need to ' +
        'implement your own custom ParameterModel.');
  }

  /**
   * @returns the name of this parameter.
   */
  getName(): string {
    return this.variable.name;
  }

  /**
   * @returns the types of this parameter.
   */
  getTypes(): string[] {
    return [];
  }

  /**
   * Returns the unique language-neutral ID for the parameter. This represents
   * the identity of the variable model which does not change over time.
   * @returns The unique language-neutral ID for the parameter.
   */
  getId(): string {
    return this.id;
  }

  /**
   * @returns the variable model associated with the parameter model.
   */
  getVariableModel(): Blockly.VariableModel {
    return this.variable;
  }

  /**
   * Tells the parameter model it should fire events.
   * @internal
   */
  startPublishing() {
    this.shouldFireEvents = true;
  }

  /**
   * Tells the parameter model it should not fire events.
   * @internal
   */
  stopPublishing() {
    this.shouldFireEvents = false;
  }

  /**
   * Sets the procedure model this parameter is a part of.
   * @param model The procedure model this parameter is a part of.
   * @returns This parameter model.
   */
  setProcedureModel(model: Blockly.procedures.IProcedureModel): this {
    this.procedureModel = model;
    return this;
  }
}
