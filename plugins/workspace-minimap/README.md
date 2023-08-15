# @blockly/workspace-minimap [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) plugin that adds a minimap to the workspace. A minimap is a miniature version of your blocks that appears on top of your main workspace. This gives you an overview of what your code looks like, and how it is organized.

## Installation

### Yarn
```
yarn add @blockly/workspace-minimap
```

### npm
```
npm install @blockly/workspace-minimap --save
```

## Usage
### Positioned Minimap
A positioned minimap is an embedded component that lies on top of the primary workspace.

```js
import * as Blockly from 'blockly';
import {PositionedMinimap} from '@blockly/workspace-minimap';

// Inject Blockly.
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: toolboxCategories,
});

// Initialize plugin.
const minimap = new PositionedMinimap(workspace);
minimap.init();
```

### Unpositioned Minimap
A raw minimap is an embedded component in the primary workspace that lays on top of the workspace.

```js
import * as Blockly from 'blockly';
import {Minimap} from '@blockly/workspace-minimap';

// Inject Blockly.
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: toolboxCategories,
});

// Initialize plugin.
const minimap = new PositionedMinimap(workspace);
minimap.init();
```

### Configuration
This plugin takes an optional configuration object...

## API

API description coming soon...
- `init`: Initializes the minimap.
- `dispose`: Disposes of minimap.

- `position`: Positions the minimap UI element.
- `getBoundingRectangle`: Returns the bounding rectangle of the UI element in
pixel units relative to the Blockly injection div.

- `isFocusEnabled`: Returns whether the focus region is enabled.
- `enableFocusRegion`: Turns on the focus region in the minimap.
- `disableFocusRegion`: Turns off the focus region in the minimap.

## License
Apache 2.0
