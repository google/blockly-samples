/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Test page for the ScrollOptions plugin.
 */

import {createPlayground, toolboxCategories} from '@blockly/dev-tools';
import * as Blockly from 'blockly';

import {Plugin} from '../src/index';
import {ScrollBlockDragger} from '../src/ScrollBlockDragger';
import {ScrollMetricsManager} from '../src/ScrollMetricsManager';


/**
 * Create a workspace.
 * @param {HTMLElement} blocklyDiv The blockly container div.
 * @param {!Blockly.BlocklyOptions} options The Blockly options.
 * @return {!Blockly.WorkspaceSvg} The created workspace.
 */
function createWorkspace(blocklyDiv, options) {
  const workspace = Blockly.inject(blocklyDiv, options);

  // TODO: Initialize your plugin here.
  const plugin = new Plugin(workspace);
  plugin.init();

  return workspace;
}

document.addEventListener('DOMContentLoaded', function() {
  const defaultOptions = {
    toolbox: toolboxCategories,
    plugins: {
      'blockDragger': ScrollBlockDragger,
      'metricsManager': ScrollMetricsManager,
    },
  };
  createPlayground(document.getElementById('root'), createWorkspace,
      defaultOptions);
});
