# @blockly/plugin-copy-by-storage [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

<!--
  - TODO: Edit plugin description.
  -->
A [Blockly](https://www.npmjs.com/package/blockly) plugin that adds context menu items and keyboard shortcuts to allow users to copy and paste a block between tabs

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

// optional: Remove the duplication command from Blockly's context menu.
Blockly.ContextMenuRegistry.registry.unregister('blockDuplicate');
```

or In Browser

```js
// Inject Blockly.
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: toolboxCategories,
});

const options = {
  contextMenu: true,
  shortcut: true,
}

// Initialize plugin.
const plugin = new CopyByStorage(options);
plugin.init();

// optional: Remove the duplication command from Blockly's context menu.
Blockly.ContextMenuRegistry.registry.unregister('blockDuplicate');
```

## Options
- contextMenu {boolean} Register copy, cut, and paste commands in the Blockly context menu.
- shortcut {boolean} Register cut (ctr + x), copy (ctr + c) and paste (ctr + v) in the keybord shortcut.

## License
Apache 2.0
