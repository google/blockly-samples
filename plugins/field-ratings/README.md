# @blockly/field-ratings [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) ratings field with star
ratings rendered inline on the block.

## Installation

### Yarn
```
yarn add @blockly/field-ratings
```

### npm
```
npm install @blockly/field-ratings --save
```

## Usage

### JavaScript

```js
import * as Blockly from 'blockly';
import {FieldRatings} from '@blockly/field-ratings';
Blockly.Blocks["test_field_ratings"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("rating: ")
      .appendField(new FieldRatings(...), "FIELDNAME")
  }
};
```
### JSON

```js
import * as Blockly from 'blockly';
import '@blockly/field-ratings';
Blockly.defineBlocksWithJsonArray([
    {
        "type": "test_field_ratings",
        "message0": "rating: %1",
        "args0": [
            {
                "type": "field_ratings",
                "name": "FIELDNAME",
                "value": ...
            }
        ]
    }]);
```

## License

Apache 2.0
