/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Unit tests for a serializer which serializes disabled
 *   interactions.
 */

const chai = require('chai');
const Blockly = require('blockly/node');
// Require for the side effect of registering.
require('../src/index.js');

suite('DisabledInteractionSerializer', function() {
  setup(function() {
    this.workspace = new Blockly.Workspace();
  });

  teardown(function() {
    this.workspace.dispose();
  });

  suite('Serialization', function() {
    test('None', function() {
      this.workspace.newBlock('controls_if');
      const state = Blockly.serialization.workspaces.save(this.workspace);
      chai.assert.isUndefined(state['disabledInteractions']);
    });

    test('Not deletable', function() {
      const block = this.workspace.newBlock('controls_if');
      block.setDeletable(false);
      const state = Blockly.serialization.workspaces.save(this.workspace);
      chai.assert.isDefined(state['disabledInteractions']);
      chai.assert.isDefined(state['disabledInteractions']['notDeletable']);
      chai.assert.isUndefined(state['disabledInteractions']['notMovable']);
      chai.assert.isUndefined(state['disabledInteractions']['notEditable']);
      chai.assert.deepEqual(
          state['disabledInteractions']['notDeletable'], [block.id]);
    });

    test('Not movable', function() {
      const block = this.workspace.newBlock('controls_if');
      block.setMovable(false);
      const state = Blockly.serialization.workspaces.save(this.workspace);
      chai.assert.isDefined(state['disabledInteractions']);
      chai.assert.isUndefined(state['disabledInteractions']['notDeltable']);
      chai.assert.isDefined(state['disabledInteractions']['notMovable']);
      chai.assert.isUndefined(state['disabledInteractions']['notEditable']);
      chai.assert.deepEqual(
          state['disabledInteractions']['notMovable'], [block.id]);
    });

    test('Not editable', function() {
      const block = this.workspace.newBlock('controls_if');
      block.setEditable(false);
      const state = Blockly.serialization.workspaces.save(this.workspace);
      chai.assert.isDefined(state['disabledInteractions']);
      chai.assert.isUndefined(state['disabledInteractions']['notDeltable']);
      chai.assert.isUndefined(state['disabledInteractions']['notMovable']);
      chai.assert.isDefined(state['disabledInteractions']['notEditable']);
      chai.assert.deepEqual(
          state['disabledInteractions']['notEditable'], [block.id]);
    });

    test('All', function() {
      const block = this.workspace.newBlock('controls_if');
      block.setDeletable(false);
      block.setMovable(false);
      block.setEditable(false);
      const state = Blockly.serialization.workspaces.save(this.workspace);
      chai.assert.isDefined(state['disabledInteractions']);
      chai.assert.isDefined(state['disabledInteractions']['notDeletable']);
      chai.assert.isDefined(state['disabledInteractions']['notMovable']);
      chai.assert.isDefined(state['disabledInteractions']['notEditable']);
      chai.assert.deepEqual(
          state['disabledInteractions']['notDeletable'], [block.id]);
      chai.assert.deepEqual(
          state['disabledInteractions']['notMovable'], [block.id]);
      chai.assert.deepEqual(
          state['disabledInteractions']['notEditable'], [block.id]);
    });
  });

  suite('Deserialization', function() {
    test('None', function() {
      Blockly.serialization.workspaces.load({
        'blocks': {
          'languageVersion': 0,
          'blocks': [
            {
              'type': 'controls_if',
              'id': 'test_id',
            },
          ],
        },
      }, this.workspace);
      const block = this.workspace.getTopBlocks()[0];
      chai.assert.isTrue(block.isDeletable());
      chai.assert.isTrue(block.isMovable());
      chai.assert.isTrue(block.isEditable());
    });

    test('Not deletable', function() {
      Blockly.serialization.workspaces.load({
        'blocks': {
          'languageVersion': 0,
          'blocks': [
            {
              'type': 'controls_if',
              'id': 'test_id',
            },
          ],
        },
        'disabledInteractions': {
          'notDeletable': ['test_id'],
        },
      }, this.workspace);
      const block = this.workspace.getTopBlocks()[0];
      chai.assert.isFalse(block.isDeletable());
      chai.assert.isTrue(block.isMovable());
      chai.assert.isTrue(block.isEditable());
    });

    test('Not movable', function() {
      Blockly.serialization.workspaces.load({
        'blocks': {
          'languageVersion': 0,
          'blocks': [
            {
              'type': 'controls_if',
              'id': 'test_id',
            },
          ],
        },
        'disabledInteractions': {
          'notMovable': ['test_id'],
        },
      }, this.workspace);
      const block = this.workspace.getTopBlocks()[0];
      chai.assert.isTrue(block.isDeletable());
      chai.assert.isFalse(block.isMovable());
      chai.assert.isTrue(block.isEditable());
    });

    test('Not editable', function() {
      Blockly.serialization.workspaces.load({
        'blocks': {
          'languageVersion': 0,
          'blocks': [
            {
              'type': 'controls_if',
              'id': 'test_id',
            },
          ],
        },
        'disabledInteractions': {
          'notEditable': ['test_id'],
        },
      }, this.workspace);
      const block = this.workspace.getTopBlocks()[0];
      chai.assert.isTrue(block.isDeletable());
      chai.assert.isTrue(block.isMovable());
      chai.assert.isFalse(block.isEditable());
    });

    test('All', function() {
      Blockly.serialization.workspaces.load({
        'blocks': {
          'languageVersion': 0,
          'blocks': [
            {
              'type': 'controls_if',
              'id': 'test_id',
            },
          ],
        },
        'disabledInteractions': {
          'notDeletable': ['test_id'],
          'notMovable': ['test_id'],
          'notEditable': ['test_id'],
        },
      }, this.workspace);
      const block = this.workspace.getTopBlocks()[0];
      chai.assert.isFalse(block.isDeletable());
      chai.assert.isFalse(block.isMovable());
      chai.assert.isFalse(block.isEditable());
    });
  });
});
