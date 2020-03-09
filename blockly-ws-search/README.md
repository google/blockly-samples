[Home](../README.md)

# blockly-ws-search [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

This package provides an implementation of workspace search for a Blockly workspace.

## Installation

```
npm install @blockly/plugin-workspace-search
```

## Usage

```js
var WorkSpaceSearch = require('@blockly/plugin-workspace-search');

// Dictionary of options used to initialize the workspace.
var options  = {};
var workspace = Blockly.inject('blocklyDiv', options);
var workspaceSearch = new WorkspaceSearch(workspace);
workspaceSearch.init();
```

## API

### `blockly-ws-search`

- `init`
- `dispose`
- `open`
- `close`
