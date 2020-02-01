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
 * @fileoverview Typedefs for use in the realtime collaboration demo.
 * @author navil@google.com (Navil Perez)
 */

/**
 * An entry from the database.
 * @typedef {Object} Entry
 * @property {<!Array.<!Blockly.Event>>} events An array of Blockly Events.
 * @property {string} workspaceId The workspaceId of the user.
 * @property {number} entryNumber The numeric id assigned to an entry by the
 * client.
 * @property {string} serverId The id assigned to an entry by the server.
 */

 /**
 * A local representation of an entry in the database.
 * @typedef {Object} LocalEntry
 * @property {<!Array.<!Blockly.Event>>} events An array of Blockly Events.
 * @property {string} workspaceId The workspaceId of the user.
 * @property {number} entryNumber The numeric id assigned to an entry by the
 * client.
 */
 
 /**
 * An update to the position of a user.
 * @typedef {Object} PositionUpdate
 * @property {string} workspaceId The workspaceId of the user.
 * @property {Position} position The position of the user. 
 */

 /**
 * A snapshot of the workspace.
 * @typedef {Object} Snapshot
 * @property {!Element} xml An XML DOM element that represents the current state
 * of the workspace.
 * @property {number} serverId The serverId of the last entry of events applied
 * to the workspace.
 */

 /**
 * An action to be performed on the workspace.
 * @typedef {Object} WorkspaceAction
 * @property {!Blockly.Event} event A Blockly Event.
 * @property {boolean} forward Indicates the direction to run an event.
 */
