/**
 * @license
 *
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Example of using WorkspaceSearch with Blockly.
 * @author kozbial@gmail.com (Monica Kozbial)
 */

import WorkspaceSearch from '../src/workspace_search.js';

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
