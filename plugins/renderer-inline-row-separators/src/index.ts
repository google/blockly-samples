/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';
import {addInlineRowSeparators, InlineRenderer}
  from './inline_row_separators_renderer';
import './inline_text_join';
import './inline_lists_create_with';
import './inline_procedures_defreturn';

export {addInlineRowSeparators, InlineRenderer};

/**
 * Replaces the built-in block definitions for "text_join",
 * "lists_create_with", and "procedures_defreturn" with alternatives that
 * render the value inputs as inline inputs on separate rows.
 */
export const overrideOldBlockDefinitions = function() {
  Blockly.Blocks['text_join'] = Blockly.Blocks['inline_text_join'];
  Blockly.Blocks['lists_create_with'] =
      Blockly.Blocks['inline_lists_create_with'];
  Blockly.Blocks['procedures_defreturn'] =
      Blockly.Blocks['inline_procedures_defreturn'];
};
