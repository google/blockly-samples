/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Test page for example plugin showing custom tooltip rendering.
 */

import * as Blockly from 'blockly';
import {createPlayground} from '@blockly/dev-tools';
import {MarkdownTooltips} from '../src/index';

/**
 * Create a workspace.
 * @param {HTMLElement} blocklyDiv The blockly container div.
 * @param {!Blockly.BlocklyOptions} options The Blockly options.
 * @return {!Blockly.WorkspaceSvg} The created workspace.
 */
function createWorkspace(blocklyDiv, options) {
  const workspace = Blockly.inject(blocklyDiv, options);

  // Initialize the plugin.
  const plugin = new MarkdownTooltips(workspace);
  plugin.init();

  return workspace;
}

document.addEventListener('DOMContentLoaded', function() {
  Blockly.Blocks['custom_tooltip_1'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('This is a test block.');
      this.setColour(150);
      this.setTooltip('This is **formatted**! Look how *great* it is!');
      this.setHelpUrl('');
    },
  };
  Blockly.Blocks['custom_tooltip_2'] = {
    init: function() {
      this.appendDummyInput()
          .appendField('This is a different test block.');
      this.setColour(150);
      this.setTooltip('![lightbulb](lightbulb.png) Tip: Use this block.');
      this.setHelpUrl('');
    },
  };
  const defaultOptions = {
    toolbox: document.getElementById('toolbox'),
  };
  createPlayground(document.getElementById('root'), createWorkspace,
      defaultOptions);
});
