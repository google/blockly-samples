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
 * @fileoverview Unit tests for MarkerManager.
 * @author navil@google.com (Navil Perez)
 */

const assert = require('assert');
const Blockly = require('blockly/dist');
const sinon = require('sinon');

const handlers = require('../src/websocket/user_data_handlers');
const MarkerManager = require('../src/UserDataManager').default;
const MarkerUpdate = require('../src/Location').default;

suite('MarkerManager', () => {
  setup(() => {
    this.markerManager = new MarkerManager(
        'mockWorkspaceId', handlers.sendMarkerUpdate, handlers.getMarkerUpdates,
        handlers.getBroadcastMarkerUpdates);
    Blockly.defineBlocksWithJsonArray([{
      'type': 'test_block',
      'message0': 'test block'
    }]);
    this.FAKE_WORKSPACE_ID = 'mockWorkspaceId';
    this.FAKE_BLOCK_ID = 'blockId';
    sinon.stub(Blockly.utils, "genUid")
        .onFirstCall().returns(this.FAKE_WORKSPACE_ID)
        .onSecondCall().returns(this.FAKE_BLOCK_ID);
    this.workspace = new Blockly.WorkspaceSvg({});
    this.block = new Blockly.Block(this.workspace, 'test_block');

    this.BlocklyMarkerManager = new Blockly.MarkerManager(this.workspace);
    sinon.stub(this.BlocklyMarkerManager, 'registerMarker');
    this.BlocklyMarkerManager.registerMarker.callsFake((markerId, marker) => {
      this.BlocklyMarkerManager.markers_[markerId] = marker;
    });
    sinon.stub(this.workspace, 'getMarkerManager')
        .returns(this.BlocklyMarkerManager);
  });

  teardown(() => {
    sinon.restore();
    delete Blockly.Blocks['test_block'];
  });

  suite('createMarker', () => {
    test('No Blockly MarkerManager, throw error.', async () => {
      sinon.stub(this.markerManager, 'getMarkerManager_').returns(null);
      sinon.spy(this.markerManager, 'createMarker_');
      const markerUpdate1 = new MarkerUpdate('Id', 'BLOCK', 'blockId', null);
      try {
        this.markerManager.createMarker_(markerUpdate1);
      } catch {};
      assert(this.markerManager.createMarker_.threw());
    });

    test('Markers have unique colors and are registered.', async () => {
      const markerUpdate1 = new MarkerUpdate('mockId1', 'BLOCK', 'blockId', null);
      const markerUpdate2 = new MarkerUpdate('mockId2', 'BLOCK', 'blockId', null);
      const marker1 = this.markerManager.createMarker_(markerUpdate1);
      const marker2 = this.markerManager.createMarker_(markerUpdate2);
      assert.notEqual(marker1.colour, marker2.colour);
      assert.deepEqual(this.BlocklyMarkerManager.getMarker('mockId1'), marker1);
      assert.deepEqual(this.BlocklyMarkerManager.getMarker('mockId2'), marker2);
    });
  });

  suite('updateMarkerLocations', () => {
    setup(() => {
      this.BlocklyMarkerManager.markers_ = {
        'mockId': new Blockly.Marker()
      };      
    });

    test('MarkerUpdate has a new markerLocation, update curNode.', async () => {
      const markerUpdates = [
        new MarkerUpdate('mockId', 'BLOCK', 'blockId', null)
      ];
      this.markerManager.updateMarkerLocations_(markerUpdates);
      const curNode = this.markerManager.getMarker('mockId').curNode_;
      const expectedNode = Blockly.ASTNode.createBlockNode(this.block);
      assert.deepEqual(curNode, expectedNode);
    });

    test('MarkerUpdates has a new marker, new marker is created', async () => {
      const createMarkerSpy = sinon.spy(this.markerManager, 'createMarker_');
      const markerUpdate = new MarkerUpdate('mockId1', 'BLOCK', 'blockId', null)
      const markerUpdates = [markerUpdate];
      this.markerManager.updateMarkerLocations_(markerUpdates);
      assert.equal(true, createMarkerSpy.calledOnceWith(markerUpdate));
    });
  });
});
