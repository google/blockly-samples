---
title: "@blockly/plugin-copy-by-storage Demo"
packageName: "@blockly/plugin-copy-by-storage"
description: "Allows you to copy blocks with cross-tab."
pageRoot: "plugins/copy-by-storage"
pages:
  - label: "Playground"
    link: "test/index"
  - label: "README"
    link: "README"

---
# @blockly/plugin-copy-by-storage [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) plugin that adds context menu items and keyboard shortcuts to allow users to copy and paste a block between tabs.

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

const options = {
  contextMenu: true,
  shortcut: true,
}

// Initialize plugin.
const plugin = new CopyByStorage();
plugin.init(options);

// optional: Remove the duplication command from Blockly's context menu.
Blockly.ContextMenuRegistry.registry.unregister('blockDuplicate');

// optional: You can change the position of the menu added to the context menu.
Blockly.ContextMenuRegistry.registry.getItem('blockCopyToStorage').weight = 2;
Blockly.ContextMenuRegistry.registry.getItem('blockPasteFromStorage').weight = 3;
```

## Options
- contextMenu {boolean} Register copy, cut, and paste commands in the Blockly context menu.
- shortcut {boolean} Register cut (ctr + x), copy (ctr + c) and paste (ctr + v) in the keybord shortcut.

## Localization
You can change the displayed words.
### English
```js
Blockly.Msg['COPYBYSTORAGE_COPY'] = 'Copy';
Blockly.Msg['COPYBYSTORAGE_PASTE'] = 'Paste';
```

### Japanese
```js
Blockly.Msg['COPYBYSTORAGE_COPY'] = 'コピー';
Blockly.Msg['COPYBYSTORAGE_PASTE'] = '貼り付け';
```

## License
Apache 2.0
