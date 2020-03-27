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
import { TypedVariableModal } from '../src/index.js';
import { toolboxCategories } from '@blockly/dev-tools';

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
  startBlocklyInstance('VertStartLTR', false, false, 'start', toolboxCategories, [["Penguin", "PENGUIN"],["Giraffe", "GIRAFFE"]]);
  startBlocklyInstance('VertStartRTL', true, false, 'start', toolboxCategories, [["Pink", "PINK"],["Blue", "BLUE"]]);

  startBlocklyInstance('VertEndLTR', false, false, 'end', toolboxCategories,[["Whale", "WHALE"],["Shark", "SHARK"]]);
  startBlocklyInstance('VertEndRTL', true, false, 'end', toolboxCategories,[["Great Dane", "GREAT_DANE"],["Boston Terrier", "BOSTON_TERRIER"]]);

  startBlocklyInstance('HorizontalStartLTR', false, true, 'start', toolboxCategories, [["Pink", "PINK"],["Blue", "BLUE"]]);
  startBlocklyInstance('HorizontalStartRTL', true, true, 'start', toolboxCategories, [["Pink", "PINK"],["Blue", "BLUE"]]);

  startBlocklyInstance('HorizontalEndLTR', false, true, 'end', toolboxCategories, [["Pink", "PINK"],["Blue", "BLUE"]]);
  startBlocklyInstance('HorizontalEndRTL', true, true, 'end', toolboxCategories, [["Pink", "PINK"],["Blue", "BLUE"]]);
}

function startBlocklyInstance(suffix, rtl, horizontalLayout, position, toolbox, types) {
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
  const typedVarModal = new TypedVariableModal(ws, 'CREATE_TYPED_VARIABLE', types);
  typedVarModal.init();
  return ws;
}

document.addEventListener("DOMContentLoaded", function () { start() });
