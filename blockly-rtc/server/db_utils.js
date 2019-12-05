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
 * @fileoverview Util scripts for interacting with the database.
 * @author navil@google.com (Navil Perez)
 */

const db = require('./db');

/**
 * A local representation of an entry in the database.
 * @typedef {Object} LocalEntry
 * @property {<!Array.<!Object>>} events An array of Blockly Events in JSON
 * format.
 * @property {string} entryId The id assigned to an event by the client.
 */

/**
 * Query the database for rows since the given server id.
 * @param {number} serverId serverId for the lower bound of the query.
 * @return {!Promise} Promise object represents the rows since the last given
 * serverId.
 * @public
 */
function queryDatabase(serverId) {
  return new Promise ((resolve, reject) => {
    db.all(`SELECT * from eventsdb WHERE serverId > ${serverId};`, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        rows.forEach((row) => {
          row.events = JSON.parse(row.events);
        });
        resolve(rows);
      };
    });
  });
};

/**
 * Add an entry to the database.
 * @param {!LocalEntry} entry The entry to be added to the database.
 * @return {!Promise} Promise object with the serverId for the entry if the
 * write succeeded.
 * @public
 */
function addToServer(entry) {

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('INSERT INTO eventsdb(events, entryId) VALUES(?,?)',
          [JSON.stringify(entry.events), entry.entryId], (err) => {
        if (err) {
          console.error(err.message);
          reject(err);
        };
      });
      db.each(`SELECT last_insert_rowid() as serverId;`, (err, lastServerId) => {
        if (err) {
          console.error(err.message);
          reject(err);
        };
        resolve(lastServerId.serverId);
      });
    });
  });
};

module.exports.queryDatabase = queryDatabase;
module.exports.addToServer = addToServer;