/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Dynamic block connection test playground.
 */

import * as Blockly from 'blockly';
import {createPlayground} from '@blockly/dev-tools';
import * as BlockDynamicConnection from '../src/index';

/**
 * Create a workspace.
 * @param {HTMLElement} blocklyDiv The blockly container div.
 * @param {!Blockly.BlocklyOptions} options The Blockly options.
 * @return {!Blockly.WorkspaceSvg} The created workspace.
 */
function createWorkspace(blocklyDiv, options) {
  return Blockly.inject(blocklyDiv, options);
}

document.addEventListener('DOMContentLoaded', function() {
  BlockDynamicConnection.overrideOldBlockDefinitions();

  const toolbox = {
    kind: 'flyoutToolbox',
    contents: [
      {
        kind: 'block',
        type: 'text_join',
      },
      {
        kind: 'block',
        type: 'lists_create_with',
      },
      {
        kind: 'block',
        type: 'controls_if',
      },
      {
        kind: 'block',
        type: 'logic_boolean',
        fields: {
          BOOL: 'TRUE',
        },
      },
      {
        kind: 'block',
        type: 'text',
        fields: {
          TEXT: 'abc',
        },
      },
      {
        kind: 'block',
        type: 'math_number',
        fields: {
          NUM: '123',
        },
      },
      {
        kind: 'block',
        type: 'text_print',
        inputs: {
          TEXT: {
            shadow: {
              type: 'text',
              fields: {
                TEXT: 'abc',
              },
            },
          },
        },
      },
    ],
  };

  const defaultOptions = {
    toolbox,
  };
  createPlayground(document.getElementById('root'), createWorkspace,
      defaultOptions);
});
