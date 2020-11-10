---
title: "@blockly/block-plus-minus Demo"
packageName: "@blockly/block-plus-minus"
description: "A group of blocks that replace the built-in mutator UI with a +/- based UI."
pageRoot: "plugins/block-plus-minus"
pages:
  - label: "Playground"
    link: "test/index"
  - label: "README"
    link: "README"

---

# @blockly/block-plus-minus [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A group of [Blockly](https://www.npmjs.com/package/blockly) blocks that replace the built-in mutator UI with a +/-
based UI.

Currently this only affects the built-in blocks that use mutators (controls_if, text_join, list_create_with,
procedures_defnoreturn, and procedures_defreturn).

![](https://github.com/google/blockly-samples/raw/master/plugins/block-plus-minus/readme-media/If.png)

But the ability to easily add this to your own mutators may be added
in the future.

## Installation

### Yarn
```
yarn add @blockly/block-plus-minus
```

### npm
```
npm install @blockly/block-plus-minus --save
```

## Usage

### Import
```js
import Blockly from 'blockly';
import '@blockly/block-plus-minus';
```

### Blockly Languages
We do not currently support translating the text in this plugin to different
languages. However, if you would like to support multiple languages the messages
can be translated by assigning the following properties of Blockly.Msg
- `PROCEDURE_VARIABLE` (Default: "variable:"): The label which signals the text
   input is a variable.
   
```javascript
Blockly.Msg['PROCEDURE_VARIABLE'] = 'variabele:';  // Dutch 
// Inject workspace, etc...
```

### XML

Blocks will automatically use the +/- UI when loaded from XML. But here is some example XML incase you are trying to
add specific mutations of blocks:

#### If

```xml
<block type="controls_if"></block>
```
![](https://github.com/google/blockly-samples/raw/master/plugins/block-plus-minus/readme-media/If.png)
```xml
<block type="controls_if">
    <mutation elseif="1"></mutation>
</block>
```
![](https://github.com/google/blockly-samples/raw/master/plugins/block-plus-minus/readme-media/IfElseIf.png)
```xml
<block type="controls_if">
    <mutation elseif="1" else="1"></mutation>
</block>
```
![](https://github.com/google/blockly-samples/raw/master/plugins/block-plus-minus/readme-media/IfElseIfElse.png)

#### Text Join

```xml
<block type="text_join"></block>
```
![](https://github.com/google/blockly-samples/raw/master/plugins/block-plus-minus/readme-media/TextJoin.png)
```xml
<block type="text_join">
    <mutation items="0"></mutation>
</block>
```
![](https://github.com/google/blockly-samples/raw/master/plugins/block-plus-minus/readme-media/TextJoinNone.png)

#### List Create

```xml
<block type="lists_create_with"></block>
```
![](https://github.com/google/blockly-samples/raw/master/plugins/block-plus-minus/readme-media/ListCreateWith.png)
```xml
<block type="lists_create_with">
    <mutation items="0"></mutation>
</block>
```
![](https://github.com/google/blockly-samples/raw/master/plugins/block-plus-minus/readme-media/ListCreateWithNone.png)

## License
Apache 2.0
