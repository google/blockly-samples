# @blockly/dev-tools [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A library of common utilities for Blockly extension development.
- `toolboxSimple`: XML for an always-open flyout with no categories.
- `toolboxCategories`: XML for a toolbox with multiple categories and all of the default blocks.
- `DebugRenderer`: A visualizer for debugging custom renderers.

## Installation

```
npm install @blockly/dev-tools -D --save
```

## Usage

### Toolboxes
Blockly built-in Simple and Category toolboxes.

```js
import * as Blockly from 'blockly';
import {toolboxSimple, toolboxCategories} from '@blockly/dev-tools';

Blockly.inject('blocklyDiv', {
  toolbox: toolboxCategories
});
```

### Debug Renderer
The debug renderer is a helpful tool to debug blocks when building a custom renderer.

```js
import {DebugRenderer} from '@blockly/dev-tools';
// Initialize the debug renderer.
DebugRenderer.init();
```

### GUI Controls
Add GUI controls to adjust Blockly workspace options with a dat.GUI interface.

```js
import {addGUIControl} from '@blockly/dev-tools';
const defaultOptions = {
  ...
};
addGUIControl((options) => {
  return Blockly.inject('blocklyDiv', options);
}, defaultOptions);
```

## License
Apache 2.0
