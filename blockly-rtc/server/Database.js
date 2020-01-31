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
 * @fileoverview Wrapper class for the SQLite database.
 * @author navil@google.com (Navil Perez)
 */

const db = require('./db');
const Blocky = require('blockly');

/**
 * Class for managing interactions between the server and the database.
 */
class Database {
  constructor() {
    this.db = db;
    this.snapshot = {
      serverId: 0,
      xml: '<xml xmlns="https://developers.google.com/blockly/xml"/>'
    };
  };

  /**
   * Query the database for entries since the given server id.
   * @param {number} serverId serverId for the lower bound of the query.
   * @return {!Promise} Promise object represents the entries since the last
   * given serverId.
   * @public
   */
  query(serverId) {
    return new Promise ((resolve, reject) => {
      this.db.all(`SELECT * from eventsdb WHERE serverId > ${serverId};`,
          (err, entries) => {
        if (err) {
          console.error(err.message);
          reject('Failed to query the database.');
        } else {
          entries.forEach((entry) => {
            entry.events = JSON.parse(entry.events);
          });
          resolve(entries);
        };
      });
    });
  };

  /**
   * Add entry to the database if the entry is a valid next addition.
   * For each user, an addition is valid if the entryNumber is greater than the
   * entryNumber of its last added entry.
   * @param {!LocalEntry} entry The entry to be added to the database.
   * @return {!Promise} Promise object with the serverId of the entry written to
   * the database.
   * @public
   */
  async addToServer(entry) {
    return new Promise(async (resolve, reject) => {
      const lastEntryNumber = await this.getLastEntryNumber_(entry.workspaceId);
      if (entry.entryNumber > lastEntryNumber) {
        try {
          const serverId = await this.runInsertQuery_(entry);
          await this.updateLastEntryNumber_(entry.workspaceId, entry.entryNumber);
          resolve(serverId);
        } catch {
          reject('Failed to write to the database');
        };
      } else if (entry.entryNumber == lastEntryNumber) {
        resolve(null);
      } else {
        reject('Entry is not valid.');
      };
    });
  };

