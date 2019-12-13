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

const Database = require('./Database').Database;

const database = new Database();
const PORT = 3001;

http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  if (req.method === 'GET' && parsedUrl.pathname === '/api/events/query') {
    await queryEventsHandler(req, res, parsedUrl.query.serverId);
  } else if (req.method === 'POST' && parsedUrl.pathname === '/api/events/add') {
    await addEventsHandler(req, res);
  } else {
    res.statusCode = 404;
    res.end();
  };
}).listen(PORT, () => { 
    console.log('server start at port 3001'); 
});

async function queryEventsHandler(req, res, serverId) {
  try {
    const entries = await database.query(serverId);
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.write(JSON.stringify({ entries }));  
    res.end();
  } catch  {
    res.statusCode = 401;
    res.end();
  };
};

async function addEventsHandler(req, res) {
  try {
    const data = [];
    req.on('data', chunk => {
      data.push(chunk);
    });
    req.on('end', () => {
      await database.addToServer(JSON.parse(data).entry)
      res.statusCode = 200;
      res.end();  
    });
  } catch {
    res.statusCode = 401;
    res.end();
  };
};