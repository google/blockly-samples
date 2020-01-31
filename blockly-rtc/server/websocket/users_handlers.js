/**
 * @license
 * 
 * Copyright 2020 Google LLC
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
 * @fileoverview Websocket middleware functions for interacting the with the
 * Users Table.
 * @author navil@google.com (Navil Perez)
 */

const database = require('../Database');

/**
 * Handler for an updatePosition message. Update a user's position in the
 * users table and broadcast the PositionUpdate to all users except the
 * sender.
 * @param {!Object} user The user who sent the message.
 * @param {!PositionUpdate} positionUpdate The PositionUpdate with the new
 * position for a given user.
 * @param {!Function} callback The callback passed in by WorkspaceClient to
 * receive acknowledgement of the success of the write.
 * @private
 */
async function updatePositionHandler(user, positionUpdate, callback) {
  await database.updatePosition(positionUpdate);
  callback();
  user.broadcast.emit('broadcastPosition', [positionUpdate]);
};

/**
 * Handler for a getPositionUpdates message. Query the database for a
 * PositionUpdate for the specified user or all if no user specified.
 * @param {string=} workspaceId The workspaceId for the specified user.
 * @param {!Function} callback The callback passed in by WorkspaceClient to
 * receive the PositionUpdates upon success of the query.
 * @private
 */
async function getPositionUpdatesHandler(workspaceId, callback) {
  const positionUpdates = await database.getPositionUpdates(workspaceId);
  callback(positionUpdates);
};

/**
 * Handler for a connectUser message. Attach the workspaceId to the user and
 * add the user to the users table.
 * @param {!Object} user The user connecting.
 * @param {string} workspaceId The workspaceId for the connecting user.
 * @param {!Function} callback The callback passed in by WorkspaceClient to
 * receive acknowledgement of the success of the connection.
 * @public
 */
async function connectUserHandler(user, workspaceId, callback) {
  user.workspaceId = workspaceId;
  const positionUpdate = {
    workspaceId: workspaceId,
    position: {
      type: null,
      blockId: null,
      fieldName: null
    },
  };
  await updatePositionHandler(user, positionUpdate, callback);
};

/**
 * Handler for a disconnect. Delete the user from the users table.
 * @param {string} workspaceId The workspaceId for the disconnecting user.
 * @param {!Function} callback The callback that broadcasts the disconnect to
 * the connected users.
 * @public
 */
async function disconnectUserHandler(workspaceId, callback) {
  await database.deleteUser(workspaceId);
  callback();
};

module.exports.updatePositionHandler = updatePositionHandler;
module.exports.getPositionUpdatesHandler = getPositionUpdatesHandler;
module.exports.disconnectUserHandler = disconnectUserHandler;
module.exports.connectUserHandler = connectUserHandler;
