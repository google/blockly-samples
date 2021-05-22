# @blockly/workspace-backpack [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) plugin that adds a Backpack to the workspace.

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

```js
import * as Blockly from 'blockly';
import {Backpack} from '@blockly/workspace-backpack';

// Inject Blockly.
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: toolboxCategories,
});

// Initialize plugin.
const backpack = new Backpack(workspace);
backpack.init();
```

### Blockly Languages
We do not currently support translating the text in this plugin to different
languages. However, if you would like to support multiple languages the messages
can be translated by assigning the following properties of Blockly.Msg
- `EMPTY_BACKPACK` (Default: "Empty") context menu - Empty the backpack.
- `REMOVE_FROM_BACKPACK` (Default: "Remove from Backpack") context menu - Remove
the selected Block from the backpack.
- `COPY_TO_BACKPACK` (Default: "Copy to Backpack") context menu - Copy the
selected Block to the backpack.
- `COPY_ALL_TO_BACKPACK` (Default: "Copy All Blocks to Backpack") Context menu -
copy all Blocks on the workspace to the backpack.
- `PASTE_ALL_FROM_BACKPACK` (Default: "Paste All Blocks from Backpack") context
menu - Paste all Blocks from the backpack to the workspace.

```javascript
Blockly.Msg['EMPTY_BACKPACK'] = 'Opróżnij plecak';  // Polish 
// Inject workspace, etc...
```

## API

- `init`: Initializes the backpack.
- `dispose`: Disposes of backpack.

- `isOpen`: Returns whether the backpack is open.
- `open`: Opens the backpack flyout.
- `close`: Closes the backpack flyout.

- `getCount`: Returns the count of items in the backpack.
- `getContents` Returns backpack contents.
- `empty`: Empties the backpack's contents. If the contents-flyout is currently
open it will be closed.
- `addItem`: Adds item to backpack.
- `deleteItem`: Deletes item from the backpack.
- `setContents`: Sets backpack contents.

- `handleBlockDrop`: Handles a block drop on this backpack.
- `onDragEnter`: Handle mouse over.
- `onDragExit`: Handle mouse exit.

- `getBoundingRectangle`: Returns the bounding rectangle of the UI element in
pixel units relative to the Blockly injection div.
- `position`: Positions the backpack UI element.

## Compatibility
This plugin registers a custom context menu by overriding
`Blockly.configureContextMenu` in `init` in order to support the context menu
for emptying the Backpack.
If you also override `Blockly.configureContextMenu` after initializing this
plugin, you must also call the old `Blockly.configureContextMenu` function.
Example:
```
const prevConfigureContextMenu = workspace.configureContextMenu;
workspace.configureContextMenu = (menuOptions, e) => {
  prevConfigureContextMenu &&
      prevConfigureContextMenu.call(null, menuOptions, e);
  ...
}      
```

This plugin also currently only supports one Backpack per Workspace.

## License
Apache 2.0
