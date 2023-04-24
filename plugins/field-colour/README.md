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
See the [Blockly Colour Input Field documentation](https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/colour) on what parameters and configurations this field supports.


### JavaScript
```js
import * as Blockly from 'blockly';
import {FieldColour} from '@blockly/field-colour';
Blockly.Blocks["test_field_colour"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("colour: ")
      .appendField(new FieldColour(90), "FIELDNAME");
  }
};
```

### JSON
```js
import * as Blockly from 'blockly';
import '@blockly/field-colour';
Blockly.defineBlocksWithJsonArray([
    {
        "type": "test_field_colour",
        "message0": "colour: %1",
        "args0": [
            {
                "type": "field_colour",
                "name": "FIELDNAME",
                "value": 50
            }
        ]
    }]);
```

## License

Apache 2.0
