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
  onConnect(user);
});

async function onConnect(user) {
  user.on('disconnect', () => {
    console.log('User disconnected.');
  });

  user.on('addEvents', async (entry, callback) => {
    const serverId = await database.addToServer(entry);
    entry.serverId = serverId;
    callback(serverId);
  });

  user.on('getEvents', async (serverId, callback) => {
    const rows = await database.query(serverId);
    callback(rows);
  });

};