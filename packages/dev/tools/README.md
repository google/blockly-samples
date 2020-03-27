# @blockly/dev-tools [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A library of common utilities for Blockly extension development.

## Installation

```
npm install @blockly/dev-tools -D --save
```

## Usage

```js
import Blockly from 'blockly';
import {toolboxSimple, toolboxCateogires} from '@blockly/dev-tools';

Blockly.inject('blocklyDiv', {
  toolbox: toolboxCategories
});
```

## License

Apache 2.0