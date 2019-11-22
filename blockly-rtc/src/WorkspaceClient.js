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
 * @fileoverview Class for managing client-server communication and event
 * resolution.
 * @author navil@google.com (Navil Perez)
 */

import {getEvents, writeEvents} from './api';

/**
 * An action to be performed on the workspace.
 * @typedef {Object} WorkspaceAction
 * @property {!Object} event The JSON of a Blockly event.
 * @property {boolean} forward Indicates the direction to run an event.
 */

/**
 * A local representation of an entry in the database.
 * @typedef {Object} LocalEntry
 * @property {<!Array.<!Object>>} events An array of Blockly Events in JSON
 * format.
 * @property {string} entryId The id assigned to an event by the client.
 */

/**
 * A row from the database.
 * @typedef {Object} Row
 * @property {<!Array.<!Object>>} events An array of Blockly Events in JSON
 * format.
 * @property {string} entryId The id assigned to an event by the client.
 * @property {string} serverId The id assigned to an event by the server.
 */

/**
 * Class for managing events between the workspace and the server.
 * @param {string} workspaceId The id of the Blockly.Workspace instance this
 * client corresponds to.
 */
export default class WorkspaceClient {
    constructor(workspaceId) {
      this.workspaceId = workspaceId;
      this.lastSync = 0;
      this.inProgress = [];
      this.notSent = [];
      this.activeChanges = [];
      this.writeInProgress = false;
      this.counter = 0;
    };

    /**
     * Add an event to activeChanges.
     * @param {!Object} event The Blockly.Event JSON created by the client.
     * @public
     */
    addEvent(event) {
      this.activeChanges.push(event);
    };

    /**
     * Add the events in activeChanges to notSent.
     * @public
     */
    flushEvents() {
      this.notSent = this.notSent.concat(this.activeChanges);
      this.activeChanges = [];
    };

    /**
     * Trigger an API call to write events to the database.
     * @throws Throws an error if the write was not successful.
     * @public
     */
    async writeToDatabase() {
      this.beginWrite_();
      try {
        await writeEvents(this.inProgress[this.inProgress.length - 1]);
        this.endWrite_(true);
      } catch {
        this.endWrite_(false);
        throw Error('Failed to write to database.');
      };
    };

    /**
     * Change status of WorkspaceClient in preparation for the network call.
     * Set writeInProgress to true, adds a LocalEntry to inProgress based on
     * the events that were notSent, and clears the notSent array.
     * @private
     */
    beginWrite_() {
      this.writeInProgress = true;
      const entryId = this.workspaceId.concat(this.counter);
      this.counter +=1;
      this.inProgress.push({
        events: this.notSent,
        entryId: entryId
      }); 
      this.notSent = [];
    };
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
    /**
     * Change status of WorkspaceClient once network call completes.
     * Change writeInProgress to true. If write was successful, the LocalEntry
     * remains in inProgress, otherwise, the LocalEntry is deleted and the
     * events move back to the front of notSent.
     * @param {boolean} success Indicates the success of the database write.
     * @private
     */
    endWrite_(success) {
        if (!success) {
            this.notSent = this.inProgress[0].events.concat(this.notSent);
            this.inProgress = [];
            this.counter -=1;
        };
        this.writeInProgress = false;
    };

    /**
     * Trigger an API call to query events from the database.
     * @returns {<!Array.<!Row>>} The result of processQueryResults_() or an
     * empty array if the API call fails.
     * @public
     */
    async queryDatabase() {
      try {
        const rows = await getEvents(this.lastSync);
        return this.processQueryResults_(rows);
      } catch {
        return [];
      };
    };

    /**
     * Compare the order of events in the rows retrieved from the database to
     * the stacks of local-only changes and provide a series of steps that
     * will allow the server and local workspace to converge.
     * @param {<!Array.<!Row>>} rows Rows of event entries retrieved by
     * querying the database.
     * @returns {!Array.<!WorkspaceAction>>} eventQueue An array of events and the
     * direction they should be run.
     * @private
     */
    processQueryResults_(rows) {
      const eventQueue = [];

      if (rows.length == 0) {
        return eventQueue;
      };

      this.lastSync = rows[rows.length - 1].serverId;
  
      // No local changes.
      if (this.notSent.length == 0 && this.inProgress.length == 0) {
        rows.forEach((row) => {
          eventQueue.push.apply(
            eventQueue, this.createWorkspaceActions_(row.events, true));
        });
        return eventQueue;
      };
  
      // Common root, remove common events from server events.
      if (this.inProgress.length > 0 && rows[0].entryId == this.inProgress[0].entryId) {
        rows.shift();
        this.inProgress = [];
      };
  
      if (rows.length > 0) {
        // Undo local events.
        eventQueue.push.apply(
          eventQueue,
          this.createWorkspaceActions_(this.notSent.slice().reverse(), false));
        if (this.inProgress.length > 0) {
          this.inProgress.slice().reverse().forEach((row) => {
            eventQueue.push.apply(eventQueue, this.createWorkspaceActions_(
              row.events.slice().reverse(), false));
          });
        };
        // Apply server events.
        rows.forEach((row) => {
          eventQueue.push.apply(
            eventQueue, this.createWorkspaceActions_(row.events, true));
          if (this.inProgress.length > 0 && row.entryId == this.inProgress[0].entryId) {
            this.inProgress.shift();
          };
        });
        // Reapply remaining local changes.
        if (this.inProgress.length > 0) {
          eventQueue.push.apply(
            eventQueue,
            this.createWorkspaceActions_(this.inProgress[0].events, true));
        };
        eventQueue.push.apply(
          eventQueue, this.createWorkspaceActions_(this.notSent, true));
      };
      return eventQueue;
    };

    /**
     * Create WorkspaceActions from a list of events.
     * @param {<!Array.<!Object>>} events An array of Blockly Events in JSON format.
     * @param {boolean} forward Indicates the direction to run an event.
     * @returns {<Array.<!WorkspaceEvent>>} An array of actions to be performed
     * on the workspace.
     * @private
     */
    createWorkspaceActions_(events, forward) {
      const eventQueue = [];
      events.forEach((event) => {
        eventQueue.push({
          event: event,
          forward: forward
        });
      });
      return eventQueue;
    };
};
