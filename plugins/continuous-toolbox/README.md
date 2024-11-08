# @blockly/continuous-toolbox [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) plugin that creates a continuous-scrolling style toolbox/flyout that is always open. All of the blocks from all categories are in the flyout together, and the user can either click a category name in the toolbox or scroll to the category they're looking for. This flyout only works as a vertical flyout and it works in both left-to-right and right-to-left modes. Parts of the toolbox style have been changed already, but you can customize the style further by following the [toolbox documentation](https://developers.google.com/blockly/guides/configure/web/toolbox).

![Screenshot of continuous toolbox showing multiple categories of blocks in the flyout at once](https://github.com/google/blockly-samples/blob/master/plugins/continuous-toolbox/screenshot.png?raw=true)
The continuous toolbox is shown here with the 'Zelos' theme, and the style can be further customized.

## Installation

### Yarn

```
yarn add @blockly/continuous-toolbox
```

### npm

```
npm install @blockly/continuous-toolbox --save
```

## Usage

Import and call the `registerContinuousToolbox()` function before injecting
Blockly. This style of flyout works best with a toolbox definition that does
not use collapsible categories.

Note that this plugin uses APIs introduced in the `v12` release of Blockly, so
you will need to use at least this version or higher.

```js
import * as Blockly from 'blockly';
import {registerContinuousToolbox} from '@blockly/continuous-toolbox';

// Inject Blockly.
registerContinuousToolbox();
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: toolboxCategories,
  plugins: {
    flyoutsVerticalToolbox: 'ContinuousFlyout',
    metricsManager: 'ContinuousMetrics',
    toolbox: 'ContinuousToolbox',
  },
  // ... your other options here ...
});
```

## License

Apache 2.0
