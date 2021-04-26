/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Object representing a user's cursor position on the workspace.
 * @author navil@google.com (Navil Perez)
 */

import * as Blockly from 'blockly';

export default class Position {
  constructor(type, blockId, fieldName) {
    this.type = type;
    this.blockId = blockId;
    this.fieldName = fieldName;
  };

  /**
   * Create a Position from an event. Currently supports creating Positions for
   * blocks from a 'selected' UI event.
   * @param {!Blockly.Events.Abstract} event The event that creates a Position.
   * @return {!PositionUpdate} The Position representative of the event.
   * @public
   */
  static fromEvent(event) {
    if (event.type === Blockly.Events.SELECTED) {
      return this.fromSelectedUiEvent_(
          /** @type {!Blockly.Events.Selected} */ (event));
    } else if (event.type === Blockly.Events.CHANGE &&
        event.element === 'field') {
      return this.fromFieldChangeEvent_(
          /** @type {!Blockly.Events.Change} */ (event));
    } else {
      throw Error('Cannot create position from this event.');
    }
  };

  /**
   * Create a Position from a Blockly UI event.
   * @param {!Blockly.Events.Selected} event The event that creates a Position.
   * @return {!PositionUpdate} The Position representative of the event.
   * @private
   */
  static fromSelectedUiEvent_(event) {
    // Assume this is a block selected event because workspace comments (also
    // selectable) are disabled.
    const type = 'BLOCK';
    const blockId = event.newElementId;
    const fieldName = null;
    return new Position(type, blockId, fieldName);
  };

  /**
   * Create a Position from a Blockly Change event.
   * @param {!Blockly.Event.Change} event The event that creates a Position.
   * @return {!PositionUpdate} The Position representative of the event.
   * @private
   */
  static fromFieldChangeEvent_(event) {
    const type = 'FIELD';
    const blockId = event.blockId;
    const fieldName = event.name;
    return new Position(type, blockId, fieldName);
  };

  /**
   * Decode the JSON into a Position.
   * @param {!Object} json The JSON representation of the Position.
   * @return {!PositionUpdate} The Position represented by the JSON.
   * @public
   */
  static fromJson(json) {
    return new Position(json.type, json.blockId, json.fieldName);
  };

  /**
   * Check if the combination of Position properties describe a viable position.
   * @return {!Boolean} Whether the PositionUpdate has a viable position.
   * @public
   */
  hasValidPosition() {
    if (this.type == 'FIELD' && this.blockId && this.fieldName) {
      return true;
    } else if (this.type == 'BLOCK' && this.blockId) {
      return true;
    } else {
      return false;
    };
  };

  /**
   * Create a Marker at the Position.
   * @param {!Blockly.Workspace} workspace The workspace the user is on.
   * @return {!Blockly.Marker} A Marker with the curNode set to the Position.
   * @public
   */
  toMarker(workspace) {
    const marker = new Blockly.Marker();
    const node = this.createNode(workspace);
    marker.setCurNode(node);
    return marker;
  };

  /**
   * Create an ASTNode pointing to the Position.
   * @param {!Blockly.Workspace} workspace The workspace the user is on.
   * @return {Blockly.ASTNode} An AST Node that points to the Position or null
   * if the position is not viable.
   * @public
   */
  createNode(workspace) {
    if (!this.hasValidPosition()) {
      return null;
    };
    if (this.type == 'BLOCK') {
      return this.createBlockNode_(workspace);
    } else if (this.type == 'FIELD') {
      return this.createFieldNode_(workspace);
    };
  };

  /**
   * Create an ASTNode pointing to a block.
   * @param {!Blockly.Workspace} workspace The workspace the user is on.
   * @return {Blockly.ASTNode} An AST Node that points to a block.
   * @public
   */
  createBlockNode_(workspace) {
    const block = workspace.getBlockById(this.blockId);
    return Blockly.ASTNode.createBlockNode(block);
  };

  /**
   * Create an ASTNode pointing to a field.
   * @param {!Blockly.Workspace} workspace The workspace the user is on.
   * @return {Blockly.ASTNode} An AST Node that points to a field.
   * @public
   */
  createFieldNode_(workspace) {
    const block = workspace.getBlockById(this.blockId);
    const field = block.getField(this.fieldName);
    return Blockly.ASTNode.createFieldNode(field);
  };
};
