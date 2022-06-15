/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Field test.
 */

import '../src/field-bitmap';

import {createPlayground, generateFieldTestBlocks} from '@blockly/dev-tools';
import * as Blockly from 'blockly';

const toolbox = generateFieldTestBlocks('field_bitmap', [
  {
    'label': 'With Default',
    'args': {
      'value': [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 0, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 0],
        [0, 1, 0, 0, 0, 1, 0],
        [0, 0, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
      ],
    },
  },
  {
    'label': 'Empty',
    'args': {
      'width': 3,
      'height': 3,
      'value': undefined,
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
  createPlayground(
      document.getElementById('root'), createWorkspace, defaultOptions);
});
