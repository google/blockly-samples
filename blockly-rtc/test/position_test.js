/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Unit tests for Position.
 * @author navil@google.com (Navil Perez)
 */

const assert = require('assert');
const Blockly = require('blockly');
const sinon = require('sinon');

const Position = require('../src/Position').default;

suite('Position', () => {

  suite('fromEvent()', () => {
    setup(() => {
      Blockly.defineBlocksWithJsonArray([{
        'type': 'test_block',
        'message0': 'test block'
      }]);
      this.FAKE_WORKSPACE_ID = 'mockWorkspaceId';
      this.FAKE_BLOCK_ID = 'mockBlockId'
      sinon.stub(Blockly.utils, 'genUid')
          .onFirstCall().returns(this.FAKE_WORKSPACE_ID)
          .onSecondCall().returns(this.FAKE_BLOCK_ID);
      this.workspace = new Blockly.Workspace();
      this.block = new Blockly.Block(this.workspace, 'test_block');
      this.field = new Blockly.Field('hello');
      this.field.sourceBlock_ = this.block;
      this.field.name = 'message0';
    });

    teardown(() => {
      sinon.restore();
      delete Blockly.Blocks['test_block'];
      this.workspace.dispose();
    });

    test('From SELECT UI event on a block.', async () => {
      const event = new Blockly.Events.Ui(
          this.block, 'selected', 'old', this.FAKE_BLOCK_ID);
      const position = Position.fromEvent(event);
      const expectedPosition = new Position('BLOCK', this.FAKE_BLOCK_ID, null);
      assert.deepEqual(position, expectedPosition);
    });

    test('From CHANGE event on a field.', async () => {
      const event = new Blockly.Events.Change(
          this.block, 'field', 'message0', 'hello', 'goodbye');
      const position = Position.fromEvent(event);
      const expectedPosition = new Position(
          'FIELD', this.FAKE_BLOCK_ID, 'message0');
      assert.deepEqual(position, expectedPosition);
    });

    test('From other not supported event, throw error.', async () => {
      sinon.spy(Position, 'fromEvent');
      const event = new Blockly.Events.Change(
          this.block, 'comment', 'message0', 'hello', 'goodbye');
      try {
        Position.fromEvent(event);
      } catch {};
      assert(Position.fromEvent.threw);
    });
  });

  suite('fromJson()', () => {
    test('JSON object to Position object.', async () => {
      const json = {
        type: 'type',
        blockId: 'blockId',
        fieldName: 'fieldName'
      };
      const position = Position.fromJson(json);
      const expectedPosition = new Position(
          'type', 'blockId', 'fieldName');
      assert.deepEqual(position, expectedPosition);
    });
  });

  suite('createNode()', () => {
    test('Position does not exists, node is undefined.', async () => {
      const position = new Position(null, null, null);
      const node = position.createNode(this.mockWorkspace);
      assert.deepEqual(null, node);
    });

    test('Position is a block, create block node.', async () => {
      const position = new Position('BLOCK', 'blockId', null);
      sinon.stub(position, 'createBlockNode_');
      position.createNode(this.mockWorkspace);
      assert(position.createBlockNode_.calledOnce);
    });

    test('Position is a field, create field node.', async () => {
      const position = new Position('FIELD', 'blockId', 'fieldName');
      sinon.stub(position, 'createFieldNode_');
      position.createNode(this.mockWorkspace);
      assert(position.createFieldNode_.calledOnce);
    });
  });

  suite('toMarker()', () => {
    test('Create marker with correct curNode.', async () => {
      const position = new Position('type', 'blockId', 'fieldName');
      sinon.stub(position, 'createNode').returns('mockNode');
      const expectedMarker = new Blockly.Marker();
      expectedMarker.setCurNode('mockNode');
      const marker = position.toMarker('mockWorkspace');
      assert.deepEqual(marker, expectedMarker);
    });
  });
});
