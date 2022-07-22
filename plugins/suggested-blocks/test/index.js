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
  SuggestedBlocks.init(workspace);
  return workspace;
}

const customTheme = Blockly.Theme.defineTheme('classic_with_suggestions', {
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

/**
 * Helper method that splices a string into another string.
 * @param {string} original the base string
 * @param {string} newContent the new string to be inserted
 * @param {number} index the index where the string should be inserted
 * @return {string} the modified string.
 */
function insertIntoString(original, newContent, index) {
  return original.slice(0, index) + newContent + original.slice(index);
}

document.addEventListener('DOMContentLoaded', function() {
  // Insert two new categories
  const mostUsedCategory = '<category name="Frequently Used" categorystyle=' +
    '"frequently_used_category" custom="MOST_USED"></category>';
  const recentlyUsedCategory = '<category name="Recently Used" categorystyle=' +
    '"recently_used_category" custom="RECENTLY_USED"></category>';
  const indexToInsert = toolboxCategories.indexOf('</xml>');
  const toolboxCompiled = insertIntoString(toolboxCategories,
      mostUsedCategory + recentlyUsedCategory, indexToInsert);

  const defaultOptions = {
    toolbox: toolboxCompiled,
    theme: customTheme,
  };
  createPlayground(document.getElementById('root'), createWorkspace,
      defaultOptions);
});
