/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

require('../src/inline_row_separators_renderer');
const chai = require('chai');
const Blockly = require('blockly');
const jsdomGlobal = require('jsdom-global');
const {overrideOldBlockDefinitions} = require('../src/index');

overrideOldBlockDefinitions();

const assert = chai.assert;

suite('inlineRowSeparates', function() {
  setup(function() {
    this.jsdomCleanup =
        jsdomGlobal('<!DOCTYPE html><div id="blocklyDiv"></div>');
    this.workspace = Blockly.inject('blocklyDiv', {
      renderer: 'inline-row-separators',
    });
    this.renderer = this.workspace.getRenderer();
  });

  teardown(function() {
    this.workspace.dispose();
    this.jsdomCleanup();
  });

  test('a text join block should start new rows for value inputs', function() {
    const block = this.workspace.newBlock('text_join');
    const renderInfo = this.renderer.makeRenderInfo_(block);
    assert.isTrue(renderInfo.isInline);
    assert.isTrue(block.inputList[0].type === Blockly.inputTypes.DUMMY);
    assert.isTrue(
        renderInfo.shouldStartNewRow_(block.inputList[1], block.inputList[0]));
    assert.isTrue(block.inputList[1].type === Blockly.inputTypes.VALUE);
    assert.isFalse(
        renderInfo.shouldStartNewRow_(block.inputList[2], block.inputList[1]));
    assert.isTrue(block.inputList[2].type === Blockly.inputTypes.DUMMY);
    assert.isTrue(
        renderInfo.shouldStartNewRow_(block.inputList[3], block.inputList[2]));
    assert.isTrue(block.inputList[3].type === Blockly.inputTypes.VALUE);
  });
});
