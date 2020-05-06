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
import {generateFieldTestBlocks, addGUIControls} from '@blockly/dev-tools';
import '../src/index';

const toolbox = generateFieldTestBlocks('field_slider', [
  {
    'label': 'Basic',
    'args': {
      'value': 50,
    },
  },
  {
    'label': 'Min',
    'args': {
      'value': 20,
      'min': 10,
    },
  },
  {
    'label': 'Max',
    'args': {
      'value': 70,
      'max': 80,
    },
  },
  {
    'label': 'Min and Max',
    'args': {
      'value': 60,
      'min': 10,
      'max': 80,
    },
  },
]);

document.addEventListener('DOMContentLoaded', function() {
  const defaultOptions = {
    toolbox,
  };
  addGUIControls((options) => {
    return Blockly.inject('blocklyDiv', options);
  }, defaultOptions);
});
