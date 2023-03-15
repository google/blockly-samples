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

// Define the new categories in JSON format
const mostUsedCategory = {
  custom: 'MOST_USED',
  name: 'Frequently Used',
  blocks: []
};

const recentlyUsedCategory = {
  custom: 'RECENTLY_USED',
  name: 'Recently Used',
  blocks: []
};

// Add the new categories to the existing categories list
const categories = [
  ...toolboxCategories,
  mostUsedCategory,
  recentlyUsedCategory
];

// Convert the categories to XML
const toolboxXml = Blockly.utils.xml.createElement('xml');
categories.forEach(category => {
  if (typeof category === 'string') {
    const xml = Blockly.utils.xml.textToDom(category);
    toolboxXml.appendChild(xml);
  } else {
    const categoryXml = Blockly.utils.xml.createElement('category');
    categoryXml.setAttribute('custom', category.custom);
    categoryXml.setAttribute('name', category.name);
    category.blocks.forEach(block => {
      const blockXml = Blockly.utils.xml.createElement('block');
      blockXml.setAttribute('type', block.type);
      categoryXml.appendChild(blockXml);
    });
    toolboxXml.appendChild(categoryXml);
  }
});

// Inject Blockly.
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: toolboxXml,
});

// Initialize the plugin
SuggestedBlocks.init(workspace);

```

## API

- `init`: Initializes the suggested blocks categories in the toolbox

## License
Apache 2.0
