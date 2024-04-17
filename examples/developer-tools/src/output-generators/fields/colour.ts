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

jsonDefinitionGenerator.forBlock['field_colour'] = function (
  block: Blockly.Block,
  generator: JsonDefinitionGenerator,
): string {
  const code = {
    type: 'field_colour',
    name: block.getFieldValue('FIELDNAME'),
    colour: block.getFieldValue('COLOUR'),
  };
  return JSON.stringify(code);
};

javascriptDefinitionGenerator.forBlock['field_colour'] = function (
  block: Blockly.Block,
  generator: JavascriptDefinitionGenerator,
): string {
  const name = generator.quote_(block.getFieldValue('FIELDNAME'));
  const colour = generator.quote_(block.getFieldValue('COLOUR'));
  return `.appendField(new FieldColour(${colour}), ${name})`;
};

importHeaderGenerator.forBlock['field_colour'] = function (
  block: Blockly.Block,
  generator: CodeHeaderGenerator,
): string {
  generator.addHeaderLine(
    `import {registerFieldColour, FieldColour} from '@blockly/field-colour';`,
  );
  generator.addHeaderLine(`registerFieldColour();`);
  return '';
};

scriptHeaderGenerator.forBlock['field_colour'] = function (
  block: Blockly.Block,
  generator: CodeHeaderGenerator,
): string {
  generator.addHeaderLine(
    `<script src="https://unpkg.com/@blockly/field-colour"></script>`,
  );
  generator.addHeaderLine(`registerFieldColour();`);
  return '';
};

generatorStubGenerator.forBlock['field_colour'] = function (
  block: Blockly.Block,
  generator: GeneratorStubGenerator,
): string {
  const name = block.getFieldValue('FIELDNAME');
  const fieldVar = generator.createVariableName('colour', name);
  return `const ${fieldVar} = block.getFieldValue(${generator.quote_(
    name,
  )});\n`;
};
