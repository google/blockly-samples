/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const chai = require('chai');
const sinon = require('sinon');
const Blockly = require('blockly');
const {BlockShadowChange, shadowBlockConversionChangeListener} =
    require('../src/index');

const assert = chai.assert;

suite('shadowBlockConversionChangeListener', function() {
  setup(function() {
    this.workspace = new Blockly.Workspace();
    this.workspace.addChangeListener(shadowBlockConversionChangeListener);
    this.clock = sinon.useFakeTimers();
  });

  teardown(function() {
    this.workspace.dispose();
    // Finish any remaining queued events then dispose the sinon environment.
    this.clock.runAll();
    this.clock.restore();
  });

  test('directly running shadow event changes shadow', function() {
    const block = this.workspace.newBlock('text');
    const event = new BlockShadowChange(block, false, true);
    event.run(true);
    assert.isTrue(block.isShadow());
    event.run(false);
    assert.isFalse(block.isShadow());
  });

  test('responds to field change', function() {
    const block = this.workspace.newBlock('text');
    block.setShadow(true);
    block.getField('TEXT').setValue('new value');
    this.clock.runAll();
    assert.isFalse(block.isShadow());
  });

  test('responds to block change event', function() {
    const block = this.workspace.newBlock('text');
    block.setShadow(true);
    const event = new Blockly.Events.BlockChange(
        block, 'field', 'TEXT', 'old value', 'new value');
    this.workspace.fireChangeListener(event);
    assert.isFalse(block.isShadow());
  });

  test('ignores to block move event', function() {
    const block = this.workspace.newBlock('text');
    block.setShadow(true);
    const event = new Blockly.Events.BlockMove(block);
    this.workspace.fireChangeListener(event);
    assert.isTrue(block.isShadow());
  });

  test('undo shadow change', function() {
    const block = this.workspace.newBlock('text');
    block.setShadow(true);
    block.getField('TEXT').setValue('new value');
    // Wait for the block change event to get handled by the shadow listener.
    this.clock.runAll();
    assert.isFalse(block.isShadow());
    // Wait for the shadow change event to get fired and recorded in history.
    this.clock.runAll();
    this.workspace.undo(false);
    assert.isTrue(block.isShadow());
  });

  test('redo shadow change', function() {
    const block = this.workspace.newBlock('text');
    block.setShadow(true);
    block.getField('TEXT').setValue('new value');
    // Wait for the block change event to get handled by the shadow listener.
    this.clock.runAll();
    // Wait for the shadow change event to get fired and recorded in history.
    this.clock.runAll();
    this.workspace.undo(false);
    assert.isTrue(block.isShadow());
    this.workspace.undo(true);
    assert.isFalse(block.isShadow());
  });

  test('shadow change follows output connection', function() {
    const statementBlock = this.workspace.newBlock('text_print');
    const expressionBlock = this.workspace.newBlock('text');
    statementBlock.inputList[0].connection.connect(
        expressionBlock.outputConnection);
    expressionBlock.setShadow(true);
    statementBlock.setShadow(true);
    expressionBlock.getField('TEXT').setValue('new value');
    this.clock.runAll();
    assert.isFalse(expressionBlock.isShadow());
    assert.isFalse(statementBlock.isShadow());
  });

  test('shadow change follows previous connection', function() {
    const block1 = this.workspace.newBlock('controls_whileUntil');
    const block2 = this.workspace.newBlock('controls_whileUntil');
    block1.nextConnection.connect(block2.previousConnection);
    block2.setShadow(true);
    block1.setShadow(true);
    block2.getField('MODE').setValue('UNTIL');
    this.clock.runAll();
    assert.isFalse(block2.isShadow());
    assert.isFalse(block1.isShadow());
  });
});
