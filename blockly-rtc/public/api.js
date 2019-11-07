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
 * @fileoverview API handler for interacting with node server.
 * @author navil@google.com (Navil Perez)
 */

/**
 * Query the database for rows since the given server id.
 * @param {number} serverId serverId for the lower bound of the query.
 * @return {!Array.<!Object>} Rows of events since the given serverId. 
 * @public
 */
export async function getEvents(serverId) {
  const response = await fetch('/api/events/query' + '?' + 'serverId=' + serverId);
  return await response.json();
};

/**
 * Add rows to database.
 * @param {!Array.<!Object>} rows The rows of events to be added to the
 * database.
 * @return Response from the server.
 * @public
 */
export async function writeEvents(rows) {
  return await fetch('/api/events/add', {
    method: 'POST',
    body: JSON.stringify({ rows })
  });
};
