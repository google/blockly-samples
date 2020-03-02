/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Example of using WorkspaceSearch with Blockly in script tags.
 * @author kozbial@gmail.com (Monica Kozbial)
 */

function start() {
  const workspace = Blockly.inject('blocklyDiv',
      {toolbox: document.getElementById('toolbox')});
  const workspaceSearch = new WorkspaceSearch(workspace);
  workspaceSearch.init();
  workspaceSearch.open();
}

document.addEventListener("DOMContentLoaded", function () { start() });
