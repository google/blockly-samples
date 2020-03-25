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
 * @fileoverview Unit tests for WorkspaceClient.
 * @author navil@google.com (Navil Perez)
 */

const assert = require('assert');
const Blockly = require('blockly');
const sinon = require('sinon');
const handler = require('../src/websocket/workspace_client_handlers');
const WorkspaceClient = require('../src/WorkspaceClient').default;

suite('WorkspaceClient', () => {
  setup(() => {
    this.workspaceClient = new WorkspaceClient(
        'mockClient', handler.getEvents, handler.writeEvents,
        handler.getBroadcast);
    sinon.stub(Blockly.Events, 'filter').callsFake((events) => {
      return events;
    });
  });

  teardown(() =>  {
    sinon.restore();
  });

  suite('writeToDatabase_()', () => {
    test('Write succeeds, events move from notSent to inProgress.', async () => {
      sinon.stub(this.workspaceClient, 'addEventsHandler').resolves();
      this.workspaceClient.notSent = [1,2,3];
      await this.workspaceClient.writeToDatabase_();
      assert.deepStrictEqual([], this.workspaceClient.notSent);
      assert.deepStrictEqual([{
        workspaceId: 'mockClient',
        entryNumber: 0,
        events: [1,2,3]
      }], this.workspaceClient.inProgress);
      assert.strictEqual(1, this.workspaceClient.counter);
      assert(Blockly.Events.filter.called);
    });

    test('Write fails, error is thrown and events stay in notSent.', async () => {
      sinon.stub(this.workspaceClient, 'addEventsHandler').rejects();
      this.workspaceClient.notSent = [1,2,3];
      await assert.rejects(this.workspaceClient.writeToDatabase_());
      assert.deepStrictEqual([1,2,3], this.workspaceClient.notSent);
      assert.deepStrictEqual([], this.workspaceClient.inProgress);
      assert.strictEqual(0, this.workspaceClient.counter);
      assert(Blockly.Events.filter.called);
    });
  });

  suite('addEvents()', () => {
    test('Events added to activeChanges with the correct order and entryNumber.',
        async () => {
      this.workspaceClient.addEvent({event: 'mockEvent0'});
      this.workspaceClient.addEvent({event: 'mockEvent1'});
      assert.deepStrictEqual([
        {event:'mockEvent0'},
        {event:'mockEvent1'}
      ], this.workspaceClient.activeChanges);
    });
  });

  suite('flushEvents()', () => {
    test('Events in activeChanges are moved to end of notSent.', async () => {
      const updateServerStub = new sinon.stub(this.workspaceClient, 'updateServer_');

      this.workspaceClient.counter = 2;
      this.workspaceClient.notSent = [
        {event: 'mockEvent0'},
        {event: 'mockEvent1'}
      ];
      this.workspaceClient.activeChanges = [
        {event: 'mockActiveChange2'},
        {event: 'mockActiveChange3'}
      ];
      this.workspaceClient.flushEvents();
      assert.equal(true, updateServerStub.calledOnce);
      assert.deepStrictEqual(
        [
          {event: 'mockEvent0'},
          {event: 'mockEvent1'},
          {event: 'mockActiveChange2'},
          {event: 'mockActiveChange3'}
        ], this.workspaceClient.notSent);
      assert.deepStrictEqual([], this.workspaceClient.activeChanges);
    });
  });

  suite('updateServer_()', () => {
    test('New local changes, no write in progress.', async () => {
      sinon.stub(this.workspaceClient, 'addEventsHandler').resolves();
      this.workspaceClient.notSent = ['event'];

      await this.workspaceClient.updateServer_();
      assert.deepStrictEqual([], this.workspaceClient.notSent);
    });

    test('Write in progress, returns.', async () => {
      const writeStub = sinon.stub(this.workspaceClient, 'writeToDatabase_')
      this.workspaceClient.notSent = ['event'];
      this.workspaceClient.writeInProgress = true;

      await this.workspaceClient.updateServer_();
      assert.equal(true, writeStub.notCalled);
      assert.deepStrictEqual(['event'], this.workspaceClient.notSent);
    });

    test('No more events in notSent, returns.', async () => {
      const writeStub = sinon.stub(this.workspaceClient, 'writeToDatabase_');
      this.workspaceClient.notSent = [];

      await this.workspaceClient.updateServer_();
      assert.equal(true, writeStub.notCalled);
      assert.deepStrictEqual([], this.workspaceClient.notSent);
    });
  });

  suite('processQueryResults_()', () => {
    setup(() => {
      this.workspaceClient.inProgress = [{
        events: [{mockEvent: 'mockLocalEvent0'}],
        workspaceId: 'mockClient',
        entryNumber: 0
      }];
    })
    test('Entries is empty.', () => {
      this.workspaceClient.notSent = [
        {mockEvent: 'mockLocalEvent1'},
        {mockEvent: 'mockLocalEvent2'}
      ];

      const eventQueue = this.workspaceClient.processQueryResults_([]);

      assert.deepStrictEqual([], eventQueue);
      assert.equal(0, this.workspaceClient.lastSync);
      assert.deepStrictEqual([{
        events: [{mockEvent: 'mockLocalEvent0'}],
        workspaceId: 'mockClient',
        entryNumber: 0
      }], this.workspaceClient.inProgress);
      assert.deepStrictEqual([
        {mockEvent: 'mockLocalEvent1'},
        {mockEvent: 'mockLocalEvent2'}
      ], this.workspaceClient.notSent);
    });

    test('Entries contain all local events.', () => {
      this.workspaceClient.notSent = [
        {mockEvent: 'mockLocalEvent1'},
        {mockEvent: 'mockLocalEvent2'}
      ];

      const eventQueue = this.workspaceClient.processQueryResults_([{
        events: ['mockLocalEvent0'],
        workspaceId: 'mockClient',
        entryNumber: 0,
        serverId: 1
      }]);

      assert.deepStrictEqual([], eventQueue);
      assert.equal(1, this.workspaceClient.lastSync);
      assert.deepStrictEqual([], this.workspaceClient.inProgress);
      assert.deepStrictEqual([
        {mockEvent: 'mockLocalEvent1'},
        {mockEvent: 'mockLocalEvent2'}
      ], this.workspaceClient.notSent);
    });

    test('Entries contain no local changes.', () => {
      this.workspaceClient.notSent = [
        {mockEvent: 'mockLocalEvent1'},
        {mockEvent: 'mockLocalEvent2'}
      ];

      const eventQueue = this.workspaceClient.processQueryResults_([{
        events: [{mockEvent:'mockExternalEvent0'}],
        workspaceId: 'otherClient',
        entryNumber: 0,
        serverId: 1
      }]);
      assert.deepStrictEqual([
        {event: {mockEvent: 'mockLocalEvent2'}, forward: false},
        {event: {mockEvent: 'mockLocalEvent1'}, forward: false},
        {event: {mockEvent: 'mockLocalEvent0'}, forward: false},
        {event: {mockEvent: 'mockExternalEvent0'}, forward: true},
        {event: {mockEvent: 'mockLocalEvent0'}, forward: true},
        {event: {mockEvent: 'mockLocalEvent1'}, forward: true},
        {event: {mockEvent: 'mockLocalEvent2'}, forward: true}
      ], eventQueue);
      assert.equal(1, this.workspaceClient.lastSync);
      assert.deepStrictEqual([
        {events: [{mockEvent: 'mockLocalEvent0'}],
        workspaceId: 'mockClient',
        entryNumber: 0
      }], this.workspaceClient.inProgress);
      assert.deepStrictEqual([
        {mockEvent: 'mockLocalEvent1'},
        {mockEvent: 'mockLocalEvent2'}
      ], this.workspaceClient.notSent);
    });
      
    test('Entries contain local changes followed by external changes.', () => {
      this.workspaceClient.notSent = [
        {mockEvent:'mockLocalEvent1'},
        {mockEvent:'mockLocalEvent2'}
      ];
      const eventQueue = this.workspaceClient.processQueryResults_([
        {
          events: [{mockEvent:'mockLocalEvent0'}],
          workspaceId: 'mockClient',
          entryNumber: 0,
          serverId: 1
        },
        {
          events: [{mockEvent:'mockExternalEvent0'}],
          workspaceId: 'otherClient',
          entryNumber: 0,
          serverId: 2
        }
      ]);
      assert.deepStrictEqual([
        {event: {mockEvent: 'mockLocalEvent2'}, forward: false},
        {event: {mockEvent: 'mockLocalEvent1'}, forward: false},
        {event: {mockEvent: 'mockExternalEvent0'}, forward: true},
        {event: {mockEvent: 'mockLocalEvent1'}, forward: true},
        {event: {mockEvent: 'mockLocalEvent2'}, forward: true}
      ], eventQueue);
      assert.equal(2, this.workspaceClient.lastSync);
      assert.deepStrictEqual([], this.workspaceClient.inProgress);
      assert.deepStrictEqual([
        {mockEvent: 'mockLocalEvent1'},
        {mockEvent: 'mockLocalEvent2'}
      ], this.workspaceClient.notSent);
    });

    test('Entries contain local changes sandwiched by external changes.', () => {
      this.workspaceClient.notSent = [
        {mockEvent: 'mockLocalEvent1'},
        {mockEvent: 'mockLocalEvent2'}
      ];

      const eventQueue = this.workspaceClient.processQueryResults_([
        {
          events: [{mockEvent:'mockExternalEvent0'}],
          workspaceId: 'otherClient',
          entryNumber: 0,
          serverId: 1
        },
        {
          events: [{mockEvent:'mockLocalEvent0'}],
          workspaceId: 'mockClient',
          entryNumber: 0,
          serverId: 2},
        {
          events: [{mockEvent:'mockExternalEvent1'}],
          workspaceId: 'otherClient',
          entryNumber: 1,
          serverId: 3
        }
      ]);

      assert.deepStrictEqual([
        {event: {mockEvent: 'mockLocalEvent2'}, forward: false},
        {event: {mockEvent: 'mockLocalEvent1'}, forward: false},
        {event: {mockEvent: 'mockLocalEvent0'}, forward: false},
        {event: {mockEvent: 'mockExternalEvent0'}, forward: true},
        {event: {mockEvent: 'mockLocalEvent0'}, forward: true},
        {event: {mockEvent: 'mockExternalEvent1'}, forward: true},
        {event: {mockEvent: 'mockLocalEvent1'}, forward: true},
        {event: {mockEvent: 'mockLocalEvent2'}, forward: true}
      ], eventQueue);
      assert.equal(3, this.workspaceClient.lastSync);
      assert.deepStrictEqual([], this.workspaceClient.inProgress);
      assert.deepStrictEqual([
        {mockEvent: 'mockLocalEvent1'},
        {mockEvent: 'mockLocalEvent2'}
      ], this.workspaceClient.notSent);
    });
  });

  suite('addServerEvents_()', () => {
    test('serverEvents in correct order, add successfully.', async () => {
      const queryStub = sinon.stub(this.workspaceClient, 'queryDatabase_');
      sinon.stub(this.workspaceClient, 'updateWorkspace_');
      this.workspaceClient.lastSync = 2;
      this.workspaceClient.serverEvents = [
        {mockEvent: 'mockEvent', serverId: 1},
        {mockEvent: 'mockEvent', serverId: 2}
      ];

      newServerEvents = [{mockEvent: 'mockEvent', serverId: 3}];
      await this.workspaceClient.addServerEvents_(newServerEvents);
      assert.deepStrictEqual([
        {mockEvent: 'mockEvent', serverId: 1},
        {mockEvent: 'mockEvent', serverId: 2},
        {mockEvent: 'mockEvent', serverId: 3}
      ], this.workspaceClient.serverEvents);
      assert.equal(true, queryStub.notCalled);
    });

    test('serverEvents in incorrect order, requery then add.', async () => {
      const queryStub = sinon.stub(this.workspaceClient, 'queryDatabase_');
      queryStub.resolves([{mockEvent: 'mockEvent', serverId: 3}]);
      sinon.stub(this.workspaceClient, 'updateWorkspace_');
      this.workspaceClient.lastSync = 2;
      this.workspaceClient.serverEvents = [
        {mockEvent: 'mockEvent', serverId: 1},
        {mockEvent: 'mockEvent', serverId: 2}
      ];

      newServerEvents = [{mockEvent: 'mockEvent', serverId: 4}];
      await this.workspaceClient.addServerEvents_(newServerEvents);
      assert.deepStrictEqual([
        {mockEvent: 'mockEvent', serverId: 1},
        {mockEvent: 'mockEvent', serverId: 2},
        {mockEvent: 'mockEvent', serverId: 3}
      ], this.workspaceClient.serverEvents);
      assert.equal(true, queryStub.calledOnce);
    });
  });
  
  suite('queryDatabase_()', () => {
    test('Query fails.', async () => {
      sinon.stub(this.workspaceClient, 'getEventsHandler').rejects();
      const entries = await this.workspaceClient.queryDatabase_();
      assert.deepStrictEqual([], entries);
    });

    test('Query succeeds.', async () => {
      const getEventsStub = sinon.stub(handler, 'getEvents')
      sinon.stub(this.workspaceClient, 'getEventsHandler').resolves(['resolved']);
      const entries = await this.workspaceClient.queryDatabase_();
      assert.deepStrictEqual(['resolved'], entries);
    });
  });

  suite('updateWorkspace_()', () => {
    test('New server events, no update in progress.', async () => {
      const processQueryStub = sinon.stub(
          this.workspaceClient, 'processQueryResults_');
      processQueryStub.returns([]);
      this.workspaceClient.serverEvents = ['event'];

      await this.workspaceClient.updateWorkspace_();
      assert.equal(true, processQueryStub.calledOnce);
      assert.deepStrictEqual([], this.workspaceClient.serverEvents);
    });

    test('Update in progress, returns.', async () => {
      const processQueryStub = sinon.stub(
          this.workspaceClient, 'processQueryResults_');
      this.workspaceClient.serverEvents = ['event'];
      this.workspaceClient.updateInProgress = true;

      await this.workspaceClient.updateWorkspace_();
      assert.equal(true, processQueryStub.notCalled);
      assert.deepStrictEqual(['event'], this.workspaceClient.serverEvents);
    });

    test('No more server events, returns.', async () => {
      const processQueryStub = sinon.stub(
          this.workspaceClient, 'processQueryResults_');
      this.workspaceClient.serverEvents = [];

      await this.workspaceClient.updateWorkspace_();
      assert.equal(true, processQueryStub.notCalled);
      assert.deepStrictEqual([], this.workspaceClient.serverEvents);
    });
  });
});
