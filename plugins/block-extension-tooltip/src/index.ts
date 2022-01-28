/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Custom tooltip block extension.
 * @author samelh@google.com (Sam El-Husseini)
 */

// TODO(maribethb): This should be from 'blockly/core'; fix asap when this
// plugin is made compatible with v7 of Blockly.
// See https://github.com/google/blockly-samples/issues/805
import * as Blockly from 'blockly';
import './tooltip_monkey_patch';

type TooltipRender = (block: Blockly.BlockSvg) => HTMLDivElement;

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

