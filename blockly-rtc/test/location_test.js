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
 * @fileoverview Unit tests for Location.
 * @author navil@google.com (Navil Perez)
 */

const assert = require('assert');
const Blockly = require('blockly/dist');
const sinon = require('sinon');

const Location = require('../src/Location').default;

suite('Location', () => {

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
    });

    teardown(() => {
      sinon.restore();
      delete Blockly.Blocks['test_block'];
      this.workspace.dispose();
    });

    test('From SELECT UI event on a block.', async () => {
      const event = new Blockly.Events.Ui(
          this.block, 'selected', 'old', this.FAKE_BLOCK_ID);
      const location = Location.fromEvent(event);
      const expectedLocation = new Location('BLOCK', this.FAKE_BLOCK_ID, null);
      assert.deepEqual(location, expectedLocation);
    });
  });

  suite('fromJson()', () => {
    test('JSON object to Location object.', async () => {
      const json = {
        type: 'type',
        blockId: 'blockId',
        fieldName: 'fieldName'
      };
      const location = Location.fromJson(json);
      const expectedLocation = new Location(
          'type', 'blockId', 'fieldName');
      assert.deepEqual(location, expectedLocation);
    });
  });

  suite('createNode()', () => {
    test('Location does not exists, node is undefined.', async () => {
      const location = new Location(null, null, null);
      const node = location.createNode(this.mockWorkspace);
      assert.deepEqual(null, node);
    });

    test('Location is a block, create block node.', async () => {
      const location = new Location('BLOCK', 'blockId', null);
      sinon.stub(location, 'createBlockNode_');
      location.createNode(this.mockWorkspace);
      assert(location.createBlockNode_.calledOnce);
    });

    test('Location is a field, create field node.', async () => {
      const location = new Location('FIELD', 'blockId', 'fieldName');
      sinon.stub(location, 'createFieldNode_');
      location.createNode(this.mockWorkspace);
      assert(location.createFieldNode_.calledOnce);
    });
  });

  suite('toMarker()', () => {
    test('Create marker with correct curNode.', async () => {
      const location = new Location('type', 'blockId', 'fieldName');
      sinon.stub(location, 'createNode').returns('mockNode');
      const expectedMarker = new Blockly.Marker();
      expectedMarker.setCurNode('mockNode');
      const marker = location.toMarker('mockWorkspace');
      assert.deepEqual(marker, expectedMarker);
    });
  });
});
