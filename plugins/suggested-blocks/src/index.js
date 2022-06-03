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
const eventUtils = goog.require('Blockly.Events.utils');

const blockDefaultJson = {};
const recentlyUsedBlocks = [];
const NUM_BLOCKS_PER_CATEGORY = 10;

// Returns an array of objects.
const getMostUsed = function() {
  const countMap = {};
  for (const key of recentlyUsedBlocks) {
    countMap[key] = (countMap[key] || 0) + 1;
  }
  console.log(countMap);

  const freqUsedKeys = [];
  for (const key in countMap) {
    freqUsedKeys.push(key);
  }
  freqUsedKeys.sort((a, b) => countMap[b] - countMap[a]);

  var blockList = [];
  for (const key of freqUsedKeys.slice(0, NUM_BLOCKS_PER_CATEGORY)) {
    const json = (blockDefaultJson[key] || {});
    blockList.push({
      'kind': 'BLOCK',
      'type': key,
      'fields': json.fields,
      'inputs': json.inputs
    });
  }
  return blockList;
};

// Returns an array of objects.
const getRecentlyUsed =
    function() {
  const uniqueRecentBlocks = [...new Set(recentlyUsedBlocks)]
  console.log(uniqueRecentBlocks);

  var blockList = [];
  for (const key of uniqueRecentBlocks.slice(-1 * NUM_BLOCKS_PER_CATEGORY)) {
    const json = (blockDefaultJson[key] || {});
    blockList.push({
      'kind': 'BLOCK',
      'type': key,
      'fields': json.fields,
      'inputs': json.inputs
    });
  }
  return blockList
}

const eventListener = function(e) {
  if (e.type == eventUtils.BLOCK_CREATE) {
    console.log('Block created.', e);
    const newBlockType = e.json.type;
    blockDefaultJson[newBlockType] = e.json;
    recentlyUsedBlocks.unshift(newBlockType);
  }
};

export const init = function(workspace) {
  workspace.registerToolboxCategoryCallback('MOST_USED', getMostUsed);
  workspace.registerToolboxCategoryCallback('RECENTLY_USED', getRecentlyUsed);
  workspace.addChangeListener(eventListener);
};