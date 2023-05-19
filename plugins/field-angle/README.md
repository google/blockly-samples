# @blockly/field-angle [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) angle field.

## Installation

### Yarn
```
yarn add @blockly/field-angle
```

### npm
```
npm install @blockly/field-angle --save
```

## Usage
See the [Blockly Angle Field documentation](https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/angle) on what parameters and configurations this field supports.

### JavaScript
```js
import * as Blockly from 'blockly';
import {FieldAngle} from '@blockly/field-angle';
Blockly.Blocks["test_field_angle"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("angle: ")
      .appendField(new FieldAngle(90), "FIELDNAME");
  }
};
```

### JSON
```js
import * as Blockly from 'blockly';
import '@blockly/field-angle';
Blockly.defineBlocksWithJsonArray([
    {
        "type": "test_field_angle",
        "message0": "angle: %1",
        "args0": [
            {
                "type": "field_angle",
                "name": "FIELDNAME",
                "value": 50
            }
        ]
    }]);
```

## License

Apache 2.0
