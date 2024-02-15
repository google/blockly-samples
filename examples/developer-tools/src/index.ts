/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
import {jsonDefinitionGenerator} from './output-generators/json_definition_generator';
import {javascriptDefinitionGenerator} from './output-generators/javascript_definition_generator';
import {registerAllBlocks} from './blocks';
import {save, load} from './serialization';
import {toolbox} from './toolbox';
import {theme} from './theme';
import 'blockly/blocks';
import './index.css';
import {ViewModel} from './view_model';
import {Controller} from './controller';

// Put Blockly in the global scope for easy debugging.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).Blockly = Blockly;

// Even though En should be loaded by default,
// if you don't load it specifically, you'll get spurious message warnings.
Blockly.setLocale(En);

registerAllBlocks();

const model = new ViewModel();

const previewWorkspace = Blockly.inject(model.previewDiv, {});
const mainWorkspace = Blockly.inject(model.mainWorkspaceDiv, {theme, toolbox});

const controller = new Controller(
  mainWorkspace,
  previewWorkspace,
  model,
  javascriptDefinitionGenerator,
  jsonDefinitionGenerator,
);

// Disable orphan blocks on the main workspace
mainWorkspace.addChangeListener(Blockly.Events.disableOrphans);

// Load either saved state or new state
load(mainWorkspace);

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
  controller.updateOutput();
});
