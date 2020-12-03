---
title: "@blockly/plugin-dot-to-dot Demo"
packageName: "@blockly/plugin-dot-to-dot"
description: "A Blockly plugin."
pageRoot: "plugins/dot-to-dot"
pages:
  - label: "Playground"
    link: "test/index"
  - label: "README"
    link: "README"

---
# @blockly/plugin-dot-to-dot [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

<!--
  - TODO: Edit plugin description.
  -->
A [Blockly](https://www.npmjs.com/package/blockly) plugin that ...

## Installation

### Yarn
```
yarn add @blockly/plugin-dot-to-dot
```

### npm
```
npm install @blockly/plugin-dot-to-dot --save
```

## Usage

<!--
  - TODO: Update usage.
  -->
```js
import * as Blockly from 'blockly';
import {Plugin} from '@blockly/plugin-dot-to-dot';

// Inject Blockly.
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: toolboxCategories,
});

// Initialize plugin.
const plugin = new Plugin(workspace);
plugin.init();
```

## API

<!--
  - TODO: describe the API.
  -->

## License
Apache 2.0
