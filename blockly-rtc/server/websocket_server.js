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
 * @fileoverview Node.js HTTP server for realtime collaboration.
 * @author navil@google.com (Navil Perez)
 */

const socket = require('socket.io');
const http = require('http');

const Database = require('./Database').Database;

const database = new Database();
const WS_PORT = 3001;
 
const server = http.createServer(function(request, response) {
  console.log((new Date()) + ' Received request for ' + request.url);
  response.writeHead(404);
  response.end();
});
server.listen(WS_PORT, function() {
  console.log((new Date()) + ' Server is listening on port 3001');
});

io = socket(server);
io.on('connection', (user) => {
  onConnect_(user);
});

/**
 * Handler for listening to and emitting messages between the server and
 * connected users.
 * @param {!Object} user The user connecting.
 * @private
 */
async function onConnect_(user) {
  user.on('disconnect', () => {
    console.log('User disconnected.');
  });

  user.on('addEvents', async (entry, callback) => {
    await addEventsHandler_(entry, callback);
  });

  user.on('getEvents', async (serverId, callback) => {
    await getEventsHandler_(serverId, callback);
  });

  user.on('sendPositionUpdate', async (positionUpdate, callback) => {
    updatePositionHandler_(user, positionUpdate, callback);
  });

  user.on('getPositionUpdates', async (workspaceId, callback) => {
    getPositionUpdatesHandler_(workspaceId, callback);
  });
};

/**
 * Handler for a getEvents message. Query the database for events since the
 * last serverId.
 * @param {number} serverId serverId for the lower bound of the query.
 * @param {!Function} callback The callback passed in by WorkspaceClient to
 * receive acknowledgement of the success of the write.
 * @private
 */
async function getEventsHandler_(serverId, callback) {
  const entries = await database.query(serverId);
  callback(entries);
};

/**
 * Handler for an addEvents message. Add an entry to the database.
 * @param {!LocalEntry} entry The entry to be added to the database.
 * @param {!Function} callback The callback passed in by WorkspaceClient to
 * receive the serverId upon success of the query.
 * @private
 */
async function addEventsHandler_(entry, callback) {
  const serverId = await database.addToServer(entry);
  entry.serverId = serverId;
  callback(serverId);
  io.emit('broadcastEvents', [entry]);
};

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
async function updatePositionHandler_(user, positionUpdate, callback) {
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
async function getPositionUpdatesHandler_(workspaceId, callback) {
  const positionUpdates = await database.getPositionUpdates(workspaceId);
  callback(positionUpdates);
};
