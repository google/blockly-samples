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
 * @fileoverview Endpoint APIs for passing events between the client and the
 * server.
 * @author navil@google.com (Navil Perez)
 */

import * as Blockly from 'blockly';

/**
 * Get a snapshot of the current workspace.
 * @return {!Snapshot} The latest snapshot of the workspace.
 * @public
 */
export async function getSnapshot() {
  const response = await fetch('/api/snapshot/query');
  const responseJson = await response.json();
  const snapshot = responseJson.snapshot;
  snapshot.xml = Blockly.Xml.textToDom(snapshot.xml);
  if (response.status === 200) {
    return snapshot;
  } else {
    throw 'Failed to get workspace snapshot.';
  };
};

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
  const entries = responseJson.entries;
  entries.forEach((entry) => {
    entry.events = entry.events.map((event) => {
      return Blockly.Events.fromJson(event, Blockly.getMainWorkspace());
    });
  });
  if (response.status === 200) {
    return entries;
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
  const entryJson = {
    workspaceId: entry.workspaceId,
    entryNumber: entry.entryNumber,
    events: entry.events.map((event) => event.toJson())
  };
  const response = await fetch('/api/events/add', {
    method: 'POST',
    body: JSON.stringify({entry: entryJson})
  });
  if (response.status === 200) {
    return;
  } else {
    throw 'Failed to write to database.';
  };
};
