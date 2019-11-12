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
 * Class for managing events between the workspace and the server.
 * @param {string} workspaceId The id of the Blockly.Workspace instance this
 * client corresponds to.
 * */
export default class WorkspaceClient {
    constructor(workspaceId) {
        this.workspaceId = workspaceId;
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
     * {workspaceId}:{counter}.
     * @param {boolean} success Indicates the success of the database write.
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
     * Add all events from a Blockly.Events group to notSent.
     * @public
     */
    endGroup() {
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

};
