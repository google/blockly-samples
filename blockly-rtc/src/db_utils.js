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
 */

var db = require('./db');

/**
 * Query the database for rows since the given server id.
 * @param {number} serverId serverId for the lower bound of the query.
 * @return {!Array.<!Object>} The rows since the last given server id.
 * @public
 */
function queryDatabase(serverId) {
  var sql = `SELECT * from events WHERE serverId > ${serverId};`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    };
    return rows;
  });
};

/**
 * Add rows to the database.
 * Rows are added transactionally.
 * @param {!Array.<!Object>} rows The rows to be added to the database.
 * @public
 */
function addToServer(rows) {
  var insertQueries = [];
  rows.forEach(function(row) {
    insertQueries.push(createInsertStatement_(row));
  });

  db.serialize(function() {
    db.run('BEGIN TRANSACTION', function(error) {
      if (error) {
        console.error(error.message);
      };
    });

    insertQueries.forEach(function(insertQuery) {
      db.run(insertQuery, function(error) {
        if (error) {
          db.run('ROLLBACK');
          console.error(error.message);
        };
      });
    });

    db.run('COMMIT;');
  });   

};

/**
 * Create a SQlite query script to insert a new row.
 * @param {!Object} row serverId for the lower bound of the query.
 * @return {!String} The SQlite query.
 * @private
 */
function createInsertStatement_(row) {
  var sql =  `INSERT INTO events(documentId, event) VALUES('${row.documentId}', '${row.event}');`;
  return sql;
};

module.exports.queryDatabase = queryDatabase;
module.exports.addToServer = addToServer;