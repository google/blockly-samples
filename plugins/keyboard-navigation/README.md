---
title: "@blockly/keyboard-navigation Demo"
packageName: "@blockly/keyboard-navigation"
description: "A Blockly plugin that adds keyboard navigation support."
version: "0.3.2"
pageRoot: "plugins/keyboard-navigation"
pages:
  - label: "Playground"
    link: "test/index"
  - label: "README"
    link: "README"

---
# @blockly/keyboard-navigation [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) plugin that adds keyboard
navigation to Blockly. This allows users to use the keyboard to navigate the
toolbox and the blocks. More information on keyboard navigation can be found
on our [keyboard navigation documentation page](https://developers.google.com/blockly/guides/configure/web/keyboard-nav).

## Installation

### Yarn
```
yarn add @blockly/keyboard-navigation
```

### npm
```
npm install @blockly/keyboard-navigation --save
```

## Usage
```js
import * as Blockly from 'blockly';
import {NavigationController} from '@blockly/keyboard-navigation';
// Inject Blockly.
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: toolboxCategories,
});
// Initialize plugin.
const navigationController = new NavigationController();
navigationController.init();
navigationController.addWorkspace(workspace);
// Turns on keyboard navigation.
navigationController.enable(workspace);
```

## API
This plugin exports the following classes:
- `NavigationController`: Class in charge of registering all keyboard shortcuts.
- `Navigation`: This holds all the functions necessary to navigate around Blockly using the keyboard.
- `FlyoutCursor`: Cursor in charge of navigating the flyout.
- `LineCursor`: Alternative cursor that tries to navigate blocks like lines of code.

You should only need to use these if you plan on changing the default functionality.

## License
Apache 2.0
