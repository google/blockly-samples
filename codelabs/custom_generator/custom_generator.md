author: Rachel Fenichel
summary: Codelab showing how to create and use a custom generator.
id: custom-generator
categories: blockly,codelab,generator
status: Draft
Feedback Link: https://github.com/google/blockly-samples/issues/new

# Build a custom generator

## Codelab overview

### What you'll learn
- How to create a custom language generator.
- How to create block generator definitions for existing blocks.
- How to create block generator definitions for new block.
- How to use a custom generator in the playground.

### What you'll build

You will build a JSON generator that implements the [JSON language spec](https://www.json.org/json-en.html).

(todo: add image)

### What you'll need

- Familiarity with JSON and the JSON specification.
- Comfort with defining blocks and toolboxes.

This codelab assumes that you are already comfortable with using the Blockly playground locally.  You can find it in `tests/playground.html`.

(TODO: Update when the new playground is ready).

### Resources/Further reading
https://developers.google.com/blockly/guides/create-custom-blocks/generating-code

## Setup

In this codelab you will add code to the Blockly playground to create and use a new generator. The playground contains all of Blockly's base blocks. You can find the playground at `tests/playground.html`.

To start, create a file named `custom_generator.js` in the same folder as the playground.  Include it with a script tag.

```
<script src="custom_generator.js"></script>
```

Note: you must include your custom code *after* including the Blockly library.

### Blocks

For this codelab you will use two custom blocks, as well as five blocks from Blockly's standard set.

The custom blocks represent the *Object* and *Member* sections of the JSON specification.

The blocks are:
- object
- member
- math_number
- text
- logic_boolean
- logic_null
- lists_create_with

### Custom block definitions

Copy this code into `custom_generator.js` to define the two custom blocks.

```js
Blockly.defineBlocksWithJsonArray([{
  "type": "object",
  "message0": "{ %1 %2 }",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "MEMBERS"
    }
  ],
  "output": null,
  "colour": 230,
},
{
  "type": "member",
  "message0": "%1 %2 %3",
  "args0": [
    {
      "type": "field_input",
      "name": "MEMBER_NAME",
      "text": ""
    },
    {
      "type": "field_label",
      "name": "COLON",
      "text": ":"
    },
    {
      "type": "input_value",
      "name": "MEMBER_VALUE"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
}]);
```

### Toolbox definition

Next, define your toolbox in XML. For this example we have a flyout-only toolbox with seven blocks in it.

Copy this code into `custom_generator.js`:

```js
var codelabToolbox = `
<xml id="toolbox" style="display: none">
<block type="object"/>
<block type="member"></block>
<block type="math_number"><field name="NUM">0</field></block>
<block type="text"><field name="TEXT"/></block>
<block type="logic_boolean"><field name="BOOL">TRUE</field></block>
<block type="logic_null"/>
<block type="lists_create_with"><mutation items="3"/></block></xml>
`
```

Then update the options struct in the playgound to use your new toolbox:

```js
var defaultOptions = {
  comments: true,
  // ...
  toolbox: codelabToolbox,
  // ...
};
```

## The basics

The first step is to define and call your generator.

### Create your generator

A custom generator is simply an instance of `Blockly.Generator`. Call the constructor, passing in your generator's name, and store the result.

```js
let myGenerator = new Blockly.Generator('Codelab');
```

### Generate code

Add a button to the playground with the following callback:

```js
const generatedCode = myGenerator.workspaceToCode(Blockly.getMainWorkspace());
console.log(generatedCode);
```

Note: You must use `workspaceToCode` as the entry point for code generation, passing in the workspace. `workspaceToCode` calls `init` and `finish` to do any additional setup and teardown that your generator needs.

Other functions such as `blockToCode` are public so that you can use them in your per-block generator definitions, but must not be used as the entry point.

### Test it

Put a number block on the workspace, then click your button to call your generator.

Check the console for the output. You should see an error:

```
generator.js:182 Uncaught Error: Language "Codelab" does not know how to generate  code for block type "math_number".
    at Blockly.Generator.blockToCode (generator.js:182)
    at Blockly.Generator.workspaceToCode (generator.js:94)
    at <anonymous>:1:18
```

This error occurs because you need to write a generator for each type of block. Read the next section for more details.

## Block generator overview

At its core, a block generator is a function that takes in a block, translates the block into code, and returns that code as a string.

Block generators are defined on the language generator object. In this case, that's `myGenerator`.

```js
myGenerator['sample_block'] = function(block) {
  // Assemble some code
  return 'my code string';
}
```

### Statement blocks
*Statement blocks* represent code that does not return a value.

A statement block's generator simply returns a string.

For example, this defines a generator that always returns the same function call.

```js
myGenerator['left_turn_block'] = function(block) {
  return 'turnLeft()';
}
```

### Value blocks
*Value blocks* represent code that returns a value.

A value block's generator returns an array containing a string and a [precedence value](https://developers.google.com/blockly/guides/create-custom-blocks/operator-precedence).

For example, this code defines a generator that always returns `1 + 1`:

```js
myGenerator['two_block'] = function(block) {
  return ['1 + 1', myGenerator.ORDER_ADDITION];
}
```

Operator precedence is not important for the JSON generator that you are building, so you will use `myGenerator.ORDER_NONE` for all precedence values.

## Value block generators

In this step you will build the generators for the simple value blocks: null, string, number, and boolean.

You will use `getFieldValue` on several types of fields.

### Null

The simplest block in this example is the `logic_null` block. No matter what, it generates the code `null`.

```js
myGenerator['logic_null'] = function(block) {
  return ['null', myGenerator.ORDER_NONE];
};
```

### String

Next is the `text` block. Unlike `logic_null`, there is a single text input field on this block. Use `getFieldValue`:

```js
var textValue = block.getFieldValue('TEXT');
```

Since this is a string in the generated code, wrap the value in quotation marks and return it:

```js
myGenerator['text'] = function(block) {
  var textValue = block.getFieldValue('TEXT');
  var code = '"' + textValue + '"';
  return [code, myGenerator.ORDER_NONE];
};
```

### Number

The `math_number` block has a number field. Like the `text` block, you can use `getFieldValue`. Unlike the text block, you don't need to wrap it in additional quotation marks.

```js
myGenerator['math_number'] = function(block) {
  const code = Number(block.getFieldValue('NUM'));
  return [code, myGenerator.ORDER_NONE];
};
```

### Boolean

The `logic_boolean` block has a dropdown field named `BOOL`. Calling `getFieldValue` on a dropdown field returns the value of the selected option, which may not be the same as the display text. In this case the dropdown has two possible values: `TRUE` and `FALSE`.

```js
myGenerator['logic_boolean'] = function(block) {
  const code = (block.getFieldValue('BOOL') == 'TRUE') ? 'true' : 'false';
  return [code, myGenerator.ORDER_NONE];
```

### Summary

- Value blocks return an array containing the value as a string and the precedence.
- `getFieldValue` find the field with the specified name and returns its value.
- The type of the return value from `getFieldValue` depends on the type of the field.
  - Each field type must document what its value represents.


## Member block generator

The member block has a text input field and a value input. It generates code that looks like `"a": b,`.


### Field value
`a` is the value of the text input, which we get with `getFieldValue`:

```js
 const text_member_name = block.getFieldValue('MEMBER_NAME');
```

### Input value
`b` is whatever is attached to the value input. A variety of blocks could be attached there: string, number, boolean, null, or even an array. Use `valueToCode` to get the correct value:

```js
const value_name = codelabGenerator.valueToCode(block, 'MEMBER_VALUE',
    codelabGenerator.ORDER_ATOMIC);
```

`valueToCode` does three things:
- Finds the blocks connected to the named value input (the second argument)
- Generates the code for that block
- Returns the code as a string

If no block is attached, `valueToCode` returns `null`.

The third argument is related to operator precedence.
TODO: Decide whether/how to explain operator precedence.

### Build the code string
Next, assemble the arguments `a` and `b` into the correct code, of the form `"a": b,`.

To generate clean code, you should also add a newline at the end of the statement.

```js
const code = '"' + text_member_name + '" : ' + value_name + ',\n'
```

### Put it all together

All together, the block generator for the member block looks like this:

```js
myGenerator['member'] = function(block) {
  const text_member_name = block.getFieldValue('MEMBER_NAME');
  const value_name = codelabGenerator.valueToCode(block, 'MEMBER_VALUE',
      codelabGenerator.ORDER_NONE);
  const code = '"' + text_member_name + '" : ' + value_name + ',\n';
  return code;
};
```


## Array block generator

[ a, b ]

This adds in a variable number of inputs.

## Object block generator

{
  "a": b,
}

This uses a statement input.

## Putting it all together

Call the new generator to generate your code, and check the results.

## Other topics

A quick overview of other generator topics not covered in this codelab.

### Reserved words

e.g. for, while, break. Different per language.

### Indentation

Set how indentation works (tabs vs spaces, etc).

### Variables


## Summary
In this section, recap the work the developer has done and suggest ways to use it.

### Resources
List any additional resources about this topic that the developer may want to consult.
