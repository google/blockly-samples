/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Field test.
 */

import * as Blockly from 'blockly';
import {addGUIControls, generateFieldTestBlocks} from '@blockly/dev-tools';
import '../src/index';

const toolbox = generateFieldTestBlocks('field_ratings', [
  {
    label: 'Basic',
    args: {
      value: 0,
    },
  },
  {
    label: 'Colour of stars',
    args: {
      value: 2,
      starColour: '#000',
      starColourSelect: '#f00',
      starColourHover: '#fff',
    },
  },
  {
    label: 'Shape of stars',
    args: {
      value: 5,
      starSize: 15,
      starRadius: 9,
    },
  },
  {
    label: 'Padding around stars',
    args: {
      value: 2,
      starPadding: 8,
    },
  },
  {
    label: 'Number of Stars',
    args: {
      value: 5,
      maxRating: 10,
    },
  },
]);

/**
 * Test page startup, sets up Blockly.
 */
function start(): void {
  const defaultOptions = {
    toolbox,
  };
  addGUIControls((options) => {
    return Blockly.inject('blocklyDiv', options);
  }, defaultOptions);
}

document.addEventListener('DOMContentLoaded', start);
