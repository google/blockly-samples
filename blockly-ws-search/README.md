[Home](../README.md)

# blockly-ws-search [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

This package provides an implementation of workspace search for a Blockly workspace.

## Installation

```
npm install blockly-ws-search
```

## Usage

```js
var WorkSpaceSearch = require('blockly-ws-search');

var workspace = Blockly.inject('blocklyDiv' + suffix, options);
var workspaceSearch = new WorkspaceSearch(workspace);
workspaceSearch.init();
```

## API

### `blockly-ws-search`

- `init`
- `dispose`
- `open`
- `close`
