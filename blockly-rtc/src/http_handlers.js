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
 * A local representation of an entry in the database.
 * @typedef {Object} LocalEntry
 * @property {<!Array.<!Object>>} events An array of Blockly Events in JSON
 * format.
 * @property {string} entryId The id assigned to an event by the client.
 */

/**
 * Query the database for entries since the given server id.
 * @param {number} serverId serverId for the lower bound of the query.
 * @return {<!Array.<!Entry>>} Entries since the given serverId.
 * @throws Will throw an error if the response status code is not 200.
 * @public
 */
export async function getEvents(serverId) {
  const response = await fetch('/api/events/query?serverId=' + serverId);
  const responseJson = await response.json();
  if (response.status === 200) {
    return responseJson.entries;
  } else {
    throw 'Failed to query database.';
  };
};

/**
 * Add an entry to database.
 * @param {!LocalEntry} entry The LocalEntry objects to be added to the
 * database.
 * @throws Will throw an error if the response status code is not 200.
 * @public
 */
export async function writeEvents(entry) {
  const response = await fetch('/api/events/add', {
    method: 'POST',
    body: JSON.stringify({ entry })
  });
  if (response.status === 200) {
    return;
  } else {
    throw 'Failed to write to database.';
  };
};
