---
title: "@blockly/suggested-blocks Demo"
packageName: "@blockly/suggested-blocks"
description: "A plugin that adds toolbox panes with suggested blocks based on the user's past usage of blocks."
pageRoot: "plugins/suggested-blocks"
pages:
  - label: "Playground"
    link: "test/index"
  - label: "README"
    link: "README"

---
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
  const mostUsedCategory = '<category name="Frequently Used" custom="MOST_USED"></category>';
  const recentlyUsedCategory = '<category name="Recently Used" custom="RECENTLY_USED"></category>';

  // This type of insertion works in a pinch, but you would more so want to add
  // the new categories wherever the rest of the categories are defined in the
  // project (e.g. HTML, or a dedicated file for all the categories)
  const indexToInsert = toolboxCategories.indexOf('</xml>');
  // Insert the new categories into the existing toolbox XML string
  return toolboxCategories.slice(0, indexToInsert) + mostUsedCategory + recentlyUsedCategory + toolboxCategories.slice(indexToInsert);
}

// Inject Blockly.
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: getNewCategories(),
});

// Initialize the plugin
SuggestedBlocks.init(workspace);
```

## API

- `init`: Initializes the suggested blocks categories in the toolbox

## License
Apache 2.0
