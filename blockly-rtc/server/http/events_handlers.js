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
 * @fileoverview Endpoint API middleware functions for interacting the with the
 * Events Table.
 * @author navil@google.com (Navil Perez)
 */

const database = require('../Database');

/**
 * Handler for an events GET request. Query the database for events since the
 * last serverId and return them in the HTTP response.
 * @param {!Object} res The HTTP response object.
 * @param {number} serverId serverId for the lower bound of the query.
 * @private
 */
async function queryEventsHandler(res, serverId) {
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
async function addEventsHandler(req, res) {
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
 * Handler for a snapshot GET request. Get the latest snapshot of the
 * workspace.
 * @param {!Object} res The HTTP response object.
 * @public
 */
async function getSnapshotHandler(res) {
  try {
    const snapshot = await database.getSnapshot();
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.write(JSON.stringify({ snapshot }));
    res.end();
  } catch {
    res.statusCode = 401;
    res.end();
  };
};

module.exports.queryEventsHandler = queryEventsHandler;
module.exports.addEventsHandler = addEventsHandler;
module.exports.getSnapshotHandler = getSnapshotHandler;
