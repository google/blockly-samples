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
  inputCounter: 3,

  /** Minimum number of inputs for this block. */
  minInputs: 2,

  itemCount: 0,

  /** Block for concatenating any number of strings. */
  init(this: DynamicListCreateBlock): void {
    this.itemCount = this.minInputs;

    this.setHelpUrl(Blockly.Msg['LISTS_CREATE_WITH_HELPURL']);
    this.setStyle('list_blocks');
    this.appendValueInput('ADD0')
        .appendField(Blockly.Msg['LISTS_CREATE_WITH_INPUT_WITH']);
    for (let i = 1; i < this.minInputs; i++) this.appendValueInput(`ADD${i}`);
    this.setOutput(true, 'Array');
    this.setTooltip(Blockly.Msg['LISTS_CREATE_WITH_TOOLTIP']);
  },

  /**
   * Create XML to represent number of text inputs.
   * @returns XML storage element.
   */
  mutationToDom(this: DynamicListCreateBlock): Element {
    const container = Blockly.utils.xml.createElement('mutation');
    container.setAttribute('items', `${this.itemCount}`);
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
    this.itemCount = Math.max(
        parseInt(xmlElement.getAttribute('items') ?? '0', 10), this.minInputs);
    // minInputs are added automatically.
    for (let i = this.minInputs; i < this.itemCount; i++) {
      this.appendValueInput('ADD' + i);
    }
    this.inputCounter = this.itemCount + 1;
  },

  /**
   * Check whether a new input should be added and determine where it should go.
   * @param connection The connection that has a pending connection.
   * @returns The index before which to insert a new input, or null if no input
   *     should be added.
   */
  findInputIndexForConnection(
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
    const insertIndex = this.findInputIndexForConnection(connection);
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
    const targetConns =
        this.removeUnnecessaryEmptyConns(
            this.inputList.map((i) => i.connection?.targetConnection));
    this.deleteDynamicInputs();
    this.addItemInputs(targetConns);
    this.itemCount = targetConns.length;
  },

  /**
   * Deletes all inputs except for the first one, which is static.
   */
  deleteDynamicInputs(this: DynamicListCreateBlock): void {
    for (let i = this.inputList.length - 1; i >= 1; i--) {
      this.removeInput(this.inputList[i].name);
    }
  },

  /**
   * Filters the given target connections so that empty connections are removed,
   * unless we need those to reach the minimum input count. Empty connections
   * are removed starting at the end of the array.
   * @param targetConns The list of connections associated with inputs.
   * @returns A filtered list of connections (or null/undefined) which should
   *     be attached to inputs.
   */
  removeUnnecessaryEmptyConns(
      targetConns: Array<Blockly.Connection | undefined | null>
  ): Array<Blockly.Connection | undefined | null> {
    const filteredConns = [...targetConns];
    for (let i = filteredConns.length - 1; i >= 0; i--) {
      if (!filteredConns[i] && filteredConns.length > this.minInputs) {
        filteredConns.splice(i, 1);
      }
    }
    return filteredConns;
  },

  /**
   * Adds inputs based on the given array of target cons. An input is added for
   * every entry in the array (if it does not already exist). If the entry is
   * a connection and not null/undefined the connection will be connected to
   * the input.
   * @param targetConns The connections defining the inputs to add.
   */
  addItemInputs(
      this: DynamicListCreateBlock,
      targetConns: Array<Blockly.Connection | undefined | null>,
  ): void {
    for (let i = 0; i < targetConns.length; i++) {
      let input = this.getInput(`ADD${i}`);
      if (!input) input = this.appendValueInput(`ADD${i}`);

      const targetConn = targetConns[i];
      if (targetConn) input.connection?.connect(targetConn);
    }
  },
};

Blockly.Blocks['dynamic_list_create'] = DYNAMIC_LIST_CREATE_MIXIN;
