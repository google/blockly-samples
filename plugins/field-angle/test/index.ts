/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Angle field test playground.
 */

import * as Blockly from 'blockly';
import {generateFieldTestBlocks, createPlayground} from '@blockly/dev-tools';
import '../src/index';

const toolbox = generateFieldTestBlocks('field_angle', [
  {
    label: 'Compass',
    args: {
      'mode': 'compass',
      'value': 90,
    },
  },
  {
    label: 'Protractor',
    args: {
      'mode': 'protractor',
      'value': 90,
    },
  },
  {
    label: 'Round',
    args: {
      'precision': 0.1,
      'value': 123,
    },
  },
  {
    label: 'Radians',
    args: {
      'precision': 0.1,
      'clockwise': true,
      'value': 0,
      'min': 0,
      'max': Math.PI,
      'displayMin': -Math.PI,
      'displayMax': Math.PI,
      'minorTick': Math.PI / 8,
      'majorTick': Math.PI,
      'symbol': ' rad',
    },
  },
  {
    label: 'Quadrant',
    args: {
      'precision': 1,
      'value': 0,
      'min': 0,
      'max': 2,
      'displayMin': 0,
      'displayMax': 8,
      'minorTick': 0,
      'majorTick': 1,
      'symbol': '',
    },
  },
]);

/**
 * Create a workspace.
 * @param blocklyDiv The blockly container div.
 * @param options The Blockly options.
 * @returns The created workspace.
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
