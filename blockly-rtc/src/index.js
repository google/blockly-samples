/**
 * @license
 * 
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
 * @fileoverview Realtime collaboration demo using Node.js and SQlite.
 * @author navil@google.com (Navil Perez)
 */

import * as Blockly from 'blockly';
import {getEvents, writeEvents} from './api';
import WorkspaceClient from './WorkspaceClient';

/**
 * An action to be performed on the workspace.
 * @typedef {Object} WorkspaceAction
 * @property {!Object} event The JSON of a Blockly event.
 * @property {boolean} forward Indicates the direction to run an event.
 */

document.addEventListener('DOMContentLoaded', () => {
    const workspace = Blockly.inject('blocklyDiv',
        {
            toolbox: document.getElementById('toolbox'),
            media: 'media/'
        });
    const workspaceClient = new WorkspaceClient(
        workspace.id, getEvents, writeEvents);

    workspace.addChangeListener((event) => {
        if (event instanceof Blockly.Events.Ui) {
            return;
        };
        workspaceClient.addEvent(event.toJson());
        if (!Blockly.Events.getGroup()) {
            workspaceClient.flushEvents();
            sendChanges_();
        };
    });
    pollServer_();

    /**
     * Signal WorkspaceClient to send local changes to the server.
     * Continues signalling the WorkspaceClient until all local changes have
     * been sent.
     * @private
     */
    function sendChanges_() {
        if (workspaceClient.writeInProgress) {
            return;
        };
        if (workspaceClient.notSent.length == 0) {
            return;
        };
        workspaceClient.writeToDatabase()
        .then(() => {
            sendChanges_();
        })
        .catch(() => {
            console.error('Failed to write to database.');
        });
    };

    /**
     * Periodically signal the WorkspaceClient to query the database and call
     * runEvents_() with the result of the query.
     * @private
     */
    function pollServer_() {
        if (!workspaceClient.writeInProgress) {
            workspaceClient.queryDatabase()
            .then((eventQueue) => {
                runEvents_(eventQueue);
            });
        };
        var timeInterval = 5000;
        setTimeout(() => {
            pollServer_();
        }, timeInterval);
    };

    /**
     * Run a series of events that allow the order of events on the workspace
     * to converge with the order of events on the database.
     * @param {<!Array.<!WorkspaceEvent>>} eventQueue An array of events and the
     * direction they should be run.
     * @private
     */
    function runEvents_(eventQueue) {
        eventQueue.forEach((event)=> {
            const blocklyEvent = Blockly.Events.fromJson(event.event, workspace);
            Blockly.Events.disable();
            blocklyEvent.run(event.forward);
            Blockly.Events.enable();
        });
    };
});
