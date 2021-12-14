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

/* eslint-disable-next-line max-len */
import {ScrollBlockDragger, ScrollMetricsManager, ScrollOptions} from '../src/index';

/**
 * Create a workspace.
 * @param {HTMLElement} blocklyDiv The blockly container div.
 * @param {!Blockly.BlocklyOptions} options The Blockly options.
 * @return {!Blockly.WorkspaceSvg} The created workspace.
 */
function createWorkspace(blocklyDiv, options) {
  const workspace = Blockly.inject(blocklyDiv, options);

  const scrollOptionsPlugin = new ScrollOptions(workspace);
  // Supply options if desired, or you can configure the plugin after
  // initialization.
  scrollOptionsPlugin.init();

  return workspace;
}

document.addEventListener('DOMContentLoaded', function() {
  const defaultOptions = {
    toolbox: toolboxCategories,
    plugins: {
      // These are both required, even if you turn off edge scrolling.
      'blockDragger': ScrollBlockDragger,
      'metricsManager': ScrollMetricsManager,
    },
    move: {
      wheel: true,
    },
  };
  createPlayground(
      document.getElementById('root'), createWorkspace, defaultOptions);
});
