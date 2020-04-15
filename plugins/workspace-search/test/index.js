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
import {toolboxCategories, toolboxSimple} from '@blockly/dev-tools';

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
    scaleSpeed: 1.1,
  },
};

/**
 * Test page startup, setup Blockly instances.
 */
function start() {
  const match = location.search.match(/toolbox=([^&]+)/);
  const toolbox = match && match[1] == 'simple' ?
      toolboxSimple : toolboxCategories;
  startBlocklyInstance('VertStartLTR', false, false, 'start', toolbox, true);
  startBlocklyInstance('VertStartRTL', true, false, 'start', toolbox);

  startBlocklyInstance('VertEndLTR', false, false, 'end', toolbox);
  startBlocklyInstance('VertEndRTL', true, false, 'end', toolbox);

  startBlocklyInstance('HorizontalStartLTR', false, true, 'start', toolbox);
  startBlocklyInstance('HorizontalStartRTL', true, true, 'start', toolbox);

  startBlocklyInstance('HorizontalEndLTR', false, true, 'end', toolbox);
  startBlocklyInstance('HorizontalEndRTL', true, true, 'end', toolbox);
}

/**
 * Inject a Blockly instance.
 * @param {string} suffix Id suffix to use.
 * @param {boolean} rtl RTL option.
 * @param {boolean} horizontalLayout Horizontal layout option.
 * @param {string} position Toolbox position option.
 * @param {string} toolbox Toolbox value.
 * @param {boolean=} optOpenSearch Optional, whether or not to open the
 *     workspace search box.
 */
function startBlocklyInstance(suffix, rtl, horizontalLayout, position, toolbox,
    optOpenSearch) {
  options.rtl = rtl;
  options.toolbox = toolbox;
  options.horizontalLayout = horizontalLayout;
  options.toolboxPosition = position;
  const ws = Blockly.inject('blocklyDiv' + suffix, options);
  const workspaceSearch = new WorkspaceSearch(ws);
  workspaceSearch.init();
  if (optOpenSearch) {
    workspaceSearch.open();
  }
}

document.addEventListener('DOMContentLoaded', start);
