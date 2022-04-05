/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Test page for example plugin showing custom tooltip rendering.
 */


/**
 * Create and register the custom tooltip rendering function.
 * This could be extracted into a plugin if desired.
 */
function initTooltips() {
  // Create a custom rendering function. This function will be called whenever
  // a tooltip is shown in Blockly. The first argument is the div to render
  // the content into. The second argument is the element to show the tooltip
  // for.
  const customTooltip = function(div, element) {
    if (element instanceof Blockly.BlockSvg) {
      // You can access the block being moused over.
      // Here we get the color of the block to set the background color.
      div.style.backgroundColor = element.getColour();
    }
    const tip = Blockly.Tooltip.getTooltipOfObject(element);
    const text = document.createElement('div');
    text.textContent = tip;
    const container = document.createElement('div');
    container.style.display = 'flex';
    // Check to see if the custom property we added in the block definition is
    // present.
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

/**
 * Create a workspace.
 * @param {HTMLElement} blocklyDiv The blockly container div.
 * @param {!Blockly.BlocklyOptions} options The Blockly options.
 * @return {!Blockly.WorkspaceSvg} The created workspace.
 */
function createWorkspace(blocklyDiv, options) {
  const workspace = Blockly.inject(blocklyDiv, options);

  initTooltips();

  return workspace;
}

document.addEventListener('DOMContentLoaded', function() {
  Blockly.Blocks['custom_tooltip_1'] = {
    init: function() {
      this.appendDummyInput().appendField('This is a test block.');
      this.setColour(150);
      this.setTooltip('This is a regular tooltip.');
      this.setHelpUrl('');
    },
  };
  Blockly.Blocks['custom_tooltip_2'] = {
    init: function() {
      this.appendDummyInput().appendField('Mouse over me.');
      this.setColour(150);
      this.setTooltip('Tip: This tooltip has an image.');
      // We will check for this property in our custom rendering code.
      this.tooltipImg = 'lightbulb.png';
      this.setHelpUrl('');
    },
  };
  const defaultOptions = {
    toolbox: {
      'kind': 'flyoutToolbox',
      'contents': [
        {'kind': 'block', 'type': 'custom_tooltip_1'},
        {'kind': 'block', 'type': 'custom_tooltip_2'},
      ],
    },
  };

  // createPlayground is from @blockly/dev-tools.
  // eslint-disable-next-line no-undef
  createPlayground(
      document.getElementById('root'), createWorkspace, defaultOptions);
});
