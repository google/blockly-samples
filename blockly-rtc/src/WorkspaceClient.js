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
import Blockly from 'blockly';

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
     * Create and entry from an event and add it to active changes.
     * An entry is of the form {"event": Blockly.Event, "entryId": string} where
     * event is an event created on the workspace and entryId is of the form
     * {workspaceId}{counter}.
     * @param {!Object} event The Blockly.Event JSON created by the client.
     * @public
     */
    addEvent(event) {
        var entryId = this.workspaceId.concat(this.counter);
        this.counter += 1;
        this.activeChanges.push({
            event: event,
            entryId: entryId
        });
    };

    /**
     * Move events in a Blockly.Events group from activeChanges to notSent.
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
            await writeEvents(this.inProgress);
            this.endWrite_(true);
        } catch {
           this.endWrite_(false);
           throw Error('Failed to write to database.');
        };
    };

    /**
     * Change status of WorkspaceClient in preparation for the network call.
     * Set writeInProgress to true and move events from notSent to inProgress.
     * @private
     */
    beginWrite_() {
        this.writeInProgress = true;
        this.inProgress = this.inProgress.concat(this.notSent);
        this.notSent = [];
    };

    /**
     * Change status of WorkspaceClient once network call completes.
     * Change writeInProgress to true. If write was successful events remain in
     * inProgress, otherwise the inProgress events are moved to the beginning of
     * notSent.
     * @param {boolean} success Indicates the success of the database write.
     * @private
     */
    endWrite_(success) {
        if (!success) {
            this.notSent = this.inProgress.concat(this.notSent);
            this.inProgress = [];
        };
        this.writeInProgress = false;
    };

    /**
     * Trigger an API call to query events from the database.
     * @returns {!Array<!Object>} The result of processQueryResults_() or an
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
     * @param {<!Array<!Object>} rows Rows of event entries retrieved by
     * querying the database.
     * @returns {!Array<!Object>} eventQueue An array of events and the
     * direction they should be run.
     * @private
     */
    processQueryResults_(rows) {
        const eventQueue = [];

        if (rows.length == 0) {
            return eventQueue;
        };
    
        this.lastSync = rows[rows.length-1].serverId;
    
        // No local changes.
        if (this.notSent.length == 0 && this.inProgress.length == 0) {
            rows.forEach((row) => {
                eventQueue.push({
                    event: JSON.parse(row.event),
                    forward: true
                });
            });
            return eventQueue;
        };
    
        // Common root, remove common events from server events.
        if (this.inProgress.length > 0 && rows[0].entryId == this.inProgress[0].entryId) {
            rows = rows.slice(this.inProgress.length);
            this.inProgress = [];
        };
    
        if (rows.length > 0) {
            // Undo local events.
            this.notSent.slice().reverse().forEach((row) => {
                eventQueue.push({
                    event: row.event,
                    forward: false});
            });
            this.inProgress.slice().reverse().forEach((row) => {
                eventQueue.push({
                    event: row.event,
                    forward: false});
            });
            // Apply server events.
            rows.forEach((row) => {
                eventQueue.push({
                    event: JSON.parse(row.event),
                    forward: true
                });
                if (this.inProgress.length > 0 && row.entryId == this.inProgress[0].entryId) {
                    this.inProgress.shift();
                };
            });
            // Reapply remaining local changes.
            this.inProgress.forEach((row) => {
                eventQueue.push({
                    event: row.event,
                    forward: true
                });
            });
            this.notSent.forEach((row) => {
                eventQueue.push({
                    event: row.event,
                    forward: true
                });
            });
        };
        return eventQueue;
    };
};
