/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The full custom JSON generator built during the custom
 * generator codelab.
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

jsonGenerator.forBlock['logic_null'] = function(block, generator) {
  return ['null', generator.PRECEDENCE];
};

jsonGenerator.forBlock['text'] = function(block, generator) {
  const textValue = block.getFieldValue('TEXT');
  const code = `"${textValue}"`;
  return [code, generator.PRECEDENCE];
};

jsonGenerator.forBlock['math_number'] = function(block, generator) {
  const code = String(block.getFieldValue('NUM'));
  return [code, generator.PRECEDENCE];
};

jsonGenerator.forBlock['logic_boolean'] = function(block, generator) {
  const code = (block.getFieldValue('BOOL') == 'TRUE') ? 'true' : 'false';
  return [code, generator.PRECEDENCE];
};

jsonGenerator.forBlock['member'] = function(block, generator) {
  const name = block.getFieldValue('MEMBER_NAME');
  const value = generator.valueToCode(
      block, 'MEMBER_VALUE', generator.PRECEDENCE);
  const code = `"${name}": ${value}`;
  return code;
};

jsonGenerator.forBlock['lists_create_with'] = function(block, generator) {
  const values = [];
  for (let i = 0; i < block.itemCount_; i++) {
    const valueCode = generator.valueToCode(block, 'ADD' + i,
        generator.PRECEDENCE);
    if (valueCode) {
      values.push(valueCode);
    }
  }
  const valueString = values.join(',\n');
  const indentedValueString =
      generator.prefixLines(valueString, generator.INDENT);
  const codeString = '[\n' + indentedValueString + '\n]';
  return [codeString, generator.PRECEDENCE];
};

jsonGenerator.forBlock['object'] = function(block, generator) {
  const statementMembers =
      generator.statementToCode(block, 'MEMBERS');
  const code = '{\n' + statementMembers + '\n}';
  return [code, generator.PRECEDENCE];
};
