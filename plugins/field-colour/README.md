# @blockly/field-colour [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) colour field and blocks that use it.

## Installation

### Yarn

```
yarn add @blockly/field-colour
```

### npm

```
npm install @blockly/field-colour --save
```

## Usage

### Field

This field accepts up to 4 parameters:

- "colour" to specify the default colour. Defaults to the first value in the
  "colourOptions" array. Should be a "#rrggbb" string.
- "colourOptions" to specify the colour options in the dropdown. Defaults to
  a set of 70 colors, including grays, reds, oranges, yellows, olives, greens,
  turquoises, blues, purples, and violets. Should be "#rrggbb" strings.
- "colourTitles" to specify the tooltips for the colour options. Defaults to
  the "#rrggbb" values of the provided colour options.
- "columns" to specify the number of columns the colour dropdown should have.
  Defaults to 7.

If you want to use only the field, you must install it by calling `registerFieldColour` before instantiating your blocks. If another field is registered under the same name, this field will overwrite it.

#### JavaScript

```js
import * as Blockly from 'blockly';
import {FieldColour} from '@blockly/field-colour';

FieldColour.registerFieldColour();
Blockly.Blocks['test_field_colour'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('colour: ')
      .appendField(new FieldColour('#ffcccc'), 'FIELDNAME');
  },
};
```

#### JSON

```js
import * as Blockly from 'blockly';
import '@blockly/field-colour';

FieldColour.registerFieldColour();
Blockly.defineBlocksWithJsonArray([
  {
    type: 'test_field_colour',
    message0: 'colour: %1',
    args0: [
      {
        type: 'field_colour',
        name: 'FIELDNAME',
        colour: '#ffcccc',
      },
    ],
  },
]);
```

### Blocks

This package also provides four blocks related to the colour field. Each block has generators in JavaScript, Python, PHP, Lua, and Dart.
- "colour_blend" takes in two colours and a ratio and outputs a single colour.
- "colour_picker" is a simple block with just the colour field and an output.
- "colour_random" generates a random colour.
- "colour_rgb" generates a colour based on red, green, and blue values.

You can install all four blocks by calling `FieldColour.installAllBlocks()`. This will install the blocks and all of their dependencies, including the colour field. You can choose which language generators to install by adding or removing items in the map of generators passed to `installAllBlocks`.

```js
import { javascriptGenerator } from 'blockly/javascript';
import { dartGenerator } from 'blockly/dart';
import { phpGenerator } from 'blockly/php';
import { pythonGenerator } from 'blockly/python';
import { luaGenerator } from 'blockly/lua';
import { FieldColour } from '@blockly/field-colour';

// Installs all four blocks, the colour field, and all of the language generators.
FieldColour.installAllBlocks({
  javascript: javascriptGenerator,
  dart: dartGenerator,
  lua: luaGenerator,
  python: pythonGenerator,
  php: phpGenerator
});
```

If you only want to install a single block, you can call that block's `install` function. The `generators` parameter is the same.


```js
import { javascriptGenerator } from 'blockly/javascript';
import { FieldColour } from '@blockly/field-colour';

// Installs the colour_blend block, the colour field, 
// and the generator for colour_blend in JavaScript.
FieldColour.colourBlend.installBlock({
  javascript: javascriptGenerator,
});
```

### API Reference

- `setColours`: Sets the colour options, and optionally the titles for the
  options. The colourss should be an array of #rrggbb strings.
- `setColumns`: Sets the number of columns the dropdown should have.


## License

Apache 2.0
