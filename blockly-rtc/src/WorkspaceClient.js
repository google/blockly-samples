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

import EventEmitter from 'events';

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
    constructor(workspaceId, getEventsHandler, addEventsHandler, broadcastEventsHandler) {
      this.workspaceId = workspaceId;
      this.lastSync = 0;
      this.inProgress = [];
      this.notSent = [];
      this.activeChanges = [];
      this.writeInProgress = false;
      this.counter = 0;
      this.serverEvents = [];
      this.updateInProgress = false;
      this.getEventsHandler = getEventsHandler;
      this.addEventsHandler = addEventsHandler;
      this.broadcastEventsHandler = broadcastEventsHandler;
      this.listener = new EventEmitter();
    };  


    /**
     * Initiate the workspace by running all stored events and activating the
     * handling of recieving events from the server.
     * @public
     */
    async initiateWorkspace() {
      // TODO: Get an SVG of the current blocks on the workspace instead of
      // replaying history.
      const events = await this.getEventsHandler(0);
      this.addServerEvents_(events);
      if (this.broadcastEventsHandler) {
        this.broadcastEventsHandler(this.addServerEvents_.bind(this));
      } else {
        this.pollServer_();
      };
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
     * Add the events in activeChanges to notSent. Initiates process for sending
     * local changes to the database.
     * @public
     */
    flushEvents() {
      this.notSent = this.notSent.concat(this.activeChanges);
      this.activeChanges = [];
      this.updateServer_();
    };

    /**
     * Send local changes to the server. Continuously runs until all local changes
     * have been sent.
     * @private
     */
    async updateServer_() {
      if (this.writeInProgress || this.notSent.length == 0) {
        return;
      };
      this.writeInProgress = true;
      while (this.notSent.length > 0) {
        await this.writeToDatabase_();
      };
      this.writeInProgress = false;
    };

    /**
     * Trigger an API call to write events to the database.
     * @throws Throws an error if the write was not successful.
     * @private
     */
    async writeToDatabase_() {
      this.beginWrite_();
      try {
        await this.addEventsHandler(this.inProgress[this.inProgress.length - 1]);
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
      const entryId = this.workspaceId + ':' + this.counter;
      this.counter += 1;
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
     * Periodically query the database for new server events and add them to
     * serverEvents.
     * @private
     */
    async pollServer_() {
      const rows = await this.queryDatabase_();
      await this.addServerEvents_(rows);
      this.pollServer_();
    };

    /**
     * Trigger an API call to query events from the database.
     * @returns {<!Array.<!Row>>} The result of the query.
     * @public
     */
    async queryDatabase_() {
      try {
        return await this.getEventsHandler(this.lastSync);
      } catch {
        return [];
      };
    };

    /**
     * Add newServerEvents to the end of this.serverEvents and initiate process of
     * applying server events to the workspace if the newServerEvents are recieved
     * in the correct order.
     * @param {<!Array.<!row>>} newServerEvents The events recieved from the server.
     * @throws Throws an error if newServerEvents are not recieved in the correct
     * order.
     * @private
     */
    async addServerEvents_(newServerEvents) {
      if (newServerEvents.length == 0) {
        return;
      }
      if (newServerEvents[0].serverId != this.lastSync + 1) {
        newServerEvents = await this.queryDatabase_();
      };
      this.lastSync = newServerEvents[newServerEvents.length-1].serverId;
      this.serverEvents.push.apply(this.serverEvents, newServerEvents);
      this.updateWorkspace_();
    };

    /**
     * Send server events to the local workspace. Continuously runs until all
     * server events have been sent.
     * @private
     */
    async updateWorkspace_() {
      if (this.updateInProgress || this.serverEvents == 0) {
        return;
      };
      this.updateInProgress = true;
      while (this.serverEvents.length > 0) {
        const newServerEvents = this.serverEvents;
        this.serverEvents = [];
        const eventQueue = await this.processQueryResults_(newServerEvents);
        this.updateInProgress = false;
        this.listener.emit('runEvents', eventQueue);
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
