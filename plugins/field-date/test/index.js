/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Date input field test.
 * @author samelh@google.com (Sam El-Husseini)
 */

import * as Blockly from 'blockly';
import {generateFieldTestBlocks, createPlayground} from '@blockly/dev-tools';
import '../dist/date_compressed';

const toolbox = generateFieldTestBlocks('field_date', [
  {
    'label': 'Simple',
    'args': {
      'date': '2020-02-20',
      'textEdit': 'false',
    },
  },
  {
    'label': 'Text Edit',
    'args': {
      'date': '2020-02-20',
      'textEdit': 'true',
    },
  },
]);

/**
 * Create a workspace.
 * @param {HTMLElement} blocklyDiv The blockly container div.
 * @param {!Blockly.BlocklyOptions} options The Blockly options.
 * @return {!Blockly.WorkspaceSvg} The created workspace.
 */
function createWorkspace(blocklyDiv, options) {
  const workspace = Blockly.inject(blocklyDiv, options);
  return workspace;
}

document.addEventListener('DOMContentLoaded', function() {
  const defaultOptions = {
    toolbox,
  };
  createPlayground(document.getElementById('root'), createWorkspace,
      defaultOptions);
});
