
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
import Position from '../Position';

const socket = io('http://localhost:3001');

/**
 * Get the position for a given user. If no user is specified will return the
 * positions of all users.
 * @param {string=} workspaceId workspaceId of the user.
 * @return {!Promise} Promise object with an array of PositionUpdate objects.
 * @public
 */
export async function getPositionUpdates(workspaceId) {
  return new Promise((resolve, reject) => {
    socket.emit('getPositionUpdates', workspaceId, (positionUpdates) => {
      positionUpdates.forEach((positionUpdate) => {
        positionUpdate.position = Position.fromJson(positionUpdate.position);
      });
      resolve(positionUpdates);
    });
  });
};

/**
 * Update the position of a user in the database.
 * @param {!PositionUpdate} positionUpdate The PositionUpdate with the new
 * position for a given user.
 * @return {!Promise} Promise object representing the success of the update.
 * @public
 */
export async function sendPositionUpdate(positionUpdate) {
  return new Promise((resolve, reject) => {
    socket.emit('sendPositionUpdate', positionUpdate, () => {
      resolve();
    });
  });
};

/**
 * Listen for PositionUpdates broadcast by the server.
 * @param {!Function} callback The callback handler that passes the
 * PositionUpdates to WorkspaceClient.
 * @public
 */
export function getBroadcastPositionUpdates(callback) {
  socket.on('broadcastPosition', async (positionUpdates)=> {
    positionUpdates.forEach((positionUpdate) => {
      positionUpdate.position = Position.fromJson(positionUpdate.position);
    });
    await callback(positionUpdates);
  });
};
