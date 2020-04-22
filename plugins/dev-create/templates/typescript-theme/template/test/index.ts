/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Block test.
 */

import * as Blockly from 'blockly';
import {toolboxCategories} from '@blockly/dev-tools';
import Theme from '../src/index';

/**
 * Test page startup, sets up Blockly.
 */
function start(): void {
  Blockly.inject('blocklyDiv', {
    toolbox: toolboxCategories,
    theme: Theme,
  });
}

document.addEventListener('DOMContentLoaded', start);
