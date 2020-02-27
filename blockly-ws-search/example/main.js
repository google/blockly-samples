/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Example of using WorkspaceSearch with Blockly.
 * @author kozbial@gmail.com (Monica Kozbial)
 */


const options = {
  comments: true,
  collapse: true,
  disable: true,
  maxBlocks: Infinity,
  oneBasedIndex: true,
  readOnly: false,
  scrollbars: true,
  trashcan: true,
  zoom: {
    controls: true,
    wheel: false,
    maxScale: 4,
    minScale: 0.25,
    scaleSpeed: 1.1
  }
};

function start() {
  const match = location.search.match(/toolbox=([^&]+)/);
  const toolbox =
      document.getElementById('toolbox-' + (match ? match[1] : 'categories'));
  document.forms.options.elements.toolbox.selectedIndex =
      Number(toolbox.getElementsByTagName('category').length === 0);
  startBlocklyInstance('VertStartLTR', false, false, 'start', toolbox, true);
  startBlocklyInstance('VertStartRTL', true, false, 'start', toolbox);

  startBlocklyInstance('VertEndLTR', false, false, 'end', toolbox);
  startBlocklyInstance('VertEndRTL', true, false, 'end', toolbox);

  startBlocklyInstance('HorizontalStartLTR', false, true, 'start', toolbox);
  startBlocklyInstance('HorizontalStartRTL', true, true, 'start', toolbox);

  startBlocklyInstance('HorizontalEndLTR', false, true, 'end', toolbox);
  startBlocklyInstance('HorizontalEndRTL', true, true, 'end', toolbox);
}

function startBlocklyInstance(suffix, rtl, horizontalLayout, position, toolbox, opt_openSearch) {
  options.rtl = rtl;
  options.toolbox = toolbox;
  options.horizontalLayout = horizontalLayout;
  options.toolboxPosition = position;
  const ws = Blockly.inject('blocklyDiv' + suffix, options);
  const workspaceSearch = new WorkspaceSearch(ws);
  workspaceSearch.init();
  if (opt_openSearch) {
    workspaceSearch.open();
  }
}

document.addEventListener("DOMContentLoaded", function () { start() });
