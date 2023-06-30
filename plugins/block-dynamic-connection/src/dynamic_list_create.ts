/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Defines a version of the list_create block with dyanmic
 *     inputs that appear when a block is dragged over inputs on the block.
 */

import * as Blockly from 'blockly/core';

/** Type of a block that has the DYNAMIC_LIST_CREATE_MIXIN. */
type DynamicListCreateBlock = Blockly.Block & DynamicListCreateMixin;
/* eslint-disable @typescript-eslint/no-empty-interface */
/** This interface avoids a "circular reference" compile error. */
interface DynamicListCreateMixin extends DynamicListCreateMixinType {}
/* eslint-enable @typescript-eslint/no-empty-interface */
type DynamicListCreateMixinType = typeof DYNAMIC_LIST_CREATE_MIXIN;

/* eslint-disable @typescript-eslint/naming-convention */
const DYNAMIC_LIST_CREATE_MIXIN = {
  /* eslint-enable @typescript-eslint/naming-convention */
  /** Counter for the next input to add to this block. */
  inputCounter: 2,

  /** Minimum number of inputs for this block. */
  minInputs: 2,

  /** Block for concatenating any number of strings. */
  init(this: DynamicListCreateBlock): void {
    this.setHelpUrl(Blockly.Msg['LISTS_CREATE_WITH_HELPURL']);
    this.setStyle('list_blocks');
    this.appendValueInput('ADD0')
        .appendField(Blockly.Msg['LISTS_CREATE_WITH_INPUT_WITH']);
    this.appendValueInput('ADD1');
    this.setOutput(true, 'Array');
    this.setTooltip(Blockly.Msg['LISTS_CREATE_WITH_TOOLTIP']);
  },

  /**
   * Create XML to represent number of text inputs.
   * @returns XML storage element.
   */
  mutationToDom(this: DynamicListCreateBlock): Element {
    const container = Blockly.utils.xml.createElement('mutation');
    const inputNames =
        this.inputList.map((input: Blockly.Input) => input.name).join(',');
    container.setAttribute('inputs', inputNames);
    container.setAttribute('next', String(this.inputCounter));
    return container;
  },

  /**
   * Parse XML to restore the text inputs.
   * @param xmlElement XML storage element.
   */
  domToMutation(this: DynamicListCreateBlock, xmlElement: Element): void {
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
  deserializeInputs(this: DynamicListCreateBlock, xmlElement: Element): void {
    const items = xmlElement.getAttribute('inputs');
    if (items) {
      const inputNames = items.split(',');
      this.inputList = [];
      inputNames.forEach((name) => this.appendValueInput(name));
      this.inputList[0]
          .appendField(Blockly.Msg['LISTS_CREATE_WITH_INPUT_WITH']);
    }
    const next = parseInt(xmlElement.getAttribute('next') ?? '0', 10) || 0;
    this.inputCounter = next;
  },

  /**
   * Parses XML based on the 'items' attribute (standard).
   * @param xmlElement XML storage element.
   */
  deserializeCounts(this: DynamicListCreateBlock, xmlElement: Element): void {
    const itemCount = Math.max(
        parseInt(xmlElement.getAttribute('items') ?? '0', 10), this.minInputs);
    // Two inputs are added automatically.
    for (let i = this.minInputs; i < itemCount; i++) {
      this.appendValueInput('ADD' + i);
    }
    this.inputCounter = itemCount;
  },

  /**
   * Check whether a new input should be added and determine where it should go.
   * @param connection The connection that has a pending connection.
   * @returns The index before which to insert a new input, or null if no input
   *     should be added.
   */
  getIndexForNewInput(
      this: DynamicListCreateBlock,
      connection: Blockly.Connection): number | null {
    if (!connection.targetConnection) {
      // this connection is available
      return null;
    }

    let connectionIndex = -1;
    for (let i = 0; i < this.inputList.length; i++) {
      if (this.inputList[i].connection == connection) {
        connectionIndex = i;
      }
    }

    if (connectionIndex == this.inputList.length - 1) {
      // this connection is the last one and already has a block in it, so
      // we should add a new connection at the end.
      return this.inputList.length + 1;
    }

    const nextInput = this.inputList[connectionIndex + 1];
    const nextConnection = nextInput?.connection?.targetConnection;
    if (nextConnection &&
        !nextConnection.getSourceBlock().isInsertionMarker()) {
      return connectionIndex + 1;
    }

    // Don't add new connection
    return null;
  },

  /**
   * Called by a monkey-patched version of InsertionMarkerManager when
   * a block is dragged over one of the connections on this block.
   * @param connection The connection on this block that has a pending
   *     connection.
   */
  onPendingConnection(
      this: DynamicListCreateBlock, connection: Blockly.Connection): void {
    const insertIndex = this.getIndexForNewInput(connection);
    if (insertIndex == null) {
      return;
    }
    this.appendValueInput('ADD' + (this.inputCounter++));
    this.moveNumberedInputBefore(this.inputList.length - 1, insertIndex);
  },

  /**
   * Called by a monkey-patched version of InsertionMarkerManager when a block
   * drag ends if the dragged block had a pending connection with this block.
   */
  finalizeConnections(this: DynamicListCreateBlock): void {
    if (this.inputList.length > this.minInputs) {
      let toRemove: string[] = [];
      this.inputList.forEach((input: Blockly.Input) => {
        if (!input.connection?.targetConnection) {
          toRemove.push(input.name);
        }
      });

      if (this.inputList.length - toRemove.length < this.minInputs) {
        // Always show at least two inputs
        toRemove = toRemove.slice(this.minInputs);
      }
      toRemove.forEach((inputName) => this.removeInput(inputName));
      // The first input should have the block text. If we removed the
      // first input, add the block text to the new first input.
      if (this.inputList[0].fieldRow.length == 0) {
        this.inputList[0]
            .appendField(Blockly.Msg['LISTS_CREATE_WITH_INPUT_WITH']);
      }
    }
  },
};

Blockly.Blocks['dynamic_list_create'] = DYNAMIC_LIST_CREATE_MIXIN;
