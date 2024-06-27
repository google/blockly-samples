# @blockly/field-multilineinput [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) multilineinput field and associated block.

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

### Field

This field accepts up to 3 parameters:

- "text" to specify the default text. Defaults to `""`.
- "maxLines" to specify the maximum number of lines displayed before scrolling
  functionality is enabled. Defaults to `Infinity`.
- "spellcheck" to specify whether spell checking is enabled. Defaults to
  `true`.

The multiline input field is a subclass of Blockly.FieldInput

If you want to use only the field, you must register it with Blockly. You can
do this by calling `registerFieldMultilineInput` before instantiating your
blocks. If another field is registered under the same name, this field will
overwrite it.

### JavaScript

```js
import * as Blockly from 'blockly';
import {registerFieldMultilineInput} from '@blockly/field-multilineinput';

registerFieldMultilineInput();
Blockly.Blocks['test_field_multilineinput'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('multilineinput: ')
      .appendField(
        new FieldMultilineInput('some text \n with newlines'),
        'FIELDNAME',
      );
  },
};
```

### JSON

```js
import * as Blockly from 'blockly';
import {registerFieldMultilineInput} from '@blockly/field-multilineinput';

registerFieldMultilineInput();
Blockly.defineBlocksWithJsonArray([
    {
        "type": "test_field_multilinetext",
        "message0": "multilineinput: %1",
        "args0": [
            {
                "type": "field_multilinetext",
                "name": "FIELDNAME",
                "text": "some text \n with newlines"
            }
    }]);
```

### Blocks

This package also provides a simple block containing a multiline input
field. It has generators in JavaScript, Python, PHP, Lua, and Dart.

You can install the block by calling `textMultiline.installBlock()`.
This will install the block and all of its dependencies, including the
multiline input field. When calling `installBlock` you can supply one or
more `CodeGenerator` instances (e.g. `javascriptGenerator`), and the install
function will also install the correct generator function for the
corresponding language(s).

```js
import {javascriptGenerator} from 'blockly/javascript';
import {dartGenerator} from 'blockly/dart';
import {phpGenerator} from 'blockly/php';
import {pythonGenerator} from 'blockly/python';
import {luaGenerator} from 'blockly/lua';
import {textMultiline} from '@blockly/field-multilineinput';

// Installs the block, the field, and all of the language generators.
textMultiline.installBlock({
  javascript: javascriptGenerator,
  dart: dartGenerator,
  lua: luaGenerator,
  python: pythonGenerator,
  php: phpGenerator,
});
```

### API reference

- `setMaxLines`: Sets the maximum number of displayed lines before
  scrolling functionality is enabled.
- `getMaxLines`: Returns the maximum number of displayed lines before
  scrolling functionality is enabled.
- `setSpellcheck`: Sets whether spell checking is enabled.
- `getSpellcheck`: Returns whether spell checking is enabled.

## License

Apache 2.0
