# @blockly/workspace-backpack [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) plugin that adds a Backpack to the workspace.

## Installation

### Yarn
```
yarn add @blockly/workspace-backpack
```

### npm
```
npm install @blockly/workspace-backpack --save
```

## Usage

```js
import * as Blockly from 'blockly';
import {Backpack} from '@blockly/workspace-backpack';

// Inject Blockly.
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: toolboxCategories,
});

// Initialize plugin.
const backpack = new Backpack(workspace);
backpack.init();
```

## API

- `init`: Initializes the backpack.
- `dispose`: Disposes of backpack.
- `getBoundingRectangle`: Returns the bounding rectangle of the UI element in
pixel units relative to the Blockly injection div.
- `position`: Positions the backpack UI element.
- `open`: Opens the backpack flyout.
- `close`: Closes the backpack flyout.

## License
Apache 2.0
