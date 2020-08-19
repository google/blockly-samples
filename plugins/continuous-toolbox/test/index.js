/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Plugin test.
 */

import * as Blockly from 'blockly';
import {toolboxCategories, createPlayground} from '@blockly/dev-tools';
import '../src/ContinuousCategory';
import {ContinuousToolbox} from '../src/ContinuousToolbox';
import {ContinuousFlyout} from '../src/ContinuousFlyout';

/**
 * Create a workspace.
 * @param {HTMLElement} blocklyDiv The blockly container div.
 * @param {!Blockly.BlocklyOptions} options The Blockly options.
 * @return {!Blockly.WorkspaceSvg} The created workspace.
 */
function createWorkspace(blocklyDiv, options) {
  const workspace = Blockly.inject(blocklyDiv, options);

  return workspace;
}

document.addEventListener('DOMContentLoaded', function() {
  const defaultOptions = {
    toolbox: toolboxCategories,
    plugins: {
      'toolbox': ContinuousToolbox,
      'flyouts-vertical-toolbox': ContinuousFlyout,
    },
  };
  createPlayground(document.getElementById('root'), createWorkspace,
      defaultOptions);
});
