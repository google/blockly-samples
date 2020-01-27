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

const Database = require('../server/Database').Database;
const database = new Database();

suite('Database', () => {

  suite('addToDatabase()', () => {
    setup(() => {
      sinon.stub(database, 'runInsertQuery_');
      sinon.stub(database, 'getLastEntryNumber_');
    });

    teardown(() => {
      database.runInsertQuery_.restore();
      database.getLastEntryNumber_.restore();
    });

    test('New user, add to database.', async () => {
      database.getLastEntryNumber_.resolves(-1);
      database.runInsertQuery_.resolves(2);
      const entry = {
          workspaceId: 'newUser',
          entryNumber: '1',
          events: [JSON.stringify({mockEvent:'event'})],
      };
      const serverId = await database.addToServer(entry);
      assert.equal(2, serverId);
      assert(database.runInsertQuery_.calledOnce);
    });

    test('Valid entry for existing user, add to database.', async () => {
      database.getLastEntryNumber_.resolves(2);
      database.runInsertQuery_.resolves(2);
      const entry = {
          workspaceId: 'mockUser',
          entryNumber: '4',
          events: [JSON.stringify({mockEvent:'event'})],
      };
      const serverId = await database.addToServer(entry);
      assert.equal(2, serverId);
      assert(database.runInsertQuery_.calledOnce);
    });

    test('Database write fails, reject.', async () => {
      database.getLastEntryNumber_.resolves(2);
      database.runInsertQuery_.rejects();
      const entry = {
        workspaceId: 'mockUser',
        entryNumber: '3',
          events: [JSON.stringify({mockEvent:'event'})],
      };
      assert.rejects(database.addToServer(entry));
    });

    test('Duplicate of last entry, resolve without further action.', async () => {
      database.getLastEntryNumber_.resolves(2);
      database.runInsertQuery_.resolves(null);
      const entry = {
        workspaceId: 'mockUser',
        entryNumber: '2',
          events: [JSON.stringify({mockEvent:'event'})],
      };
      const serverId = await database.addToServer(entry);
      assert.equal(null, serverId);
      assert(database.runInsertQuery_.notCalled);
    });

    test('Invalid entry, reject.', async () => {
      database.getLastEntryNumber_.resolves(2);
      database.runInsertQuery_.resolves();
      const entry = {
        workspaceId: 'mockUser',
        entryNumber: '1',
        events: [JSON.stringify({mockEvent:'event'})],
      };
      assert.rejects(database.addToServer(entry));
      assert(database.runInsertQuery_.notCalled);
    });
  });
});
