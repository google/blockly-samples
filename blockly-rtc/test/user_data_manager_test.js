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
 * @fileoverview Unit tests for UserDataManager.
 * @author navil@google.com (Navil Perez)
 */

const assert = require('assert');
const Blockly = require('blockly');
const sinon = require('sinon');

const handlers = require('../src/websocket/user_data_handlers');
const UserDataManager = require('../src/UserDataManager').default;
const Position = require('../src/Position').default;

suite('UserDataManager', () => {
  setup(() => {
    this.userDataManager = new UserDataManager(
        'mockWorkspaceId', handlers.sendPositionUpdate,
        handlers.getPositionUpdates, handlers.getBroadcastPositionUpdates);
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
    this.position = new Position('BLOCK', 'blockId', null);

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
      sinon.stub(this.userDataManager, 'getMarkerManager_').returns(null);
      sinon.spy(this.userDataManager, 'createMarker_');
      const positionUpdate1 = {workspaceId: 'mockId1', position: this.position};
      try {
        this.userDataManager.createMarker_(positionUpdate1);
      } catch {};
      assert(this.userDataManager.createMarker_.threw());
    });

    test('Markers have unique colors and are registered.', async () => {
      const positionUpdate1 = {workspaceId: 'mockId1', position: this.position};
      const positionUpdate2 = {workspaceId: 'mockId2', position: this.position};
      const marker1 = this.userDataManager.createMarker_(positionUpdate1);
      const marker2 = this.userDataManager.createMarker_(positionUpdate2);
      assert.notEqual(marker1.colour, marker2.colour);
      assert.deepEqual(this.BlocklyMarkerManager.getMarker('mockId1'), marker1);
      assert.deepEqual(this.BlocklyMarkerManager.getMarker('mockId2'), marker2);
    });
  });

  suite('disposeMarker', () => {
    test('No Blockly MarkerManager, throw error.', async () => {
      sinon.stub(this.userDataManager, 'getMarkerManager_').returns(null);
      sinon.spy(this.userDataManager, 'disposeMarker_');
      try {
        this.userDataManager.disposeMarker_();
      } catch {};
      assert(this.userDataManager.disposeMarker_.threw());
    });

    test('No Marker with the given workspaceId, no error.', async () => {
      sinon.spy(this.userDataManager, 'disposeMarker_');
      this.userDataManager.disposeMarker_('mockId');
      assert(!this.userDataManager.disposeMarker_.threw());
    });

    test('Unregister Marker from Blockly MarkerManager.', async () => {
      sinon.spy(this.BlocklyMarkerManager, 'unregisterMarker');
      const marker = new Blockly.Marker();
      this.BlocklyMarkerManager.markers_['mockId'] = marker;
      this.userDataManager.disposeMarker_('mockId');
      assert(this.BlocklyMarkerManager.unregisterMarker.calledOnceWith('mockId'));
    });    
  });

  suite('updateMarkerPositions', () => {
    setup(() => {
      this.BlocklyMarkerManager.markers_ = {
        'mockId': new Blockly.Marker()
      };
    });

    test('New Position, update curNode.', async () => {
      const positionUpdate = {workspaceId: 'mockId', position: this.position};
      const positionUpdates = [positionUpdate];
      this.userDataManager.updateMarkerPositions_(positionUpdates);
      const curNode = this.userDataManager.getMarker('mockId').curNode_;
      const expectedNode = Blockly.ASTNode.createBlockNode(this.block);
      assert.deepEqual(curNode, expectedNode);
    });

    test('Position is for a new user, new marker is created.', async () => {
      sinon.spy(this.userDataManager, 'createMarker_');
      const positionUpdate = {workspaceId: 'mockId1', position: this.position};
      const positionUpdates = [positionUpdate];
      this.userDataManager.updateMarkerPositions_(positionUpdates);
      assert(this.userDataManager.createMarker_.calledOnceWith(positionUpdate));
    });
  });
});
