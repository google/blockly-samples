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
 * Users Table.
 * @author navil@google.com (Navil Perez)
 */

const database = require('../Database');

 /**
 * Handler for a users PUT request. Update a user's position in the users table.
 * @param {!Object} req The HTTP request object.
 * @param {!Object} res The HTTP response object.
 * @private
 */
async function updatePositionHandler(req, res) {
  try {
    const data = [];
    req.on('data', chunk => {
      data.push(chunk);
    });
    req.on('end', async () => {
      const positionUpdate = JSON.parse(data).positionUpdate;
      await database.updatePosition(positionUpdate);
      res.statusCode = 200;
      res.end();  
    });
  } catch {
    res.statusCode = 401;
    res.end();
  };
};

/**
 * Handler for a getPositionUpdates message. Query the database for a
 * PositionUpdate for the specified user or all if no user is specified.
 * @param {!Object} res The HTTP response object.
 * @param {string=} workspaceId workspaceId for specified user.
 * @private
 */
async function getPositionUpdatesHandler(res, workspaceId) {
  try {
    const positionUpdates = await database.getPositionUpdates(workspaceId);
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.write(JSON.stringify({ positionUpdates }));  
    res.end();
  } catch {
    res.statusCode = 401;
    res.end();
  };
};

module.exports.updatePositionHandler = updatePositionHandler;
module.exports.getPositionUpdatesHandler = getPositionUpdatesHandler;
