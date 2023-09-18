/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';
import {registerAllBlocks} from './blocks';
import {toolbox} from './toolbox';
import './index.css';
import {jsonDefinitionGenerator} from './output-generators/json_definition_generator';

// Put Blockly in the global scope for easy debugging.
(window as any).Blockly = Blockly;

registerAllBlocks();

const mainWorkspaceDiv = document.getElementById('mainWorkspace');
const previewDiv = document.getElementById('preview');
const definitionDiv = document.getElementById('definition').firstChild;

const previewWorkspace = Blockly.inject(previewDiv, {});
const mainWorkspace = Blockly.inject(mainWorkspaceDiv, {toolbox});

// Disable orphan blocks on the main workspace
mainWorkspace.addChangeListener(Blockly.Events.disableOrphans);


const startBlocks = {
  'blocks': {
    'languageVersion': 0,
    'blocks': [
      {
        'type': 'factory_base',
        'deletable': false,
        'x': 53,
        'y': 23,
        'fields': {
          'NAME': 'block_type',
          'INLINE': 'AUTO',
          'CONNECTIONS': 'NONE',
        },
        'inputs': {
          'TOOLTIP': {
            'block': {
              'type': 'text',
              'deletable': false,
              'movable': false,
              'fields': {
                'TEXT': '',
              },
            },
          },
          'HELPURL': {
            'block': {
              'type': 'text',
              'deletable': false,
              'movable': false,
              'fields': {
                'TEXT': '',
              },
            },
          },
        },
      },
    ],
  },
};

Blockly.serialization.workspaces.load(startBlocks, mainWorkspace);

let blockName = '';


// Whenever the workspace changes meaningfully, update the preview.
mainWorkspace.addChangeListener((e: Blockly.Events.Abstract) => {
  // Don't run the code when the workspace finishes loading; we're
  // already running it once when the application starts.
  // Don't run the code during drags; we might have invalid state.
  if (e.isUiEvent || e.type == Blockly.Events.FINISHED_LOADING ||
      mainWorkspace.isDragging()) {
    return;
  }

  previewWorkspace.clear();

  // If we previously had a block registered, delete it.
  if (blockName) {
    delete Blockly.Blocks[blockName];
  }
  const blockDefinitionString = jsonDefinitionGenerator.workspaceToCode(mainWorkspace);
  definitionDiv.textContent = blockDefinitionString;
  const blockDefinition = JSON.parse(blockDefinitionString);
  blockName = blockDefinition.type;
  Blockly.common.defineBlocks(Blockly.common.createBlockDefinitionsFromJsonArray([blockDefinition]));
  const block = previewWorkspace.newBlock(blockName);
  block.initSvg();
  block.render();
});
