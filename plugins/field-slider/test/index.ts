/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Slider field test playground.
 * @author kozbial@google.com (Monica Kozbial)
 */

import * as Blockly from 'blockly';
import {generateFieldTestBlocks, createPlayground} from '@blockly/dev-tools';
import '../src/index';

const toolbox = generateFieldTestBlocks('field_slider', [
  {
    label: 'Basic',
    args: {
      'value': 50,
    },
  },
  {
    label: 'Min',
    args: {
      'value': 20,
      'min': 10,
    },
  },
  {
    label: 'Max',
    args: {
      'value': 70,
      'max': 80,
    },
  },
  {
    label: 'Min and Max',
    args: {
      'value': 60,
      'min': 10,
      'max': 80,
    },
  },
]);

/**
 * Create a workspace.
 * @param blocklyDiv The blockly container div.
 * @param options The Blockly options.
 * @return The created workspace.
 */
function createWorkspace(blocklyDiv: HTMLElement,
    options: Blockly.BlocklyOptions): Blockly.WorkspaceSvg {
  const workspace = Blockly.inject(blocklyDiv, options);
  return workspace;
}

document.addEventListener('DOMContentLoaded', function() {
  const defaultOptions: Blockly.BlocklyOptions = {
    toolbox,
  };
  const rootElement = document.getElementById('root');
  if (rootElement) {
    createPlayground(rootElement, createWorkspace, defaultOptions);
  }
});
