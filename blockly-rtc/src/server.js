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
 * @fileoverview Node.js HTTP server for realtime collaboration.
 * @author navil@google.com (Navil Perez)
 */

const http = require('http'); 
const url = require('url');

const sql = require('./db_utils');

http.createServer(function (req, res) {
  if (req.method === 'GET') {
    sql.queryDatabase(url.parse(req.url, true).query.serverId).then((rows) => {
      res.statusCode = 200;
      res.write(JSON.stringify({rows:rows}));  
      res.end();
    }); 
  }
  else if (req.method === 'POST') {
    const data = [];
    req.on('data', chunk => {
      data.push(chunk);
    });
    req.on('end', () => {
      sql.addToServer(JSON.parse(data).rows).then(() => {
        res.statusCode = 200;
        res.end();  
      })
      .catch(() => {
        res.statusCode = 401;
        res.end();
      });
    });
  }
  else {
    res.statusCode = 404;
    res.end();
  };
}).listen(3001, function() { 
    console.log("server start at port 3001"); 
}); 