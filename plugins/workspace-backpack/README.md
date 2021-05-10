# @blockly/workspace-backpack [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

<!--
  - TODO: Edit plugin description.
  -->
A [Blockly](https://www.npmjs.com/package/blockly) plugin that ...

## Installation

### Yarn
```
yarn add @blockly/workspace-backpack
```

### npm
```
npm install @blockly/workspace-backpack --save
```

## Usage

<!--
  - TODO: Update usage.
  -->
```js
import * as Blockly from 'blockly';
import {Plugin} from '@blockly/workspace-backpack';

// Inject Blockly.
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: toolboxCategories,
});

// Initialize plugin.
const plugin = new Plugin(workspace);
plugin.init();
```

## API

<!--
  - TODO: describe the API.
  -->

## License
Apache 2.0
