---
title: "@blockly/plugin-serialize-disabled-interactions Demo"
packageName: "@blockly/plugin-serialize-disabled-interactions"
description: "A Blockly plugin that serializes the deletable, movable, and editable attribues of blocks."
pageRoot: "plugins/serialize-disabled-interactions"
pages:
  - label: "Playground"
    link: "test/index"
  - label: "README"
    link: "README"

---
# @blockly/plugin-serialize-disabled-interactions [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) plugin for the JSON
serialization system that serializes blocks which are not deletable,
movable, or editable.

## Installation

### Yarn
```
yarn add @blockly/plugin-serialize-disabled-interactions
```

### npm
```
npm install @blockly/plugin-serialize-disabled-interactions --save
```

## Usage

```js
// Import plugin to get side effects.
import '@blockly/plugin-serialize-disabled-interactions';

// Information about which blocks are not deletable/movable/editable will
// automatically be included because of the above import.
var state = Blockly.serialization.workspace.save(myWorkspace);
```

The resultant JSON will look like this:
```json
{
  "blocks": { /* block state */ },
  "disabledInteractions": {
    "notDeletable": [ /* block ids */ ],
    "notMovable": [ /* block ids */ ],
    "notEditable": [ /* block ids */ ],
  }
}
```

All of the keys are optional. For example, if all of the blocks on the workspace
are deletable, the `'notDeletable'` key will be undefined. If all of the keys
are undefined, then the `'disabledInteractions`' key is also undefined.

## Migration Guide

This plugin was created because the old XML serialization system supported
serializing these attributes, but the new JSON system does not. For more
information about why this is, see [this forum post](https://groups.google.com/g/blockly/c/eP9PXVfCaHs/m/S4rPmwnTAQAJ).

Usually these values don't need to be serialized. Instead you can just set these
attributes in your block definition:
```javascript
Blockly.Blocks['my_start_block'] = {
  init: function() {
    // Your normal init code...
    this.setDeletable(false);
    this.setMovable(false);
    this.setEditable(false);
  }
}
```

However, sometimes you want a block type that is sometimes
deletable/movable/editable and othertimes not. For example in [Blockly Games](https://blockly.games/)
they have blocks that start off as not-deletable, and then as you progress
through levels they become deletable. This plugin faciliates that.

Suppose you have the following block defined in XML, and you would like to
migrate to the JSON system (which is completely optional).
```xml
<block type="my_start_block" deletable="false" movable="false" editable="false"/>
```

You can either modify the `'my_start_block'`'s definition (as specified above),
or you can import this plugin and then change your JSON to look like the
following:
```javascript
import '@blockly/plugin-serialize-disabled-interactions';

const json = {
  'blocks': {
    'languageVersion': 0,
    'blocks': [
      {
        'type': 'my_start_block',
        'id': 'start_block_id'
      }
    ]
  },
  'disabledInteractions': {
    'notDeletable': ['start_block_id'],
    'notMovable': ['start_block_id'],
    'notEditable': ['start_block_id']
  }
}
```

Any questions about how this works can be directed to the [forums](https://groups.google.com/g/blockly).

## License
Apache 2.0
