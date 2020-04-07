/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Block test.
 */

import * as Blockly from 'blockly';
import '../src/index.js';

// TODO: Edit list of blocks.
const allBlocks = ['block_template'];

/**
 * Test page startup, sets up Blockly.
 */
function start() {
  Blockly.inject('blocklyDiv',
      {
        toolbox: `<xml xmlns="https://developers.google.com/blockly/xml">
          ${allBlocks.map((b) => `<block type="${b}"></block>`)}
        </xml>`,
      });
}

document.addEventListener('DOMContentLoaded', start);
