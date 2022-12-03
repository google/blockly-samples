# @blockly/field-time [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) time picker field that uses [HTML time input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/time)

## Installation

### Yarn
```
yarn add @blockly/field-time
```

### npm
```
npm install @blockly/field-time --save
```

## Usage

### JavaScript
```js
import * as Blockly from 'blockly';
import FieldDate from '@blockly/field-time';

Blockly.Blocks["test_fields_time"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("time: ")
      .appendField(new FieldTime("12:00"), "FIELDNAME");
  }
};
```
### JSON

```js
import * as Blockly from 'blockly';
import '@blockly/field-time';

Blockly.defineBlocksWithJsonArray([
    {
        "type": "test_fields_time",
        "message0": "time: %1",
        "args0": [
            {
                "type": "field_time",
                "name": "FIELDNAME",
                "time": "12:00"
            }
        ]
    }]);
```

## License

Apache 2.0
