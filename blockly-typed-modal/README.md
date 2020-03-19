# @blockly/plugin-workspace-search [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) plugin that adds the ability 
to create a modal for creating typed variables.

## Installation

```
npm install @blockly/plugin-typed-modal --save
```

## Usage

### ES6 Imports
```js
import Blockly from 'blockly';
import { TypedModal } from '@blockly/plugin-typed-modal';

const workspace = Blockly.inject('blocklyDiv');
const typedModal = new TypedModal(workspace, 'CREATE_TYPED_VARIABLE', [["PENGUIN", "Penguin"], ["GIRAFFE", "Giraffe"]]);

typedModal.init();
```
### Script Tag
```js
<script src="./node_modules/@blockly/plugin-typed-modal/dist/typed-modal.umd.js"></script>
```

## API


## License
Apache 2.0
