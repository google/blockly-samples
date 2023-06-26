# @blockly/workspace-minimap [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) plugin that adds a minimap to the workspace. A minimap is a miniature version of your blocks that appears on top of your main workspace. This gives you an overview of what your code looks like, and how it is organized.

## Installation

### Yarn
```
yarn add @blockly/workspace-minimap
```

### npm
```
npm install @blockly/workspace-minimap --save
```

## Usage

```js
import * as Blockly from 'blockly';
import {Minimap} from '@blockly/workspace-minimap';

// Inject Blockly.
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: toolboxCategories,
});

// Initialize plugin.
const minimap = new Minimap(workspace);
minimap.init();
```

## API

API description coming soon...

## License
Apache 2.0
