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
import {generateFieldTestBlocks, addGUIControls} from '@blockly/dev-tools';
import '../dist/date_compressed';

const toolbox = generateFieldTestBlocks('field_date', [
  {
    'args': {
      'date': '2020-02-20',
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
