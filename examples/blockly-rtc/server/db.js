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
 * @fileoverview The SQlite database object.
 * @author navil@google.com (Navil Perez)
 */

const sqlite3 = require('@vscode/sqlite3');

const db = new sqlite3.Database('./eventsdb.sqlite', (err) => {
  if (err) {
    return console.error(err.message);
  };
  console.log('successful connection');
  const eventsDbSql = `CREATE TABLE IF NOT EXISTS eventsdb(
      serverId INTEGER PRIMARY KEY,
      workspaceId TEXT, entryNumber INTEGER, events BLOB);`;
  db.run(eventsDbSql, function(err) {
    if (err) {
      return console.error(err.message);
    };
  });
  const userTableSql = `CREATE TABLE IF NOT EXISTS users(
      workspaceId TEXT UNIQUE,
      lastEntryNumber INTEGER,
      position TEXT);`
  db.run(userTableSql, function(err) {
    if (err) {
      return console.error(err.message);
    };
  });
});

module.exports = db;