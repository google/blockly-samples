import * as Blockly from 'blockly';
import {registerAllBlocks} from './blocks';
import {toolbox} from './toolbox';
import './index.css';

// Put Blockly in the global scope for easy debugging.
(window as any).Blockly = Blockly;

registerAllBlocks();

const mainWorkspaceDiv = document.getElementById('mainWorkspace');
const mainWorkspace = Blockly.inject(mainWorkspaceDiv, {toolbox});


const startBlocks = {
  'blocks': {
    'languageVersion': 0,
    'blocks': [
      {
        'type': 'factory_base',
        'id': 'n:4C145zw,rF:XcB6TSS',
        'x': 53,
        'y': 23,
        'extraState': '<mutation connections="NONE"></mutation>',
        'fields': {
          'NAME': 'block_type',
          'INLINE': 'AUTO',
          'CONNECTIONS': 'NONE',
        },
      },
    ],
  },
};

Blockly.serialization.workspaces.load(startBlocks, mainWorkspace);
