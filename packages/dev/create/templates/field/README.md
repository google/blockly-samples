# @blockly/field-template [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

<!--
  - TODO: Add field description.
  -->
A [Blockly](https://www.npmjs.com/package/blockly) ... field.

## Installation

### Yarn
```
yarn add @blockly/field-template
```

### npm
```
npm install @blockly/field-template --save
```

## Usage

<!--
  - TODO: Update usage.
  -->

### JavaScript
```js
import Blockly from 'blockly';
import Field from '@blockly/field-template';
Blockly.Blocks["test_field_template"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("template: ")
      .appendField(new Field(...), "FIELDNAME")
  }
};
```
### JSON

```js
import Blockly from 'blockly';
import '@blockly/field-template';
Blockly.defineBlocksWithJsonArray([
    {
        "type": "test_field_template",
        "message0": "slider: %1",
        "args0": [
            {
                "type": "field_template",
                "name": "FIELDNAME",
                "value": ...
            }
        ]
    }]);
```

## License

Apache 2.0
