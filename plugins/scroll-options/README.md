---
title: "@blockly/plugin-scroll-options Demo"
packageName: "@blockly/plugin-scroll-options"
description: "A Blockly plugin that adds advanced scroll options such as scroll-on-drag and scroll while holding a block."
pageRoot: "plugins/scroll-options"
pages:
  - label: "Playground"
    link: "test/index"
  - label: "README"
    link: "README"

---
# blockly-plugin-scroll-options [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

<!--
  - TODO: Edit plugin description.
  -->
A [Blockly](https://www.npmjs.com/package/blockly) plugin that adds additional scroll features.

## Installation

### Yarn
```
yarn add blockly-plugin-scroll-options
```

### npm
```
npm install blockly-plugin-scroll-options --save
```

## Usage

<!--
  - TODO: Update usage.
  -->
```js
import * as Blockly from 'blockly';
import {Plugin} from 'blockly-plugin-scroll-options';

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
