/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The class representing a cursor that traverses all inputs,
 * fields, and connections on the workspace using next and previous. This is
 * based off of the BasicCursor that does a pre order traversal of the AST.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';

import * as Blockly from 'blockly';
import {speaker} from './speaker';
import {notePlayer} from './note_player';

/**
 * This will allow the user to get to all nodes in the AST by hitting next or
 * previous.
 * @constructor
 * @extends {Blockly.BasicCursor}
 */
export class CustomCursor extends Blockly.BasicCursor {
  /**
   * Constructor for a custom cursor.
   */
  constructor() {
    super();
    // Makes it so the ast contains all fields, not just editable fields.
    Blockly.ASTNode.NAVIGATE_ALL_FIELDS = true;
  }

  /**
   * Find the next node in the pre order traversal.
   * @return {Blockly.ASTNode} The next node, or null if the current node is
   *     not set or there is no next value.
   * @override
   */
  next() {
    const curNode = this.getCurNode();
    if (!curNode) {
      return null;
    }
    const newNode = this.getNextNode_(curNode, this.validLineNode_);

    if (newNode) {
      this.setCurNode(newNode);
    } else {
      speaker.speak(
          speaker.nodeToText_(this.getCurNode(), this.getCurNode(), false),
          true);
      notePlayer.playNote('c4', '16n');
    }
    return newNode;
  }

  /**
   * Find the previous node in the pre order traversal.
   * @return {Blockly.ASTNode} The previous node, or null if the current node
   *     is not set or there is no previous value.
   * @override
   */
  prev() {
    const curNode = this.getCurNode();
    if (!curNode) {
      return null;
    }
    const newNode = this.getPreviousNode_(curNode, this.validLineNode_);

    if (newNode) {
      this.setCurNode(newNode);
    } else {
      speaker.speak(
          speaker.nodeToText_(this.getCurNode(), this.getCurNode(), false),
          true);
      notePlayer.playNote('c4', '16n');
    }
    return newNode;
  }

  /**
   * No-op. For this cursor, we do not have the ability to go in.
   * @override
   */
  in() {}

  /**
   * No-op. For this cursor, we do not have the ability to go out.
   * @override
   */
  out() {}

  /**
   * Valid nodes are all connections, fields, inputs that are not connected to
   * another block, and blocks that do not have a previous output or previous
   * connection.
   * @param {Blockly.ASTNode} node The AST node to check whether it is valid.
   * @return {boolean} True if the node should be visited, false otherwise.
   * @private
   */
  validLineNode_(node) {
    if (!node) {
      return false;
    }
    let isValid = false;
    const location = node.getLocation();
    const type = node && node.getType();
    if (type === Blockly.ASTNode.types.BLOCK) {
      if (!location.outputConnection && !location.previousConnection) {
        isValid = true;
      }
    } else if (type === Blockly.ASTNode.types.INPUT) {
      const location = node.getLocation();
      if (location.targetConnection) {
        isValid = false;
      } else {
        isValid = true;
      }
    } else if (type === Blockly.ASTNode.types.NEXT) {
      isValid = true;
    } else if (type === Blockly.ASTNode.types.OUTPUT) {
      isValid = true;
    } else if (type === Blockly.ASTNode.types.PREVIOUS) {
      isValid = true;
    } else if (type === Blockly.ASTNode.types.STACK) {
      isValid = true;
    } else if (type === Blockly.ASTNode.types.FIELD) {
      isValid = true;
    }
    return isValid;
  }

  /**
   * Meant to traverse within a block. These are fields and input values.
   * @param {Blockly.ASTNode} node The AST node to check whether it is valid.
   * @return {boolean} True if the node should be visited, false otherwise.
   * @private
   */
  validInLineNode_(node) {
    return false;
  }
}
