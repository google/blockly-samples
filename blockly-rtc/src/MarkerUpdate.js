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
 * @fileoverview Object for communicating an update to a Marker's location.
 * @author navil@google.com (Navil Perez)
 */

import * as Blockly from 'blockly/dist';

export default class MarkerUpdate {
  constructor(id, type, blockId, fieldName) {
    this.id = id;
    this.type_ = type;
    this.blockId_ = blockId;
    this.fieldName_ = fieldName;
  };

  /**
   * Create a MarkerUpdate from an event. Currently supports MarkerUpdates
   * on blocks from a 'selected' UI event.
   * @param {!Blockly.Event} event The event that creates a MarkerUpdate.
   * @return {!MarkerUpdate} The MarkerUpdate representative of the event.
   * @public
   */  
  static fromEvent(event) {
    // TODO: Add support for a field marker on a change event.
    const id = event.workspaceId;
    const type = 'BLOCK';
    const blockId = event.newValue;
    const fieldName = null;
    return new MarkerUpdate(id, type, blockId, fieldName);  
  };

  /**
   * Decode the JSON into a MarkerUpdate.
   * @param {!Object} json The JSON representation of the markerUpdate.
   * @return {!MarkerUpdate} The MarkerUpdate represented by the JSON.
   * @public
   */
  static fromJson(json) {
    const markerLocation = json.markerLocation;
    return new MarkerUpdate(
        json.id,
        markerLocation.type,
        markerLocation.blockId,
        markerLocation.fieldName);
  };

  /**
   * Encode the MarkerUpdate as JSON.
   * @return {!Object} The JSON representation of the MarkerUpdate.
   * @public
   */
  toJson() {
    return {
      id: this.id,
      markerLocation: this.getMarkerLocation()
    };
  };

  /**
   * Check if the combination of MarkerLocation properties describe a
   * viable location.
   * @return {!Boolean} Whether the MarkerUpdate has a viable location.
   * @public
   */  
  hasLocation() {
    if (this.type_ == 'FIELD' || this.blockId_ || this.fieldName_) {
      return true;
    } else if (this.type_ == 'BLOCK' || this.blockId_) {
      return true;
    } else {
      return false;
    };
  };

  /**
   * Get the location of the MarkerUpdate.
   * @return {!MarkerLocation} The MarkerLocation on the MarkerUpdate.
   * @public
   */
  getMarkerLocation() {
    return {
      type: this.type_,
      blockId: this.blockId_,
      fieldName: this.fieldName_
    };
  };
  
  /**
   * Decode the MarkerUpdate into a Marker object.
   * @param {!Blockly.Workspace} workspace The workspace the user is on.
   * @return {!MarkerUpdate} The MarkerUpdate represented by the JSON.
   * @public
   */
  toMarker(workspace) {
    const marker = new Blockly.Marker();
    const node = this.createNode(workspace);
    marker.setCurNode(node);
    return marker;
  };

  /**
   * Create an ASTNode pointing to the MarkerUpdate location.
   * @param {!Blockly.Workspace} workspace The workspace the user is on.
   * @return {Blockly.ASTNode} An AST Node that points to the MarkerUpdate
   * location or null if the location is not viable.
   * @public
   */
  createNode(workspace) {
    if (!this.hasLocation()) {
      return null;
    };
    if (this.type_ == 'BLOCK') {
      return this.createBlockNode_(workspace);
    } else if (this.type_ == 'FIELD') {
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
    const block = workspace.getBlockById(this.blockId_);
    return Blockly.ASTNode.createBlockNode(block);
  };

  /**
   * Create an ASTNode pointing to a field.
   * @param {!Blockly.Workspace} workspace The workspace the user is on.
   * @return {Blockly.ASTNode} An AST Node that points to a field.
   * @public
   */  
  createFieldNode_(workspace) {
    const block = workspace.getBlockById(this.blockId_);
    const field = block.getField(this.fieldName_);
    return Blockly.ASTNode.createFieldNode(field);
  };
};
