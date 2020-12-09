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
 * @fileoverview Class for tracking users' metadata.
 * @author navil@google.com (Navil Perez)
 */

import * as Blockly from 'blockly';
import Position from './Position';

export default class UserDataManager {
  constructor(workspaceId, sendPositionUpdate, getPositionUpdates,
      getBroadcastPositionUpdates) {
    this.workspaceId = workspaceId;
    this.colours = [
        '#fcba03', '#03fc20', '#03f0fc', '#035efc', '#5603fc', '#fc03d2'];
    this.sendPositionUpdate = sendPositionUpdate;
    this.getPositionUpdates = getPositionUpdates;
    this.getBroadcastPositionUpdates = getBroadcastPositionUpdates;
    this.getUserDisconnects = null;
  };

  /**
   * Initialize the workspace by creating and registering markers for all active
   * users and activating the handling of recieving PositionUpdates from the server.
   * @public
   */
  async start() {
    const positionUpdates = await this.getPositionUpdates();
    positionUpdates.forEach((positionUpdate) => {
      this.createMarker_(positionUpdate);
    });
    if (this.getBroadcastPositionUpdates) {
      this.getBroadcastPositionUpdates(this.updateMarkerPositions_.bind(this));
    } else {
      this.pollServer_();
    };
    if (this.getUserDisconnects) {
      this.getUserDisconnects(this.disposeMarker_.bind(this));
    };
  };

  /**
   * Set handlers that enable the detection of user presence on the workspace
   * and send workspaceId to the server.
   * @param {!Function} connectUserHandler The callback that sends workspaceId to
   * the server.
   * @param {!Function} getUserDisconnectsHandler The callback that allows the
   * workspace to detect user disconnects.
   * @public
   */
  async setPresenceHandlers(connectUserHandler, getUserDisconnectsHandler) {
    this.getUserDisconnects = getUserDisconnectsHandler;
    await connectUserHandler(this.workspaceId);
  };

  /**
   * Create a PositionUpdate from a Blockly event and send it to the server.
   * @param {!Blockly.Events.Abstract} event The event for which to create a
   *    PositionUpdate.
   * @public
   */
  async handleEvent(event) {
    const position = Position.fromEvent(event);
    await this.sendPositionUpdate({
      workspaceId: this.workspaceId,
      position: position
    });
  };

  /**
   * Periodically query the database for PositionUpdates.
   * @private
   */
  async pollServer_() {
    const positionUpdates = await this.getPositionUpdates();
    await this.updateMarkerPositions_(positionUpdates);
    setTimeout(() => {
      this.pollServer_();
    }, 5000)
  };

  /**
   * Get the workspace that corresponds to workspaceId.
   * @return {Blockly.Workspace} The sought after workspace or null if not found.
   * @private
   */  
  getWorkspace_() {
    return Blockly.Workspace.getById(this.workspaceId);
  };

  /**
   * Get the MarkerManager for the workspace.
   * @return {Blockly.MarkerManager} The sought after MarkerManager or null if not
   * found.
   * @private
   */  
  getMarkerManager_() {
    return this.getWorkspace_() ?
        this.getWorkspace_().getMarkerManager(): null;
  };

  /**
   * Get a color to assign to a new user marker.
   * @returns {string} The string encoding a colour.
   * @private
   */  
  getColour_() {
    const colour = this.colours.shift();
    this.colours.push(colour);
    return colour;
  };

  /**
   * Create a Marker with a unique color and register it.
   * @param {!PositionUpdate} positionUpdate The PositionUpdate for which to create
   * a Marker.
   * @returns {!Marker} marker The Marker represented by the PositionUpdate.
   * @throws Throws an error if there is no Blockly MarkerManager to add the
   * created marker to.
   * @private
   */
  createMarker_(positionUpdate) {
    if (!this.getMarkerManager_()) {
      throw Error('Cannot create a Marker without Blockly MarkerManager.');
    };
    const position = positionUpdate.position;
    const marker = position.toMarker(this.getWorkspace_());
    marker.colour = this.getColour_();
    this.getMarkerManager_().registerMarker(positionUpdate.workspaceId, marker)
    marker.setCurNode(position.createNode(this.getWorkspace_()));
    return marker;
  };

  /**
   * Unregister the Marker from Blockly MarkerManager and dispose the marker.
   * @param {!String} workspaceId The workspaceId of the user whose marker is
   * getting disposed.
   * @throws Throws an error if there is no Blockly MarkerManager.
   * @private
   */
  disposeMarker_(workspaceId) {
    if (!this.getMarkerManager_()) {
      throw Error('Cannot dispose of a Marker without Blockly MarkerManager.');
    };
    try {
      this.getMarkerManager_().unregisterMarker(workspaceId);
    } catch {};
  };

  /**
   * Get the Marker that corresponds to the given user.
   * @param {string} workspaceId The workspaceId of the user.
   * @returns {Blockly.Marker} The Marker for the user if it exists, otherwise
   * null.
   * @private
   */  
  getMarker(workspaceId) {
    return this.getMarkerManager_() ?
        this.getMarkerManager_().getMarker(workspaceId) : null;
  };

  /**
   * Updates curNode on a Marker based on MarkerPosition.
   * @param {!<Array.<!PositionUpdate>>} positionUpdates The PositionUpdates which
   * contain the new MarkerPositions.
   * @private
   */
  async updateMarkerPositions_(positionUpdates) {
    const filteredPositionUpdates = positionUpdates.filter(
        positionUpdate => positionUpdate.workspaceId != this.workspaceId);
    filteredPositionUpdates.forEach((positionUpdate) => {
      const position = positionUpdate.position;
      const node = position.createNode(this.getWorkspace_());
      if (this.getMarker(positionUpdate.workspaceId)) {
        this.getMarker(positionUpdate.workspaceId).setCurNode(node);
      } else {
        this.createMarker_(positionUpdate).setCurNode(node);        
      };
    });
  };
};
