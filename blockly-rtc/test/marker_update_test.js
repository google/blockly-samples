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
 * @fileoverview Unit tests for MarkerUpdate.
 * @author navil@google.com (Navil Perez)
 */

const assert = require('assert');
const Blockly = require('blockly/dist');
const sinon = require('sinon');

const MarkerUpdate = require('../src/MarkerUpdate').default;

suite('MarkerUpdate', () => {

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
      delete Blockly.Blocks['simple_test_block1'];
      this.workspace.dispose();
    });

    test('From SELECT UI event on a block.', async () => {
      const event = new Blockly.Events.Ui(this.block, 'selected', 'old', this.FAKE_BLOCK_ID);
      const markerUpdate = MarkerUpdate.fromEvent(event);
      const expectedMarkerUpdate = new MarkerUpdate(this.FAKE_WORKSPACE_ID, 'BLOCK', this.FAKE_BLOCK_ID, null);
      assert.deepEqual(markerUpdate, expectedMarkerUpdate);
    });
  });

  suite('fromJson()', () => {
    test('JSON object to MarkerUpdate object.', async () => {
      const json = {
        id: 'id',
        markerLocation: {
          type: 'type',
          blockId: 'blockId',
          fieldName: 'fieldName'
        }
      };
      const markerUpdate = MarkerUpdate.fromJson(json);
      const expectedMarkerUpdate = new MarkerUpdate(
          'id', 'type', 'blockId', 'fieldName');
      assert.deepEqual(markerUpdate, expectedMarkerUpdate);
    });
  });

  suite('toJson()', () => {
    test('MarkerUpdate object to JSON object.', async () => {
      const markerUpdate = new MarkerUpdate('id', 'type', 'blockId', 'fieldName');
      const json = markerUpdate.toJson(markerUpdate);
      const expectedJson = {
        id: 'id',
        markerLocation: {
          type: 'type',
          blockId:  'blockId',
          fieldName: 'fieldName'
        }
      };
      assert.deepEqual(json, expectedJson);
    });
  });

  suite('createNode()', () => {
    test('Location does not exists, node is undefined.', async () => {
      const markerUpdate = new MarkerUpdate(this.FAKE_WORKSPACE_ID, null, null, null);
      const node = markerUpdate.createNode(this.mockWorkspace);
      assert.deepEqual(null, node);
    });

    test('Location is a block, create block node.', async () => {
      const markerUpdate = new MarkerUpdate('workspaceId', 'BLOCK', 'blockId', null);
      const createBlockNodeStub = sinon.stub(markerUpdate, 'createBlockNode_');
      markerUpdate.createNode(this.mockWorkspace);
      assert.equal(true, createBlockNodeStub.calledOnce);
    });

    test('Location is a field, create field node.', async () => {
      const markerUpdate = new MarkerUpdate(
          'workspaceId', 'FIELD', 'blockId', 'fieldName');
      const createFieldNodeStub = sinon.stub(markerUpdate, 'createFieldNode_');
      markerUpdate.createNode(this.mockWorkspace);
      assert.equal(true, createFieldNodeStub.calledOnce);
    });
  });

  suite('toMarker()', () => {
    test('Create marker with correct curNode.', async () => {
      const markerUpdate = new MarkerUpdate(
          'workspaceId', 'type', 'blockId', 'fieldName');
      const createNodeStub = sinon.stub(markerUpdate, 'createNode');
      createNodeStub.returns('mockNode');

      const expectedMarker = new Blockly.Marker();
      expectedMarker.setCurNode('mockNode');

      const marker = markerUpdate.toMarker('mockWorkspace');
      assert.deepEqual(marker, expectedMarker);
    });
  });
});
