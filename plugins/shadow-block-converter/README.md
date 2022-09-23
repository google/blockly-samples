# @blockly/shadow-block-converter [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) plugin for automatically converting shadow blocks to real blocks when the user edits them.

## Installation

### Yarn
```
yarn add @blockly/shadow-block-converter
```

### npm
```
npm install @blockly/shadow-block-converter --save
```

## Usage
This plugin exports a function called `shadowBlockConversionChangeListener`. If
you add it as a change listener to your blockly workspace then any shadow block
the user edits will be converted to a real block. See below for an example using
it with a workspace.

### JavaScript

```js
import * as Blockly from 'blockly';
import {shadowBlockConversionChangeListener} from '@blockly/shadow-block-converter';

function start() {
  const workspace = Blockly.inject('blocklyDiv', {toolbox: toolbox});
  workspace.addChangeListener(shadowBlockConversionChangeListener);
}
```

## License

Apache 2.0
