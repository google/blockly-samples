/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const {assert} = require('chai');
const sinon = require('sinon');
const Blockly = require('blockly/node');
const SuggestedBlocks = require('../src/index');

const STANDARD_TEST_CASE = {
  usedBlockList: [
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
  ],
  expectedFrequentBlocks: [
    'controls_if',
    'controls_whileUntil',
    'colour_random',
    'colour_picker',
    'lists_length',
  ],
  expectedRecentBlocks: [
    'colour_random',
    'colour_picker',
    'controls_whileUntil',
    'lists_length',
    'controls_if',
  ],
};

const MANY_UNIQUE_BLOCKS_TEST_CASE = {
  usedBlockList: [
    'controls_if',
    'controls_if',
    'lists_length',
    'controls_whileUntil',
    'controls_whileUntil',
    'controls_whileUntil',
    'colour_picker',
    'colour_picker',
    'colour_random',
    'colour_random',
    'math_arithmetic',
    'logic_operation',
    'math_single',
    'math_trig',
    'math_constant',
    'controls_repeat_ext',
    'controls_forEach',
    'text_multiline',
  ],
  expectedFrequentBlocks: [
    'controls_whileUntil',
    'colour_random',
    'colour_picker',
    'controls_if',
    'text_multiline',
    'controls_forEach',
    'controls_repeat_ext',
    'math_constant',
    'math_trig',
    'math_single',
  ],
  expectedRecentBlocks: [
    'text_multiline',
    'controls_forEach',
    'controls_repeat_ext',
    'math_constant',
    'math_trig',
    'math_single',
    'logic_operation',
    'math_arithmetic',
    'colour_random',
    'colour_picker',
  ],
};

const FREQUENCY_TIEBREAK_TEST_CASE = {
  usedBlockList: [
    // Used once
    'controls_if',
    'lists_length',
    'controls_whileUntil',
    'colour_picker',
    'colour_random',
    'math_arithmetic',
    // Used a second time
    'controls_if',
    'controls_whileUntil',
    'colour_picker',
    'colour_random',
    // Used a third time
    'colour_picker',
    'colour_random',
  ],
  expectedFrequentBlocks: [
    'colour_random',
    'colour_picker',
    'controls_whileUntil',
    'controls_if',
    'math_arithmetic',
    'lists_length',
  ],
  expectedRecentBlocks: [
    'colour_random',
    'colour_picker',
    'controls_whileUntil',
    'controls_if',
    'math_arithmetic',
    'lists_length',
  ],
};


suite('Suggested blocks', function() {
  /**
   * Asserts that the list of blocks matches the expected list.
   * @param {Array <object>} blockList list of block JSON objects
   * @param {Array <string>} expectedBlockIds list of expected block_type values
   */
  function assertSuggestedListEquals(blockList, expectedBlockIds) {
    const actualBlockIds = blockList.map((x) => x.type);
    assert.deepEqual(actualBlockIds, expectedBlockIds);
  }

  const simulateTestCase = (testCase, workspace, clock) => {
    for (const blockType of testCase.usedBlockList) {
      workspace.newBlock(blockType);
    }

    // Force events to fire by running any timers scheduled for the next 10ms.
    // Takes <1ms, so 10ms is conservative
    clock.tick(10);
  };

  setup(function() {
    // Create a workspace and integrate with the suggested blocks plugin
    this.workspace = new Blockly.Workspace();
    this.suggestor = new SuggestedBlocks.BlockSuggestor(
        /* numBlocksPerCategory= */ 10);
    this.workspace.addChangeListener(this.suggestor.eventListener);
    this.workspace.fireChangeListener({type: Blockly.Events.FINISHED_LOADING});

    // Configure the Sinon library, which lets us control the timing of the
    // unit tests.
    if (!this.clock) {
      this.clock = sinon.useFakeTimers();
    }
  });

  test('No blocks, shows label', function() {
    // (No setup code needed because no blocks created)

    const mostUsed = this.suggestor.getMostUsed();
    assert.equal(mostUsed.length, 1);
    assert.equal(mostUsed[0].kind, 'LABEL');

    const recentlyUsed = this.suggestor.getMostUsed();
    assert.equal(recentlyUsed.length, 1);
    assert.equal(recentlyUsed[0].kind, 'LABEL');
  });

  test('Standard case, most used', function() {
    simulateTestCase(STANDARD_TEST_CASE, this.workspace, this.clock);
    assertSuggestedListEquals(this.suggestor.getMostUsed(),
        STANDARD_TEST_CASE.expectedFrequentBlocks);
  });

  test('Standard case, recently used', function() {
    simulateTestCase(STANDARD_TEST_CASE, this.workspace, this.clock);
    assertSuggestedListEquals(this.suggestor.getRecentlyUsed(),
        STANDARD_TEST_CASE.expectedRecentBlocks);
  });

  test('Many blocks case, most used', function() {
    simulateTestCase(MANY_UNIQUE_BLOCKS_TEST_CASE, this.workspace, this.clock);
    assertSuggestedListEquals(this.suggestor.getMostUsed(),
        MANY_UNIQUE_BLOCKS_TEST_CASE.expectedFrequentBlocks);
  });

  test('Many blocks case, recently used', function() {
    simulateTestCase(MANY_UNIQUE_BLOCKS_TEST_CASE, this.workspace, this.clock);
    assertSuggestedListEquals(this.suggestor.getRecentlyUsed(),
        MANY_UNIQUE_BLOCKS_TEST_CASE.expectedRecentBlocks);
  });

  test('Frequency tiebreak case, most used', function() {
    simulateTestCase(FREQUENCY_TIEBREAK_TEST_CASE, this.workspace, this.clock);
    assertSuggestedListEquals(this.suggestor.getMostUsed(),
        FREQUENCY_TIEBREAK_TEST_CASE.expectedFrequentBlocks);
  });

  test('Frequency tiebreak case, recently used', function() {
    simulateTestCase(FREQUENCY_TIEBREAK_TEST_CASE, this.workspace, this.clock);
    assertSuggestedListEquals(this.suggestor.getRecentlyUsed(),
        FREQUENCY_TIEBREAK_TEST_CASE.expectedRecentBlocks);
  });

  test('Can serialize/de-serialize', function() {
    simulateTestCase(STANDARD_TEST_CASE, this.workspace, this.clock);

    const serializedData = this.suggestor.saveToSerializedData();
    this.suggestor.clearPriorBlockData();
    this.suggestor.loadFromSerializedData(serializedData);

    assertSuggestedListEquals(this.suggestor.getMostUsed(),
        STANDARD_TEST_CASE.expectedFrequentBlocks);
  });

  teardown(function() {
    this.workspace.dispose();
    this.suggestor = null;
  });
});
