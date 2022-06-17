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
   *
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
   * Generates a list of the 10 most frequently used blocks, in order. Includes a secondary sort by most recent blocks.
   * @return A list of block JSON objects
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
   * @return A list of block JSON objects
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
   * @param data
   */
  loadFromSerializedData(data) {
    // console.log('Suggestor LOADING...', data);
    this.defaultJsonForBlockLookup = data.defaultJsonForBlockLookup;
    this.recentlyUsedBlocks = data.recentlyUsedBlocks;
  }

  /**
   *
   */
  saveToSerializedData() {
    // console.log('Suggestor SAVING...');
    return {
      defaultJsonForBlockLookup: this.defaultJsonForBlockLookup,
      recentlyUsedBlocks: this.recentlyUsedBlocks,
    };
  }

  /**
   *
   */
  clearPriorBlockData() {
    // console.log('Suggestor CLEARING...');
    this.defaultJsonForBlockLookup = {};
    this.recentlyUsedBlocks = [];
  }

  /**
   * @param e the event object
   */
  eventListener(e) {
    if (e.type == Blockly.Events.BLOCK_CREATE &&
      this.workspaceHasFinishedLoading) {
      const newBlockType = e.json.type;
      // console.log('Block created.', newBlockType, e.json);
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
   * @param workspace
   */
  save(workspace) {
    return suggestorLookup.get(workspace).saveToSerializedData();
  }

  /**
   * @param state
   * @param workspace
   */
  load(state, workspace) {
    suggestorLookup.get(workspace).loadFromSerializedData(state);
  }

  /**
   * @param workspace
   */
  clear(workspace) {
    suggestorLookup.get(workspace).clearPriorBlockData();
  }
}


Blockly.serialization.registry.register(
    'suggested-blocks', // Name
    new BlockSuggestorSerializer());
