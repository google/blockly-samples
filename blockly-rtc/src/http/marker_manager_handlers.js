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
 * @fileoverview Endpoint APIs for passing MarkerUpdates between the client
 * and the server.
 * @author navil@google.com (Navil Perez)
 */

import MarkerUpdate from '../MarkerUpdate';

/**
 * Get a MarkerUpdate for given client. If no client is specified will return
 * a MarkerUpdate for all clients.
 * @param {string=} workspaceId workspaceId of the client.
 * @return {!Promise} Promise object with an array of MarkerUpdate objects.
 * @public
 */
export async function getMarkerUpdates(workspaceId) {
  const response = workspaceId ? await fetch('/api/markers/query?workspaceId=' + workspaceId) :
      await fetch('/api/markers/query?');
  const responseJson = await response.json();
  if (response.status === 200) {
    const markerUpdates = responseJson.markerUpdates
    .map((markerUpdate) => MarkerUpdate.fromJson(markerUpdate));
    return markerUpdates;
  } else {
    throw 'Failed to get MarkerUpdates.';
  };
};

/**
 * Update the MarkerLocation of a client in the database.
  * @param {!MarkerUpdate} markerUpdate The MarkerUpdate with the new
  * MarkerLocation for a given client.
  * @return {!Promise} Promise object represents the success of the update.
  * @public
  */
export async function sendMarkerUpdate(markerUpdate) {
  const markerUpdateJson = markerUpdate.toJson();
  const response = await fetch('/api/markers/update', {
    method: 'PUT',
    body: JSON.stringify({markerUpdate: markerUpdateJson})
  });
  if (response.status === 200) {
    return;
  } else {
    throw 'Failed to update marker.';
  };
};

/**
 * Add the client to the database if not already in it. A client needs to be in
 * the database in order for it to appear as a marker.
 * @param {!string} workspaceId The workspaceId of the client.
 * @return {!Promise} Promise object representing the success of the query.
 * @public
 */
export async function addClient(workspaceId) {
  const response = await fetch('/api/markers/add?workspaceId=' + workspaceId, {
    method: 'POST'
  });
  if (response.status === 200) {
    return;
  } else {
    throw 'Failed to add client to database.';
  };
};
