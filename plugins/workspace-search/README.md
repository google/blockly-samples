---
title: "@blockly/plugin-workspace-search Demo"
packageName: "@blockly/plugin-workspace-search"
description: "A Blockly plugin that adds workspace search support."
pageRoot: "plugins/workspace-search"
pages:
  - label: "Playground"
    link: "test/index"
  - label: "README"
    link: "README"

---
# @blockly/plugin-workspace-search [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) plugin that adds workspace search support.

## Installation

```
npm install @blockly/plugin-workspace-search --save
```

## Usage

### ES6 Imports
```js
import * as Blockly from 'blockly';
import { WorkspaceSearch } from '@blockly/plugin-workspace-search';

const workspace = Blockly.inject('blocklyDiv');
const workspaceSearch = new WorkspaceSearch(workspace);

workspaceSearch.init();
```
### Script Tag
```js
<script src="./node_modules/@blockly/plugin-workspace-search/dist/index.js"></script>
```

To open workspace search use either command + f or control + f. To close the search bar hit escape or the 'x' in the top right corner.

## API

- `init`: Initializes the workspace search bar.
- `dispose`: Disposes of workspace search.
- `open`: Opens the search bar.
- `close`: Closes the search bar.
- `previous`: Selects the previous block.
- `next`: Selects the next block.
- `setSearchPlaceholder`: Sets the placeholder text for the search bar text input.
- `addActionBtn`: Add a button to the action div. This must be called after the init function has been called.
- `clearBlocks`: Clears the selection group and current block.
- `searchAndHighlight`: Searches the workspace for the current search term and highlights matching blocks.

## License
Apache 2.0
