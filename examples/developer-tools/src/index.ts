/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
import 'blockly/blocks';
import {registerAllBlocks} from './blocks';
import {toolbox} from './toolbox';
import './index.css';
import {jsonDefinitionGenerator} from './output-generators/json_definition_generator';
import {load, save} from './serialization';

// Put Blockly in the global scope for easy debugging.
(window as any).Blockly = Blockly;

// Even though En should be loaded by default,
// if you don't load it specifically, you'll get spurious message warnings.
Blockly.setLocale(En);
registerAllBlocks();

const mainWorkspaceDiv = document.getElementById('mainWorkspace');
const previewDiv = document.getElementById('preview');
const definitionDiv = document.getElementById('definition').firstChild;

const previewWorkspace = Blockly.inject(previewDiv, {});
const mainWorkspace = Blockly.inject(mainWorkspaceDiv, {toolbox});

// Disable orphan blocks on the main workspace
mainWorkspace.addChangeListener(Blockly.Events.disableOrphans);

// Load either saved state or new state
load(mainWorkspace);

let blockName = '';
// Whenever the workspace changes meaningfully, update the preview.
mainWorkspace.addChangeListener((e: Blockly.Events.Abstract) => {
  // Don't run the code when the workspace finishes loading; we're
  // already running it once when the application starts.
  // Don't run the code during drags; we might have invalid state.
  if (
    e.isUiEvent ||
    e.type == Blockly.Events.FINISHED_LOADING ||
    mainWorkspace.isDragging()
  ) {
    return;
  }

  save(mainWorkspace);
  previewWorkspace.clear();

  // If we previously had a block registered, delete it.
  if (blockName) {
    delete Blockly.Blocks[blockName];
  }
  const blockDefinitionString =
    jsonDefinitionGenerator.workspaceToCode(mainWorkspace);
  definitionDiv.textContent = blockDefinitionString;
  const blockDefinition = JSON.parse(blockDefinitionString);
  blockName = blockDefinition.type;
  Blockly.common.defineBlocks(
    Blockly.common.createBlockDefinitionsFromJsonArray([blockDefinition]),
  );
  const block = previewWorkspace.newBlock(blockName);
  block.initSvg();
  block.render();
});
