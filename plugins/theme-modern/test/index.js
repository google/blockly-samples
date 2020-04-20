/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Block test.
 */

import * as Blockly from 'blockly';
import {toolboxCategories, addGUIControls} from '@blockly/dev-tools';
import Theme from '../src/index.js';


/**
 * Test page startup, sets up Blockly.
 */
function start() {
  const defaultOptions = {
    toolbox: toolboxCategories,
    theme: Theme,
  };
  addGUIControls((options) => {
    return Blockly.inject('blocklyDiv', options);
  }, defaultOptions);
}

document.addEventListener('DOMContentLoaded', start);
