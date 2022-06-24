# blockly-plugin-suggested-blocks [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) plugin that suggests blocks for the user based on which blocks they've used already in the workspace.

## Installation

### Yarn
```
yarn add @blockly/suggested-blocks
```

### npm
```
npm install @blockly/suggested-blocks --save
```

## Usage
```js
import * as Blockly from 'blockly';
import {toolboxCategories} from '@blockly/dev-tools';
import * as SuggestedBlocks from '@blockly/suggested-blocks';

// TODO: either splice these into the toolboxCategories string or insert them where the categories are defined
const mostUsedCategory = '<category name="Frequently Used" custom="MOST_USED"></category>';
const recentlyUsedCategory = '<category name="Recently Used" custom="RECENTLY_USED"></category>';

// Inject Blockly.
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: toolboxCategories,
});

// Initialize the plugin
SuggestedBlocks.init(workspace);
```

## API

- `init`: Initializes the suggested blocks categories in the toolbox

## License
Apache 2.0
