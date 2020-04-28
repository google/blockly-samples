# blockly-plugin-modal [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

<!--
  - TODO: Edit plugin description.
  -->
A [Blockly](https://www.npmjs.com/package/blockly) plugin that creates a modal.

## Installation

### Yarn
```
yarn add blockly-plugin-modal
```

### npm
```
npm install blockly-plugin-modal --save
```

## Usage

```js
import * as Blockly from 'blockly';
import {Modal} from 'blockly-plugin-modal';

// Inject Blockly.
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: toolboxCategories,
});

// Initialize plugin.
const modal = new Modal(workspace);
modal.init();
```

## API
- `init`: Create a  modal.
- `dispose`: Dispose of the modal.
- `show`: Shows the modal and focus on the first focusable element.
- `hide`: Hide the modal.
- `render`: Create all the dom elements for the modal.

### For extending
- `shouldCloseOnOverlayClick`: 
- `shouldCloseOnEsc`: 

## License
Apache 2.0
