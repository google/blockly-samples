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
const handler = require('../src/http_handlers');
const WorkspaceClient = require('../src/WorkspaceClient').default;

suite('WorkspaceClient', () => {

  suite('writeToDatabase()', () => {
    test('Write succeeds, events move from notSent to inProgress.', async () => {
      const writeEventsStub = sinon.stub(handler, 'writeEvents').resolves();
      const workspaceClient = new WorkspaceClient(
        'mockClient', handler.getEvents, handler.writeEvents);
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
      const writeEventsStub = sinon.stub(handler, 'writeEvents').rejects();
      const workspaceClient = new WorkspaceClient(
        'mockClient', handler.getEvents, handler.writeEvents);
      workspaceClient.notSent = [1,2,3];
      await assert.rejects(workspaceClient.writeToDatabase());
      writeEventsStub.restore();
      assert.deepStrictEqual([1,2,3], workspaceClient.notSent);
      assert.deepStrictEqual([], workspaceClient.inProgress);
      assert.strictEqual(0, workspaceClient.counter);
    });
  });

  suite('addEvents()', () => {
    test('Events added to activeChanges in the correct order with the correct entryId.', async () => {
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
    test('Events in activeChanges are moved to tne end of notSent.', async () => {
      const workspaceClient = new WorkspaceClient(
        'mockClient', handler.getEvents, handler.writeEvents);
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
      const workspaceClient = new WorkspaceClient(
        'mockClient', handler.getEvents, handler.writeEvents);
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
      const workspaceClient = new WorkspaceClient(
        'mockClient', handler.getEvents, handler.writeEvents);
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
      const workspaceClient = new WorkspaceClient(
        'mockClient', handler.getEvents, handler.writeEvents);
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
      const workspaceClient = new WorkspaceClient(
        'mockClient', handler.getEvents, handler.writeEvents);
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
      const workspaceClient = new WorkspaceClient(
        'mockClient', handler.getEvents, handler.writeEvents);
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
      const getEventsStub = sinon.stub(handler, 'getEvents').rejects();
      const workspaceClient = new WorkspaceClient(
        'mockClient', handler.getEvents, handler.writeEvents);
      const rows = await workspaceClient.queryDatabase();
      getEventsStub.restore();
      assert.deepStrictEqual([], rows);
    });

    test('Query succeeds.', async () => {
      const getEventsStub = sinon.stub(handler, 'getEvents').resolves(['resolved']);
      const workspaceClient = new WorkspaceClient(
        'mockClient', handler.getEvents, handler.writeEvents);
      const spy = sinon.spy(workspaceClient, 'processQueryResults_');
      await workspaceClient.queryDatabase();
      getEventsStub.restore();
      assert.equal(true, spy.calledWithExactly(['resolved']));
      spy.restore();
    });
  });
});
