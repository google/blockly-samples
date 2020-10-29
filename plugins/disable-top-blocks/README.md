# @blockly/disable-top-blocks [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

<!--
  - TODO: Edit plugin description.
  -->
A [Blockly](https://www.npmjs.com/package/blockly) plugin that shows the 'disable' context menu option only on top blocks. This is useful in conjunction with the `Blockly.Events.disableOrphans` event handler (which you must set up yourself).

## Installation

### Yarn
```
yarn add @blockly/disable-top-blocks
```

### npm
```
npm install @blockly/disable-top-blocks --save
```

## Usage

<!--
  - TODO: Update usage.
  -->
```js
import * as Blockly from 'blockly';
import {Plugin} from 'blockly-plugin-disable-top-blocks';

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
