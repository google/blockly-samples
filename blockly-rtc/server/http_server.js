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
 * @fileoverview Node.js HTTP server for realtime collaboration.
 * @author navil@google.com (Navil Perez)
 */

const http = require('http'); 
const url = require('url');

const EventsHandlers = require('./http/events_handlers');
const UsersHandlers = require('./http/users_handlers');

const PORT = 3001;

http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  if (req.method === 'GET' && parsedUrl.pathname === '/api/events/query') {
    await EventsHandlers.queryEventsHandler(res, parsedUrl.query.serverId);
  } else if (req.method === 'POST' && parsedUrl.pathname === '/api/events/add') {
    await EventsHandlers.addEventsHandler(req, res);
  } else if (req.method === 'GET' && parsedUrl.pathname === '/api/snapshot/query') {
    await EventsHandlers.getSnapshotHandler(res);
  } else if (req.method === 'GET' && parsedUrl.pathname === '/api/users/position/query') {
    await UsersHandlers.getPositionUpdatesHandler(res, parsedUrl.query.workspaceId);
  } else if (req.method === 'PUT' && parsedUrl.pathname === '/api/users/position/update') {
    await UsersHandlers.updatePositionHandler(req, res);
  } else {
    res.statusCode = 404;
    res.end();
  };
}).listen(PORT, () => { 
    console.log('server start at port 3001'); 
});

