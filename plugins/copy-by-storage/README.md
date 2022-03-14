# @blockly/plugin-copy-by-storage [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

<!--
  - TODO: Edit plugin description.
  -->
A [Blockly](https://www.npmjs.com/package/blockly) plugin that ...

## Installation

### Yarn
```
yarn add @blockly/plugin-copy-by-storage
```

### npm
```
npm install @blockly/plugin-copy-by-storage --save
```

## Usage

<!--
  - TODO: Update usage.
  -->
```js
import * as Blockly from 'blockly';
import {CopyByStorage} from '@blockly/plugin-copy-by-storage';

// Inject Blockly.
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: toolboxCategories,
});

// Initialize plugin.
const plugin = new CopyByStorage(workspace);
plugin.init();
```

or In Browser

```js
// Inject Blockly.
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: toolboxCategories,
});

// Initialize plugin.
const plugin = new CopyByStorage();
plugin.init();
```

## API

<!--
  - TODO: describe the API.
  -->

## License
Apache 2.0
