# @blockly/field-colour [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) colour field.

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

### JavaScript

```js
import * as Blockly from 'blockly';
import {FieldColour} from '@blockly/field-colour';
Blockly.Blocks['test_field_colour'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('colour: ')
      .appendField(new FieldColour('#ffcccc'), 'FIELDNAME');
  },
};
```

### JSON

```js
import * as Blockly from 'blockly';
import '@blockly/field-colour';
Blockly.defineBlocksWithJsonArray([
  {
    'type': 'test_field_colour',
    'message0': 'colour: %1',
    'args0': [
      {
        'type': 'field_colour',
        'name': 'FIELDNAME',
        'colour': '#ffcccc',
      },
    ],
  },
]);
```

### API Reference

- `setColours`: Sets the colour options, and optionally the titles for the
  options. The colourss should be an array of #rrggbb strings.
- `setColumns`: Sets the number of columns the dropdown should have.

## License

Apache 2.0
