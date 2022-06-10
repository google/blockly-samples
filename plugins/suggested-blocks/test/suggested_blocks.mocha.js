/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const {assert} = require('chai');
const sinon = require('sinon');
const Blockly = require('blockly/node');
const SuggestedBlocks = require('../src/index');

const BLOCK_LIST_1 = [
  'controls_if',
  'controls_if',
  'controls_if',
  'controls_if',
  'controls_if',
  'lists_length',
  'controls_whileUntil',
  'controls_whileUntil',
  'controls_whileUntil',
  'controls_whileUntil',
  'colour_picker',
  'colour_picker',
  'colour_random',
  'colour_random',
  'colour_random',
]

const EXPECTED_FREQUENT_BLOCKS_ORDER_1 = [
  'controls_if',
  'controls_whileUntil',
  'colour_random',
  'colour_picker',
  'lists_length',
]

const EXPECTED_RECENT_BLOCKS_ORDER_1 = [
  'controls_if',
  'lists_length',
  'controls_whileUntil',
  'colour_picker',
  'colour_random',
]

suite('Frequently used blocks', function() {
  /**
   * Asserts that the list of blocks matches the expected list.
   * @param blockList
   * @param expectedBlockIds
   */
  function assertSuggestedListEquals(blockList, expectedBlockIds) {
    assert.equal(blockList.length, expectedBlockIds.length);
    for (let i = 0; i < blockList.length; i++){
      assert.equal(blockList[i].type, expectedBlockIds[i]);
    }
  }

  setup(function() {
    this.workspace = new Blockly.Workspace();
    this.suggestor = new SuggestedBlocks.BlockSuggestor();
    this.workspace.addChangeListener(this.suggestor.eventListener);
    this.clock = sinon.useFakeTimers();
  });

  teardown(function() {
    this.workspace.dispose();
    this.suggestor = null;
  });

  // test('Initially both empty', function() {
  //   // this.block = this.workspace.newBlock('lists_create_with');
  //   assertSuggestedListEquals(this.suggestor.getMostUsed(), []);
  //   assertSuggestedListEquals(this.suggestor.getRecentlyUsed(), []);
  // });

  test('Standard case, most used', function() {
    for (const blockType of BLOCK_LIST_1){
      // Broken method
      this.workspace.newBlock(blockType);
      
      // // Workaround
      // const mockEvent = {
      //   type: Blockly.Events.BLOCK_CREATE,
      //   json: {
      //     type: blockType
      //   }
      // }
      // this.suggestor.eventListener(mockEvent);
    }
    this.clock.tick(500);
    const result = this.suggestor.getMostUsed();
    console.log('RESULT:', result);
    assertSuggestedListEquals(result, EXPECTED_FREQUENT_BLOCKS_ORDER_1);
  });

  // test('Standard case, recently used', function() {
  //   for (const blockType of BLOCK_LIST_1){
  //     this.workspace.newBlock(blockType);
  //   }
  //   assertSuggestedListEquals(this.suggestor.getRecentlyUsed(), EXPECTED_RECENT_BLOCKS_ORDER_1);
  // });
});
