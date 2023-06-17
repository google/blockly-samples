/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Adds blocks that replace the built-in mutator UI with dynamic
 *     connections that appear when a block is dragged over inputs on the block.
 */

import * as Blockly from 'blockly/core';
import './insertion_marker_manager_monkey_patch';
import './dynamic_if.js';
import './dynamic_text_join.js';
import './dynamic_list_create.js';

export const overrideOldBlockDefinitions = function() {
  Blockly.Blocks['lists_create_with'] = Blockly.Blocks['dynamic_list_create'];
  Blockly.Blocks['text_join'] = Blockly.Blocks['dynamic_text_join'];
  Blockly.Blocks['controls_if'] = Blockly.Blocks['dynamic_if'];
};
