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
const Blockly = require('blockly/dist');
const sinon = require('sinon');

const handlers = require('../src/websocket/user_data_handlers');
const UserDataManager = require('../src/UserDataManager').default;
const Location = require('../src/Location').default;

suite('UserDataManager', () => {
  setup(() => {
    this.userDataManager = new UserDataManager(
        'mockWorkspaceId', handlers.sendLocationUpdate,
        handlers.getLocationUpdates, handlers.getBroadcastLocationUpdates);
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
    this.location = new Location('BLOCK', 'blockId', null);

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
      const locationUpdate1 = {workspaceId: 'mockId1', location: this.location};
      try {
        this.userDataManager.createMarker_(locationUpdate1);
      } catch {};
      assert(this.userDataManager.createMarker_.threw());
    });

    test('Markers have unique colors and are registered.', async () => {
      const locationUpdate1 = {workspaceId: 'mockId1', location: this.location};
      const locationUpdate2 = {workspaceId: 'mockId2', location: this.location};
      const marker1 = this.userDataManager.createMarker_(locationUpdate1);
      const marker2 = this.userDataManager.createMarker_(locationUpdate2);
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

    test('New Location, update curNode.', async () => {
      const locationUpdate = {workspaceId: 'mockId', location: this.location};
      const locationUpdates = [locationUpdate];
      this.userDataManager.updateMarkerLocations_(locationUpdates);
      const curNode = this.userDataManager.getMarker('mockId').curNode_;
      const expectedNode = Blockly.ASTNode.createBlockNode(this.block);
      assert.deepEqual(curNode, expectedNode);
    });

    test('Location is for a new user, new marker is created.', async () => {
      sinon.spy(this.userDataManager, 'createMarker_');
      const locationUpdate = {workspaceId: 'mockId1', location: this.location};
      const locationUpdates = [locationUpdate];
      this.userDataManager.updateMarkerLocations_(locationUpdates);
      assert(this.userDataManager.createMarker_.calledOnceWith(locationUpdate));
    });
  });
});
