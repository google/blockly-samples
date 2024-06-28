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

jsonDefinitionGenerator.forBlock['field_image'] = function (
  block: Blockly.Block,
  generator: JsonDefinitionGenerator,
): string {
  const code = {
    type: 'field_image',
    src: block.getFieldValue('SRC'),
    width: block.getFieldValue('WIDTH'),
    height: block.getFieldValue('HEIGHT'),
    alt: block.getFieldValue('ALT'),
    flipRtl: block.getFieldValue('FLIP_RTL'),
  };
  return JSON.stringify(code);
};

javascriptDefinitionGenerator.forBlock['field_image'] = function (
  block: Blockly.Block,
  generator: JavascriptDefinitionGenerator,
) {
  const src = generator.quote_(block.getFieldValue('SRC'));
  const width = block.getFieldValue('WIDTH');
  const height = block.getFieldValue('HEIGHT');
  const alt = generator.quote_(block.getFieldValue('ALT'));
  const flipRtl = generator.quote_(block.getFieldValue('FLIP_RTL'));

  const code = `.appendField(new Blockly.FieldImage(${src}, ${width}, ${height}, { alt: ${alt}, flipRtl: ${flipRtl}}))`;
  return code;
};

importHeaderGenerator.forBlock['field_image'] = function (
  block: Blockly.Block,
  generator: CodeHeaderGenerator,
): string {
  return '';
};

scriptHeaderGenerator.forBlock['field_image'] = function (
  block: Blockly.Block,
  generator: CodeHeaderGenerator,
): string {
  return '';
};

generatorStubGenerator.forBlock['field_image'] = function (
  block: Blockly.Block,
  generator: GeneratorStubGenerator,
): string {
  // Images don't have a value that would typically appear in a block-code generator
  return '';
};
