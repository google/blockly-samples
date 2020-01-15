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

/**
 * Class for managing interactions between the server and the database.
 */
class Database {
  constructor() {
    this.db = db;
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
   * For each user, an addition is valid if the entryId is greater than the
   * entryId of its last added entry.
   * @param {!LocalEntry} entry The entry to be added to the database.
   * @return {!Promise} Promise object with the serverId the entry was written
   * to the database.
   * @public
   */
  async addToServer(entry) {
    return new Promise(async (resolve, reject) => {
      const workspaceId = entry.entryId.split(':')[0];
      const entryIdInt = entry.entryId.split(':')[1];
      const lastEntryIdNumber = await this.getLastEntryIdNumber_(workspaceId);
      if (entryIdInt > lastEntryIdNumber) {
        try {
          const serverId = await this.runInsertQuery_(entry);
          await this.updateLastEntryIdNumber_(workspaceId, entryIdInt);
          resolve(serverId);
        } catch {
          reject('Failed to write to the database');
        };
      } else if (entryIdInt == lastEntryIdNumber) {
        resolve(null);
      } else {
        reject('EntryId is not valid.');
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
        this.db.run('INSERT INTO eventsdb(events, entryId) VALUES(?,?)',
            [JSON.stringify(entry.events), entry.entryId], (err) => {
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
   * Update lastEntryIdNumber in the users table for a given user.
   * @param {!string} workspaceId The workspaceId of the user.
   * @param {!number} entryIdNumber The numeric part of the entryId.
   * @return {!Promise} Promise object represents the success of the update.
   * @private
   */
  updateLastEntryIdNumber_(workspaceId, entryIdNumber) {
    return new Promise((resolve, reject) => {
      this.db.run(`UPDATE users SET lastEntryNumber = ?
          WHERE workspaceId = ?;`,
          [entryIdNumber, workspaceId],
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
   * Get the numerical part of the last added entryId for a given user.
   * @param {!string} workspaceId The workspaceId of the user.
   * @return {!Promise} Promise object with the the numerical part of the
   * entryId.
   * @private
   */
  getLastEntryIdNumber_(workspaceId) {
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
            reject('Failed to get last entryId number.');
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
            reject('Failed to get last entryId number.');
          } else {
            resolve(result.lastEntryNumber);
          };
        });
      });
    });
  };

  /**
   * Query the location for the given user. If no user is specified will
   * return the locations of all users.
   * @param {string=} workspaceId workspaceId of the user.
   * @return {!Promise} Promise object with an array of LocationUpdate objects.
   * @public
   */
  getLocationUpdates(workspaceId) {
    return new Promise((resolve, reject) => {
      const sql = workspaceId ? 
          `SELECT workspaceId, location from users
          WHERE
          (EXISTS (SELECT 1 from users WHERE workspaceId == ${workspaceId}))
          AND workspaceId = ${workspaceId};` :
          `SELECT workspaceId, location from users;`;
      this.db.all(sql, (err, locationUpdates) => {
        if (err) {
          console.error(err.message);
          reject('Failed to get locations.');
        } else {
          locationUpdates.forEach((locationUpdate) => {
            locationUpdate.location = JSON.parse(locationUpdate.location);
          });
          resolve(locationUpdates);
        };
      });
    });
  };

  /**
   * Update the location in the users table for a given user.
   * @param {!Object} locationUpdate The LocationUpdate with the new
   * location for a given user.
   * @return {!Promise} Promise object represents the success of the update.
   * @public
   */
  updateLocation(locationUpdate) {
    return new Promise((resolve, reject) => {
      this.db.run(
          `INSERT INTO users(workspaceId, lastEntryNumber, location)
          VALUES(?, -1, ?)
          ON CONFLICT(workspaceId)
          DO UPDATE SET location = ?`,
          [
            locationUpdate.workspaceId,
            JSON.stringify(locationUpdate.location),
            JSON.stringify(locationUpdate.location)
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
};

module.exports.Database = Database;
