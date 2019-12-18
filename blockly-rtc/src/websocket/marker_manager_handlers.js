
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
 * @fileoverview Websocket APIs for passing MarkerUpdates between the client
 * and the server.
 * @author navil@google.com (Navil Perez)
 */

import io from 'socket.io-client';
import MarkerUpdate from '../MarkerUpdate';

const socket = io('http://localhost:3001');

/**
 * Get a MarkerUpdate for given client. If no client is specified will return
 * a MarkerUpdate for all clients.
 * @param {string=} workspaceId workspaceId of the client.
 * @return {!Promise} Promise object with an array of MarkerUpdate objects.
 * @public
 */
export async function getMarkerUpdates(workspaceId) {
  return new Promise((resolve, reject) => {
    socket.emit('getMarkerUpdates', workspaceId, (markerUpdatesJson) => {
      const markerUpdates = markerUpdatesJson
      .map(markerUpdate => MarkerUpdate.fromJson(markerUpdate));
      resolve(markerUpdates);
    });
  });
};

/**
 * Update the MarkerLocation of a client in the database.
 * @param {!MarkerUpdate} markerUpdate The MarkerUpdate with the new
 * MarkerLocation for a given client.
 * @return {!Promise} Promise object represents the success of the update.
 * @public
 */
export async function sendMarkerUpdate(markerUpdate) {
  return new Promise((resolve, reject) => {
    socket.emit('sendMarkerUpdate', markerUpdate.toJson(), () => {
      resolve();
    });
  });
};

/**
 * Listen for MarkerUpdates broadcast by the server.
 * @param {!Function} callback The callback handler that passes the MarkerUpdates
 * to the client.
 * @public
 */
export function getBroadcastMarkerUpdates(callback) {
  socket.on('broadcastMarker', async (markerUpdatesJson)=> {
    const markerUpdates = markerUpdatesJson
    .map(markerUpdate => MarkerUpdate.fromJson(markerUpdate));
    await callback(markerUpdates);
  });
};

/**
 * Add the client to the database if not already in it. A client needs to be in
 * the database in order for it to appear as a marker.
 * @param {!string} workspaceId The workspaceId of the client.
 * @return {!Promise} Promise object representing the success of the query.
 * @public
 */
export async function addClient(workspaceId) {
  return new Promise((resolve, reject) => {
    socket.emit('addClient', workspaceId, () => {
      resolve();
    })
  });
};