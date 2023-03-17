/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Plugin test.
 */

import * as Blockly from 'blockly';
import {toolboxCategories, createPlayground} from '@blockly/dev-tools';
import * as SuggestedBlocks from '../src/index';

/**
 * Create a workspace.
 * @param {HTMLElement} blocklyDiv The blockly container div.
 * @param {!Blockly.BlocklyOptions} options The Blockly options.
 * @returns {!Blockly.WorkspaceSvg} The created workspace.
 */
function createWorkspace(blocklyDiv, options) {
  const workspace = Blockly.inject(blocklyDiv, options);
  SuggestedBlocks.init(workspace);
  return workspace;
}

const customTheme = Blockly.Theme.defineTheme('classic_with_suggestions', {
  'name': 'classic_with_suggestions',
  'base': Blockly.Themes.Classic,
  'blockStyles': {},
  'categoryStyles': {
    'frequently_used_category': {'colour': '60'},
    'recently_used_category': {'colour': '60'},
  },
  'componentStyles': {},
  'fontStyle': {},
  'startHats': null,
});

document.addEventListener('DOMContentLoaded', function() {
  // Insert two new categories
  toolboxCategories['contents'].push({
    'kind': 'category',
    'name': 'Frequently Used',
    'custom': 'MOST_USED',
    'categorystyle': 'frequently_used_category',
  });
  toolboxCategories['contents'].push({
    'kind': 'category',
    'name': 'Recentlty Used',
    'custom': 'RECENTLY_USED',
    'categorystyle': 'recently_used_category',
  });
  const defaultOptions = {
    toolbox: toolboxCategories,
    theme: customTheme,
  };
  createPlayground(document.getElementById('root'), createWorkspace,
      defaultOptions);
});
