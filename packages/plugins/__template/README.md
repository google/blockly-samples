<!--
  - TODO: Rename to the desired plugin name.
  -->
# @blockly/plugin-template [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

<!--
  - TODO: Add plugin description.
  -->
A [Blockly](https://www.npmjs.com/package/blockly) plugin that ...

## Installation

<!--
  - TODO: Rename to plugin name.
  -->
### Yarn
```
yarn add @blockly/plugin-template
```

### npm
```
npm install @blockly/plugin-template --save
```

## Usage

<!--
  - TODO: Update usage and rename to plugin name.
  -->
```js
import Blockly from 'blockly';
import {Plugin} from '@blockly/plugin-template';

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
