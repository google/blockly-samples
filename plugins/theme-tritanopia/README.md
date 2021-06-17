# @blockly/theme-tritanopia [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) theme for people that have
tritanopia (the inability to perceive blue light).

## Installation

### Yarn
```
yarn add @blockly/theme-tritanopia
```

### npm
```
npm install @blockly/theme-tritanopia --save
```

## Usage

```js
import * as Blockly from 'blockly';
import Theme from '@blockly/theme-tritanopia';

Blockly.inject('blocklyDiv', {
  theme: Theme,
});

```

## License
Apache 2.0
