# blockly-plugin-shortcut-menu [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) plugin that renders an interactive shortcut menu modal

## Installation

### Yarn

```
yarn add blockly-plugin-shortcut-menu
```

### npm

```
npm install blockly-plugin-shortcut-menu --save
```

## Usage

```js
import * as Blockly from "blockly";
import { Plugin } from "blockly-plugin-shortcut-menu";

// Inject Blockly.
const workspace = Blockly.inject("blocklyDiv", {
  toolbox: toolboxCategories,
});

// Initialize plugin and show plugin
const plugin = new ShortcutMenu(workspace);
plugin.init();
plugin.show();
```

## API

### Methods

- `init`: Create a modal.
- `dispose`: Dispose of the modal.
- `show`: Show the modal and focus on the first interactable element.
- `hide`: Hide the modal.
- `render`: Create all the dom elements for the modal.

## License

Apache 2.0
