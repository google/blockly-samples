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
const api = require('../src/api');
const WorkspaceClient = require('../src/WorkspaceClient').default;

suite('WorkspaceClient', () => {

  suite('writeToDatabase()', () => {
    test('Write succeeds, events move from notSent to inProgress.', async () => {
      const writeEventsStub = sinon.stub(api, 'writeEvents').resolves();
      const workspaceClient = new WorkspaceClient('mockClient');
      workspaceClient.notSent = [1,2,3];
      await workspaceClient.writeToDatabase();
      writeEventsStub.restore();
      assert.deepStrictEqual([], workspaceClient.notSent);
      assert.deepStrictEqual([{
        entryId: 'mockClient0',
        events: [1,2,3]
      }], workspaceClient.inProgress);
      assert.strictEqual(1, workspaceClient.counter);
    });

    test('Write fails, error is thrown and events stay in notSent.', async () => {
      const writeEventsStub = sinon.stub(api, 'writeEvents').rejects();
      const workspaceClient = new WorkspaceClient('mockClient');
      workspaceClient.notSent = [1,2,3];
      await assert.rejects(workspaceClient.writeToDatabase());
      writeEventsStub.restore();
      assert.deepStrictEqual([1,2,3], workspaceClient.notSent);
      assert.deepStrictEqual([], workspaceClient.inProgress);
      assert.strictEqual(0, workspaceClient.counter);
    });
  });

  suite('flushEvents()', () => {
    test('Events in activeChanges are added to the end of notSent.', async () => {
      const workspaceClient = new WorkspaceClient('mockClient');
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

  suite('processQueryResults_()', () => {
    test('Rows is empty.', () => {
      const workspaceClient = new WorkspaceClient('mockClient');
      workspaceClient.inProgress = [
        {events: [{mockEvent: 'mockLocalEvent0'}], entryId:'mockClient0'}
      ];
      workspaceClient.notSent = [
        {mockEvent: 'mockLocalEvent1'},
        {mockEvent: 'mockLocalEvent2'}
      ];

      const eventQueue = workspaceClient.processQueryResults_([]);

      assert.deepStrictEqual([], eventQueue);
      assert.equal(0, workspaceClient.lastSync);
      assert.deepStrictEqual([
        {events: [{mockEvent: 'mockLocalEvent0'}], entryId:'mockClient0'}
      ], workspaceClient.inProgress);
      assert.deepStrictEqual([
        {mockEvent: 'mockLocalEvent1'},
        {mockEvent: 'mockLocalEvent2'}
      ], workspaceClient.notSent);
    });

    test('Rows contains all local events.', () => {
      const workspaceClient = new WorkspaceClient('mockClient');
      workspaceClient.inProgress = [
        {events: [{mockEvent: 'mockLocalEvent0'}], entryId:'mockClient0'}
      ];
      workspaceClient.notSent = [
        {mockEvent: 'mockLocalEvent1'},
        {mockEvent: 'mockLocalEvent2'}
      ];

      const eventQueue = workspaceClient.processQueryResults_([
        {events: ['mockLocalEvent0'], entryId: 'mockClient0', serverId:1}
      ]);

      assert.deepStrictEqual([], eventQueue);
      assert.equal(1, workspaceClient.lastSync);
      assert.deepStrictEqual([], workspaceClient.inProgress);
      assert.deepStrictEqual([
        {mockEvent: 'mockLocalEvent1'},
        {mockEvent: 'mockLocalEvent2'}
      ], workspaceClient.notSent);
    });

    test('Rows contains no local changes.', () => {
      const workspaceClient = new WorkspaceClient('mockClient');
      workspaceClient.inProgress = [
        {events: [{mockEvent: 'mockLocalEvent0'}], entryId:'mockClient0'}
      ];
      workspaceClient.notSent = [
        {mockEvent: 'mockLocalEvent1'},
        {mockEvent: 'mockLocalEvent2'}
      ];

      const eventQueue = workspaceClient.processQueryResults_([
        {events: [{mockEvent:'mockExternalEvent0'}], entryId: 'otherClient0', serverId:1}
      ]);
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
        {events: [{mockEvent: 'mockLocalEvent0'}], entryId:'mockClient0'}
      ], workspaceClient.inProgress);
      assert.deepStrictEqual([
        {mockEvent: 'mockLocalEvent1'},
        {mockEvent: 'mockLocalEvent2'}
      ], workspaceClient.notSent);
    });
      
    test('Rows contains local changes followed by external changes.', () => {
      const workspaceClient = new WorkspaceClient('mockClient');
      workspaceClient.inProgress = [
        {events: [{mockEvent: 'mockLocalEvent0'}], entryId:'mockClient0'}
      ];
      workspaceClient.notSent = [
        {mockEvent:'mockLocalEvent1'},
        {mockEvent:'mockLocalEvent2'}
      ];
      const eventQueue = workspaceClient.processQueryResults_([
        {events: [{mockEvent:'mockLocalEvent0'}], entryId: 'mockClient0', serverId:1},
        {events: [{mockEvent:'mockExternalEvent0'}], entryId: 'otherClient0', serverId:2}
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

    test('Rows contains local changes sandwiched by external changes.', () => {
      const workspaceClient = new WorkspaceClient('mockClient');
      workspaceClient.inProgress = [
        {events: [{mockEvent: 'mockLocalEvent0'}], entryId:'mockClient0'}
      ];
      workspaceClient.notSent = [
        {mockEvent: 'mockLocalEvent1'},
        {mockEvent: 'mockLocalEvent2'}
      ];

      const eventQueue = workspaceClient.processQueryResults_([
        {events: [{mockEvent:'mockExternalEvent0'}], entryId: 'otherClient0', serverId:1},
        {events: [{mockEvent:'mockLocalEvent0'}], entryId: 'mockClient0', serverId:2},
        {events: [{mockEvent:'mockExternalEvent1'}], entryId: 'otherClient1', serverId:3}
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

  suite('queryDatabase()', () => {
    test('Query fails.', async () => {
      const getEventsStub = sinon.stub(api, 'getEvents').rejects();
      const workspaceClient = new WorkspaceClient('mockClient');
      const rows = await workspaceClient.queryDatabase();
      assert.deepStrictEqual([], rows);
      getEventsStub.restore();
    });

    test('Query succeeds.', async () => {
      const workspaceClient = new WorkspaceClient('mockClient');
      const getEventsStub = sinon.stub(api, 'getEvents').resolves([]);
      const spy = sinon.spy(workspaceClient, 'processQueryResults_');
      await workspaceClient.queryDatabase();
      assert.equal(true, spy.calledWithExactly([]));
      getEventsStub.restore();
      spy.restore();
    });
  });
});
