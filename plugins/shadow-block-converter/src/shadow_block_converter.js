/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Plugin for converting shadow blocks to real ones on edit.
 */

import * as Blockly from 'blockly/core';

/**
 * A new blockly event class specifically for recording changes to the shadow
 * state of a block. This implementation is similar to and could be merged with
 * the implementation of Blockly.Events.BlockChange in Blockly core code.
 * @extends {Blockly.Events.BlockBase}
 */
export class BlockShadowChange extends Blockly.Events.BlockBase {
  /**
   * The name of the event type for broadcast and listening purposes.
   * @type {string}
   */
  static EVENT_TYPE = 'block_shadow_change';

  /**
   * The constructor for a new BlockShadowChange event.
   * @param {Blockly.Block=} block The changed block. Undefined for a blank
   *   event.
   * @param {boolean=} oldValue Previous value of shadow state.
   * @param {boolean=} newValue New value of shadow state.
   */
  constructor(block, oldValue, newValue) {
    super(block);

    /**
     * Type of this event.
     * @type {string}
     */
    this.type = BlockShadowChange.EVENT_TYPE;

    if (!block) {
      return; // Blank event to be populated by fromJson.
    }
    this.oldValue = typeof oldValue === 'undefined' ? '' : oldValue;
    this.newValue = typeof newValue === 'undefined' ? '' : newValue;
  }

  /**
   * Encode the event as JSON.
   * @return {!Object} JSON representation.
   * @override
   */
  toJson() {
    const json = super.toJson();
    json['oldValue'] = this.oldValue;
    json['newValue'] = this.newValue;
    return json;
  }

  /**
   * Decode the JSON event.
   * @param {!Object} json JSON representation.
   * @override
   */
  fromJson(json) {
    super.fromJson(json);
    this.oldValue = json['oldValue'];
    this.newValue = json['newValue'];
  }

  /**
   * Does this event record any change of state?
   * @return {boolean} False if something changed.
   * @override
   */
  isNull() {
    return this.oldValue === this.newValue;
  }

  /**
   * Run a change event.
   * @param {boolean} forward True if run forward, false if run backward (undo).
   * @override
   */
  run(forward) {
    const workspace = this.getEventWorkspace_();
    const block = workspace.getBlockById(this.blockId);
    if (!block) {
      console.warn('Can\'t change non-existent block: ' + this.blockId);
      return;
    }

    const value = forward ? this.newValue : this.oldValue;
    block.setShadow(!!value);
  }
}

Blockly.registry.register(
    Blockly.registry.Type.EVENT,
    BlockShadowChange.EVENT_TYPE,
    BlockShadowChange);

/**
 * Add this function to your workspace as a change listener to automatically
 * convert shadow blocks to real blocks whenever the user edits a field on the
 * block, like this:
 *
 * workspace.addChangeListener(shadowBlockConversionChangeListener);
 *
 * Ideally the Blockly.Field.prototype.setValue method should handle this logic,
 * but for the purposes of this plugin it can be a workspace change listener.
 *
 * @param {Blockly.Events.Abstract} event An event broadcast by the workspace.
 */
export function shadowBlockConversionChangeListener(event) {
  // Auto-converting shadow blocks to real blocks should happen in response to
  // new user action events (which get recorded as undo events) but not when
  // undoing or redoing events (which do not get recorded again).
  if (!event.recordUndo) {
    return;
  }

  // Auto-converting shadow blocks to real blocks should happen in response to
  // editing a field value, which is recorded as Blockly.Events.BLOCK_CHANGE.
  if (event.type != Blockly.Events.BLOCK_CHANGE) {
    return;
  }

  const workspace = Blockly.Workspace.getById(event.workspaceId);
  if (!workspace) {
    return;
  }
  const block = workspace.getBlockById(event.blockId);
  if (!block) {
    return;
  }

  // Blocks that are already real blocks can be ignored.
  if (!block.isShadow()) {
    return;
  }

  // Remember the current event group so that it can be resumed below.
  const currentGroup = Blockly.Events.getGroup();

  if (event.group) {
    // Temporarily use the same group as the initiating event so that
    // the shadow events get grouped with it for undo purposes.
    Blockly.Events.setGroup(event.group);
  } else {
    // The initiating event wasn't part of any named group, so the shadow events
    // can't be grouped with it, but at least they can be grouped with each
    // other.
    Blockly.Events.setGroup(true);
  }

  // If the changed shadow block is, itself, a child of another shadow block,
  // then both blocks should be converted to real blocks. Keep track of all
  // shadow blocks that should be converted and haven't been yet.
  const shadowBlocks = [block];

  while (shadowBlocks.length > 0) {
    const shadowBlock = shadowBlocks.pop();

    // If connected blocks need to be converted too, add them to the list.
    if (shadowBlock.outputConnection != null &&
        shadowBlock.outputConnection.isConnected() &&
        shadowBlock.outputConnection.targetBlock().isShadow()) {
      shadowBlocks.push(shadowBlock.outputConnection.targetBlock());
    }
    if (shadowBlock.previousConnection != null &&
        shadowBlock.previousConnection.isConnected() &&
        shadowBlock.previousConnection.targetBlock().isShadow()) {
      shadowBlocks.push(shadowBlock.previousConnection.targetBlock());
    }

    // Finally, convert the block to a real block, and fire an event recording
    // the change so that it can be undone. Ideally the
    // Blockly.Block.prototype.setShadow method should fire this event directly,
    // but for this plugin it needs to be explicitly fired here.
    shadowBlock.setShadow(false);
    Blockly.Events.fire(new BlockShadowChange(shadowBlock, true, false));
  }

  // Revert to the current event group, if any.
  Blockly.Events.setGroup(currentGroup);
}
