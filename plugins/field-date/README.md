---
title: "@blockly/field-date Demo"
packageName: "@blockly/field-date"
description: "A Blockly date picker field that uses the Google Closure date picker."
version: "6.0.2"
pageRoot: "plugins/field-date"
pages:
  - label: "Playground"
    link: "test/index"
  - label: "README"
    link: "README"

---
# @blockly/field-date [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) date picker field that uses the Google Closure date picker ([goog.ui.DatePicker](https://google.github.io/closure-library/source/closure/goog/demos/)).

## Installation

### Yarn
```
yarn add @blockly/field-date
```

### npm
```
npm install @blockly/field-date --save
```

## Usage

### JavaScript
```js
import * as Blockly from 'blockly';
import FieldDate from '@blockly/field-date';

Blockly.Blocks["test_fields_date"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("date: ")
      .appendField(new FieldDate("2020-02-20"), "FIELDNAME");
  }
};
```
### JSON

```js
import * as Blockly from 'blockly';
import '@blockly/field-date';

Blockly.defineBlocksWithJsonArray([
    {
        "type": "test_fields_date",
        "message0": "date: %1",
        "args0": [
            {
                "type": "field_date",
                "name": "FIELDNAME",
                "date": "2020-02-20"
            }
        ]
    }]);
```

[View the developer documentation](https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/date) for further usage examples.

## License

Apache 2.0
