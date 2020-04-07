
# @blockly/plus-minus [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A group of [Blockly](https://www.npmjs.com/package/blockly) blocks that replace the built-in mutator UI with a +/-
based UI.

Currently this only affects the built-in blocks that use mutators (controls_if, text_join, list_create_with,
procedures_defnoreturn, and procedures_defreturn).
<!--TODO add picture -->
But the ability to easily add this to your own mutators may be added
in the future.

## Installation

### Yarn
```
yarn add @blockly/plus-minus
```

### npm
```
npm install @blockly/plus-minus --save
```

## Usage

<!--
  - TODO: Update block module name.
  -->
### Import
```js
import Blockly from 'blockly';
import '@blockly/plus-minus';
```

### XML

Blocks will automatically use the +/- UI when loaded from XML. But here is some example XML incase you are trying to
add specific mutations of blocks:

#### If

```xml
<block type="controls_if"></block>
```
<!--TODO add picture -->
```xml
<block type="controls_if">
    <mutation elseif="1"></mutation>
</block>
```
<!--TODO add picture -->
```xml
<block type="controls_if">
    <mutation elseif="1" else="1"></mutation>
</block>
```
<!--TODO add picture -->

#### Text Join

```xml
<block type="text_join"></block>
```
<!--TODO add picture -->
```xml
<block type="text_join">
    <mutation items="0"></mutation>
</block>
```
<!--TODO add picture -->

#### List Create

```xml
<block type="lists_create_with"></block>
```
<!--TODO add picture -->
```xml
<block type="lists_create_with">
    <mutation items="0"></mutation>
</block>
```
<!--TODO add picture -->

## License
Apache 2.0
