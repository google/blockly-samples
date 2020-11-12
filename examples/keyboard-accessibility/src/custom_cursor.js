/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The class representing a line cursor.
 * A line cursor traverses the blocks as if they were
 * lines of code in a text editor.
 * Previous and next go up and down lines. In and out go
 * through the elements in a line.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';

import * as Blockly from 'blockly';

/**
 * Class for a line cursor.
 * This will allow the user to get to all nodes in the AST by hitting next or
 * previous.
 * @constructor
 * @extends {Blockly.BasicCursor}
 */
export class CustomCursor extends Blockly.BasicCursor {
  /**
   * Constructor for a line cursor.
   */
  constructor() {
    super();
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
    let newNode = this.getNextNode_(curNode, this.validLineNode_);

    // Skip the input or next value if there is a connected block.
    // if (newNode && (newNode.getType() == Blockly.ASTNode.types.INPUT ||
    //     newNode.getType() == Blockly.ASTNode.types.NEXT) &&
    //     newNode.getLocation().targetBlock()) {
    //   newNode = this.getNextNode_(newNode, this.validLineNode_);
    // }
    if (newNode) {
      this.setCurNode(newNode);
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
    let newNode = this.getPreviousNode_(curNode, this.validLineNode_);

    // if (newNode && (newNode.getType() == Blockly.ASTNode.types.INPUT ||
    //   newNode.getType() == Blockly.ASTNode.types.NEXT) &&
    //   newNode.getLocation().targetBlock()) {
    //   newNode = this.getPreviousNode_(newNode, this.validLineNode_);
    // }

    if (newNode) {
      this.setCurNode(newNode);
    }
    return newNode;
  }

  /**
   * For a basic cursor we only have the ability to go next and previous, so
   * in will also allow the user to get to the next node in the pre order
   * traversal.
   * @return {Blockly.ASTNode} The next node, or null if the current node is
   *     not set or there is no next value.
   * @override
   */
  in() {
    const curNode = this.getCurNode();
    if (!curNode) {
      return null;
    }
    const newNode = this.getNextNode_(curNode, this.validInLineNode_);

    if (newNode) {
      this.setCurNode(newNode);
    }
    return newNode;
  }

  /**
   * For a basic cursor we only have the ability to go next and previous, so
   * out will allow the user to get to the previous node in the pre order
   * traversal.
   * @return {Blockly.ASTNode} The previous node, or null if the current
   *     node is not set or there is no previous value.
   * @override
   */
  out() {
    const curNode = this.getCurNode();
    if (!curNode) {
      return null;
    }
    const newNode = this.getPreviousNode_(curNode, this.validInLineNode_);

    if (newNode) {
      this.setCurNode(newNode);
    }
    return newNode;
  }

  /**
   * Meant to traverse by lines of code. This is blocks, statement inputs and
   * next connections.
   * @param {Blockly.ASTNode} node The AST node to check whether it is valid.
   * @return {boolean} True if the node should be visited, false otherwise.
   * @private
   */
  validLineNode_(node) {
    if (!node) {
      return false;
    }
    var isValid = false;
    var location = node.getLocation();
    var type = node && node.getType();
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
  //   if (!node) {
  //     return false;
  //   }
  //   let isValid = false;
  //   const location = node.getLocation();
  //   const type = node && node.getType();
  //   if (type === Blockly.ASTNode.types.FIELD) {
  //     isValid = true;
  //   } else if (type === Blockly.ASTNode.types.INPUT &&
  //       location.type === Blockly.INPUT_VALUE) {
  //     isValid = true;
  //   } else if (type == Blockly.ASTNode.types.OUTPUT) {
  //     isValid = true;
  //   } else if (type == Blockly.ASTNode.types.STACK) {
  //     isValid = true;
  //   }
  //   return isValid;
  // }
}
