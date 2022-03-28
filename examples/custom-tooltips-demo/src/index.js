/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * This example plugin can show images in tooltips. It is only an example of how
 * to use the customTooltip API and should not be copied wholesale.
 */
export class CustomTooltips {
  /**
   * Initialize the plugin.
   */
  init() {
    // Create a custom rendering function. This function will be called whenever
    // a tooltip is shown in Blockly. The first argument is the div to render
    // the content into. The second argument is the element to show the tooltip
    // for.
    const customTooltip = function(div, element) {
      const tip = Blockly.Tooltip.getTooltipOfObject(element);
      const text = document.createElement('div');
      text.textContent = tip;
      const container = document.createElement('div');
      container.style.display = 'flex';
      if (element.tooltipImg) {
        const img = document.createElement('img');
        img.setAttribute('src', element.tooltipImg);
        container.appendChild(img);
      }
      container.appendChild(text);
      div.appendChild(container);
    };
    // Register the function in the Blockly.Tooltip so that Blockly calls it
    // when needed.
    Blockly.Tooltip.setCustomTooltip(customTooltip);
  }
}
