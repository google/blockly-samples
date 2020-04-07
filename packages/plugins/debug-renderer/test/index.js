/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview BlocklyDebugRenderer test
 */

import * as Blockly from 'blockly';
import { toolboxCategories } from '@blockly/dev-tools';
import { BlocklyDebugRenderer } from '../src/index';

/**
 * DOM loaded.
 */
function start() {
  Blockly.inject('blocklyDiv',
      {
        toolbox: toolboxCategories
      }
  );
  BlocklyDebugRenderer.init();
}

document.addEventListener('DOMContentLoaded', start);
