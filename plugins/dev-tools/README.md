---
title: "@blockly/dev-tools Demo"
packageName: "@blockly/dev-tools"
description: "A library of common utilities for Blockly extension development."
pageRoot: "plugins/dev-tools"
pages:
  - label: "Playground"
    link: "test/index"
  - label: "README"
    link: "README"

---
# @blockly/dev-tools [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A library of helpful tools for Blockly development.

## Installation

```
npm install @blockly/dev-tools -D --save
```

## Usage

### Playground
The playground is a tremendously useful tool for debugging your Blockly project. As a preview, here is [one of the plugin playgrounds](https://google.github.io/blockly-samples/plugins/theme-modern/test/). The playground features are:
- All the default blocks
- All the language generators (JavaScript, Python, PHP, Lua, and Dart)
- Switch between different Blockly options (eg: rtl, renderer, readOnly, zoom and scroll)
- Switch between different toolboxes and themes
- Import and export programs, or generate code using one of the built-in generators
- Trigger programmatic actions (eg: Show/hide, Clear, Undo/Redo, Scale)
- A debug renderer
- Stress tests for the renderer
- Log all events in the console

```js
import {createPlayground} from '@blockly/dev-tools';

const defaultOptions = {
  ...
};
createPlayground(document.getElementById('blocklyDiv'), (blocklyDiv, options) => {
  return Blockly.inject(blocklyDiv, options);
}, defaultOptions);
```

This package also exports pieces of the playground (addGUIControls, addCodeEditor) if you'd rather build your own playground.

### Toolboxes
Blockly built-in Simple and Category toolboxes.

```js
import * as Blockly from 'blockly';
import {toolboxSimple, toolboxCategories} from '@blockly/dev-tools';

Blockly.inject('blocklyDiv', {
  toolbox: toolboxCategories
});
```

#### Test Toolbox

The test toolbox is re-exported in this package, but can be imported as a stand-alone through [@blockly/block-test](https://www.npmjs.com/package/@blockly/block-test). See the README for details.

### Helpers

#### `populateRandom`

The `populateRandom` function adds random blocks to a workspace. Blocks are selected from the full set of defined blocks. Pass in a worskpace and how many blocks should be created.
```js
import {populateRandom} from '@blockly/dev-tools';
// Add 10 random blocks to the workspace.
populateRandom(workspace, 10);
```

#### `spaghetti`

The `spaghetti` function is a renderer stress test that populates the workspace with nested if-statements. Pass in a worskpace and how deep the nesting should be.
```js
import {spaghetti} from '@blockly/dev-tools';
spaghetti(workspace, 8);
```

#### `generateFieldTestBlocks`

The `generateFieldTestBlocks` function automatically generates a number of field testing blocks for the passed-in field. This is useful for testing field plugins.

```js
import {generateFieldTestBlocks} from '@blockly/dev-tools';

const toolbox = generateFieldTestBlocks('field_template', [
  {
    'args': {
      'value': 0, // default value
    },
  },
]);
```

### Test Helpers

This package is also used in mocha tests, and exports a suite of useful test helpers.
You can find the full list of helpers [here](https://github.com/google/blockly-samples/blob/master/plugins/dev-tools/src/test_helpers.mocha.js).

### Debug Renderer
The debug renderer is a helpful tool to debug blocks when building a custom
renderer. It displays the different elements on a block such as the rows,
elements and connections shown below.

![A block showing the rows.](https://github.com/google/blockly-samples/raw/master/plugins/dev-tools/readme-media/DebuggerRows.png)
![A block showing the elements.](https://github.com/google/blockly-samples/raw/master/plugins/dev-tools/readme-media/DebuggerElements.png)
![A block showing the connections.](https://github.com/google/blockly-samples/raw/master/plugins/dev-tools/readme-media/DebuggerConnections.png)

If you want to use the debug a custom renderer with the playground, you can
simply set your renderer in the `defaultOptions` passed into `createPlayground`.
The debug renderer can then be turned on/off by toggling the 'debugEnabled'
option under the 'Debug' folder.

If you want to modify the rectangles that are drawn or you are not using the
playground, you can follow the example below.

```js
import {createNewRenderer, DebugDrawer} from '@blockly/dev-tools';

class CustomDebugDrawer extends DebugDrawer {
  // Add custom functionality here.
}

const DebugRenderer = createNewRenderer(YourCustomRenderer);
DebugRenderer.DebugDrawerClass = CustomDebugDrawer;
Blockly.blockRendering.register('debugRenderer', DebugRenderer);

Blockly.inject('blocklyDiv', {renderer: 'debugRenderer'});
```

### Logger
A lightweight workspace console logger. 

```js
import {logger} from '@blockly/dev-tools';

logger.enableLogger(workspace);
logger.disableLogger(workspace);
```

The logger is included by default in the playground.

## License
Apache 2.0
