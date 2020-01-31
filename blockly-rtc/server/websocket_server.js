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

const EventsHandlers = require('./websocket/events_handlers');
const UsersHandlers = require('./websocket/users_handlers');

const WS_PORT = 3001;
 
const server = http.createServer(function(request, response) {
  response.writeHead(404);
  response.end();
});

server.listen(WS_PORT, function() {
  console.log('server start at port 3001');
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
  user.on('connectUser', async (workspaceId, callback) => {
    await UsersHandlers.connectUserHandler(user, workspaceId, callback);
  });

  user.on('disconnect', async () => {
    await UsersHandlers.disconnectUserHandler(user.workspaceId, () => {
      io.emit('disconnectUser', user.workspaceId);
    });
  });

  user.on('addEvents', async (entry, callback) => {
    await EventsHandlers.addEventsHandler(entry, (serverId) => {
      entry.serverId = serverId;
      io.emit('broadcastEvents', [entry]);
      callback(serverId);
    });
  });

  user.on('getEvents', async (serverId, callback) => {
    await EventsHandlers.getEventsHandler(serverId, callback);
  });

  user.on('sendPositionUpdate', async (positionUpdate, callback) => {
    await UsersHandlers.updatePositionHandler(user, positionUpdate, callback);
  });

  user.on('getPositionUpdates', async (workspaceId, callback) => {
    await UsersHandlers.getPositionUpdatesHandler(workspaceId, callback);
  });

  user.on('getSnapshot', async (callback) => {
    await EventsHandlers.getSnapshotHandler(callback);
  });
};
