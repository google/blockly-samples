# @blockly/block-extension-tooltip [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) block extension that adds
support for custom tooltip rendering.

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
});
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
    Blockly.Extensions.apply('custom-tooltip-extension', this, true);
  },
};
```

## License
Apache 2.0
