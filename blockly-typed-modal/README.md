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

Import Blockly and create your workspace.
```js
import Blockly from 'blockly';
import { TypedModal } from '@blockly/plugin-typed-modal';

const workspace = Blockly.inject('blocklyDiv', {
  toolbox: toolbox
});
```

In your toolbox add a custom category.
```js
<category name="Colours" custom="CREATE_TYPED_VARIABLE"></category>
```

Define a callback to provide the category content
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

Create your Typed Modal using the callbackName for the button.
```js
const typedModal = new TypedModal(workspace, 'callbackName', [["PENGUIN", "Penguin"], ["GIRAFFE", "Giraffe"]]);
typedModal.init();
```

This can also be used by adding a script tag:
```js
<script src="https://unpkg.com/@blockly/plugin-typed-modal"></script>
```

## API
- `init`: Create a typed modal and register it with the given button name.
- `dispose`: Dispose of the typed modal.
- `show`: Shows the modal and focus on the first focusable element.
- `hide`: Hide the modal.
- `render`: Create all the dom elements for the modal.
- `getSelectedType`: Get the selected type of the modal.

## License
Apache 2.0
