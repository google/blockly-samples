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

export class BlockSuggestor {
  constructor() {
    this.blockDefaultJson = {};
    this.recentlyUsedBlocks = [];

    this.eventListener = this.eventListener.bind(this);
    this.getMostUsed = this.getMostUsed.bind(this);
    this.getRecentlyUsed = this.getRecentlyUsed.bind(this);
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
      const json = (this.blockDefaultJson[key] || {});
      blockList.push({
        'kind': 'BLOCK',
        'type': key,
        'fields': json.fields,
        'inputs': json.inputs,
      });
    }
    return blockList;
  }

  eventListener = function (e) {
    if (e.type == Blockly.Events.BLOCK_CREATE) {
      const newBlockType = e.json.type;
      // console.log('Block created.', newBlockType, this.recentlyUsedBlocks);
      this.blockDefaultJson[newBlockType] = e.json;
      this.recentlyUsedBlocks.unshift(newBlockType);
    }
  };
}

export const init = function (workspace) {
  const suggestor = new BlockSuggestor();
  workspace.registerToolboxCategoryCallback('MOST_USED', suggestor.getMostUsed);
  workspace.registerToolboxCategoryCallback('RECENTLY_USED',
    suggestor.getRecentlyUsed);
  workspace.addChangeListener(suggestor.eventListener);
};
