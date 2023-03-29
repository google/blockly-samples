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

- `init`: Initializes the suggested blocks categories in the toolbox. Takes several arguments:
  - `workspace`: The workspace to use the plugin with. If you have multiple
    workspaces, you need to register the plugin for each workspace separately,
    and the stats will be tracked separately.
  - `numBlocksPerCategory` (optional): The maximum number of blocks to show in
    each category. Defaults to 10.
  - `waitForFinishedLoading` (optional): Whether to wait for the
    [`Blockly.Events.FinishedLoading` event](https://developers.google.com/blockly/reference/js/blockly.events_namespace.finishedloading_class.md)
    before taking action on any new `BlockCreate` events. If you disable event
    firing while you load the initial state of the workspace, you'll need to set
    this to `false`, or the plugin will never place blocks in either category.
    By default, this value is `true`, so that events fired while loading initial
    serialized state do not affect the statistics.

## License
Apache 2.0
