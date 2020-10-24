/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Testing playground for WorkspaceSearch.
 * @author kozbial@gmail.com (Monica Kozbial)
 */

import * as Blockly from 'blockly';
import {WorkspaceSearch} from '../src/index.js';
import {toolboxCategories, createPlayground} from '@blockly/dev-tools';

/**
 * Create a workspace.
 * @param {HTMLElement} blocklyDiv The blockly container div.
 * @param {!Blockly.BlocklyOptions} options The Blockly options.
 * @return {!Blockly.WorkspaceSvg} The created workspace.
 */
function createWorkspace(blocklyDiv, options) {
  const workspace = Blockly.inject(blocklyDiv, options);

  const workspaceSearch = new WorkspaceSearch(workspace);
  workspaceSearch.init();
  workspaceSearch.open();
  return workspace;
}

document.addEventListener('DOMContentLoaded', function() {
  const defaultOptions = {
    toolbox: toolboxCategories,
  };
  createPlayground(document.getElementById('root'), createWorkspace,
      defaultOptions);
});

