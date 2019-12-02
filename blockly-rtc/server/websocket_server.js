/**
 * @fileoverview Node.js HTTP server for realtime collaboration.
 * @author navil@google.com (Navil Perez)
 */

const socket = require('socket.io');
const http = require('http');

const sql = require('./db_utils');

const PORT = 3001;
 
const server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(PORT, function() {
    console.log((new Date()) + ' Server is listening on port 3001');
});

io = socket(server);
io.on('connection', (user) => {
  onConnect(user);
});

async function onConnect(user) {
  user.on('disconnect', () => {
    console.log('User disconnected.');
  });

  user.on('addEvents', async (entry, callback) => {
    const serverId = await sql.addToServer(entry);
    entry.serverId = serverId;
    callback(serverId);
  });

  user.on('getEvents', async (serverId, callback) => {
    const rows = await sql.queryDatabase(serverId);
    callback(rows);
  });

};