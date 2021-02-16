/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The class representing a line cursor.
 * A line cursor tries to traverse the blocks and connections on a block as if
 * they were lines of code in a text editor. Previous and next traverse previous
 * connections, next connections and blocks, while in and out traverse input
 * connections and fields.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */

import * as Blockly from 'blockly/core';

/**
 * Class for a line cursor.
 * @constructor
 * @extends {Blockly.BasicCursor}
 */
export class LineCursor extends Blockly.BasicCursor {
  /**
   * Constructor for a line cursor.
   */
  constructor() {
    super();
  }

  /**
   * Moves the cursor to the next previous connection, next connection or block
   * in the pre order traversal. Finds the next node in the pre order traversal.
   * @return {Blockly.ASTNode} The next node, or null if the current node is
   *     not set or there is no next value.
   * @override
   */
  next() {
    const curNode = this.getCurNode();
    if (!curNode) {
      return null;
    }
    let newNode = this.getNextNode_(curNode, this.validLineNode);

    // Skip the input or next value if there is a connected block.
    if (newNode &&
        (newNode.getType() == Blockly.ASTNode.types.INPUT ||
         newNode.getType() == Blockly.ASTNode.types.NEXT) &&
        newNode.getLocation().targetBlock()) {
      newNode = this.getNextNode_(newNode, this.validLineNode);
    }
    if (newNode) {
      this.setCurNode(newNode);
    }
    return newNode;
  }

  /**
   * Moves the cursor to the next input connection or field
   * in the pre order traversal.
   * @return {Blockly.ASTNode} The next node, or null if the current node is
   *     not set or there is no next value.
   * @override
   */
  in() {
    const curNode = this.getCurNode();
    if (!curNode) {
      return null;
    }
    const newNode = this.getNextNode_(curNode, this.validInLineNode);

    if (newNode) {
      this.setCurNode(newNode);
    }
    return newNode;
  }
  /**
   * Moves the cursor to the previous next connection or previous connection in
   * the pre order traversal.
   * @return {Blockly.ASTNode} The previous node, or null if the current node
   *     is not set or there is no previous value.
   * @override
   */
  prev() {
    const curNode = this.getCurNode();
    if (!curNode) {
      return null;
    }
    let newNode = this.getPreviousNode_(curNode, this.validLineNode);

    if (newNode &&
        (newNode.getType() == Blockly.ASTNode.types.INPUT ||
         newNode.getType() == Blockly.ASTNode.types.NEXT) &&
        newNode.getLocation().targetBlock()) {
      newNode = this.getPreviousNode_(newNode, this.validLineNode);
    }

    if (newNode) {
      this.setCurNode(newNode);
    }
    return newNode;
  }
  /**
   * Moves the cursor to the previous input connection or field in the pre order
   * traversal.
   * @return {Blockly.ASTNode} The previous node, or null if the current node is
   *     not set or there is no previous value.
   * @override
   */
  out() {
    const curNode = this.getCurNode();
    if (!curNode) {
      return null;
    }
    const newNode = this.getPreviousNode_(curNode, this.validInLineNode);

    if (newNode) {
      this.setCurNode(newNode);
    }
    return newNode;
  }

  /**
   * Decides if the previous and next methods should traverse the given node.
   * The previous and next method only traverse previous connections, next
   * connections and blocks.
   * @param {Blockly.ASTNode} node The AST node to check.
   * @return {boolean} True if the node should be visited, false otherwise.
   * @protected
   */
  validLineNode(node) {
    if (!node) {
      return false;
    }
    let isValid = false;
    const location = node.getLocation();
    const type = node && node.getType();
    if (type == Blockly.ASTNode.types.BLOCK) {
      if (location.outputConnection === null) {
        isValid = true;
      }
    } else if (
      type == Blockly.ASTNode.types.INPUT &&
        location.type == Blockly.NEXT_STATEMENT) {
      isValid = true;
    } else if (type == Blockly.ASTNode.types.NEXT) {
      isValid = true;
    }
    return isValid;
  }

  /**
   * Decides if the in and out methods should traverse the given node.
   * The in and out method only traverse fields and input connections.
   * @param {Blockly.ASTNode} node The AST node to check whether it is valid.
   * @return {boolean} True if the node should be visited, false otherwise.
   * @protected
   */
  validInLineNode(node) {
    if (!node) {
      return false;
    }
    let isValid = false;
    const location = node.getLocation();
    const type = node && node.getType();
    if (type == Blockly.ASTNode.types.FIELD) {
      isValid = true;
    } else if (
      type == Blockly.ASTNode.types.INPUT &&
        location.type == Blockly.INPUT_VALUE) {
      isValid = true;
    }
    return isValid;
  }
}


export const registrationName = 'LineCursor';
export const registrationType = Blockly.registry.Type.CURSOR;

Blockly.registry.register(registrationType, registrationName, LineCursor);

export const pluginInfo = {
  [registrationType]: registrationName,
};
