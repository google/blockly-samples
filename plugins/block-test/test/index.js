/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Block test.
 */

import * as Blockly from 'blockly';
import {toolboxTestBlocks as toolbox,
  toolboxTestBlocksInit as onInit} from '../src/index';

document.addEventListener('DOMContentLoaded', function() {
  const workspace = Blockly.inject('root', {
    toolbox: toolbox,
  });
  onInit(workspace);
});