  /**
   * Run query to add an entry to the database.
   * @param {!LocalEntry} entry The entry to be added to the database.
   * @return {!Promise} Promise object with the serverId for the entry if the
   * write succeeded.
   * @private
   */
  runInsertQuery_(entry) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run(`INSERT INTO eventsdb
            (events, workspaceId, entryNumber) VALUES(?,?,?)`,
            [JSON.stringify(entry.events), entry.workspaceId, entry.entryNumber],
            (err) => {
          if (err) {
            console.error(err.message);
            reject('Failed to write to the database.');
          };
        });
        this.db.each(`SELECT last_insert_rowid() as serverId;`, (err, lastServerId) => {
          if (err) {
            console.error(err.message);
            reject('Failed to retrieve serverId.');
          };
          resolve(lastServerId.serverId);
        });
      });
    });
  };

  /**
   * Update lastEntryNumber in the users table for a given user.
   * @param {!string} workspaceId The workspaceId of the user.
   * @param {!number} entryNumber The numeric ID assigned to an entry by the
   * user.
   * @return {!Promise} Promise object represents the success of the update.
   * @private
   */
  updateLastEntryNumber_(workspaceId, entryNumber) {
    return new Promise((resolve, reject) => {
      this.db.run(`UPDATE users SET lastEntryNumber = ?
          WHERE workspaceId = ?;`,
          [entryNumber, workspaceId],
          async (err) => {
        if (err) {
          console.error(err.message);
          reject('Failed update users table.');
        };
        resolve();
      });
    });
  };

  /**
   * Get the lastEntryNumber for a given user.
   * @param {!string} workspaceId The workspaceId of the user.
   * @return {!Promise} Promise object with the the numeric ID assigned to an
   * entry by the user.
   * @private
   */
  getLastEntryNumber_(workspaceId) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {

        // Ensure user is in the database, otherwise add it.
        this.db.all(
            `SELECT * from users
            WHERE (EXISTS (SELECT 1 from users WHERE workspaceId == ?));`,
            [workspaceId],
            (err, entries) => {
          if (err) {
            console.error(err.message);
            reject('Failed to get last entry number.');
          } else if (entries.length == 0) {
            this.db.run(`INSERT INTO users(workspaceId, lastEntryNumber)
                VALUES(?, -1)`, [workspaceId]);
          };
        });

        this.db.each(
            `SELECT lastEntryNumber from users WHERE workspaceId = ?;`,
            [workspaceId],
            (err, result) => {
          if (err) {
            console.error(err.message);
            reject('Failed to get last entry number.');
          } else {
            resolve(result.lastEntryNumber);
          };
        });
      });
    });
  };

  /**
   * Query the position for the given user. If no user is specified will
   * return the positions of all users.
   * @param {string=} workspaceId workspaceId of the user.
   * @return {!Promise} Promise object with an array of positionUpdate objects.
   * @public
   */
  getPositionUpdates(workspaceId) {
    return new Promise((resolve, reject) => {
      const sql = workspaceId ? 
          `SELECT workspaceId, position from users
          WHERE
          (EXISTS (SELECT 1 from users WHERE workspaceId == ${workspaceId}))
          AND workspaceId = ${workspaceId};` :
          `SELECT workspaceId, position from users;`;
      this.db.all(sql, (err, positionUpdates) => {
        if (err) {
          console.error(err.message);
          reject('Failed to get positions.');
        } else {
          positionUpdates.forEach((positionUpdate) => {
            positionUpdate.position = JSON.parse(positionUpdate.position);
          });
          resolve(positionUpdates);
        };
      });
    });
  };

  /**
   * Update the position in the users table for a given user.
   * @param {!Object} positionUpdate The positionUpdate with the new
   * position for a given user.
   * @return {!Promise} Promise object represents the success of the update.
   * @public
   */
  updatePosition(positionUpdate) {
    return new Promise((resolve, reject) => {
      this.db.run(
          `INSERT INTO users(workspaceId, lastEntryNumber, position)
          VALUES(?, -1, ?)
          ON CONFLICT(workspaceId)
          DO UPDATE SET position = ?`,
          [
            positionUpdate.workspaceId,
            JSON.stringify(positionUpdate.position),
            JSON.stringify(positionUpdate.position)
          ],
          (err) => {
        if (err) {
          console.error(err.message);
          reject();
        };
        resolve();
      });
    });
  };

  /**
   * Delete a user from the users table.
   * @param {string} workspaceId The workspaceId of the user to be removed from
   * the users table.
   * @return {!Promise} Promise object represents the success of the deletion.
   * @public
   */
  deleteUser(workspaceId) {
    return new Promise((resolve, reject) => {
      this.db.run(
          `DELETE FROM users WHERE workspaceId = '${workspaceId}';`,
          (err) => {
        if (err) {
          console.error(err.message);
          reject();
        };
        resolve();
      });
    });
  };

  /**
   * Retrieve the latest snapshot of the workspace.
   * @return {!Snapshot} The latest snapshot of the workspace.
   * @public
   */
  async getSnapshot() {
    await this.updateSnapshot_();
    return this.snapshot;
  };

  /**
   * Update the snapshot of the workspace.
   * @return {!Promise} Promise object that represents the success of the
   * update.
   * @private
   */
  updateSnapshot_() {
    return new Promise(async (resolve, reject) => {
      const newEntries = await this.query(this.snapshot.serverId);
      if (newEntries.length == 0) {
        resolve();
        return;
      };
      // Load last stored snapshot of the workspace.
      const workspace = new Blocky.Workspace();
      if (this.snapshot.xml) {
        const xml = Blocky.Xml.textToDom(this.snapshot.xml);
        Blocky.Xml.domToWorkspace(xml, workspace);  
      };
      // Play events since the last time the snapshot was generated.
      newEntries.forEach((entry) => {
        entry.events.forEach((event) => {
          const blocklyEvent = Blocky.Events.fromJson(event, workspace);
          blocklyEvent.run(true);
        });
      });
      // Store the new snapshot object.
      const newSnapshotXml = Blocky.Xml.workspaceToDom(workspace, false);
      const newSnapshotText = Blocky.Xml.domToText(newSnapshotXml);
      this.snapshot.xml = newSnapshotText;
      this.snapshot.serverId = newEntries[newEntries.length -1].serverId;
      resolve();
    });
  };
};

module.exports = new Database();
