/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Handles serializing disabled interactions associated with
 *     blocks to plain JavaScript objects, only containing state.
 */
'use strict';

import * as Blockly from 'blockly/core';


/**
 * Defines the state type returned by this serializer.
 */
class State {
  /**
   * Constructs the state class.
   */
  constructor() {
    /**
     * An array of block ids for blocks that are not deletable. Or undefined
     * if there are no not-deletable blocks.
     * @type {(!Array<string>|undefined)}
     */
    this.notDeletable;

    /**
     * An array of block ids for blocks that are not movable. Or undefined
     * if there are no not-movable blocks.
     * @type {(!Array<string>|undefined)}
     */
    this.notMovable;

    /**
     * An array of block ids for blocks that are not editable. Or undefined
     * if there are no not-editable blocks.
     * @type {(!Array<string>|undefined)}
     */
    this.notEditable;
  }
}

/**
 * Plugin serializer for saving and loading disabled interactions associated
 * with blocks.
 * @implements {Blockly.serialization.IPluginSerializer}
 */
class DisabledInteractionsSerializer {
  /**
   * Constructs the disabled interactions serializer.
   */
  constructor() {
    /**
     * The priority for deserializing disabled interactions.
     * Should be less than the priority for blocks so that this state is
     * applied after the blocks are loaded.
     * @type {number}
     */
    this.priority = Blockly.serialization.priorities.BLOCKS - 10;
  }

  /**
   * Serializes the disabled interactions associated with blocks on the given
   * workspace.
   * @param {!Blockly.Workspace} workspace The workspace to save the disabled
   *     interactions of.
   * @return {?State} The state of the workspace's disabled interactions, or
   *     null if there are none.
   */
  save(workspace) {
    const notDeletable = [];
    const notMovable = [];
    const notEditable = [];

    const blocks = workspace.getAllBlocks(false);
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      if (!block.isDeletable()) {
        notDeletable.push(block.id);
      }
      if (!block.isMovable()) {
        notMovable.push(block.id);
      }
      if (!block.isEditable()) {
        notEditable.push(block.id);
      }
    }

    const state = Object.create(null);
    if (notDeletable.length) {
      state['notDeletable'] = notDeletable;
    }
    if (notMovable.length) {
      state['notMovable'] = notMovable;
    }
    if (notEditable.length) {
      state['notEditable'] = notEditable;
    }

    if (notDeletable.length || notMovable.length || notEditable.length) {
      return state;
    }
    return null;
  }

  /**
   * Deserializes the variable defined by the given state into the given
   * workspace.
   * @param {!State} state The state of the variables to deserialize.
   * @param {!Blockly.Workspace} workspace The workspace to deserialize into.
   */
  load(state, workspace) {
    const notDeletable = state['notDeletable'] || [];
    const notMovable = state['notMovable'] || [];
    const notEditable = state['notEditable'] || [];

    for (let i = 0; i < notDeletable.length; i++) {
      workspace.getBlockById(notDeletable[i]).setDeletable(false);
    }
    for (let i = 0; i < notMovable.length; i++) {
      workspace.getBlockById(notMovable[i]).setMovable(false);
    }
    for (let i = 0; i < notEditable.length; i++) {
      workspace.getBlockById(notEditable[i]).setEditable(false);
    }
  }

  /**
   * Would clear the state, but this plugin has no state to clear.
   * @param {!Blockly.Workspace} _workspace The workspace to clear the state
   *     of.
   */
  clear(_workspace) { }
}

Blockly.serialization.registry.register(
    'disabledInteractions', new DisabledInteractionsSerializer());
