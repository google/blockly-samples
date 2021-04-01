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

Blockly.Blocks['dynamic_if'] = {
  /**
   * Counter for the next input to add to this block.
   * @type {number}
   */
  inputCounter: 1,

  /**
   * Minimum number of inputs for this block.
   * @type {number}
   */
  minInputs: 1,
  /**
   * Block for concatenating any number of strings.
   * @this {Blockly.Block}
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg['CONTROLS_IF_HELPURL']);
    this.setStyle('logic_blocks');

    this.appendValueInput('IF0')
        .setCheck('Boolean')
        .appendField(Blockly.Msg['CONTROLS_IF_MSG_IF'], 'if');
    this.appendStatementInput('DO0');

    this.setTooltip(Blockly.Msg['LISTS_CREATE_WITH_TOOLTIP']);
  },

  mutationToDom: function() {
    const container = Blockly.utils.xml.createElement('mutation');
    const inputNames = this.inputList
        .filter((input) => input.name.includes('IF'))
        .map((input) => input.name.replace('IF', '')).join(',');
    container.setAttribute('inputs', inputNames);
    const hasElse = !!this.getInput('ELSE');
    container.setAttribute('else', hasElse);
    container.setAttribute('next', this.inputCounter);
    return container;
  },

  domToMutation: function(xmlElement) {
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
      this.appendStatementInput('DO' + first);

      for (let i = 1; i < inputNumbers.length; i++) {
        this.appendValueInput('IF' + inputNumbers[i])
            .setCheck('Boolean')
            .appendField(Blockly.Msg['CONTROLS_IF_MSG_ELSEIF'], 'elseif');
        this.appendStatementInput('DO' + inputNumbers[i]);
      }
    }
    const hasElse = xmlElement.getAttribute('else');
    if (hasElse == 'true') {
      this.appendStatementInput('ELSE')
          .appendField(Blockly.Msg['CONTROLS_IF_MSG_ELSE'], 'else');
    }
    const next = parseInt(xmlElement.getAttribute('next'));
    this.inputCounter = next;
  },

  findInputIndexForConnection: function(connection) {
    for (let i = 0; i < this.inputList.length; i++) {
      const input = this.inputList[i];
      if (input.connection == connection) {
        return i;
      }
    }
  },

  insertElseIf: function(index) {
    const caseNumber = this.inputCounter;
    this
        .appendValueInput('IF' + caseNumber)
        .setCheck('Boolean')
        .appendField(Blockly.Msg['CONTROLS_IF_MSG_ELSEIF'], 'elseif');
    this.appendStatementInput('DO' + caseNumber);
    this.moveInputBefore('IF' + caseNumber, this.inputList[index].name);
    this.moveInputBefore('DO' + caseNumber, this.inputList[index + 1].name);
    this.inputCounter++;
  },

  onPendingConnection: function(connection) {
    if (connection.type === Blockly.NEXT_STATEMENT && !this.getInput('ELSE')) {
      this.appendStatementInput('ELSE')
          .appendField(Blockly.Msg['CONTROLS_IF_MSG_ELSE'], 'else');
    }
    const inputIndex = this.findInputIndexForConnection(connection);
    const input = this.inputList[inputIndex];
    if (connection.targetConnection && input.name.includes('IF')) {
      const nextIfInput = this.inputList[inputIndex + 2];
      if (!nextIfInput || nextIfInput.name == 'ELSE') {
        this.insertElseIf(inputIndex + 2);
      } else {
        const nextIfConnection = nextIfInput &&
          nextIfInput.connection.targetConnection;
        if (
          nextIfConnection &&
          !nextIfConnection.sourceBlock_.isInsertionMarker()
        ) {
          this.insertElseIf(inputIndex + 2);
        }
      }
    }
  },

  finalizeConnections: function() {
    const toRemove = [];
    // Remove Else If inputs if neither the if nor the do has a connected block.
    for (let i = 2; i < this.inputList.length - 2; i += 2) {
      const ifConnection = this.inputList[i];
      const doConnection = this.inputList[i + 1];
      if (!ifConnection.connection.targetConnection &&
          !doConnection.connection.targetConnection) {
        toRemove.push(ifConnection.name);
        toRemove.push(doConnection.name);
      }
    }
    toRemove.forEach((input) => this.removeInput(input));

    // Remove Else input if it doesn't have a connected block.
    const elseInput = this.getInput('ELSE');
    if (elseInput && !elseInput.connection.targetConnection) {
      this.removeInput(elseInput.name);
    }

    // Remove the If input if it is empty and there is at least one Else If
    if (this.inputList.length > 2) {
      const ifInput = this.inputList[0];
      const doInput = this.inputList[1];
      const nextInput = this.inputList[2];
      if (nextInput.name.includes('IF') &&
          !ifInput.connection.targetConnection &&
          !doInput.connection.targetConnection) {
        this.removeInput(ifInput.name);
        this.removeInput(doInput.name);
        nextInput.removeField('elseif');
        nextInput.appendField(Blockly.Msg['CONTROLS_IF_MSG_IF'], 'if');
      }
    }
  },
};
