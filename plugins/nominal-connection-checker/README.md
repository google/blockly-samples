---
title: "@blockly/plugin-nominal-connection-checker Demo"
packageName: "@blockly/plugin-nominal-connection-checker"
description: "A Blockly plugin for creating more advanced connection checks, targeted at nominally typed languages."
pageRoot: "plugins/nominal-connection-checker"
pages:
  - label: "Playground"
    link: "test/index"
  - label: "README"
    link: "README"

---
# @blockly/plugin-nominal-connection-checker [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) plugin that allows you to create more advanced connection checks.

This project is targeted at helping Blockly model languages with complex nominal typing systems, like C++, Java, or Rust.
It can also be used for modeling subsets of structurally typed languages like TypeScript, Golang, or Haskell. Or it
can be used to create a type-safe blocks languages that generates a dynamically typed language like JavaScript.

It includes support for modeling subtyping, generic functions/blocks, and parameterized types.

## Installation

### Yarn
```
yarn add @blockly/plugin-nominal-connection-checker
```

### npm
```
npm install @blockly/plugin-nominal-connection-checker --save
```

## Usage

```js
import * as Blockly from 'blockly';
import {pluginInfo as NominalConnectionCheckerPluginInfo} from '@blockly/plugin-nominal-connection-checker';

// Inject Blockly.
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: toolboxCategories,
  plugins: {
      ...NominalConnectionCheckerPluginInfo,
    },
});

// Initialize plugin.
workspace.connectionChecker.init(hierarchyDef);
```

## API

<!--
  - TODO: describe the API.
  -->

## License
Apache 2.0
