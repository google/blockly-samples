/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Testing playground for Typed Variable Modal.
 * @author aschmiedt@gmail.com (Abby Schmiedt)
 */

import * as Blockly from 'blockly';
import {TypedVariableModal} from '../src/index.js';
import {toolboxCategories, createPlayground} from '@blockly/dev-tools';
import '../src/index.js';


/**
 * Create a workspace.
 * @param {HTMLElement} blocklyDiv The blockly container div.
 * @param {!Blockly.BlocklyOptions} options The Blockly options.
 * @return {!Blockly.WorkspaceSvg} The created workspace.
 */
function createWorkspace(blocklyDiv, options) {
  /**
   * Create the typed variable flyout.
   * @param {!Blockly.WorkspaceSvg} workspace The Blockly workspace.
   * @return {!Array.<!Element>} Array of XML block elements.
   */
  const createFlyout = function(workspace) {
    let xmlList = [];
    const button = document.createElement('button');
    button.setAttribute('text', 'Create Typed Variable');
    button.setAttribute('callbackKey', 'CREATE_TYPED_VARIABLE');

    xmlList.push(button);

    const blockList = Blockly.VariablesDynamic.flyoutCategoryBlocks(workspace);
    xmlList = xmlList.concat(blockList);
    return xmlList;
  };

  const types = [['Penguin', 'PENGUIN'], ['Giraffe', 'GIRAFFE']];
  const workspace = Blockly.inject(blocklyDiv, options);
  workspace.registerToolboxCategoryCallback(
      'CREATE_TYPED_VARIABLE', createFlyout);
  const typedVarModal =
      new TypedVariableModal(workspace, 'CREATE_TYPED_VARIABLE', types);
  typedVarModal.init();

  return workspace;
}

document.addEventListener('DOMContentLoaded', function() {
  let toolboxString = toolboxCategories.replace('</xml>',
      '<category name="Typed Variables" categorystyle="variable_category" ' +
      'custom="CREATE_TYPED_VARIABLE"></category>');
  toolboxString = toolboxString + '</xml>';

  const defaultOptions = {
    toolbox: toolboxString,
  };
  createPlayground(document.getElementById('root'), createWorkspace,
      defaultOptions);
});
