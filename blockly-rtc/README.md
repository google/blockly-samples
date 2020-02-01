# Blockly Realtime Collaboration Coding Sample [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)
This sample demonstrates how to create a realtime collaboration environment on top of the Blockly framework.

## Installation
From the blockly-rtc directory run:

```npm install```

## Running
You can run the sample with either a websocket server (full-duplex communication) or a basic http server (half-duplex communication). The websocket server implementation includes a presence feature which detects when clients have disconnected from the session.

To run the websocket implementation:

```npm run start-websocket```

Open http://localhost:3000/websocket.html

To run the http implementation:

```npm run start-http```

Open http://localhost:3000/http.html


## Design Overview

### Event Resolution Algorithm

The collaboration algorithm's design focus is eventual consistency and algorithmic simplicity.

In order to allow for realtime collaboration, a central server stores events in eventsdb.sqlite and sends them to all clients connected to the same workspace.

The server has no model of the workspace, it is just a 'bent pipe'. It does basic error checking, then appends all incoming events onto a structured database that assigns an incrementing serial number to each.

When a client connects it requests the state of the workspace. This may be a snapshot of the workspace state or a list of all accumulated events since the client last connected.

The net result is that all clients receive all messages, including those which they sent.
and all clients receive the events in the same order as each other.

Whenever new events are received from the server, the client rewinds any local events until it has
reached a common root with the server events, replays all events received from the server, and then re-applies any remaining local events.

### UX/UI

The UX for collaboration is based on the idea of minimal distraction. Users will not see blocks move in real-time, but simply see blocks update their locations.

Markers will be used to display the positions of other users on the workspace. Each user will have a colour assigned to them. Currently markers show when a user has selected a block or is editing a field.

![markers](https://raw.githubusercontent.com/google/blockly-samples/master/blockly-rtc/markers.png)

The image above shows a yellow marker for one user, a blue marker for a second user, and a green marker for a third user.
