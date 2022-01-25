/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Custom tooltip block extension.
 * @author samelh@google.com (Sam El-Husseini)
 */
import * as Blockly from 'blockly';
import './tooltip_monkey_patch';

type TooltipRender = (block: Blockly.BlockSvg) => HTMLElement;

interface TooltipBlock extends Blockly.BlockSvg {
  customTooltip: () => HTMLElement;
}

/**
 * Register the Blockly tooltip block extension.
 * @param tooltipRender Custom tooltip render function.
 * @param extensionName Optional extension name.
 * @return The registered extension name.
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

  return extensionName;
};

