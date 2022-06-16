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
const suggestorLookup = {};

export class BlockSuggestor {
  constructor() {
    this.defaultJsonForBlockLookup = {};
    this.recentlyUsedBlocks = [];
    this.recentlyDeletedBlocks = [];

    this.eventListener = this.eventListener.bind(this);
    this.getMostUsed = this.getMostUsed.bind(this);
    this.getRecentlyUsed = this.getRecentlyUsed.bind(this);
  }

  getFullBlockHistory = function () {
    return this.recentlyDeletedBlocks.concat(this.recentlyUsedBlocks);
  }

  /**
   * Generates a list of the 10 most frequently used blocks, in order. Includes a secondary sort by most recent blocks.
   * @return A list of block JSON objects
   */
  getMostUsed = function () {
    // Store the frequency of each block, as well as the index at which it first appears
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
    freqUsedBlockTypes.sort((a, b) => countMap[b] - countMap[a] + 0.01 * (recencyMap[a] - recencyMap[b]));

    return this.generateBlockData(freqUsedBlockTypes);
  };

  /**
   * Generates a list of the 10 most recently used blocks.
   * @return A list of block JSON objects
   */
  getRecentlyUsed = function () {
    const uniqueRecentBlocks = [...new Set(this.recentlyUsedBlocks)];
    const recencyMap = {};
    for (const [index, key] of this.recentlyUsedBlocks.entries()) {
      if (!recencyMap[key]) {
        recencyMap[key] = index + 1;
      }
    }
    uniqueRecentBlocks.sort((a, b) => recencyMap[a] - recencyMap[b]);
    return this.generateBlockData(uniqueRecentBlocks)
  }

  generateBlockData = function (blockTypeList) {
    const blockList = [];
    for (const key of blockTypeList.slice(0, NUM_BLOCKS_PER_CATEGORY)) {
      const json = (this.defaultJsonForBlockLookup[key] || {});
      json['kind'] = 'BLOCK';
      json['type'] = key;
      json['x'] = null;
      json['y'] = null;
      blockList.push(json);
    }
    if (blockList.length == 0){
      blockList.push({
        'kind': 'LABEL',
        'text': 'No blocks have been used yet!',
      })
    }
    return blockList;
  }

  loadFromSerializedData(data){
    console.log("Suggestor LOADING...", data);
    this.defaultJsonForBlockLookup = data.defaultJsonForBlockLookup;
    // Add all the blocks that were used and then deleted into the block history queue
    this.recentlyUsedBlocks = data.recentlyDeletedBlocks;
    this.recentlyDeletedBlocks = data.recentlyDeletedBlocks;
  }

  saveToSerializedData(){
    console.log("Suggestor SAVING...");

    /* All blocks that were ever used are either:
        1) still present (and will automatically emit new BLOCK_CREATE events 
          when de-serialized)
        2) deleted at some point
      Therefore, when serializing we only need to store the deleted blocks.
     */
    return {
      defaultJsonForBlockLookup: this.defaultJsonForBlockLookup,
      recentlyDeletedBlocks: this.recentlyDeletedBlocks
    }
  }

  clearPriorBlockData(){
    console.log("Suggestor CLEARING...");
    this.defaultJsonForBlockLookup = {};
    this.recentlyUsedBlocks = [];
    this.recentlyDeletedBlocks = [];
  }

  eventListener = function (e) {
    if (e.type == Blockly.Events.BLOCK_CREATE) {
      const newBlockType = e.json.type;
      console.log('Block created.', newBlockType, e.json);
      // If this is the first time creating this block, store its default
      // configuration so we know how exactly to render it in the toolbox
      if (!this.defaultJsonForBlockLookup[newBlockType]){
        this.defaultJsonForBlockLookup[newBlockType] = e.json;        
      }
      this.recentlyUsedBlocks.unshift(newBlockType);
    } else if (e.type == Blockly.Events.BLOCK_DELETE) {
      const newBlockType = e.oldJson.type;
      console.log('Block deleted.', newBlockType);
      this.recentlyDeletedBlocks.unshift(newBlockType);
    }
  };
}

export const init = function (workspace) {
  const suggestor = new BlockSuggestor();
  workspace.registerToolboxCategoryCallback('MOST_USED', suggestor.getMostUsed);
  workspace.registerToolboxCategoryCallback('RECENTLY_USED',
    suggestor.getRecentlyUsed);
  workspace.addChangeListener(suggestor.eventListener);
  suggestorLookup[workspace.id] = suggestor;
};

class BlockSuggestorSerializer{
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

  save(workspace) {
    return suggestorLookup[workspace.id].saveToSerializedData();
  }

  load(state, workspace) {
    suggestorLookup[workspace.id].loadFromSerializedData(state);
  }

  clear(workspace) {
    suggestorLookup[workspace.id].clearPriorBlockData();
  }
}


Blockly.serialization.registry.register(
  'suggested-blocks',  // Name
  new BlockSuggestorSerializer());