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
import {toolboxCategories} from '@blockly/dev-tools';

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
  let toolboxString = toolboxCategories.replace('</xml>',
      '<category name="Typed Variables" categorystyle="variable_category" ' +
      'custom="CREATE_TYPED_VARIABLE"></category>');
  toolboxString = toolboxString + '</xml>';

  startBlocklyInstance('VertStartLTR', false, false, 'start', toolboxString,
      [['Penguin', 'PENGUIN'], ['Giraffe', 'GIRAFFE']]);
  startBlocklyInstance('VertStartRTL', true, false, 'start', toolboxString,
      [['Pink', 'PINK'], ['Blue', 'BLUE']]);

  startBlocklyInstance('VertEndLTR', false, false, 'end', toolboxString,
      [['Whale', 'WHALE'], ['Shark', 'SHARK']]);
  startBlocklyInstance('VertEndRTL', true, false, 'end', toolboxString,
      [['Great Dane', 'GREAT_DANE'], ['Boston Terrier', 'BOSTON_TERRIER']]);

  startBlocklyInstance('HorizontalStartLTR', false, true, 'start',
      toolboxString, [['Pink', 'PINK'], ['Blue', 'BLUE']]);
  startBlocklyInstance('HorizontalStartRTL', true, true, 'start', toolboxString,
      [['Pink', 'PINK'], ['Blue', 'BLUE']]);

  startBlocklyInstance('HorizontalEndLTR', false, true, 'end', toolboxString,
      [['Pink', 'PINK'], ['Blue', 'BLUE']]);
  startBlocklyInstance('HorizontalEndRTL', true, true, 'end', toolboxString,
      [['Pink', 'PINK'], ['Blue', 'BLUE']]);
}

/**
 * Inject a Blockly instance.
 * @param {string} suffix Id suffix to use.
 * @param {boolean} rtl RTL option.
 * @param {boolean} horizontalLayout Horizontal layout option.
 * @param {string} position Toolbox position option.
 * @param {string} toolbox Toolbox value.
 * @param {Array.<Array.<string>>} types An array holding arrays with the
 *     display name as the first value and the type as the second.
 *     Ex: [['Penguin', 'PENGUIN'], ['Giraffe', 'GIRAFFE']].
 */
function startBlocklyInstance(suffix, rtl, horizontalLayout, position, toolbox,
    types) {
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
  options.rtl = rtl;
  options.toolbox = toolbox;
  options.horizontalLayout = horizontalLayout;
  options.toolboxPosition = position;

  const ws = Blockly.inject('blocklyDiv' + suffix, options);
  ws.registerToolboxCategoryCallback('CREATE_TYPED_VARIABLE', createFlyout);
  const typedVarModal =
      new TypedVariableModal(ws, 'CREATE_TYPED_VARIABLE', types);
  typedVarModal.init();
}

document.addEventListener('DOMContentLoaded', start);
