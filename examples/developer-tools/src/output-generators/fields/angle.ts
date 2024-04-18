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

jsonDefinitionGenerator.forBlock['field_angle'] = function (
  block: Blockly.Block,
  generator: JsonDefinitionGenerator,
): string {
  const code = {
    type: 'field_angle',
    name: block.getFieldValue('FIELDNAME'),
    angle: block.getFieldValue('ANGLE'),
  };
  return JSON.stringify(code);
};

javascriptDefinitionGenerator.forBlock['field_angle'] = function (
  block: Blockly.Block,
  generator: JavascriptDefinitionGenerator,
): string {
  const name = generator.quote_(block.getFieldValue('FIELDNAME'));
  const angle = block.getFieldValue('ANGLE');
  return `.appendField(new FieldAngle(${angle}), ${name})`;
};

importHeaderGenerator.forBlock['field_angle'] = function (
  block: Blockly.Block,
  generator: CodeHeaderGenerator,
): string {
  generator.addHeaderLine(
    `import {registerFieldAngle, FieldAngle} from '@blockly/field-angle';`,
  );
  generator.addHeaderLine(`registerFieldAngle();`);
  return '';
};

scriptHeaderGenerator.forBlock['field_angle'] = function (
  block: Blockly.Block,
  generator: CodeHeaderGenerator,
): string {
  generator.addHeaderLine(
    `<script src="https://unpkg.com/@blockly/field-angle"></script>`,
  );
  generator.addHeaderLine(`registerFieldAngle();`);
  return '';
};

generatorStubGenerator.forBlock['field_angle'] = function (
  block: Blockly.Block,
  generator: GeneratorStubGenerator,
): string {
  const name = block.getFieldValue('FIELDNAME');
  const fieldVar = generator.createVariableName('angle', name);
  return `const ${fieldVar} = block.getFieldValue(${generator.quote_(
    name,
  )});\n`;
};
