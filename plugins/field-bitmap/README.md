---
title: "@blockly/field-bitmap Demo"
packageName: "@blockly/field-bitmap"
description: "A field that lets users input a pixel grid with their mouse."
pageRoot: "plugins/field-bitmap"
pages:
  - label: "Playground"
    link: "test/index"
  - label: "README"
    link: "README"

---
# @blockly/field-bitmap [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) field that allows for user-inputted pixel grids. The image value is stored as a 2D array of 1s and 0s, and supports any size. The user can paint over pixels with their mouse, or randomize the grid.

Note: this field does not support serialization to XML.

## Installation

### Yarn
```
yarn add @blockly/field-bitmap
```

### npm
```
npm install @blockly/field-bitmap --save
```

## Usage

This field accepts up to 3 parameters:
- `"value"` to specify an initial value. Must be a 2D rectangular array of 1s and 0s.
If not provided, the default is an empty grid of the specified size.
- `"width"` to specify an initial width, if there is no initial value.
If not provided, the default is a width of 5.
- `"height"` to specify an initial height, if there is no initial value.
If not provided, the default is a height of 5.

### JavaScript
```js
import * as Blockly from 'blockly';
import {FieldBitmap} from 'blockly-field-bitmap';
Blockly.Blocks["test_field_bitmap"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("bitmap: ")
      .appendField(new FieldBitmap(...), "FIELDNAME");
  }
};
```
### JSON

Example with default value:
```js
import * as Blockly from 'blockly';
import '@blockly/field-bitmap';
Blockly.defineBlocksWithJsonArray([
    {
        "type": "test_field_bitmap",
        "message0": "bitmap: %1",
        "args0": [
            {
                "type": "field_bitmap",
                "name": "FIELDNAME",
                "value": [
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 1, 1, 0, 1, 1, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 1, 1, 1, 1, 1, 0],
                    [0, 1, 0, 0, 0, 1, 0],
                    [0, 0, 1, 1, 1, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                ],
            }
        ]
    }]);
```

Example with width and height:
```js
import * as Blockly from 'blockly';
import '@blockly/field-bitmap';
Blockly.defineBlocksWithJsonArray([
    {
        "type": "test_field_bitmap",
        "message0": "bitmap: %1",
        "args0": [
            {
                "type": "field_bitmap",
                "name": "FIELDNAME",
                "width": 8,
                "height": 8
            }
        ]
    }]);
```

## License

Apache 2.0
