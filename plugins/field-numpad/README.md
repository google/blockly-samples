# blockly-field-numpad [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) numpad field.

## Installation

### Yarn
```
yarn add @blockly/field-numpad
```

### npm
```
npm install @blockly/field-numpad --save
```

## Usage
This field is an extension of the Blockly.FieldNumber field. See the [Blockly.FieldNumber documentation](https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/number#creation) on what parameters and configurations this field supports.

### JavaScript
```js
import * as Blockly from 'blockly';
import {FieldNumpad} from '@blockly/field-numpad';
Blockly.Blocks["test_field_numpad"] = {
    init: function () 
        {
            this.appendDummyInput()
                .appendField('numpad: ')
                .appendField(new FieldNumpad(50), "FIELDNAME");
        }
};
```
### JSON

```js
import * as Blockly from 'blockly';
import '@blockly/field-numpad';
Blockly.defineBlocksWithJsonArray([
    {
        "type": "test_field_numpad",
        "message0": "numpad: %1",
        "args0": [
            {
                "type": "field_numpad",
                "name": "FIELDNAME",
                "value": 50,
            }
        ]
    }]);
```

## License

Apache 2.0
