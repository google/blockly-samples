
/**
 * @license
 * 
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
 * @fileoverview Websocket APIs for passing user metadata between the client and
 * the server.
 * @author navil@google.com (Navil Perez)
 */

import io from 'socket.io-client';
import Location from '../Location';

const socket = io('http://localhost:3001');

/**
 * Get the location for a given user. If no user is specified will return the
 * locations of all users.
 * @param {string=} workspaceId workspaceId of the user.
 * @return {!Promise} Promise object with an array of LocationUpdate objects.
 * @public
 */
export async function getLocationUpdates(workspaceId) {
  return new Promise((resolve, reject) => {
    socket.emit('getLocationUpdates', workspaceId, (locationUpdates) => {
      locationUpdates.forEach((locationUpdate) => {
        locationUpdate.location = Location.fromJson(locationUpdate.location);
      });
      resolve(locationUpdates);
    });
  });
};

/**
 * Update the location of a user in the database.
 * @param {!LocationUpdate} locationUpdate The LocationUpdate with the new
 * location for a given user.
 * @return {!Promise} Promise object representing the success of the update.
 * @public
 */
export async function sendLocationUpdate(locationUpdate) {
  return new Promise((resolve, reject) => {
    socket.emit('sendLocationUpdate', locationUpdate, () => {
      resolve();
    });
  });
};

/**
 * Listen for LocationUpdates broadcast by the server.
 * @param {!Function} callback The callback handler that passes the
 * LocationUpdates to WorkspaceClient.
 * @public
 */
export function getBroadcastLocationUpdates(callback) {
  socket.on('broadcastLocation', async (locationUpdates)=> {
    locationUpdates.forEach((locationUpdate) => {
      locationUpdate.location = Location.fromJson(locationUpdate.location);
    });
    await callback(locationUpdates);
  });
};
