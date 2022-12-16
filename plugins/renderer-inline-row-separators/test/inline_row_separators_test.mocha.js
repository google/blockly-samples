/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

require('../src/inline_row_separators_renderer');
const chai = require('chai');
const Blockly = require('blockly');
const jsdomGlobal = require('jsdom-global');
const {addInlineRowSeparators, overrideOldBlockDefinitions} =
    require('../src/index');

overrideOldBlockDefinitions();

const assert = chai.assert;

suite('inlineRowSeparates', function() {
  setup(function() {
    this.jsdomCleanup =
        jsdomGlobal('<!DOCTYPE html><div id="blocklyDiv"></div>');
    this.workspace = Blockly.inject('blocklyDiv', {
      renderer: 'thrasos-inline-row-separators',
    });
    this.renderer = this.workspace.getRenderer();
    Blockly.defineBlocksWithJsonArray([
      {
        'type': 'test_block',
        'message0': 'input A %1 %2 input B %3',
        'args0': [
          {'type': 'input_value', 'name': 'A'},
          {'type': 'input_dummy'},
          {'type': 'input_value', 'name': 'B'},
        ],
        'inputsInline': true,
      },
    ]);
  });

  teardown(function() {
    delete Blockly.Blocks['test_block'];
    this.workspace.dispose();
    this.jsdomCleanup();
  });

  test('shouldStartNewRow_ returns true if last input is a dummy', function() {
    const block = this.workspace.newBlock('test_block');
    const renderInfo = this.renderer.makeRenderInfo_(block);
    // Test that a dummy after a value still remains on one row.
    assert.isFalse(
        renderInfo.shouldStartNewRow_(block.inputList[1], block.inputList[0]));
    // Test that a value after a dummy is put on a new row.
    assert.isTrue(
        renderInfo.shouldStartNewRow_(block.inputList[2], block.inputList[1]));
  });

  test('addInlineRowSeparators adds row separators to renderer', function() {
    const Renderer = addInlineRowSeparators(
        Blockly.zelos.Renderer, Blockly.zelos.RenderInfo);
    const block = this.workspace.newBlock('test_block');
    const renderer = new Renderer('test_renderer');
    renderer.init(this.workspace.getTheme());
    const renderInfo = renderer.makeRenderInfo_(block);
    // Test that a dummy after a value still remains on one row.
    assert.isFalse(
        renderInfo.shouldStartNewRow_(block.inputList[1], block.inputList[0]));
    // Test that a value after a dummy is put on a new row.
    assert.isTrue(
        renderInfo.shouldStartNewRow_(block.inputList[2], block.inputList[1]));
  });

  test('inline_text_join is inline and inserts dummies', function() {
    const block = this.workspace.newBlock('inline_text_join');
    // Test that the alternative block inserts dummies between values.
    assert.isTrue(block.inputList[0].type === Blockly.inputTypes.DUMMY);
    assert.isTrue(block.inputList[1].type === Blockly.inputTypes.VALUE);
    assert.isTrue(block.inputList[2].type === Blockly.inputTypes.DUMMY);
    assert.isTrue(block.inputList[3].type === Blockly.inputTypes.VALUE);
    // Test that the alternative block's inputs are rendered in inline mode.
    assert.isTrue(block.inputsInline);
  });

  test('inline_lists_create_with is inline and inserts dummies', function() {
    const block = this.workspace.newBlock('inline_lists_create_with');
    // Test that the alternative block inserts dummies between values.
    assert.isTrue(block.inputList[0].type === Blockly.inputTypes.DUMMY);
    assert.isTrue(block.inputList[1].type === Blockly.inputTypes.VALUE);
    assert.isTrue(block.inputList[2].type === Blockly.inputTypes.DUMMY);
    assert.isTrue(block.inputList[3].type === Blockly.inputTypes.VALUE);
    assert.isTrue(block.inputList[4].type === Blockly.inputTypes.DUMMY);
    assert.isTrue(block.inputList[5].type === Blockly.inputTypes.VALUE);
    // Test that the alternative block's inputs are rendered in inline mode.
    assert.isTrue(block.inputsInline);
  });

  test('inline_procedures_defreturn is inline', function() {
    const block = this.workspace.newBlock('inline_procedures_defreturn');
    // Test that the alternative block's inputs are rendered in inline mode.
    assert.isTrue(block.inputsInline);
  });

  test('overrideOldBlockDefinitions replaces blocks', function() {
    assert.isTrue(Blockly.Blocks['text_join'] ===
        Blockly.Blocks['inline_text_join']);
    assert.isTrue(Blockly.Blocks['lists_create_with'] ===
        Blockly.Blocks['inline_lists_create_with']);
    assert.isTrue(Blockly.Blocks['procedures_defreturn'] ===
        Blockly.Blocks['inline_procedures_defreturn']);
  });
});
