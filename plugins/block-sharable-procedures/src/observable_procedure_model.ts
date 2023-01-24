/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';
import {triggerProceduresUpdate} from './update_procedures';

/** Represents a procedure signature. */
export class ObservableProcedureModel
implements Blockly.procedures.IProcedureModel {
  private id: string;
  private name: string;
  private parameters: Blockly.procedures.IParameterModel[] = [];
  private returnTypes: string[]|null = null;
  private enabled = true;
  private shouldFireEvents = false;
  private shouldTriggerUpdates = true;

  /**
   * Constructor for the procedure model.
   * @param workspace The workspace the procedure model is associated with.
   * @param name The name of the new procedure.
   * @param id The (optional) unique language-neutral ID for the procedure.
   */
  constructor(
      private readonly workspace: Blockly.Workspace,
      name: string,
      id?: string
  ) {
    this.id = id ?? Blockly.utils.idGenerator.genUid();
    this.name = name;
  }

  /**
   * Sets the human-readable name of the procedure.
   * @param name The human-readable name of the procedure.
   * @return This procedure model.
   */
  setName(name: string): this {
    if (name === this.name) return this;
    const prevName = this.name;
    this.name = name;
    if (this.shouldTriggerUpdates) triggerProceduresUpdate(this.workspace);
    if (this.shouldFireEvents) {
      // Blockly.Events.fire(
      //     new (Blockly.Events.get(Blockly.Events.PROCEDURE_RENAME))(
      //         this.workspace, this, prevName));
    }
    return this;
  }

  /**
   * Inserts a parameter into the list of parameters.
   * To move a parameter, first delete it, and then re-insert.
   * @param parameterModel The parameter model to insert.
   * @param index The index to insert it at.
   * @return This procedure model.
   */
  insertParameter(
      parameterModel: Blockly.procedures.IParameterModel, index: number): this {
    if (this.parameters[index] &&
        this.parameters[index].getId() === parameterModel.getId()) {
      return this;
    }

    this.parameters.splice(index, 0, parameterModel);
    parameterModel.setProcedureModel(this);
    if (Blockly.isObservable(parameterModel)) {
      if (this.shouldFireEvents) {
        parameterModel.startPublishing();
      } else {
        parameterModel.stopPublishing();
      }
    }

    if (this.shouldTriggerUpdates) triggerProceduresUpdate(this.workspace);
    if (this.shouldFireEvents) {
      // Blockly.Events.fire(
      //     new (Blockly.Events.get(
      //         Blockly.Events.PROCEDURE_PARAMETER_CREATE))(
      //         this.workspace, this, parameterModel, index));
    }
    return this;
  }

  /**
   * Removes the parameter at the given index from the parameter list.
   * @param index The index of the parameter to remove.
   * @return This procedure model.
   */
  deleteParameter(index: number): this {
    if (!this.parameters[index]) return this;
    const oldParam = this.parameters[index];

    this.parameters.splice(index, 1);
    if (this.shouldTriggerUpdates) triggerProceduresUpdate(this.workspace);
    if (Blockly.isObservable(oldParam)) {
      oldParam.stopPublishing();
    }

    if (this.shouldFireEvents) {
      // Blockly.Events.fire(
      //     new (Blockly.Events.get(
      //         Blockly.Events.PROCEDURE_PARAMETER_DELETE))(
      //         this.workspace, this, oldParam, index));
    }
    return this;
  }

  /**
   * Sets whether the procedure has a return value (empty array) or no return
   * value (null).
   * This procedure model does not support procedures that have actual
   * return types (i.e. non-empty arrays, e.g. ['number']).
   * @param types Used to set whether this procedure has a return value
   *     (empty array) or no return value (null).
   * @return This procedure model.
   */
  setReturnTypes(types: string[]|null): this {
    if (types && types.length) {
      throw new Error(
          'The built-in ProcedureModel does not support typing. You need to ' +
          'implement your own custom ProcedureModel.');
    }
    // Either they're both an empty array, or both null. Noop either way.
    if (!!types === !!this.returnTypes) return this;
    const oldReturnTypes = this.returnTypes;
    this.returnTypes = types;
    if (this.shouldTriggerUpdates) triggerProceduresUpdate(this.workspace);
    if (this.shouldFireEvents) {
      // Blockly.Events.fire(
      //     new (Blockly.Events.get(Blockly.Events.PROCEDURE_CHANGE_RETURN))(
      //         this.workspace, this, oldReturnTypes));
    }
    return this;
  }

  /**
   * Sets whether this procedure is enabled/disabled. If a procedure is disabled
   * all procedure caller blocks should be disabled as well.
   * @param enabled Whether this procedure is enabled/disabled.
   * @return This procedure model.
   */
  setEnabled(enabled: boolean): this {
    if (enabled === this.enabled) return this;
    this.enabled = enabled;
    if (this.shouldTriggerUpdates) triggerProceduresUpdate(this.workspace);
    if (this.shouldFireEvents) {
      // Blockly.Events.fire(
      //     new (Blockly.Events.get(Blockly.Events.PROCEDURE_ENABLE))(
      //         this.workspace, this));
    }
    return this;
  }

  /**
   * Disables triggering updates to procedure blocks until the endBulkUpdate
   * is called.
   * @internal
   */
  startBulkUpdate() {
    this.shouldTriggerUpdates = false;
  }

  /**
   * Triggers an update to procedure blocks. Should be used with
   * startBulkUpdate.
   * @internal
   */
  endBulkUpdate() {
    this.shouldTriggerUpdates = true;
    triggerProceduresUpdate(this.workspace);
  }

  /**
   * Returns the unique language-neutral ID for the procedure.
   * @return The unique language-neutral ID for the procedure.
   */
  getId(): string {
    return this.id;
  }

  /**
   * Returns the human-readable name of the procedure.
   * @return The human-readable name of the procedure
   */
  getName(): string {
    return this.name;
  }

  /**
   * Returns the parameter at the given index in the parameter list.
   * @param index The index of the parameter to return.
   * @return the parameter at the given index in the parameter list.
   */
  getParameter(index: number): Blockly.procedures.IParameterModel {
    return this.parameters[index];
  }

  /**
   * Returns an array of all of the parameters in the parameter list.
   * @return an array of all of the parameters in the parameter list.
   */
  getParameters(): Blockly.procedures.IParameterModel[] {
    return [...this.parameters];
  }

  /**
   * Returns the return type of the procedure.
   * Null represents a procedure that does not return a value.
   * @return the return type of the procedure.
   */
  getReturnTypes(): string[]|null {
    return this.returnTypes;
  }

  /**
   * Returns whether the procedure is enabled/disabled. If a procedure is
   * disabled, all procedure caller blocks should be disabled as well.
   * @return Returns whether the procedure is enabled/disabled.
   */
  getEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Tells the procedure model it should fire events.
   *
   * @internal
   */
  startPublishing() {
    this.shouldFireEvents = true;
    for (const param of this.parameters) {
      if (Blockly.isObservable(param)) param.startPublishing();
    }
  }

  /**
   * Tells the procedure model it should not fire events.
   *
   * @internal
   */
  stopPublishing() {
    triggerProceduresUpdate(this.workspace);
    this.shouldFireEvents = false;
    for (const param of this.parameters) {
      if (Blockly.isObservable(param)) param.stopPublishing();
    }
  }
}
