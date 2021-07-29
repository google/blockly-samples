---
title: "blockly-plugin-workspace-minimap Demo"
packageName: "blockly-plugin-workspace-minimap"
description: "A Blockly plugin."
pageRoot: "plugins/workspace-minimap"
pages:
  - label: "Playground"
    link: "test/index"
  - label: "README"
    link: "README"

---
# blockly-plugin-workspace-minimap [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

<!--
  - TODO: Edit plugin description.
  -->
A [Blockly](https://www.npmjs.com/package/blockly) plugin that ...

## Installation

### Yarn
```
yarn add blockly-plugin-workspace-minimap
```

### npm
```
npm install blockly-plugin-workspace-minimap --save
```

## Usage

<!--
  - TODO: Update usage.
  -->
```js
import * as Blockly from 'blockly';
import {Plugin} from 'blockly-plugin-workspace-minimap';

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
