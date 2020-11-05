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
const tooltipExtensionId = 'tooltip-extension';
registerTooltipExtension((block: Blockly.Block) => {
  // Custom tooltip render function.
  const tooltip = document.createElement('div');
  tooltip.className = 'custom-tooltip';

  const blockId = document.createElement('div');
  blockId.textContent = block.id;
  tooltip.appendChild(blockId);

  const blockTooltipText = document.createElement('div');
  blockTooltipText.textContent = block.getTooltip();
  tooltip.appendChild(blockTooltipText);

  return tooltip;
}, tooltipExtensionId);

// Customize the CSS.
Blockly.Css.register([
  `
    div.blocklyTooltipDiv {
      border: none !important;
      box-shadow: none !important;
      background-color: transparent !important;
      opacity: 1 !important;
      /* wrap the JS text inside a blockly Tooltip */
      overflow-wrap: break-word;
    }
    .custom-tooltip {
      background: #000;
      color: #fff;
      border-radius: 8px;
      padding: 1rem;
    }
  `,
]);

// Add the extension to all blocks.
Object.keys(Blockly.Blocks).forEach((blockId) => {
  const block = Blockly.Blocks[blockId] as Blockly.Block;
  if (block.init) {
    // TODO(samelh): Is there a better way to do this.
    const oldInit = block.init;
    block.init = function() {
      if (oldInit) oldInit.call(this);
      this.jsonInit({
        'extensions': [tooltipExtensionId],
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
