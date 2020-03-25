# @blockly/plugin-typed-modal [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) plugin that adds the ability 
to create a modal for creating typed variables.

## Installation

```
npm install @blockly/plugin-typed-modal --save
```

## Usage
To add a Typed Modal to your application you will have to create a custom
dynamically populated flyout category. More information on custom flyouts can be
found [here](https://developers.google.com/blockly/guides/configure/web/toolbox?hl=en#dynamic_categories).

#### Import
```js
import Blockly from 'blockly';
import { TypedModal } from '@blockly/plugin-typed-modal';
```
or

```js
<script src="https://unpkg.com/@blockly/plugin-typed-modal"></script>
```

#### Setup

Create your workspace and your category.
```js
workspace = Blockly.inject('blocklyDiv', {
    toolbox: toolbox
});
```

Add a category to your toolbox.
```js
<category name="Colours" custom="CREATE_TYPED_VARIABLE"></category>
```

Define a callback to provide the category content.
```js
const createFlyout = function(workspace) {
    let xmlList = [];
    // Add your button and give it a callback name.
    const button = document.createElement('button');
    button.setAttribute('text', 'Create Typed Variable');
    button.setAttribute('callbackKey', 'callbackName');

    xmlList.push(button);

    // This gets all the variables that the user creates and adds them to the
    // flyout.
    const blockList = Blockly.VariablesDynamic.flyoutCategoryBlocks(workspace);
    xmlList = xmlList.concat(blockList);
    return xmlList;
};
```

Register the callback on the workspace.
```js
workspace.registerToolboxCategoryCallback('CREATE_TYPED_VARIABLE', createFlyout);
```

Create your Typed Modal using the workspace, callbackName for the button and
your types.
```js
const typedModal = new TypedModal(workspace, 'callbackName', [["PENGUIN", "Penguin"], ["GIRAFFE", "Giraffe"]]);
typedModal.init();
```

#### Blockly Languages
We do not currently support translating the text in this plugin to different
languages. However, if you would like to support multiple languages the
different messages in the typed modal can be set by calling `typedModal.setLocale(messages)`.

Messages that need to be translated for a Typed Modal:
- `TYPED_MODAL_CONFIRM_BUTTON` (Default: "Ok"): The label for the confirmation button.
- `TYPED_MODAL_VARIABLES_DEFAULT_NAME` (Default: "Variable Name: "): The label in front of the variable input.
- `TYPED_MODAL_VARIABLE_TYPE_LABEL` (Default: "Variable Types"): The label in front of the types.
- `TYPED_MODAL_CANCEL_BUTTON` (Default: "Cancel"): The label for the cancel button.
- `TYPED_MODAL_TITLE` (Default: "Create Typed Variable"): The modal title.


## API
- `init`: Create a typed modal and register it with the given button name.
- `dispose`: Dispose of the typed modal.
- `show`: Shows the modal and focus on the first focusable element.
- `hide`: Hide the modal.
- `render`: Create all the dom elements for the modal.
- `getSelectedType`: Get the selected type of the modal.
- `setLocale`: Change the language for the typed modal.


## License
Apache 2.0
