# @blockly/theme-hackermode [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)
<!--
  - TODO: Add theme description.
  -->

A [Blockly](https://www.npmjs.com/package/blockly) theme that is designed to look like a movie hacker screen. It has a black background, black blocks and lime green text. 

## Installation

### Yarn

```
yarn add @blockly/theme-hackermode
```

### npm

```
npm install @blockly/theme-hackermode --save
```

## Usage

```js
import * as Blockly from 'blockly';
import Theme from '@blockly/theme-hackermode';

Blockly.inject('blocklyDiv', {
  theme: Theme,
});
```

## License

Apache 2.0
