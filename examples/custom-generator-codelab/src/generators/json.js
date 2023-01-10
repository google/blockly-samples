/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';

export const jsonGenerator = new Blockly.Generator('JSON');

jsonGenerator.PRECEDENCE = 0;

jsonGenerator.scrub_ = function(block, code, thisOnly) {
  const nextBlock =
      block.nextConnection && block.nextConnection.targetBlock();
  if (nextBlock && !thisOnly) {
    return code + ',\n' + jsonGenerator.blockToCode(nextBlock);
  }
  return code;
};

jsonGenerator['logic_null'] = function(block) {
  return ['null', jsonGenerator.PRECEDENCE];
};

jsonGenerator['text'] = function(block) {
  const textValue = block.getFieldValue('TEXT');
  const code = `"${textValue}"`;
  return [code, jsonGenerator.PRECEDENCE];
};

jsonGenerator['math_number'] = function(block) {
  const code = String(block.getFieldValue('NUM'));
  return [code, jsonGenerator.PRECEDENCE];
};

jsonGenerator['logic_boolean'] = function(block) {
  const code = (block.getFieldValue('BOOL') == 'TRUE') ? 'true' : 'false';
  return [code, jsonGenerator.PRECEDENCE];
};

jsonGenerator['member'] = function(block) {
  const name = block.getFieldValue('MEMBER_NAME');
  const value = jsonGenerator.valueToCode(
      block, 'MEMBER_VALUE', jsonGenerator.PRECEDENCE);
  const code = `"${name}": ${value}`;
  return code;
};

jsonGenerator['lists_create_with'] = function(block) {
  const values = [];
  for (let i = 0; i < block.itemCount_; i++) {
    const valueCode = jsonGenerator.valueToCode(block, 'ADD' + i,
        jsonGenerator.PRECEDENCE);
    if (valueCode) {
      values.push(valueCode);
    }
  }
  const valueString = values.join(',\n');
  const indentedValueString =
      jsonGenerator.prefixLines(valueString, jsonGenerator.INDENT);
  const codeString = '[\n' + indentedValueString + '\n]';
  return [codeString, jsonGenerator.PRECEDENCE];
};

jsonGenerator['object'] = function(block) {
  const statementMembers =
      jsonGenerator.statementToCode(block, 'MEMBERS');
  const code = '{\n' + statementMembers + '\n}';
  return [code, jsonGenerator.PRECEDENCE];
};
