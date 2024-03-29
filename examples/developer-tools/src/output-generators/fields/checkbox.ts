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

jsonDefinitionGenerator.forBlock['field_checkbox'] = function (
  block: Blockly.Block,
  generator: JsonDefinitionGenerator,
): string {
  const code = {
    type: 'field_checkbox',
    name: block.getFieldValue('FIELDNAME'),
    checked: block.getFieldValue('CHECKED'),
  };
  return JSON.stringify(code);
};

javascriptDefinitionGenerator.forBlock['field_checkbox'] = function (
  block: Blockly.Block,
  generator: JavascriptDefinitionGenerator,
): string {
  const name = generator.quote_(block.getFieldValue('FIELDNAME'));
  const checked = generator.quote_(block.getFieldValue('CHECKED'));
  return `.appendField(new Blockly.FieldCheckbox(${checked}), ${name})`;
};

importHeaderGenerator.forBlock['field_checkbox'] = function (
  block: Blockly.Block,
  generator: CodeHeaderGenerator,
): string {
  return '';
};

scriptHeaderGenerator.forBlock['field_checkbox'] = function (
  block: Blockly.Block,
  generator: CodeHeaderGenerator,
): string {
  return '';
};

generatorStubGenerator.forBlock['field_checkbox'] = function (
  block: Blockly.Block,
  generator: GeneratorStubGenerator,
): string {
  const name = block.getFieldValue('FIELDNAME');
  const fieldVar = generator.createVariableName('checkbox', name);
  return `const ${fieldVar} = block.getFieldValue(${generator.quote_(
    name,
  )});\n`;
};
