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
import WorkspaceClient from './WorkspaceClient';

document.addEventListener("DOMContentLoaded", () => {
    const workspace = Blockly.inject('blocklyDiv',
        {
            toolbox: document.getElementById('toolbox'),
            media: 'media/'
        });
    var workspaceClient = new WorkspaceClient(workspace.id);

    workspace.addChangeListener(function(event) {
        if (event instanceof Blockly.Events.Ui) {
            return;
        };
        workspaceClient.addEvent(event.toJson());
        if (!Blockly.Events.getGroup()) {
            workspaceClient.endGroup();
            sendChanges();
        };
    });

    /**
     * Signal WorkspaceClient to send local changes to the server.
     * Continues signalling the WorkspaceClient until all local changes have
     * been sent.
     * @public
     */
    function sendChanges() {
        if (workspaceClient.writeInProgress) {
            return;
        };
        if (workspaceClient.notSent.length == 0) {
            return;
        };
        workspaceClient.writeToDatabase()
        .then(() => {
            sendChanges();
        })
        .catch(() => {
            console.error('Failed to write to database.');
        });
    };
});
