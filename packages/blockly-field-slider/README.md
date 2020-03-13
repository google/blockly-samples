# @blockly/field-number-draf [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) slider field.

## Installation

### Yarn
```
yarn add @blockly/field-slider
```

### npm
```
npm install @blockly/field-slider --save
```

## Usage

### JavaScript
```js
import Blockly from 'blockly';
import FieldSlider from '@blockly/field-slider';
Blockly.Blocks["test_field_slider"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("slider: ")
      .appendField(new FieldSlider(50), "FIELDNAME")
  }
};
```
### JSON

```js
import Blockly from 'blockly';
import '@blockly/field-slider';
Blockly.defineBlocksWithJsonArray([
    {
        "type": "test_field_slider",
        "message0": "slider: %1",
        "args0": [
            {
                "type": "field_slider",
                "name": "FIELDNAME",
                "value": 50
            }
        ]
    }]);
```

[View the developer documentation](https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/date) for further usage examples.

## License

Apache 2.0