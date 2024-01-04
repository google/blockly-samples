/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';

const storageKey = 'blockFactory';

const startBlocks = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'factory_base',
        deletable: false,
        x: 53,
        y: 23,
        fields: {
          NAME: 'block_type',
          INLINE: 'AUTO',
          CONNECTIONS: 'NONE',
        },
        inputs: {
          TOOLTIP: {
            block: {
              type: 'text',
              deletable: false,
              movable: false,
              fields: {
                TEXT: '',
              },
            },
          },
          HELPURL: {
            block: {
              type: 'text',
              deletable: false,
              movable: false,
              fields: {
                TEXT: '',
              },
            },
          },
        },
      },
    ],
  },
};

/**
 * Saves the state of the workspace to browser's local storage.
 * @param workspace Blockly workspace to save.
 */
export const save = function (workspace: Blockly.Workspace) {
  const data = Blockly.serialization.workspaces.save(workspace);
  window.localStorage?.setItem(storageKey, JSON.stringify(data));
};

/**
 * Loads saved state from local storage into the given workspace.
 * @param workspace Blockly workspace to load into.
 */
export const load = function (workspace: Blockly.Workspace) {
  const data = window.localStorage?.getItem(storageKey);
  if (data) {
    Blockly.serialization.workspaces.load(JSON.parse(data), workspace);
  } else {
    // Load starter block
    Blockly.serialization.workspaces.load(startBlocks, workspace);
  }
};
