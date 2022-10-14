---
title: "@blockly/block-test Demo"
packageName: "@blockly/block-test"
description: "A group of Blockly test blocks."
version: "3.0.1"
pageRoot: "plugins/block-test"
pages:
  - label: "Playground"
    link: "test/index"
  - label: "README"
    link: "README"

---
# @blockly/block-test [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A set of [Blockly](https://www.npmjs.com/package/blockly) test blocks.

## Installation

### Yarn
```
yarn add @blockly/block-test
```

### npm
```
npm install @blockly/block-test --save
```

## Usage

### Import
```js
import * as Blockly from 'blockly';
import {toolboxTestBlocks, toolboxTestBlocksInit} from '@blockly/block-test';

// Configure the Blockly workspace to use the test block's toolbox.
const workspace = Blockly.inject('blocklyDiv', {
  ...options
  toolbox: toolboxTestBlocks,
});

// Initalize the test block's toolbox.
toolboxTestBlocksInit(workspace);
```

## License
Apache 2.0
