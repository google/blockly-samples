/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Plugin test.
 */

import * as Blockly from 'blockly';
import {toolboxCategories} from '@blockly/dev-tools';
import {Modal} from '../src/index';

/**
 * Test page startup, sets up Blockly.
 */
function start() {
  const workspace = Blockly.inject('blocklyDiv', {
    toolbox: toolboxCategories,
  });
  console.log(Modal);
  const modal = new Modal('Test Modal', workspace);
  modal.init();
  modal.show();
}

document.addEventListener('DOMContentLoaded', start);
