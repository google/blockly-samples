/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Custom tooltip block extension.
 */
import * as Blockly from 'blockly/core';

type TooltipRender = (block: Blockly.Block) => HTMLElement;

interface TooltipBlock extends Blockly.Block {
  customTooltip: () => HTMLElement;
}

/**
 * Register the Blockly tooltip block extension.
 * @param {!TooltipRender} tooltipRender Custom tooltip render function.
 * @param {string=} extensionName Optional extension name.
 * @return {string} The registered extension name.
 */
export const registerTooltipExtension = (tooltipRender: TooltipRender,
    extensionName = 'custom-tooltip-extension') => {
  // Register the tooltip extension.
  Blockly.Extensions.register(extensionName, function() {
    const block = this as TooltipBlock;
    block.customTooltip = function() {
      return tooltipRender(block);
    };
  });

  // Patch the tooltip method to support custom tooltip rendering.
  patchBlocklyTooltip();

  return extensionName;
};

// TODO: We have no way to do this currently without monkey-patching Blockly.
// Add support extending the tooltip in Blockly.
const patchBlocklyTooltip = () => {
  const renderStandardTooltip = (el: HTMLElement, tooltipDiv: HTMLElement) => {
    let tip = BlocklyTooltip.getTooltipOfObject(el);
    tip = (Blockly.utils as any).string.wrap(tip, BlocklyTooltip.LIMIT);
    // Create new text, line by line.
    const lines = tip.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const div = document.createElement('div');
      div.appendChild(document.createTextNode(lines[i]));
      tooltipDiv.appendChild(div);
    }
  };

  const renderTooltip = (el: HTMLElement, tooltipDiv: HTMLElement) => {
    const customTooltip = (el as any).customTooltip;
    if (customTooltip) {
      const customEl = customTooltip();
      if (customEl) {
        tooltipDiv.appendChild(customEl);
      } else {
        renderStandardTooltip(el, tooltipDiv);
      }
    } else {
      renderStandardTooltip(el, tooltipDiv);
    }
  };

  const BlocklyTooltip = (Blockly.Tooltip as any);
  BlocklyTooltip.show_ = function() {
    if (BlocklyTooltip.blocked_) {
      // Someone doesn't want us to show tooltips.
      return;
    }
    BlocklyTooltip.poisonedElement_ = BlocklyTooltip.element_;
    const tooltipDiv = BlocklyTooltip.DIV as HTMLElement;
    if (!tooltipDiv) {
      return;
    }
    // Erase all existing text.
    tooltipDiv.textContent = '';

    renderTooltip(BlocklyTooltip.element_, tooltipDiv);

    const rtl = BlocklyTooltip.element_.RTL;
    const windowWidth = document.documentElement.clientWidth;
    const windowHeight = document.documentElement.clientHeight;
    // Display the tooltip.
    tooltipDiv.style.direction = rtl ? 'rtl' : 'ltr';
    tooltipDiv.style.display = 'block';
    BlocklyTooltip.visible = true;
    // Move the tooltip to just below the cursor.
    let anchorX = BlocklyTooltip.lastX_;
    if (rtl) {
      anchorX -= BlocklyTooltip.OFFSET_X + tooltipDiv.offsetWidth;
    } else {
      anchorX += BlocklyTooltip.OFFSET_X;
    }
    let anchorY = BlocklyTooltip.lastY_ + BlocklyTooltip.OFFSET_Y;

    if (anchorY + tooltipDiv.offsetHeight >
        windowHeight + window.scrollY) {
      // Falling off the bottom of the screen; shift the tooltip up.
      anchorY -= tooltipDiv.offsetHeight + 2 * BlocklyTooltip.OFFSET_Y;
    }
    if (rtl) {
      // Prevent falling off left edge in RTL mode.
      anchorX = Math.max(BlocklyTooltip.MARGINS - window.scrollX, anchorX);
    } else {
      if (anchorX + tooltipDiv.offsetWidth >
          windowWidth + window.scrollX - 2 * BlocklyTooltip.MARGINS) {
        // Falling off the right edge of the screen;
        // clamp the tooltip on the edge.
        anchorX = windowWidth - tooltipDiv.offsetWidth -
            2 * BlocklyTooltip.MARGINS;
      }
    }
    tooltipDiv.style.top = anchorY + 'px';
    tooltipDiv.style.left = anchorX + 'px';
  };
};
