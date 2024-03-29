/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';
import {
  JsonDefinitionGenerator,
  jsonDefinitionGenerator,
} from '../json_definition_generator';
import {
  JavascriptDefinitionGenerator,
  javascriptDefinitionGenerator,
} from '../javascript_definition_generator';
import {
  CodeHeaderGenerator,
  importHeaderGenerator,
  scriptHeaderGenerator,
} from '../code_header_generator';
import {
  GeneratorStubGenerator,
  generatorStubGenerator,
} from '../generator_stub_generator';

jsonDefinitionGenerator.forBlock['field_number'] = function (
  block: Blockly.Block,
  generator: JsonDefinitionGenerator,
): string {
  const code: Record<string, string | number> = {
    type: 'field_number',
    name: block.getFieldValue('FIELDNAME'),
    value: block.getFieldValue('VALUE'),
  };
  const min = block.getFieldValue('MIN');
  const max = block.getFieldValue('MAX');
  const precision = block.getFieldValue('PRECISION');
  if (min !== -Infinity) code.min = min;
  if (max !== Infinity) code.max = max;
  if (precision !== 0) code.precision = precision;
  return JSON.stringify(code);
};

javascriptDefinitionGenerator.forBlock['field_number'] = function (
  block: Blockly.Block,
  generator: JavascriptDefinitionGenerator,
): string {
  const name = generator.quote_(block.getFieldValue('FIELDNAME'));
  const value = block.getFieldValue('VALUE');
  const min = block.getFieldValue('MIN');
  const max = block.getFieldValue('MAX');
  const precision = block.getFieldValue('PRECISION');
  const args = [value, min, max, precision];

  // Remove trailing useless arguments if needed
  if (precision === 0) {
    args.pop();
    if (max === Infinity) {
      args.pop();
      if (min === -Infinity) {
        args.pop();
      }
    }
  }
  const argsString = args.join(', ');

  const code = `.appendField(new Blockly.FieldNumber(${argsString}), ${name})`;
  return code;
};

importHeaderGenerator.forBlock['field_number'] = function (
  block: Blockly.Block,
  generator: CodeHeaderGenerator,
): string {
  return '';
};

scriptHeaderGenerator.forBlock['field_number'] = function (
  block: Blockly.Block,
  generator: CodeHeaderGenerator,
): string {
  return '';
};

generatorStubGenerator.forBlock['field_number'] = function (
  block: Blockly.Block,
  generator: GeneratorStubGenerator,
): string {
  const name = block.getFieldValue('FIELDNAME');
  const fieldVar = generator.createVariableName('number', name);
  return `const ${fieldVar} = block.getFieldValue(${generator.quote_(
    name,
  )});\n`;
};
