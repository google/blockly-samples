/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';

const storageKey = 'mainWorkspace';

/**
 * Saves the state of the workspace to browser's local storage.
 * @param {Blockly.Workspace} workspace Blockly workspace to save.
 */
export const save = function (workspace) {
  const data = Blockly.serialization.workspaces.save(workspace);
  window.localStorage?.setItem(storageKey, JSON.stringify(data));
};

const defaultData = {
  'blocks': {
    'languageVersion': 0,
    'blocks': [
      {
        'type': 'p5_setup',
        'id': '5.{;T}3Qv}Awi:1M$:ut',
        'x': 10,
        'y': 30,
        'inputs': {
          'STATEMENTS': {
            'block': {
              'type': 'p5_canvas',
            },
          },
        },
      },
      {
        'type': 'p5_draw',
        'id': '3iI4f%2#Gmk}=OjI7(8h',
        'x': 400,
        'y': 30,
      },
    ],
  },
};

/**
 * Loads saved state from local storage into the given workspace.
 * @param {Blockly.Workspace} workspace Blockly workspace to load into.
 * @returns
 */
export const load = function (workspace) {
  const data =
    window.localStorage?.getItem(storageKey) || JSON.stringify(defaultData);

  // Don't emit events during loading.
  Blockly.Events.disable();
  Blockly.serialization.workspaces.load(JSON.parse(data), workspace, false);
  Blockly.Events.enable();
};
