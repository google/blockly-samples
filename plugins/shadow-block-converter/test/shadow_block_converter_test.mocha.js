/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {assert} from 'chai';
import * as Blockly from 'blockly';
import {BlockShadowChange, shadowBlockConversionChangeListener} from '../src/index';

/**
 * Wait until after previously queued Blockly events have been handled by any
 * workspace change listeners.
 *
 * Blockly event firing is asynchronous, so the shadow block conversion plugin's
 * workspace change listener isn't notified immediately when blocks change, but
 * waiting for a timeout to complete should be sufficient to ensure any queued
 * events have propagated to the listener.
 */
async function waitForEventsToFire() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

suite('shadowBlockConversionChangeListener', function() {
  setup(function() {
    this.workspace = new Blockly.Workspace();
    this.workspace.addChangeListener(shadowBlockConversionChangeListener);
  });

  teardown(function() {
    this.workspace.dispose();
  });

  test('directly running shadow event changes shadow', async function() {
    const block = this.workspace.newBlock('text');
    const event = new BlockShadowChange(block, false, true);
    event.run(true);
    assert.isTrue(block.isShadow());
    event.run(false);
    assert.isFalse(block.isShadow());
  });

  test('responds to field change', async function() {
    const block = this.workspace.newBlock('text');
    block.setShadow(true);
    block.getField('TEXT').setValue('new value');
    await waitForEventsToFire();
    assert.isFalse(block.isShadow());
  });

  test('responds to block change event', async function() {
    const block = this.workspace.newBlock('text');
    block.setShadow(true);
    const event = new Blockly.Events.BlockChange(
        block, 'field', 'TEXT', 'old value', 'new value');
    this.workspace.fireChangeListener(event);
    assert.isFalse(block.isShadow());
  });

  test('ignores to block move event', async function() {
    const block = this.workspace.newBlock('text');
    block.setShadow(true);
    const event = new Blockly.Events.BlockMove(block);
    this.workspace.fireChangeListener(event);
    assert.isTrue(block.isShadow());
  });

  test('undo shadow change', async function() {
    const block = this.workspace.newBlock('text');
    block.setShadow(true);
    block.getField('TEXT').setValue('new value');
    // Wait for the block change event to get handled by the shadow listener.
    await waitForEventsToFire();
    assert.isFalse(block.isShadow());
    // Wait for the shadow change event to get fired and recorded in history.
    await waitForEventsToFire();
    this.workspace.undo(false);
    assert.isTrue(block.isShadow());
  });

  test('redo shadow change', async function() {
    const block = this.workspace.newBlock('text');
    block.setShadow(true);
    block.getField('TEXT').setValue('new value');
    // Wait for the block change event to get handled by the shadow listener.
    await waitForEventsToFire();
    // Wait for the shadow change event to get fired and recorded in history.
    await waitForEventsToFire();
    this.workspace.undo(false);
    assert.isTrue(block.isShadow());
    this.workspace.undo(true);
    assert.isFalse(block.isShadow());
  });

  test('shadow change follows output connection', async function() {
    const statementBlock = this.workspace.newBlock('text_print');
    const expressionBlock = this.workspace.newBlock('text');
    statementBlock.inputList[0].connection.connect(
        expressionBlock.outputConnection);
    expressionBlock.setShadow(true);
    statementBlock.setShadow(true);
    expressionBlock.getField('TEXT').setValue('new value');
    await waitForEventsToFire();
    assert.isFalse(expressionBlock.isShadow());
    assert.isFalse(statementBlock.isShadow());
  });

  test('shadow change follows previous connection', async function() {
    const block1 = this.workspace.newBlock('controls_whileUntil');
    const block2 = this.workspace.newBlock('controls_whileUntil');
    block1.nextConnection.connect(block2.previousConnection);
    block2.setShadow(true);
    block1.setShadow(true);
    block2.getField('MODE').setValue('UNTIL');
    await waitForEventsToFire();
    assert.isFalse(block2.isShadow());
    assert.isFalse(block1.isShadow());
  });
});
