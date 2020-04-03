/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Block test.
 */

import Blockly from 'blockly';
import '../src/index.js';

const blocks = ['block_template'];

function start() {
  Blockly.inject('blocklyDiv',
    {
      toolbox: `<xml xmlns="https://developers.google.com/blockly/xml" style="display: none">
      ${blocks.map(b => `<block type="${b}"></block>`)}
    </xml>`
    });
}

document.addEventListener("DOMContentLoaded", start);
