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
const sinon = require('sinon');
const handler = require('../src/websocket_handlers');
const WorkspaceClient = require('../src/WorkspaceClient').default;

suite('WorkspaceClient', () => {

  suite('writeToDatabase_()', () => {
    test('Write succeeds, events move from notSent to inProgress.', async () => {
      const writeEventsStub = sinon.stub(handler, 'writeEvents').resolves();
      const workspaceClient = new WorkspaceClient(
          'mockClient', handler.getEvents, handler.writeEvents);
      workspaceClient.notSent = [1,2,3];
      await workspaceClient.writeToDatabase_();
      writeEventsStub.restore();
      assert.deepStrictEqual([], workspaceClient.notSent);
      assert.deepStrictEqual([{
        entryId: 'mockClient:0',
        events: [1,2,3]
      }], workspaceClient.inProgress);
      assert.strictEqual(1, workspaceClient.counter);
    });

    test('Write fails, error is thrown and events stay in notSent.', async () => {
      const writeEventsStub = sinon.stub(handler, 'writeEvents').rejects();
      const workspaceClient = new WorkspaceClient(
          'mockClient', handler.getEvents, handler.writeEvents);
      workspaceClient.notSent = [1,2,3];
      await assert.rejects(workspaceClient.writeToDatabase_());
      writeEventsStub.restore();
      assert.deepStrictEqual([1,2,3], workspaceClient.notSent);
      assert.deepStrictEqual([], workspaceClient.inProgress);
      assert.strictEqual(0, workspaceClient.counter);
    });
  });

  suite('addEvents()', () => {
    test('Events added to activeChanges with the correct order and entryId.',
        async () => {
      const workspaceClient = new WorkspaceClient(
          'mockClient', handler.getEvents, handler.writeEvents);
      workspaceClient.addEvent({event: 'mockEvent0'});
      workspaceClient.addEvent({event: 'mockEvent1'});
      assert.deepStrictEqual([
        {event:'mockEvent0'},
        {event:'mockEvent1'}
      ],workspaceClient.activeChanges);
    });
  });

  suite('flushEvents()', () => {
    test('Events in activeChanges are moved to end of notSent.', async () => {
      const workspaceClient = new WorkspaceClient(
          'mockClient', handler.getEvents, handler.writeEvents);
      const updateServerStub = new sinon.stub(workspaceClient, 'updateServer_');

      workspaceClient.counter = 2;
      workspaceClient.notSent = [
        {event: 'mockEvent0'},
        {event: 'mockEvent1'}
      ];
      workspaceClient.activeChanges = [
        {event: 'mockActiveChange2'},
        {event: 'mockActiveChange3'}
      ];
      workspaceClient.flushEvents();
      assert.equal(true, updateServerStub.calledOnce);
      updateServerStub.restore();
      assert.deepStrictEqual(
        [
          {event: 'mockEvent0'},
          {event: 'mockEvent1'},
          {event: 'mockActiveChange2'},
          {event: 'mockActiveChange3'}
        ], workspaceClient.notSent);
      assert.deepStrictEqual([], workspaceClient.activeChanges);
    });
  });

  suite('updateServer_()', () => {
    test('New local changes, no write in progress.', async () => {
      const writeEventsStub = sinon.stub(handler, 'writeEvents').resolves();
      const workspaceClient = new WorkspaceClient(
          'mockClient', handler.getEvents, handler.writeEvents,
          handler.getBroadcast);
      workspaceClient.notSent = ['event']

      await workspaceClient.updateServer_();
      assert.deepStrictEqual([], workspaceClient.notSent);
      writeEventsStub.restore();
    });

    test('Write in progress, returns.', async () => {
      const workspaceClient = new WorkspaceClient(
          'mockClient', handler.getEvents, handler.writeEvents,
          handler.getBroadcast);
      const writeStub = sinon.stub(workspaceClient, 'writeToDatabase_')
      workspaceClient.notSent = ['event'];
      workspaceClient.writeInProgress = true;

      await workspaceClient.updateServer_();
      assert.equal(true, writeStub.notCalled);
      writeStub.restore();
      assert.deepStrictEqual(['event'], workspaceClient.notSent);
    });

    test('No more events in notSent, returns.', async () => {
      const workspaceClient = new WorkspaceClient(
          'mockClient', handler.getEvents, handler.writeEvents,
          handler.getBroadcast);
      const writeStub = sinon.stub(workspaceClient, 'writeToDatabase_');
      workspaceClient.notSent = [];

      await workspaceClient.updateServer_();
      assert.equal(true, writeStub.notCalled);
      assert.deepStrictEqual([], workspaceClient.notSent);
      writeStub.restore();
    });
  });

  suite('processQueryResults_()', () => {
    test('Entries is empty.', () => {
      const workspaceClient = new WorkspaceClient(
          'mockClient', handler.getEvents, handler.writeEvents);
      workspaceClient.inProgress = [
        {events: [{mockEvent: 'mockLocalEvent0'}], entryId:'mockClient:0'}
      ];
      workspaceClient.notSent = [
        {mockEvent: 'mockLocalEvent1'},
        {mockEvent: 'mockLocalEvent2'}
      ];

      const eventQueue = workspaceClient.processQueryResults_([]);

      assert.deepStrictEqual([], eventQueue);
      assert.equal(0, workspaceClient.lastSync);
      assert.deepStrictEqual([
        {events: [{mockEvent: 'mockLocalEvent0'}], entryId:'mockClient:0'}
      ], workspaceClient.inProgress);
      assert.deepStrictEqual([
        {mockEvent: 'mockLocalEvent1'},
        {mockEvent: 'mockLocalEvent2'}
      ], workspaceClient.notSent);
    });

    test('Entries contain all local events.', () => {
      const workspaceClient = new WorkspaceClient(
          'mockClient', handler.getEvents, handler.writeEvents);
      workspaceClient.inProgress = [
        {events: [{mockEvent: 'mockLocalEvent0'}], entryId:'mockClient:0'}
      ];
      workspaceClient.notSent = [
        {mockEvent: 'mockLocalEvent1'},
        {mockEvent: 'mockLocalEvent2'}
      ];

      const eventQueue = workspaceClient.processQueryResults_([
        {events: ['mockLocalEvent0'], entryId: 'mockClient:0', serverId:1}
      ]);

      assert.deepStrictEqual([], eventQueue);
      assert.equal(1, workspaceClient.lastSync);
      assert.deepStrictEqual([], workspaceClient.inProgress);
      assert.deepStrictEqual([
        {mockEvent: 'mockLocalEvent1'},
        {mockEvent: 'mockLocalEvent2'}
      ], workspaceClient.notSent);
    });

    test('Entries contain no local changes.', () => {
      const workspaceClient = new WorkspaceClient(
          'mockClient', handler.getEvents, handler.writeEvents);
      workspaceClient.inProgress = [
        {events: [{mockEvent: 'mockLocalEvent0'}], entryId:'mockClient:0'}
      ];
      workspaceClient.notSent = [
        {mockEvent: 'mockLocalEvent1'},
        {mockEvent: 'mockLocalEvent2'}
      ];

      const eventQueue = workspaceClient.processQueryResults_([{
        events: [{mockEvent:'mockExternalEvent0'}],
        entryId: 'otherClient:0',
        serverId:1
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
      assert.equal(1, workspaceClient.lastSync);
      assert.deepStrictEqual([
        {events: [{mockEvent: 'mockLocalEvent0'}], entryId:'mockClient:0'}
      ], workspaceClient.inProgress);
      assert.deepStrictEqual([
        {mockEvent: 'mockLocalEvent1'},
        {mockEvent: 'mockLocalEvent2'}
      ], workspaceClient.notSent);
    });
      
    test('Entries contain local changes followed by external changes.', () => {
      const workspaceClient = new WorkspaceClient(
          'mockClient', handler.getEvents, handler.writeEvents);
      workspaceClient.inProgress = [
        {events: [{mockEvent: 'mockLocalEvent0'}], entryId:'mockClient:0'}
      ];
      workspaceClient.notSent = [
        {mockEvent:'mockLocalEvent1'},
        {mockEvent:'mockLocalEvent2'}
      ];
      const eventQueue = workspaceClient.processQueryResults_([
        {
          events: [{mockEvent:'mockLocalEvent0'}],
          entryId: 'mockClient:0',
          serverId:1
        },
        {
          events: [{mockEvent:'mockExternalEvent0'}],
          entryId: 'otherClient:0',
          serverId:2
        }
      ]);
      assert.deepStrictEqual([
        {event: {mockEvent: 'mockLocalEvent2'}, forward: false},
        {event: {mockEvent: 'mockLocalEvent1'}, forward: false},
        {event: {mockEvent: 'mockExternalEvent0'}, forward: true},
        {event: {mockEvent: 'mockLocalEvent1'}, forward: true},
        {event: {mockEvent: 'mockLocalEvent2'}, forward: true}
      ], eventQueue);
      assert.equal(2, workspaceClient.lastSync);
      assert.deepStrictEqual([], workspaceClient.inProgress);
      assert.deepStrictEqual([
        {mockEvent: 'mockLocalEvent1'},
        {mockEvent: 'mockLocalEvent2'}
      ], workspaceClient.notSent);
    });

    test('Entries contain local changes sandwiched by external changes.', () => {
      const workspaceClient = new WorkspaceClient(
          'mockClient', handler.getEvents, handler.writeEvents);
      workspaceClient.inProgress = [
        {events: [{mockEvent: 'mockLocalEvent0'}], entryId:'mockClient:0'}
      ];
      workspaceClient.notSent = [
        {mockEvent: 'mockLocalEvent1'},
        {mockEvent: 'mockLocalEvent2'}
      ];

      const eventQueue = workspaceClient.processQueryResults_([
        {
          events: [{mockEvent:'mockExternalEvent0'}],
          entryId: 'otherClient:0',
          serverId:1
        },
        {
          events: [{mockEvent:'mockLocalEvent0'}],
          entryId: 'mockClient:0',
          serverId:2},
        {
          events: [{mockEvent:'mockExternalEvent1'}],
          entryId: 'otherClient:1',
          serverId:3
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
      assert.equal(3, workspaceClient.lastSync);
      assert.deepStrictEqual([], workspaceClient.inProgress);
      assert.deepStrictEqual([
        {mockEvent: 'mockLocalEvent1'},
        {mockEvent: 'mockLocalEvent2'}
      ], workspaceClient.notSent);
    });
  });

  suite('addServerEvents_()', () => {
    test('serverEvents in correct order, add successfully.', async () => {
      const workspaceClient = new WorkspaceClient(
          'mockClient', handler.getEvents, handler.writeEvents);
      const queryStub = sinon.stub(workspaceClient, 'queryDatabase_');
      const updateStub = sinon.stub(workspaceClient, 'updateWorkspace_');
      workspaceClient.lastSync = 2;
      workspaceClient.serverEvents = [
        {mockEvent: 'mockEvent', serverId: 1},
        {mockEvent: 'mockEvent', serverId: 2}
      ];

      newServerEvents = [{mockEvent: 'mockEvent', serverId: 3}];
      await workspaceClient.addServerEvents_(newServerEvents);
      assert.deepStrictEqual([
        {mockEvent: 'mockEvent', serverId: 1},
        {mockEvent: 'mockEvent', serverId: 2},
        {mockEvent: 'mockEvent', serverId: 3}
      ], workspaceClient.serverEvents);
      assert.equal(true, queryStub.notCalled);
      queryStub.restore();
      updateStub.restore();
    });

    test('serverEvents in incorrect order, requery then add.', async () => {
      const workspaceClient = new WorkspaceClient(
          'mockClient', handler.getEvents, handler.writeEvents);
      const queryStub = sinon.stub(workspaceClient, 'queryDatabase_');
      queryStub.resolves([{mockEvent: 'mockEvent', serverId: 3}]);
      const updateStub = sinon.stub(workspaceClient, 'updateWorkspace_');
      workspaceClient.lastSync = 2;
      workspaceClient.serverEvents = [
        {mockEvent: 'mockEvent', serverId: 1},
        {mockEvent: 'mockEvent', serverId: 2}
      ];

      newServerEvents = [{mockEvent: 'mockEvent', serverId: 4}];
      await workspaceClient.addServerEvents_(newServerEvents);
      assert.deepStrictEqual([
        {mockEvent: 'mockEvent', serverId: 1},
        {mockEvent: 'mockEvent', serverId: 2},
        {mockEvent: 'mockEvent', serverId: 3}
      ], workspaceClient.serverEvents);
      assert.equal(true, queryStub.calledOnce);
      queryStub.restore();
      updateStub.restore();
    });
  });
  
  suite('queryDatabase_()', () => {
    test('Query fails.', async () => {
      const getEventsStub = sinon.stub(handler, 'getEvents').rejects();
      const workspaceClient = new WorkspaceClient(
          'mockClient', handler.getEvents, handler.writeEvents);
      const entries = await workspaceClient.queryDatabase_();
      getEventsStub.restore();
      assert.deepStrictEqual([], entries);
    });

    test('Query succeeds.', async () => {
      const getEventsStub = sinon.stub(handler, 'getEvents')
      .resolves(['resolved']);
      const workspaceClient = new WorkspaceClient(
          'mockClient', handler.getEvents, handler.writeEvents);
      const entries = await workspaceClient.queryDatabase_();
      getEventsStub.restore();
      assert.deepStrictEqual(['resolved'], entries);
    });
  });

  suite('updateWorkspace_()', () => {
    test('New server events, no update in progress.', async () => {
      const workspaceClient = new WorkspaceClient(
          'mockClient', handler.getEvents, handler.writeEvents,
          handler.getBroadcast);
      const processQueryStub = sinon.stub(
          workspaceClient, 'processQueryResults_');
      processQueryStub.returns([]);
      workspaceClient.serverEvents = ['event'];

      await workspaceClient.updateWorkspace_();
      assert.equal(true, processQueryStub.calledOnce);
      assert.deepStrictEqual([], workspaceClient.serverEvents);
    });

    test('Update in progress, returns.', async () => {
      const workspaceClient = new WorkspaceClient(
          'mockClient', handler.getEvents, handler.writeEvents,
          handler.getBroadcast);
      const processQueryStub = sinon.stub(
          workspaceClient, 'processQueryResults_');
      workspaceClient.serverEvents = ['event'];
      workspaceClient.updateInProgress = true;

      await workspaceClient.updateWorkspace_();
      assert.equal(true, processQueryStub.notCalled);
      assert.deepStrictEqual(['event'], workspaceClient.serverEvents);
    });

    test('No more server events, returns.', async () => {
      const workspaceClient = new WorkspaceClient(
          'mockClient', handler.getEvents, handler.writeEvents,
          handler.getBroadcast);
      const processQueryStub = sinon.stub(
          workspaceClient, 'processQueryResults_');
      workspaceClient.serverEvents = [];

      await workspaceClient.updateWorkspace_();
      assert.equal(true, processQueryStub.notCalled);
      assert.deepStrictEqual([], workspaceClient.serverEvents);
    });
  });
});
