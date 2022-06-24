/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utility functions for handling suggestions.
 */
'use strict';

/**
 * Utility functions for handling block suggestions.
 * @namespace Blockly.SuggestedBlocks
 */
import * as Blockly from 'blockly';

const NUM_BLOCKS_PER_CATEGORY = 10;

// Map from workspace ID to BlockSuggestor objects
const suggestorLookup = new WeakMap();

/**
 *
 */
export class BlockSuggestor {
  /**
   * Constructs a BlockSuggestor object.
   */
  constructor() {
    this.defaultJsonForBlockLookup = {};
    this.recentlyUsedBlocks = [];
    this.workspaceHasFinishedLoading = false;

    this.eventListener = this.eventListener.bind(this);
    this.getMostUsed = this.getMostUsed.bind(this);
    this.getRecentlyUsed = this.getRecentlyUsed.bind(this);
  }

  /**
   * Generates a list of the 10 most frequently used blocks, in order.
   * Includes a secondary sort by most recent blocks.
   * @return {Array <object>}A list of block JSON objects
   */
  getMostUsed = function() {
    // Store the frequency of each block, as well as the index first appears at
    const countMap = {};
    const recencyMap = {};
    for (const [index, key] of this.recentlyUsedBlocks.entries()) {
      countMap[key] = (countMap[key] || 0) + 1;
      if (!recencyMap[key]) {
        recencyMap[key] = index + 1;
      }
    }

    // Get a sorted list
    const freqUsedBlockTypes = [];
    for (const key of Object.keys(countMap)) {
      freqUsedBlockTypes.push(key);
    }
    freqUsedBlockTypes.sort((a, b) => countMap[b] - countMap[a] +
        0.01 * (recencyMap[a] - recencyMap[b]));

    return this.generateBlockData(freqUsedBlockTypes);
  };

  /**
   * Generates a list of the 10 most recently used blocks.
   * @return {Array <object>} A list of block JSON objects
   */
  getRecentlyUsed = function() {
    const uniqueRecentBlocks = [...new Set(this.recentlyUsedBlocks)];
    const recencyMap = {};
    for (const [index, key] of this.recentlyUsedBlocks.entries()) {
      if (!recencyMap[key]) {
        recencyMap[key] = index + 1;
      }
    }
    uniqueRecentBlocks.sort((a, b) => recencyMap[a] - recencyMap[b]);
    return this.generateBlockData(uniqueRecentBlocks);
  }

  generateBlockData = function(blockTypeList) {
    const blockList = [];
    for (const key of blockTypeList.slice(0, NUM_BLOCKS_PER_CATEGORY)) {
      const json = (this.defaultJsonForBlockLookup[key] || {});
      json['kind'] = 'BLOCK';
      json['type'] = key;
      json['x'] = null;
      json['y'] = null;
      blockList.push(json);
    }
    if (blockList.length == 0) {
      blockList.push({
        'kind': 'LABEL',
        'text': 'No blocks have been used yet!',
      });
    }
    return blockList;
  }

  /**
   * Loads the state of this object from a serialized JSON.
   * @param {object} data the serialized data payload to load from
   */
  loadFromSerializedData(data) {
    this.defaultJsonForBlockLookup = data.defaultJsonForBlockLookup;
    this.recentlyUsedBlocks = data.recentlyUsedBlocks;
  }

  /**
   * Saves the state of this object to a serialized JSON.
   * @return {object} a serialized data object including this object's state
   */
  saveToSerializedData() {
    return {
      defaultJsonForBlockLookup: this.defaultJsonForBlockLookup,
      recentlyUsedBlocks: this.recentlyUsedBlocks,
    };
  }

  /**
   * Resets the internal state of this object.
   */
  clearPriorBlockData() {
    this.defaultJsonForBlockLookup = {};
    this.recentlyUsedBlocks = [];
  }

  /**
   * Callback for when the workspace sends out events.
   * @param {any} e the event object
   */
  eventListener(e) {
    if (e.type == Blockly.Events.BLOCK_CREATE &&
      this.workspaceHasFinishedLoading) {
      const newBlockType = e.json.type;
      // If this is the first time creating this block, store its default
      // configuration so we know how exactly to render it in the toolbox
      if (!this.defaultJsonForBlockLookup[newBlockType]) {
        this.defaultJsonForBlockLookup[newBlockType] = e.json;
      }
      this.recentlyUsedBlocks.unshift(newBlockType);
    } else if (e.type == Blockly.Events.FINISHED_LOADING) {
      this.workspaceHasFinishedLoading = true;
    }
  }
}

export const init = function(workspace) {
  const suggestor = new BlockSuggestor();
  workspace.registerToolboxCategoryCallback('MOST_USED', suggestor.getMostUsed);
  workspace.registerToolboxCategoryCallback('RECENTLY_USED',
      suggestor.getRecentlyUsed);
  workspace.addChangeListener(suggestor.eventListener);
  suggestorLookup.set(workspace, suggestor);
};

/**
 *
 */
class BlockSuggestorSerializer {
  /** Constructs the block suggestor serializer */
  constructor() {
    /**
     * The priority for deserializing block suggestion data.
     * Should be less than the priority for blocks so that this state is
     * applied after the blocks are loaded.
     * @type {number}
     */
    this.priority = Blockly.serialization.priorities.BLOCKS - 10;
  }

  /**
   * Saves a target workspace's state to serialized JSON.
   * @param {Blockly.Workspace} workspace the workspace to save
   * @return {object} the serialized JSON
   */
  save(workspace) {
    return suggestorLookup.get(workspace).saveToSerializedData();
  }

  /**
   * Loads a serialized state into the target workspace.
   * @param {object} state the serialized state JSON
   * @param {Blockly.Workspace} workspace the workspace to load into
   */
  load(state, workspace) {
    suggestorLookup.get(workspace).loadFromSerializedData(state);
  }

  /**
   * Resets the state of a workspace.
   * @param {Blockly.Workspace} workspace the workspace to reset
   */
  clear(workspace) {
    suggestorLookup.get(workspace).clearPriorBlockData();
  }
}


Blockly.serialization.registry.register(
    'suggested-blocks', // Name
    new BlockSuggestorSerializer());
