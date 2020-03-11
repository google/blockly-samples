/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Example of using WorkspaceSearch with Blockly with imports.
 * @author kozbial@gmail.com (Monica Kozbial)
 */

import * as Blockly from 'blockly';
import { WorkspaceSearch } from '@blockly/plugin-workspace-search';

function start() {
  const workspace = Blockly.inject('blocklyDiv',
      {toolbox: document.getElementById('toolbox')});
  const workspaceSearch = new WorkspaceSearch(workspace);
  workspaceSearch.init();
  workspaceSearch.open();
}

document.addEventListener("DOMContentLoaded", function () { start() });
