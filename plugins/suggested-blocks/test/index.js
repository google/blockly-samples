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
 * @return {!Blockly.WorkspaceSvg} The created workspace.
 */
function createWorkspace(blocklyDiv, options) {
  const workspace = Blockly.inject(blocklyDiv, options);

  // TODO: Initialize your plugin here.
  SuggestedBlocks.init(workspace);

  return workspace;
}

const customTheme = Blockly.Theme.defineTheme('CLASSIC_WITH_SUGGESTIONS', {
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

document.addEventListener('DOMContentLoaded', function () {
  // Insert two new categories
  const newCategories = '<category name="Frequently Used" categorystyle="frequently_used_category" custom="MOST_USED"></category><category name="Recently Used" categorystyle="recently_used_category" custom="RECENTLY_USED"></category>';
  const indexToInsert = toolboxCategories.indexOf('</xml>');
  const toolboxCompiled = toolboxCategories.slice(0, indexToInsert) + newCategories + toolboxCategories.slice(indexToInsert);

  const defaultOptions = {
    toolbox: toolboxCompiled,
    theme: customTheme
  };
  createPlayground(document.getElementById('root'), createWorkspace,
      defaultOptions);
});
