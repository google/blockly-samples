/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview UI events used for the backpack plugin.
 * @author kozbial@google.com (Monica Kozbial)
 */

import * as Blockly from 'blockly/core';

/**
 * Name of event that records a backpack open.
 * @const
 */
export const BACKPACK_OPEN = 'backpack_open';

/**
 * A UI event representing a backpack opening or closing.
 */
export class BackpackOpen extends Blockly.Events.UiBase {
  /**
   * Class for a backpack open event.
   * @param {boolean=} isOpen Whether the backpack flyout is opening (false
   *    if closing). Undefined for a blank event.
   * @param {string=} workspaceId The workspace identifier for this event.
   *    Undefined for a blank event.
   * @extends {Blockly.Events.UiBase}
   * @constructor
   */
  constructor(isOpen, workspaceId) {
    super(workspaceId);

    /**
     * Whether the backpack flyout is opening (false if closing).
     * @type {boolean|undefined}
     */
    this.isOpen = isOpen;

    /**
     * Type of this event.
     * @type {string}
     */
    this.type = BACKPACK_OPEN;
  }

  /**
   * Encode the event as JSON.
   * @returns {!Object} JSON representation.
   */
  toJson() {
    const json = super.toJson();
    json['isOpen'] = this.isOpen;
    return json;
  }

  /**
   * Decode the JSON event.
   * @param {!Object} json JSON representation.
   */
  fromJson(json) {
    super.fromJson(json);
    this.isOpen = json['isOpen'];
  }
}

Blockly.registry.register(Blockly.registry.Type.EVENT, BACKPACK_OPEN,
    BackpackOpen);

/**
 * Name of event that records a backpack change.
 * @const
 */
export const BACKPACK_CHANGE = 'backpack_change';

/**
 * A UI event representing a change in a backpack's contents.
 */
export class BackpackChange extends Blockly.Events.UiBase {
  /**
   * Class for a backpack change event.
   * @param {string=} workspaceId The workspace identifier for this event.
   *    Undefined for a blank event.
   * @extends {Blockly.Events.UiBase}
   * @constructor
   */
  constructor(workspaceId) {
    super(workspaceId);

    /**
     * Type of this event.
     * @type {string}
     */
    this.type = BACKPACK_CHANGE;
  }
}

Blockly.registry.register(Blockly.registry.Type.EVENT, BACKPACK_CHANGE,
    BackpackChange);
