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

This field accepts up to 3 parameters:
  * "text" to specify the default text. Defaults to `""`.
  * "maxLines" to specify the maximum number of lines displayed before scrolling
    functionality is enabled. Defaults to `Infinity`.
  * "spellcheck" to specify whether spell checking is enabled. Defaults to
  `true`.

The multiline input field is a subclass of Blockly.FieldInput

### JavaScript
```js
import * as Blockly from 'blockly';
import {FieldMultilineInput} from '@blockly/field-multilineinput';

Blockly.Blocks["test_field_multilineinput"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("multilineinput: ")
      .appendField(
          new FieldMultilineInput("some text \n with newlines"),
          "FIELDNAME");
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
                "text": "some text \n with newlines"
            }
    }]);
```

### API reference

* `setMaxLines`: Sets the maximum number of displayed lines before
  scrolling functionality is enabled.
* `getMaxLines`: Returns the maximum number of displayed lines before
  scrolling functionality is enabled.
* `setSpellcheck`: Sets whether spell checking is enabled.
* `getSpellcheck`: Returns whether spell checking is enabled.

## License

Apache 2.0
