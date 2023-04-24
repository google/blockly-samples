# @blockly/field-multilineinput [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) multilineinput field.

## Installation

### Yarn
```
yarn add @blockly/field-multilineinput
```

### npm
```
npm install @blockly/field-multilineinput --save
```

## Usage
See the [Blockly Multiline Text Input Field documentation](https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/multiline-text-input) on what parameters and configurations this field supports.

### JavaScript
```js
import * as Blockly from 'blockly';
import {FieldMultilineInput} from '@blockly/field-multilineinput';
Blockly.Blocks["test_field_multilineinput"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("multilineinput: ")
      .appendField(new FieldMultilineInput(90), "FIELDNAME");
  }
};
```

### JSON
```js
import * as Blockly from 'blockly';
import '@blockly/field-multilineinput';
Blockly.defineBlocksWithJsonArray([
    {
        "type": "test_field_multilineinput",
        "message0": "multilineinput: %1",
        "args0": [
            {
                "type": "field_multilineinput",
                "name": "FIELDNAME",
                "value": 50
            }
        ]
    }]);
```

## License

Apache 2.0
