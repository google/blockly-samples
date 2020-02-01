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
  teardown(() => {
    sinon.restore();
  })

  suite('getSnapshot()', () => {
    setup(() => {
      this.xmlText0 = '<xml xmlns="https://developers.google.com/blockly/xml"/>';
      this.xmlText1 = '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '<block type="controls_if" id="^EzM:}wIx;MjBTcxQ@oB" x="238" y="63"/>' +
          '</xml>';
      this.xmlText2 = '<xml xmlns="https://developers.google.com/blockly/xml">' +
          '<block type="controls_if" id="^EzM:}wIx;MjBTcxQ@oB" x="238" y="63">' +
          '<value name="IF0">' +
          '<block type="logic_compare" id="oNVDtK2cF?jWDM+.gCR3">' +
          '<field name="OP">EQ</field>' +
          '</block></value></block></xml>'
      this.entry1 = {
        serverId: 1,
        events: [{
          type: "create",
          group: "zH!7f,gfyd$ni%`Wq`Y|",
          blockId: "^EzM:}wIx;MjBTcxQ@oB",
          xml: '<block xmlns="https://developers.google.com/blockly/xml" ' +
              'type="controls_if" id="^EzM:}wIx;MjBTcxQ@oB" x="16" y="10"/>',
          ids: ["^EzM:}wIx;MjBTcxQ@oB"]
        }, {
          type: "move",
          group: "zH!7f,gfyd$ni%`Wq`Y|",
          blockId: "^EzM:}wIx;MjBTcxQ@oB",
          newCoordinate: "228,58"
        }, {
          type: "move",
          group: "zH!7f,gfyd$ni%`Wq`Y|",
          blockId: "^EzM:}wIx;MjBTcxQ@oB",
          newCoordinate: "238,63"
        }]
      };
      this.entry2 = {
        serverId: 2,
        events: [{
          type: "create",
          group: "|r115vF03q}F@7l]*PcB",
          blockId: "oNVDtK2cF?jWDM+.gCR3",
          xml: '<block xmlns="https://developers.google.com/blockly/xml" ' +
              'type="logic_compare" id="oNVDtK2cF?jWDM+.gCR3" x="8" y="97">' +
              '<field name="OP">EQ</field></block>',
          ids: ["oNVDtK2cF?jWDM+.gCR3"]
        }, {
          type: "move",
          group: "|r115vF03q}F@7l]*PcB",
          blockId: "oNVDtK2cF?jWDM+.gCR3",
          newParentId: "^EzM:}wIx;MjBTcxQ@oB",
          newInputName: "IF0"
        }]
      };
    });

    test('No previous snapshot, no new events', async () => {
      database.snapshot = {
        xml: this.xmlText0,
        serverId: 0
      };
      sinon.stub(database, 'query').resolves([]);
      const newSnapshot = await database.getSnapshot();
      assert.equal(this.xmlText0, newSnapshot.xml);
      assert.equal(0, newSnapshot.serverId);
      assert(database.query.calledOnceWith(0));
    });

    test('No previous snapshot, new events', async () => {
      database.snapshot = {
        xml: this.xmlText0,
        serverId: 0
      };
      sinon.stub(database, 'query').resolves([this.entry1, this.entry2]);
      const newSnapshot = await database.getSnapshot();
      assert.equal(this.xmlText2, newSnapshot.xml);
      assert.equal(2, newSnapshot.serverId);
      assert(database.query.calledOnceWith(0));
    });

    test('Snapshot stored, no new events.', async () => {
      database.snapshot = {
        xml: this.xmlText1,
        serverId: 1
      };
      sinon.stub(database, 'query').resolves([]);
      const newSnapshot = await database.getSnapshot();
      assert.equal(this.xmlText1, newSnapshot.xml);
      assert.equal(1, newSnapshot.serverId);
      assert(database.query.calledOnceWith(1));
    });

    test('Snapshot stored, new events.', async () => {
      database.snapshot = {
        xml: this.xmlText1,
        serverId: 1
      };
      sinon.stub(database, 'query').resolves([this.entry2]);
      const newSnapshot = await database.getSnapshot();
      assert.equal(this.xmlText2, newSnapshot.xml);
      assert.equal(2, newSnapshot.serverId);
      assert(database.query.calledOnceWith(1));
    });
  });

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
