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
 * @fileoverview Unit tests for Database.
 * @author navil@google.com (Navil Perez)
 */

const assert = require('assert');
const sinon = require('sinon');

const database = require('../server/Database');

suite('Database', () => {

  suite('addToDatabase()', () => {
    setup(() => {
      this.runInsertQueryStub = sinon.stub(database, 'runInsertQuery_');
      this.getLastEntryIdStub = sinon.stub(database, 'getLastEntryIdNumber_');
    });

    teardown(() => {
      database.runInsertQuery_.restore();
      database.getLastEntryIdNumber_.restore();
    });

    test('New user, add to database.', async () => {
      this.getLastEntryIdStub.resolves(-1);
      this.runInsertQueryStub.resolves(2);
      const entry = {
          entryId: 'newMockEntry:1',
          events: [JSON.stringify({mockEvent:'event'})],
      };
      const serverId = await database.addToServer(entry);
      assert.equal(2, serverId);
      assert.equal(true, this.runInsertQueryStub.calledOnce);
    });

    test('Valid entry for existing user, add to database.', async () => {
      this.getLastEntryIdStub.resolves(2);
      this.runInsertQueryStub.resolves(2);
      const entry = {
          entryId: 'mockEntry:4',
          events: [JSON.stringify({mockEvent:'event'})],
      };
      const serverId = await database.addToServer(entry);
      assert.equal(2, serverId);
      assert.equal(true, this.runInsertQueryStub.calledOnce);
    });

    test('Database write fails, reject.', async () => {
      this.getLastEntryIdStub.resolves(2);
      this.runInsertQueryStub.rejects();
      const entry = {
          entryId: 'mockEntry:3',
          events: [JSON.stringify({mockEvent:'event'})],
      };
      assert.rejects(database.addToServer(entry));
    });

    test('Duplicate of last entry, resolve without further action.', async () => {
      this.getLastEntryIdStub.resolves(2);
      this.runInsertQueryStub.resolves(null);
      const entry = {
          entryId: 'mockEntry:2',
          events: [JSON.stringify({mockEvent:'event'})],
      };
      const serverId = await database.addToServer(entry);
      assert.equal(null, serverId);
      assert.equal(true, this.runInsertQueryStub.notCalled);
    });

    test('Invalid entry, reject.', async () => {
      this.getLastEntryIdStub.resolves(2);
      this.runInsertQueryStub.resolves();
      const entry = {
        entryId: 'mockEntry:1',
        events: [JSON.stringify({mockEvent:'event'})],
      };
      assert.rejects(database.addToServer(entry));
      assert.equal(true, this.runInsertQueryStub.notCalled);
    });
  });
});
