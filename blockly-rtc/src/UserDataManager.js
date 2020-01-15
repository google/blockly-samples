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

import * as Blockly from 'blockly/dist';
import Location from './Location';

export default class UserDataManager {
  constructor(workspaceId, sendLocationUpdate, getLocationUpdates,
      getBroadcastLocationUpdates) {
    this.workspaceId = workspaceId;
    this.colours = [
        '#fcba03', '#03fc20', '#03f0fc', '#035efc', '#5603fc', '#fc03d2'];
    this.sendLocationUpdate = sendLocationUpdate;
    this.getLocationUpdates = getLocationUpdates;
    this.getBroadcastLocationUpdates = getBroadcastLocationUpdates;
  };

  /**
   * Initialize the workspace by creating and registering markers for all active
   * users and activating the handling of recieving LocationUpdates from the server.
   * @public
   */
  async initMarkers() {
    const locationUpdates = await this.getLocationUpdates();
    locationUpdates.forEach((locationUpdate) => {
      this.createMarker_(locationUpdate);
    });
    if (this.getBroadcastLocationUpdates) {
      this.getBroadcastLocationUpdates(this.updateMarkerLocations_.bind(this));
    } else {
      this.pollServer_();
    };
};

  /**
   * Create a LocationUpdate from a Blockly event and send it to the server.
   * @param {!Blockly.Event} event The event for which to create a LocationUpdate.
   * @public
   */
  async handleEvent(event) {
    const location = Location.fromEvent(event);
    await this.sendLocationUpdate({
      workspaceId: this.workspaceId,
      location: location
    });
  };

  /**
   * Periodically query the database for LocationUpdates.
   * @private
   */
  async pollServer_() {
    const locationUpdates = await this.getLocationUpdates();
    await this.updateMarkerLocations_(locationUpdates);
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
   * @param {!LocationUpdate} locationUpdate The LocationUpdate for which to create
   * a Marker.
   * @returns {!Marker} marker The Marker represented by the LocationUpdate.
   * @throws Throws an error if there is no Blockly MarkerManager to add the
   * created marker to.
   * @private
   */
  createMarker_(locationUpdate) {
    if (!this.getMarkerManager_()) {
      throw Error('Cannot create a Marker without Blockly MarkerManager.');
    };
    const location = locationUpdate.location;
    const marker = location.toMarker(this.getWorkspace_());
    marker.colour = this.getColour_();
    this.getMarkerManager_().registerMarker(locationUpdate.workspaceId, marker)
    marker.setCurNode(location.createNode(this.getWorkspace_()));
    return marker;
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
   * Updates curNode on a Marker based on MarkerLocation.
   * @param {!<Array.<!LocationUpdate>>} locationUpdates The LocationUpdates which
   * contain the new MarkerLocations.
   * @private
   */
  async updateMarkerLocations_(locationUpdates) {
    const filteredLocationUpdates = locationUpdates.filter(
        locationUpdate => locationUpdate.workspaceId != this.workspaceId);
    filteredLocationUpdates.forEach((locationUpdate) => {
      const location = locationUpdate.location;
      const node = location.createNode(this.getWorkspace_());
      if (this.getMarker(locationUpdate.workspaceId)) {
        this.getMarker(locationUpdate.workspaceId).setCurNode(node);
      } else {
        this.createMarker_(locationUpdate).setCurNode(node);        
      };
    });
  };
};
