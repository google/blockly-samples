# @blockly/plugin-workspace-search [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) plugin that adds workspace search support.

## Installation

```
npm install @blockly/plugin-workspace-search --save
```

## Usage

### ES6 Imports
```js
import Blockly from 'blockly';
import { WorkspaceSearch } from '@blockly/plugin-workspace-search';

const workspace = Blockly.inject('blocklyDiv');
const workspaceSearch = new WorkspaceSearch(workspace);

workspaceSearch.init();
```
### Script Tag
```js
<script src="./node_modules/@blockly/plugin-workspace-search/dist/workspace-search.umd.js"></script>
```

## API

- `init`
- `dispose`
- `open`
- `close`

## License
Apache 2.0
