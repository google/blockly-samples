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

const Database = require('./Database').Database;

const database = new Database();
const PORT = 3001;

http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  if (req.method === 'GET' && parsedUrl.pathname === '/api/events/query') {
    await queryEventsHandler_(res, parsedUrl.query.serverId);
  } else if (req.method === 'POST' && parsedUrl.pathname === '/api/events/add') {
    await addEventsHandler_(req, res);
  } else if (req.method === 'GET' && parsedUrl.pathname === '/api/markers/query') {
    await getMarkerUpdatesHandler_(res, parsedUrl.query.workspaceId);
  } else if (req.method === 'POST' && parsedUrl.pathname === '/api/markers/add') {
    await addClientHandler_(res, parsedUrl.query.workspaceId);
  } else if (req.method === 'PUT' && parsedUrl.pathname === '/api/markers/update') {
    await updateMarkerHandler_(req, res);
  } else {
    res.statusCode = 404;
    res.end();
  };
}).listen(PORT, () => { 
    console.log('server start at port 3001'); 
});

/**
 * Handler for an events GET request. Query the database for events since the
 * last serverId and return them in the HTTP response.
 * @param {!Object} res The HTTP response object.
 * @param {number} serverId serverId for the lower bound of the query.
 * @private
 */
async function queryEventsHandler_(res, serverId) {
  try {
    const entries = await database.query(serverId);
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.write(JSON.stringify({ entries }));  
    res.end();
  } catch {
    res.statusCode = 401;
    res.end();
  };
};

/**
 * Handler for an events POST request. Add an entry to the database.
 * @param {!Object} req The HTTP request object.
 * @param {!Object} res The HTTP response object.
 * @private
 */
async function addEventsHandler_(req, res) {
  try {
    const data = [];
    req.on('data', chunk => {
      data.push(chunk);
    });
    req.on('end', async () => {
      await database.addToServer(JSON.parse(data).entry)
      res.statusCode = 200;
      res.end();  
    });
  } catch {
    res.statusCode = 401;
    res.end();
  };
};

/**
 * Handler for a clients PUT request. Update a client markerLocation.
 * @param {!Object} req The HTTP request object.
 * @param {!Object} res The HTTP response object.
 * @private
 */
async function updateMarkerHandler_(req, res) {
  try {
    const data = [];
    req.on('data', chunk => {
      data.push(chunk);
    });
    req.on('end', async () => {
      const markerUpdate = JSON.parse(data).markerUpdate;
      await database.updateMarker(markerUpdate);
      res.statusCode = 200;
      res.end();  
    });
  } catch {
    res.statusCode = 401;
    res.end();
  };
};

/**
 * Handler for a clients POST request. Add a client to the clients table.
 * @param {!Object} res The HTTP response object.
 * @param {string} workspaceId workspaceId for specified client.
 * @private
 */
async function addClientHandler_(res, workspaceId) {
  try {
    await database.addClient(workspaceId);
    res.statusCode = 200;
    res.end();
  } catch {
    res.statusCode = 401;
    res.end();
  };
};

/**
 * Handler for a clients GET request. Query the database for a MarkerUpdate for
 * the specified client or all if no client specified.
 * @param {!Object} res The HTTP response object.
 * @param {string=} workspaceId workspaceId for specified client.
 * @private
 */
async function getMarkerUpdatesHandler_(res, workspaceId) {
  try {
    const markerUpdates = await database.getMarkerUpdates(workspaceId);
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.write(JSON.stringify({ markerUpdates }));  
    res.end();
  } catch {
    res.statusCode = 401;
    res.end();
  };
};
