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
      assert.deepStrictEqual([], workspaceClient.notSent);
      assert.deepStrictEqual([1,2,3], workspaceClient.inProgress);
      writeEventsStub.restore();
    });

    test('Write fails, error is thrown and events stay in notSent.', async () => {
      const writeEventsStub = sinon.stub(api, 'writeEvents').rejects();
      const workspaceClient = new WorkspaceClient('mockClient');
      workspaceClient.notSent = [1,2,3];
      await assert.rejects(workspaceClient.writeToDatabase());
      assert.deepStrictEqual([1,2,3], workspaceClient.notSent);
      assert.deepStrictEqual([], workspaceClient.inProgress);
    });
  });

   suite('addEvents()', () => {
    test('Events added to activeChanges in the correct order with the correct entryId.', async () => {
      const workspaceClient = new WorkspaceClient('mockClient');
      workspaceClient.addEvent('mockEvent0');
      workspaceClient.addEvent('mockEvent1');
      assert.deepStrictEqual([
        {event:'mockEvent0', entryId:'mockClient0'},
        {event:'mockEvent1', entryId:'mockClient1'}
      ],workspaceClient.activeChanges);
    });
  });

  suite('flushEvents()', () => {
    test('Events in activeChanges are moved to tne end of notSent.', async () => {
      const workspaceClient = new WorkspaceClient('mockClient');
      workspaceClient.counter = 2;
      workspaceClient.notSent = [
        {event:'mockEvent0', entryId:'mockClient0'},
        {event:'mockEvent1', entryId:'mockClient1'}
      ];
      workspaceClient.activeChanges = [
        {event:'mockActiveChange2', entryId:'mockClient2'},
        {event:'mockActiveChange3', entryId:'mockClient3'}
      ];
      workspaceClient.flushEvents();
      assert.deepStrictEqual(
        [
          {event:'mockEvent0', entryId:'mockClient0'},
          {event:'mockEvent1', entryId:'mockClient1'},
          {event:'mockActiveChange2', entryId:'mockClient2'},
          {event:'mockActiveChange3', entryId:'mockClient3'}
        ],
        workspaceClient.notSent);
      assert.deepStrictEqual([], workspaceClient.activeChanges);
    });
  });
});
