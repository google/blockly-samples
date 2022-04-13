# @blockly/block-extension-tooltip [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) block extension that adds
support for custom tooltip rendering.

WARNING: This plugin is **deprecated**. It is not compatible with recent versions of Blockly (v7.20211209.0 or above). As of Blockly v8, this plugin is no longer necessary as Blockly supports [custom tooltip rendering](https://developers.google.com/blockly/guides/create-custom-blocks/define-blocks#customizing). For an example, see the [custom tooltip demo](https://google.github.io/blockly-samples/examples/custom-tooltips-demo/). Please uninstall this plugin and update Blockly to v8 or above. This plugin may be removed in the future.

Note:
- This plugin uses a [block extension](https://developers.google.com/blockly/guides/create-custom-blocks/extensions)
and as a result, it needs to be added to each block type. See [test/index.ts](https://github.com/google/blockly-samples/tree/master/plugins/block-extension-tooltip/test/index.ts)
- This plugin is monkeypatching Blockly. It is not guaranteed to continue to function.

## Installation

### Yarn
```
yarn add @blockly/block-extension-tooltip
```

### npm
```
npm install @blockly/block-extension-tooltip --save
```

## Usage

![](https://github.com/google/blockly-samples/raw/master/plugins/block-extension-tooltip/readme-media/CustomTooltip.png)

### Register

Register the tooltip extension:

```js
import * as Blockly from 'blockly';
import {registerTooltipExtension} from '@blockly/block-extension-tooltip';

registerTooltipExtension((block) => {
  // Custom tooltip rendering method.
  const el = document.createElement('div');
  el.className = 'my-custom-tooltip';
  el.textContent = block.getTooltip();
  return el;
}, 'custom-tooltip-extension');
```

### Block definition

Add the extension to your block definition using JSON:

```js
Blockly.defineBlocksWithJsonArray([
  {
    "type": "my-block",
    "extensions": ["custom-tooltip-extension"]
  }
]);
```

or add the extension to your block definition using JavaScript:

```js
Blockly.Blocks['my-block'] = {
  init: function() {
    Blockly.Extensions.apply('custom-tooltip-extension', this, false);
  },
};
```

## License
Apache 2.0
