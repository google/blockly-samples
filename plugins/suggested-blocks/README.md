# @blockly/suggested-blocks [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

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

function getNewCategories() {
  const mostUsedCategory = {
    kind: 'category',
    name: 'Frequently Used',
    custom: 'MOST_USED'
  };
  const recentlyUsedCategory = {
    kind: 'category',
    name: 'Recently Used',
    custom: 'RECENTLY_USED'
  };
  
  // Insert the new categories into the existing toolboxCategories array
  return [
    ...toolboxCategories.slice(0, -1),
    mostUsedCategory,
    recentlyUsedCategory,
    toolboxCategories.slice(-1)
  ];
}

// Define the toolbox as a JSON object
const toolbox = {
  kind: 'categoryToolbox',
  categories: getNewCategories()
};

// Inject Blockly.
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: toolbox,
});

// Initialize the plugin
SuggestedBlocks.init(workspace);

```

## API

- `init`: Initializes the suggested blocks categories in the toolbox

## License
Apache 2.0
