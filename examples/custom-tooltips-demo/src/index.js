/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as showdown from 'showdown';

/**
 * This example plugin parses markdown in tooltips and renders the formatted
 * tooltips. It is only an example of how to use the customTooltip API and
 * should not be copied wholesale.
 */
export class MarkdownTooltips {
  /**
   * Initialize the plugin.
   */
  init() {
    // Create a custom rendering function. This function will be called whenever
    // a tooltip is shown in Blockly. The first argument is the div to render
    // the content into. The second argument is the element to show the tooltip
    // for.
    const customTooltip = function(div, element) {
      // In this example, the tooltip we set on an element such as block may
      // contain markdown-formatted text.
      let tip = Blockly.Tooltip.getTooltipOfObject(element);
      tip = new showdown.Converter().makeHtml(tip);
      const child = document.createElement('div');
      // Warning: Setting innerHTML is dangerous!
      // Accepting untrusted HTML leaves you vulnerable to XSS attacks.
      // To do this in production, use an HTML sanitization library.
      child.innerHTML = tip;
      div.appendChild(child);
    };
    // Register the function in the Blockly.Tooltip so that Blockly calls it
    // when needed.
    Blockly.Tooltip.setCustomTooltip(customTooltip);
  }
}
