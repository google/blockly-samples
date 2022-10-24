/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Plugin for converting shadow blocks to real ones on edit.
 */

import * as Blockly from 'blockly/core';
import {Block} from 'blockly/core/block';
import {Abstract} from 'blockly/core/events/events_abstract';
import {BlockChangeJson} from 'blockly/core/events/events_block_change';


/**
 * A new blockly event class specifically for recording changes to the shadow
 * state of a block. This implementation is similar to and could be merged with
 * the implementation of Blockly.Events.BlockChange in Blockly core code.
 */
export class BlockShadowChange extends Blockly.Events.BlockBase {
  /**
   * The name of the event type for broadcast and listening purposes.
   */
  /* eslint-disable @typescript-eslint/naming-convention */
  static readonly EVENT_TYPE = 'block_shadow_change';
  /* eslint-enable @typescript-eslint/naming-convention */

  /**
   * The previous value of the field.
   */
  oldValue: unknown;

  /**
   * The new value of the field.
   */
  newValue: unknown;

  /**
   * The constructor for a new BlockShadowChange event.
   * @param block The changed block. Undefined for a blank event.
   * @param oldValue Previous value of shadow state.
   * @param newValue New value of shadow state.
   */
  constructor(block?: Block, oldValue?: boolean, newValue?: boolean) {
    super(block);

    this.type = BlockShadowChange.EVENT_TYPE;

    if (!block) {
      return; // Blank event to be populated by fromJson.
    }
    this.oldValue = typeof oldValue === 'undefined' ? '' : oldValue;
    this.newValue = typeof newValue === 'undefined' ? '' : newValue;
  }

  /**
   * Encode the event as JSON.
   * @return JSON representation.
   * @override
   */
  toJson(): BlockChangeJson {
    const json = super.toJson() as BlockChangeJson;
    json['oldValue'] = this.oldValue;
    json['newValue'] = this.newValue;
    return json;
  }

  /**
   * Decode the JSON event.
   * @param json JSON representation.
   * @override
   */
  fromJson(json: BlockChangeJson) {
    super.fromJson(json);
    this.oldValue = json['oldValue'];
    this.newValue = json['newValue'];
  }

  /**
   * Does this event record any change of state?
   * @return False if something changed.
   * @override
   */
  isNull(): boolean {
    return this.oldValue === this.newValue;
  }

  /**
   * Run a change event.
   * @param forward True if run forward, false if run backward (undo).
   * @override
   */
  run(forward: boolean) {
    const workspace = this.getEventWorkspace_();
    if (!this.blockId) {
      throw new Error(
          'The block ID is undefined. Either pass a block to ' +
          'the constructor, or call fromJson');
    }
    const block = workspace.getBlockById(this.blockId);
    if (!block) {
      throw new Error(
          'The associated block is undefined. Either pass a ' +
          'block to the constructor, or call fromJson');
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
 * @param event An event broadcast by the workspace.
 */
export function shadowBlockConversionChangeListener(
    event: Abstract) {
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
  const blockEvent = event as Blockly.Events.BlockChange;

  if (!blockEvent.workspaceId || !blockEvent.blockId) {
    return;
  }
  const workspace = Blockly.Workspace.getById(blockEvent.workspaceId);
  if (!workspace) {
    return;
  }
  const block = workspace.getBlockById(blockEvent.blockId);
  if (!block) {
    return;
  }

  // Blocks that are already real blocks can be ignored.
  if (!block.isShadow()) {
    return;
  }

  // Remember the current event group so that it can be resumed below.
  const currentGroup = Blockly.Events.getGroup();

  if (blockEvent.group) {
    // Temporarily use the same group as the initiating event so that
    // the shadow events get grouped with it for undo purposes.
    Blockly.Events.setGroup(blockEvent.group);
  } else {
    // The initiating event wasn't part of any named group, so the shadow events
    // can't be grouped with it, but at least they can be grouped with each
    // other.
    Blockly.Events.setGroup(true);
  }

  // If the changed shadow block is a child of another shadow block, then both
  // blocks should be converted to real blocks. To find all the shadow block
  // ancestors that need to be converted to real blocks, seed the list of blocks
  // starting with the changed block, and append all shadow block ancestors.
  const shadowBlocks = [block];
  for (let i = 0; i < shadowBlocks.length; i++) {
    const shadowBlock = shadowBlocks[i];

    // If connected blocks need to be converted too, add them to the list.
    const outputBlock: Block | null =
        shadowBlock.outputConnection?.targetBlock();
    const previousBlock: Block | null =
        shadowBlock.previousConnection?.targetBlock();
    if (outputBlock?.isShadow()) {
      shadowBlocks.push(outputBlock);
    }
    if (previousBlock?.isShadow()) {
      shadowBlocks.push(previousBlock);
    }
  }

  // The list of shadow blocks starts with the deepest child and ends with the
  // highest parent, but the parent of a real block should never be a shadow
  // block, so the parents need to be converted to real blocks first. Start
  // at the end of the list and iterate backward to convert the blocks.
  for (let i = shadowBlocks.length - 1; i >= 0; i--) {
    const shadowBlock = shadowBlocks[i];
    // Convert the shadow block to a real block and fire an event recording the
    // change so that it can be undone. Ideally the
    // Blockly.Block.prototype.setShadow method should fire this event directly,
    // but for this plugin it needs to be explicitly fired here.
    shadowBlock.setShadow(false);
    Blockly.Events.fire(new BlockShadowChange(shadowBlock, true, false));
  }

  // Revert to the current event group, if any.
  Blockly.Events.setGroup(currentGroup);
}
