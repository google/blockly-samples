
# @blockly/block-plus-minus [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

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
