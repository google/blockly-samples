---
title: "@blockly/block-dynamic-connection Demo"
packageName: "@blockly/block-dynamic-connection"
description: "A group of blocks that add connections dynamically."
pageRoot: "plugins/block-dynamic-connection"
pages:
  - label: "Playground"
    link: "test/index"
  - label: "README"
    link: "README"

---
# @blockly/block-dynamic-connection [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A group of [Blockly](https://www.npmjs.com/package/blockly) blocks that
add and remove connections dynamically.

## Installation
```
npm install @blockly/block-dynamic-connection --save
```

## Usage

```js
import * as Blockly from 'blockly';
import * as BlockDynamicConnection from '@blockly/block-dynamic-connection';
```

## API
- `overrideOldBlockDefinitions`: Replaces the Blockly default blocks with the
  dynamic connection blocks. This enables projects to use the dynamic block
  plugin without changing existing XML.

## XML
```xml
<block type="dynamic_text_join"></block>
<block type="dynamic_list_create"></block>
<block type="dynamic_if"></block>
```

## License
Apache 2.0
