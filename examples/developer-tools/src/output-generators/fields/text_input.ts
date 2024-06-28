/**
 * @license
 * Copyright 2023 Google LLC
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

jsonDefinitionGenerator.forBlock['field_input'] = function (
  block: Blockly.Block,
  generator: JsonDefinitionGenerator,
): string {
  const code = {
    type: 'field_input',
    name: block.getFieldValue('FIELDNAME'),
    text: block.getFieldValue('TEXT'),
  };
  return JSON.stringify(code);
};

javascriptDefinitionGenerator.forBlock['field_input'] = function (
  block: Blockly.Block,
  generator: JavascriptDefinitionGenerator,
): string {
  const name = generator.quote_(block.getFieldValue('FIELDNAME'));
  const text = generator.quote_(block.getFieldValue('TEXT'));

  const code = `.appendField(new Blockly.FieldTextInput(${text}), ${name})`;
  return code;
};

importHeaderGenerator.forBlock['field_input'] = function (
  block: Blockly.Block,
  generator: CodeHeaderGenerator,
): string {
  return '';
};

scriptHeaderGenerator.forBlock['field_input'] = function (
  block: Blockly.Block,
  generator: CodeHeaderGenerator,
): string {
  return '';
};

generatorStubGenerator.forBlock['field_input'] = function (
  block: Blockly.Block,
  generator: GeneratorStubGenerator,
): string {
  const name = block.getFieldValue('FIELDNAME');
  const fieldVar = generator.createVariableName('text', name);
  return `const ${fieldVar} = block.getFieldValue(${generator.quote_(
    name,
  )});\n`;
};
