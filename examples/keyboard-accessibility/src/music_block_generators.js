/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript generators for music blocks.
 */

import * as Blockly from 'blockly';

Blockly.JavaScript['music_pitch'] = function(block) {
  const code = Blockly.JavaScript.quote_(block.getFieldValue('PITCH'));
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['music_note'] = function(block) {
  const pitch = Blockly.JavaScript.valueToCode(block, 'PITCH',
      Blockly.JavaScript.ORDER_NONE) || 'C4';
  return 'play(' + Number(block.getFieldValue('DURATION')) + ', ' + pitch +
      ', \'block_id_' + block.id + '\');\n';
};

Blockly.JavaScript['music_rest_whole'] = function(block) {
  return 'rest(1, \'block_id_' + block.id + '\');\n';
};

Blockly.JavaScript['music_rest'] = function(block) {
  return 'rest(' + Number(block.getFieldValue('DURATION')) +
      ', \'block_id_' + block.id + '\');\n';
};

Blockly.JavaScript['music_instrument'] = function(block) {
  const instrument =
      Blockly.JavaScript.quote_(block.getFieldValue('INSTRUMENT'));
  return 'setInstrument(' + instrument + ', \'block_id_' + block.id + '\');\n';
};

Blockly.JavaScript['music_start'] = function(block) {
  const statementsStack = Blockly.JavaScript.statementToCode(block, 'STACK');
  const code = 'function start() {\n' +
    statementsStack + '}\n';
  // Add % so as not to collide with helper functions in definitions list.
  Blockly.JavaScript.definitions_['%start'] = code;
  return null;
};
