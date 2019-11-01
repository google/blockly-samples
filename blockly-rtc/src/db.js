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
const sqlite3 = require('sqlite3');

let db = new sqlite3.Database("./events.sqlite", function(error) {
    if (error) {
        return console.error(error.message);
    };
    console.log('successful connection');

    let sql = `CREATE TABLE IF NOT EXISTS events(
        serverId INTEGER PRIMARY KEY,
        documentId TEXT, event BLOB);`;
    db.run(sql, function(error) {
        if (error) {
            console.error(error.message);
        };
    });
});

module.exports = db;