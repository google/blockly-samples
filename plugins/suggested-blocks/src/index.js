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

  // Returns an array of objects.
  getMostUsed = function() {
    console.log('GETTING MOST USED', this.recentlyUsedBlocks, this);
    const countMap = {};
    for (const key of this.recentlyUsedBlocks) {
      countMap[key] = (countMap[key] || 0) + 1;
    }
    // console.log(countMap);

    const freqUsedKeys = [];
    for (const key of Object.keys(countMap)) {
      freqUsedKeys.push(key);
    }
    freqUsedKeys.sort((a, b) => countMap[b] - countMap[a]);

    const blockList = [];
    for (const key of freqUsedKeys.slice(0, NUM_BLOCKS_PER_CATEGORY)) {
      const json = (this.blockDefaultJson[key] || {});
      blockList.push({
        'kind': 'BLOCK',
        'type': key,
        'fields': json.fields,
        'inputs': json.inputs,
      });
    }
    return blockList;
  };

  // Returns an array of objects.
  getRecentlyUsed = function() {
    const uniqueRecentBlocks = [...new Set(this.recentlyUsedBlocks)];
    // console.log(uniqueRecentBlocks);

    const blockList = [];
    for (const key of uniqueRecentBlocks.slice(-1 * NUM_BLOCKS_PER_CATEGORY)) {
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

  eventListener = function(e) {
    if (e.type == Blockly.Events.BLOCK_CREATE) {
      const newBlockType = e.json.type;
      console.log('Block created.', newBlockType, e, this.recentlyUsedBlocks, this);
      this.blockDefaultJson[newBlockType] = e.json;
      this.recentlyUsedBlocks.unshift(newBlockType);
    }
  };
}

export const init = function(workspace) {
  const suggestor = new BlockSuggestor();
  workspace.registerToolboxCategoryCallback('MOST_USED', suggestor.getMostUsed);
  workspace.registerToolboxCategoryCallback('RECENTLY_USED',
      suggestor.getRecentlyUsed);
  workspace.addChangeListener(suggestor.eventListener);
};
