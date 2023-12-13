/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


import * as Blockly from 'blockly';
import {javascriptGenerator} from 'blockly/javascript';
import {save, load} from './serialization';
import {toolbox} from './toolbox';
import {blocks} from './blocks/p5';
import {forBlock} from './generators/javascript';
import {Multiselect, MultiselectBlockDragger, blockSelectionWeakMap} from '@mit-app-inventor/blockly-plugin-workspace-multiselect';
import { combineBlocks } from './contiguous.ts';
import p5 from 'p5';
import './index.css';
import './block_svg_patch';

// Register the blocks and generator with Blockly
Blockly.common.defineBlocks(blocks);
Object.assign(javascriptGenerator.forBlock, forBlock);
javascriptGenerator.addReservedWords('sketch');

// Set up UI elements
const codeDiv = document.getElementById('generatedCode').firstChild;
const outputDiv = document.getElementById('output');
const blocklyDiv = document.getElementById('blocklyDiv');

const options = {
  collapse: true,
  toolbox: toolbox,
  plugins: {
    'blockDragger': MultiselectBlockDragger, // Required to work
  },
  // Bump neighbours after dragging to avoid overlapping.
  bumpNeighbours: false,
  // Use custom icon for the multi select controls.
  multiselectIcon: {
    hideIcon: false,
    weight: 3,
    enabledIcon: 'https://github.com/mit-cml/workspace-multiselect/raw/main/test/media/select.svg',
    disabledIcon: 'https://github.com/mit-cml/workspace-multiselect/raw/main/test/media/unselect.svg',
  },

  multiselectCopyPaste: {
    // Enable the copy/paste accross tabs feature (true by default).
    crossTab: true,
    // Show the copy/paste menu entries (true by default).
    menu: true,
  },
}

const ws = Blockly.inject(blocklyDiv, options);

// Initialize multiselect plugin.
const multiselectPlugin = new Multiselect(ws);
multiselectPlugin.init(options);

// This function resets the code and output divs, shows the
// generated code from the workspace, and evals the code.
// In a real application, you probably shouldn't use `eval`.
const runCode = () => {
  const code = javascriptGenerator.workspaceToCode(ws);
  codeDiv.innerText = code;

  outputDiv.innerHTML = '';

  // Run p5 in instance mode. The name `sketch` matches the name
  // used in the generator for all the p5 blocks.
  // eslint-disable-next-line new-cap
  new p5((sketch) => {
    eval(code);
  }, outputDiv);
};

// Disable blocks that aren't inside the setup or draw loops.
ws.addChangeListener(Blockly.Events.disableOrphans);

const getContiguousOption = 
{
    callback: function(scope) {
      console.log(combineBlocks(scope.block.workspace, blockSelectionWeakMap.get(scope.block.workspace)));
    },
    scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
    displayText: "Get lists of contiguous blocks",
    preconditionFn: () => {return 'enabled'},
    weight: 100,
    id: 'getContiguous'
}
Blockly.ContextMenuRegistry.registry.register(getContiguousOption);

// Load the initial state from storage and run the code.
load(ws);
runCode();

// Every time the workspace changes state, save the changes to storage.
ws.addChangeListener((e) => {
  // UI events are things like scrolling, zooming, etc.
  // No need to save after one of these.
  if (e.isUiEvent) return;
  save(ws);
});


// Whenever the workspace changes meaningfully, run the code again.
ws.addChangeListener((e) => {
  // Don't run the code when the workspace finishes loading; we're
  // already running it once when the application starts.
  // Don't run the code during drags; we might have invalid state.
  if (e.isUiEvent || e.type == Blockly.Events.FINISHED_LOADING ||
    ws.isDragging()) {
    return;
  }
  runCode();
});
