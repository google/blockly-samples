/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  JsonDefinitionGenerator,
  jsonDefinitionGenerator,
} from '../json_definition_generator';
import {DropdownOptionData, FieldDropdownBlock} from '../../blocks/fields';
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

/**
 * Gets the array of human-readable and machine-readable dropdown options.
 *
 * @param block Dropdown field block to read.
 * @returns An array of dropdown option arrays.
 */
function getOptionsList(block: FieldDropdownBlock) {
  const options: Array<[DropdownOptionData, string]> = [];
  for (let i = 0; i < block.optionList.length; i++) {
    options.push([block.getUserData(i), block.getFieldValue('CPU' + i)]);
  }
  return options;
}

jsonDefinitionGenerator.forBlock['field_dropdown'] = function (
  block: FieldDropdownBlock,
  generator: JsonDefinitionGenerator,
): string {
  const code: Record<string, string | Array<[DropdownOptionData, string]>> = {
    type: 'field_dropdown',
    name: block.getFieldValue('FIELDNAME'),
  };
  const options: Array<[DropdownOptionData, string]> = getOptionsList(block);

  if (options.length === 0) {
    // If there are no options in the dropdown, the field isn't valid.
    // Remove it from the list of fields by returning an empty string.
    return '';
  }

  code.options = options;
  return JSON.stringify(code);
};

javascriptDefinitionGenerator.forBlock['field_dropdown'] = function (
  block: FieldDropdownBlock,
  generator: JavascriptDefinitionGenerator,
): string {
  const name = generator.quote_(block.getFieldValue('FIELDNAME'));
  const options = getOptionsList(block);
  if (options.length === 0) {
    // If there are no options in the dropdown, the field isn't valid.
    // Remove it from the list of fields by returning an empty string.
    return '';
  }

  const formatImgOption = function (option: DropdownOptionData) {
    if (typeof option === 'string') return;
    const optionString = generator.prefixLines(
      `src: ${generator.quote_(option.src)},
height: ${generator.quote_(option.height.toString())},
width: ${generator.quote_(option.width.toString())},
alt: ${generator.quote_(option.alt)},`,
      generator.INDENT,
    );
    return `{
${optionString}
}`;
  };

  const optionsCode = [];
  for (const option of options) {
    if (typeof option[0] === 'string') {
      // text option
      optionsCode.push(
        `[${generator.quote_(option[0])}, ${generator.quote_(option[1])}]`,
      );
    } else {
      // image option
      optionsCode.push(
        `[${formatImgOption(option[0])}, ${generator.quote_(option[1])}]`,
      );
    }
  }

  const optionsString = generator.prefixLines(
    optionsCode.join(',\n'),
    generator.INDENT + generator.INDENT,
  );
  const code = `.appendField(new Blockly.FieldDropdown([
${optionsString}
${generator.INDENT}]), ${name})`;
  return code;
};

importHeaderGenerator.forBlock['field_dropdown'] = function (
  block: FieldDropdownBlock,
  generator: CodeHeaderGenerator,
): string {
  return '';
};

scriptHeaderGenerator.forBlock['field_dropdown'] = function (
  block: FieldDropdownBlock,
  generator: CodeHeaderGenerator,
): string {
  return '';
};

generatorStubGenerator.forBlock['field_dropdown'] = function (
  block: FieldDropdownBlock,
  generator: GeneratorStubGenerator,
): string {
  const name = block.getFieldValue('FIELDNAME');
  const fieldVar = generator.createVariableName('dropdown', name);
  return `const ${fieldVar} = block.getFieldValue(${generator.quote_(
    name,
  )});\n`;
};
