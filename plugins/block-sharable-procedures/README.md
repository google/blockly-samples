---
title: "@blockly/block-sharable-procedures Demo"
packageName: "@blockly/block-sharable-procedures"
description: "A plugin that adds procedure blocks which are backed by explicit data models."
version: "1.0.1"
pageRoot: "plugins/block-sharable-procedures"
pages:
  - label: "Playground"
    link: "test/index"
  - label: "README"
    link: "README"

---
# @blockly/block-sharable-procedures [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A set of [Blockly](https://www.npmjs.com/package/blockly) blocks that allow
end-users to define procedures (i.e. functions). These blocks reference explicit
backing data models, which allows them to be more easily manipulated, and shared
between workspaces.

Note that these blocks have the same names as the built-in procedure blocks, so
you can seamlessly upgrade your existing project to use the new blocks.

## Installation

### Yarn
```
yarn add @blockly/block-sharable-procedures
```

### npm
```
npm install @blockly/block-sharable-procedures --save
```

## Usage

### Import

The blocks in this plugin must be explicitly defined after they are imported.
This is so that importing the plugin doesn't have side effects (i.e. defining
the blocks itself) which might be unexpected.

```js
import * as Blockly from 'blockly';
import {blocks} from '@blockly/block-sharable-procedures';

// Blocks must be explicitly defined after importing.
Blockly.common.defineBlocks(blocks);
```

## License
Apache 2.0
