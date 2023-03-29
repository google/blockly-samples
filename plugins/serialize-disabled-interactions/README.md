# @blockly/plugin-serialize-disabled-interactions [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) plugin for the JSON
serialization system that serializes blocks which are not deletable,
movable, or editable.

## When to use

### For Blockly versions >= v9.3.0

This plugin is being deprecated, because serializing these disabled-interaction
attributes is now handled by core in versions of Blockly >= v9.3.0.

If you had previously used this plugin to serialize workspaces, you should use
v3.0 of the plugin. This version will deserialize the old saves, but it will no
longer serialize the disabled properties (since that is now handled by core).
Once all  of your saves have been "cleaned" you can safely remove your use of
this plugin.

### For Blockly versions < v9.3.0

This plugin was created because the old XML serialization system supported
serializing these disabled-interaction attributes, but the new JSON system did
not (for versions of Blockly < v9.3.0). For more information about why this
was, see [this forum post](https://groups.google.com/g/blockly/c/eP9PXVfCaHs/m/S4rPmwnTAQAJ).

In v9.3.0 this was changed to fix https://github.com/google/blockly/issues/6793.

It is **strongly** recommended that instead of using this plugin, you upgrade
to a version of Blockly >= v9.3.0. However if that is not possible, you can use
this plugin to serialize these disabled-interaction attributes.

See the "Usage for Blockly versions < v9.3.0" section below for more
information.


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

## Usage for Blockly < v9.3.0

Suppose:
  1) You have the following block defined in XML
  2) You would like to migrate to the JSON system.
  3) You cannot update to a version of Blockly >= v9.3.0

```xml
<block type="my_start_block" deletable="false" movable="false" editable="false"/>
```

To solve for this, you can import this plugin and then change your JSON to look
like the following:
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
