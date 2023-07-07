/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Defines a version of the if block with dyanmic
 *     inputs that appear when a block is dragged over inputs on the block.
 */

import * as Blockly from 'blockly/core';

/** Type of a block that has the DYNAMIC_IF_MIXIN. */
type DynamicIfBlock = Blockly.Block & DynamicIfMixin;
/* eslint-disable @typescript-eslint/no-empty-interface */
/** This interface avoids a "circular reference" compile error. */
interface DynamicIfMixin extends DynamicIfMixinType {}
/* eslint-enable @typescript-eslint/no-empty-interface */
type DynamicIfMixinType = typeof DYNAMIC_IF_MIXIN;

/* eslint-disable @typescript-eslint/naming-convention */
const DYNAMIC_IF_MIXIN = {
  /* eslint-enable @typescript-eslint/naming-convention */
  /** Counter for the next input to add to this block. */
  inputCounter: 1,

  /** Minimum number of inputs for this block. */
  minInputs: 1,

  /**
   * Block for if/elseif/else statements. Must have one if input.
   * Can have any number of elseif inputs and optionally one else input.
   */
  init(this: DynamicIfBlock): void {
    this.setHelpUrl(Blockly.Msg['CONTROLS_IF_HELPURL']);
    this.setStyle('logic_blocks');

    this.appendValueInput('IF0')
        .setCheck('Boolean')
        .appendField(Blockly.Msg['CONTROLS_IF_MSG_IF'], 'if');
    this.appendStatementInput('DO0')
        .appendField(Blockly.Msg['CONTROLS_IF_MSG_THEN']);

    this.setNextStatement(true);
    this.setPreviousStatement(true);
    this.setTooltip(Blockly.Msg['LISTS_CREATE_WITH_TOOLTIP']);
  },

  /**
   * Create XML to represent if/elseif/else inputs.
   * @returns XML storage element.
   */
  mutationToDom(this: DynamicIfBlock): Element {
    const container = Blockly.utils.xml.createElement('mutation');
    const inputNames = this.inputList
        .filter((input: Blockly.Input) => input.name.includes('IF'))
        .map((input: Blockly.Input) => input.name.replace('IF', '')).join(',');
    container.setAttribute('inputs', inputNames);
    const hasElse = !!this.getInput('ELSE');
    container.setAttribute('else', String(hasElse));
    container.setAttribute('next', String(this.inputCounter));
    return container;
  },

  /**
   * Parse XML to restore the inputs.
   * @param xmlElement XML storage element.
   */
  domToMutation(this: DynamicIfBlock, xmlElement: Element): void {
    if (xmlElement.getAttribute('inputs')) {
      this.deserializeInputs(xmlElement);
    } else {
      this.deserializeCounts(xmlElement);
    }
  },

  /**
   * Parses XML based on the 'inputs' attribute (non-standard).
   * @param xmlElement XML storage element.
   */
  deserializeInputs(this: DynamicIfBlock, xmlElement: Element): void {
    const inputs = xmlElement.getAttribute('inputs');
    if (inputs) {
      const inputNumbers = inputs.split(',');
      if (this.getInput('IF0')) {
        this.removeInput('IF0');
      }
      if (this.getInput('DO0')) {
        this.removeInput('DO0');
      }
      const first = inputNumbers[0];
      this.appendValueInput('IF' + first)
          .setCheck('Boolean')
          .appendField(Blockly.Msg['CONTROLS_IF_MSG_IF'], 'if');
      this.appendStatementInput('DO' + first)
          .appendField(Blockly.Msg['CONTROLS_IF_MSG_THEN']);

      for (let i = 1; i < inputNumbers.length; i++) {
        this.appendValueInput('IF' + inputNumbers[i])
            .setCheck('Boolean')
            .appendField(Blockly.Msg['CONTROLS_IF_MSG_ELSEIF'], 'elseif');
        this.appendStatementInput('DO' + inputNumbers[i])
            .appendField(Blockly.Msg['CONTROLS_IF_MSG_THEN']);
      }
    }
    const hasElse = xmlElement.getAttribute('else');
    if (hasElse == 'true') {
      this.appendStatementInput('ELSE')
          .appendField(Blockly.Msg['CONTROLS_IF_MSG_ELSE'], 'else');
    }
    const next = parseInt(xmlElement.getAttribute('next') ?? '0', 10) || 0;
    this.inputCounter = next;
  },

  /**
   * Parses XML based on the 'elseif' and 'else' attributes (standard).
   * @param xmlElement XML storage element.
   */
  deserializeCounts(this: DynamicIfBlock, xmlElement: Element): void {
    const elseifCount = parseInt(
        xmlElement.getAttribute('elseif') ?? '0', 10) || 0;
    const elseCount = parseInt(xmlElement.getAttribute('else') ?? '0', 10) || 0;
    for (let i = 1; i <= elseifCount; i++) {
      this.appendValueInput('IF' + i).setCheck('Boolean').appendField(
          Blockly.Msg['CONTROLS_IF_MSG_ELSEIF']);
      this.appendStatementInput('DO' + i).appendField(
          Blockly.Msg['CONTROLS_IF_MSG_THEN']);
    }
    if (elseCount) {
      this.appendStatementInput('ELSE').appendField(
          Blockly.Msg['CONTROLS_IF_MSG_ELSE']);
    }
    this.inputCounter = elseifCount + 1;
  },

  /**
   * Finds the index of a connection. Used to determine where in the block to
   * insert new inputs.
   * @param connection A connection on this block.
   * @returns The index of the connection in the this.inputList.
   */
  findInputIndexForConnection(
      this: DynamicIfBlock, connection: Blockly.Connection): number | null {
    for (let i = 0; i < this.inputList.length; i++) {
      const input = this.inputList[i];
      if (input.connection == connection) {
        return i;
      }
    }
    return null;
  },

  /**
   * Inserts a boolean value input and statement input at the specified index.
   * @param index Index of the input before which to add new inputs.
   */
  insertElseIf(this: DynamicIfBlock, index: number): void {
    const caseNumber = this.inputCounter;
    this
        .appendValueInput('IF' + caseNumber)
        .setCheck('Boolean')
        .appendField(Blockly.Msg['CONTROLS_IF_MSG_ELSEIF'], 'elseif');
    this.appendStatementInput('DO' + caseNumber)
        .appendField(Blockly.Msg['CONTROLS_IF_MSG_THEN']);
    this.moveInputBefore('IF' + caseNumber, this.inputList[index].name);
    this.moveInputBefore('DO' + caseNumber, this.inputList[index + 1].name);
    this.inputCounter++;
  },

  /**
   * Called by a monkey-patched version of InsertionMarkerManager when
   * a block is dragged over one of the connections on this block.
   * @param connection The connection on this block that has a pending
   *     connection.
   */
  onPendingConnection(
      this: DynamicIfBlock, connection: Blockly.Connection): void {
    if (connection.type === Blockly.NEXT_STATEMENT && !this.getInput('ELSE')) {
      this.appendStatementInput('ELSE')
          .appendField(Blockly.Msg['CONTROLS_IF_MSG_ELSE'], 'else');
    }
    const inputIndex = this.findInputIndexForConnection(connection);
    if (inputIndex === null) {
      return;
    }
    const input = this.inputList[inputIndex];
    if (connection.targetConnection && input.name.includes('IF')) {
      const nextIfInput = this.inputList[inputIndex + 2];
      if (!nextIfInput || nextIfInput.name == 'ELSE') {
        this.insertElseIf(inputIndex + 2);
      } else {
        const nextIfConnection =
            nextIfInput &&
            nextIfInput.connection &&
            nextIfInput.connection.targetConnection;
        if (
          nextIfConnection &&
          !nextIfConnection.getSourceBlock().isInsertionMarker()
        ) {
          this.insertElseIf(inputIndex + 2);
        }
      }
    }
  },

  /**
   * Called by a monkey-patched version of InsertionMarkerManager when a block
   * drag ends if the dragged block had a pending connection with this block.
   */
  finalizeConnections(this: DynamicIfBlock): void {
    const toRemove = [];
    // Remove Else If inputs if neither the if nor the do has a connected block.
    for (let i = 2; i < this.inputList.length - 1; i += 2) {
      const ifConnection = this.inputList[i];
      const doConnection = this.inputList[i + 1];
      if (!ifConnection.connection?.targetConnection &&
          !doConnection.connection?.targetConnection) {
        toRemove.push(ifConnection.name);
        toRemove.push(doConnection.name);
      }
    }
    toRemove.forEach((input) => this.removeInput(input));

    // Remove Else input if it doesn't have a connected block.
    const elseInput = this.getInput('ELSE');
    if (elseInput && !elseInput.connection?.targetConnection) {
      this.removeInput(elseInput.name);
    }

    // Remove the If input if it is empty and there is at least one Else If
    if (this.inputList.length > 2) {
      const ifInput = this.inputList[0];
      const doInput = this.inputList[1];
      const nextInput = this.inputList[2];
      if (nextInput.name.includes('IF') &&
          !ifInput.connection?.targetConnection &&
          !doInput.connection?.targetConnection) {
        this.removeInput(ifInput.name);
        this.removeInput(doInput.name);
        nextInput.removeField('elseif');
        nextInput.appendField(Blockly.Msg['CONTROLS_IF_MSG_IF'], 'if');
      }
    }
  },
};

Blockly.Blocks['dynamic_if'] = DYNAMIC_IF_MIXIN;
