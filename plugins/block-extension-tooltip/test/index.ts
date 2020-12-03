/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Tooltip block extension test.
 */

import * as Blockly from 'blockly';
import {toolboxCategories, createPlayground} from '@blockly/dev-tools';
import {registerTooltipExtension} from '../src/index';


// Register the tooltip extension.
registerTooltipExtension((block: Blockly.BlockSvg) => {
  // Custom tooltip render function.
  const tooltip = document.createElement('div');
  tooltip.className = 'custom-tooltip';
  tooltip.style.backgroundColor = block.getColour();
  tooltip.style.borderColor = block.getColourTertiary();

  const blockTooltipText = document.createElement('div');
  blockTooltipText.textContent = block.getTooltip();
  tooltip.appendChild(blockTooltipText);

  return tooltip;
}, 'tooltip-extension');

// Customize the tooltip CSS.
Blockly.Css.register([
  `
    div.blocklyTooltipDiv {
      border: none !important;
      box-shadow: none !important;
      background-color: transparent !important;
      opacity: 1 !important;
    }
    .custom-tooltip {
      color: #fff;
      border: 1px solid #000;
      border-radius: 4px;
      padding: 1rem;
    }
  `,
]);

// Add the tooltip extension to all blocks.
Object.keys(Blockly.Blocks).forEach((blockId) => {
  const block = Blockly.Blocks[blockId] as Blockly.Block;
  if (block.init) {
    // TODO(samelh): Is there a better way to do this.
    const oldInit = block.init;
    block.init = function() {
      if (oldInit) oldInit.call(this);
      this.jsonInit({
        'extensions': ['tooltip-extension'],
      });
    };
  }
});

/**
 * Create a workspace.
 * @param {HTMLElement} blocklyDiv The blockly container div.
 * @param {!Blockly.BlocklyOptions} options The Blockly options.
 * @return {!Blockly.WorkspaceSvg} The created workspace.
 */
function createWorkspace(blocklyDiv: HTMLElement,
    options: Blockly.BlocklyOptions): Blockly.WorkspaceSvg {
  return Blockly.inject(blocklyDiv, options);
}

document.addEventListener('DOMContentLoaded', function() {
  const defaultOptions = {
    toolbox: toolboxCategories,
  };
  createPlayground(document.getElementById('root'), createWorkspace,
      defaultOptions);
});
