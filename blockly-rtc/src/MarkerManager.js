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
 * @fileoverview Wrapper class for interacting with the Blockly MarkerManager.
 * @author navil@google.com (Navil Perez)
 */

import * as Blockly from 'blockly/dist';
import MarkerUpdate from './MarkerUpdate';

export default class MarkerManager {
  constructor(workspaceId, sendMarkerUpdate, getMarkerUpdates,
      addClient, getBroadcastMarkerUpdates) {
    this.workspaceId = workspaceId
    this.colours =  [
        '#fcba03', '#03fc20', '#03f0fc', '#035efc', '#5603fc', '#fc03d2'];
    this.sendMarkerUpdate = sendMarkerUpdate;
    this.getMarkerUpdates = getMarkerUpdates;
    this.addClient = addClient;
    this.broadcastMarkerHandler = getBroadcastMarkerUpdates;
  };

  /**
   * Initialize the workspace by creating and registering markers for all active
   * users and activating the handling of recieving MarkerUpdates from the server.
   * @public
   */
  async initMarkers() {
    await this.addClient(this.workspaceId);
    const markerUpdates = await this.getMarkerUpdates();
    markerUpdates.forEach((markerUpdate) => {
      this.createMarker_(markerUpdate);
      if (this.broadcastMarkerHandler) {
        this.broadcastMarkerHandler(this.updateMarkerLocations_.bind(this));
      } else {
        this.pollServer_();
      };
    });
  };

  /**
   * Create a MarkerUpdate from a Blockly event and send it to the server.
   * @param {!Blockly.Event} The event for which to create a MarkerUpdate.
   * @public
   */
  async handleEvent(event) {
    const markerUpdate = MarkerUpdate.fromEvent(event);
    await this.sendMarkerUpdate(markerUpdate);
  };

  /**
   * Periodically query the database for MarkerUpdates.
   * @private
   */
  async pollServer_() {
    const markerUpdates = await this.getMarkerUpdates();
    await this.updateMarkerLocations_(markerUpdates);
    setTimeout(() => {
      this.pollServer_();
    }, 5000)
  };

  /**
   * Get the workspace with the id specified by the MarkerUpdate.
   * @return {Blockly.Workspace} The sought after workspace or null if not found.
   * @private
   */  
  getWorkspace_() {
    return Blockly.Workspace.getById(this.workspaceId);
  };

  /**
   * Get the MarkerManager for the workspace specified by MarkerUpdate.
   * @return {Blockly.MarkerManager} The sought after MarkerManager or null if not
   * found.
   * @private
   */  
  getMarkerManager_() {
    return this.getWorkspace_().getMarkerManager();
  };

  /**
   * Get a unique color to assign to a new client marker.
   * @returns {string} The string encoding a colour.
   * @private
   */  
  setColour_() {
    return this.colours.pop();
  };

  /**
   * Create a Marker with a unique color and register it.
   * @param {!MarkerUpdate} markerUpdate The MarkerUpdate for which to create
   * a Marker.
   * @returns {!Marker} marker The Marker represented by the MarkerUpdate.
   * @private
   */
  createMarker_(markerUpdate) {
    const marker = markerUpdate.toMarker(this.getWorkspace_());
    marker.colour = this.setColour_();
    this.getMarkerManager_().registerMarker(markerUpdate.id, marker)
    marker.setCurNode(markerUpdate.createNode(this.getWorkspace_()));
    return marker;
  };

  /**
   * Get the Marker that corresponds to the given client.
   * @param {!string} workspaceId The workspaceId of the client.
   * @returns {Marker} The Marker for the client if it exists, otherwise null.
   * @private
   */  
  getMarker(workspaceId) {
    return this.getMarkerManager_().getMarker(workspaceId);
  };

  /**
   * Updates curNode on a Marker based on MarkerLocation.
   * @param {!<Array.<!MarkerUpdate>>} markerUpdates The MarkerUpdates which
   * contain the new MarkerLocations.
   * @private
   */
  async updateMarkerLocations_(markerUpdates) {
    const filteredMarkerUpdates = markerUpdates.filter(
        markerUpdate => markerUpdate.id != this.workspaceId);
    filteredMarkerUpdates.forEach((markerUpdate) => {
      const node = markerUpdate.createNode(this.getWorkspace_());
      if (this.getMarker(markerUpdate.id) == undefined) {
        this.createMarker_(markerUpdate).setCurNode(node);
      } else {
        this.getMarker(markerUpdate.id).setCurNode(node);
      };
    });
  };
};
