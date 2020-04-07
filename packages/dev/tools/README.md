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

```js
import Blockly from 'blockly';
import {toolboxSimple, toolboxCategories, DebugRenderer} from '@blockly/dev-tools';

Blockly.inject('blocklyDiv', {
  toolbox: toolboxCategories
});

// Initialize the debug renderer if you are making a custom renderer.
DebugRenderer.init();
```

## License

Apache 2.0
