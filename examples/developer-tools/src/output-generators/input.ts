/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  JsonDefinitionGenerator,
  Order as JsonOrder,
  jsonDefinitionGenerator,
} from './json_definition_generator';
import {
  javascriptDefinitionGenerator,
  JavascriptDefinitionGenerator,
} from './javascript_definition_generator';
import {Order as JsOrder} from 'blockly/javascript';
import * as Blockly from 'blockly/core';
import {
  CodeHeaderGenerator,
  importHeaderGenerator,
  scriptHeaderGenerator,
} from './code_header_generator';
import {
  GeneratorStubGenerator,
  generatorStubGenerator,
} from './generator_stub_generator';

/**
 * JSON definition for the "input" block.
 *
 * @param block
 * @param generator
 * @returns The stringified JSON representing the stack of input blocks.
 *    The entire stack will be returned due to the `scrub_` function.
 *    The JSON returned here should be part of the `args0` of the JSON
 *    in the final block definition.
 */
jsonDefinitionGenerator.forBlock['input'] = function (
  block: Blockly.Block,
  generator: JsonDefinitionGenerator,
): string {
  const name = block.getFieldValue('INPUTNAME');
  const inputType = block.getFieldValue('INPUTTYPE');

  const code: {[key: string]: unknown} = {
    type: inputType,
    name: name,
  };

  const align = block.getFieldValue('ALIGNMENT');
  if (align !== 'LEFT') {
    code.align = align;
  }

  const connectionCheckValue = block.getInput('CHECK')
    ? generator.valueToCode(block, 'CHECK', JsonOrder.ATOMIC)
    : '';
  if (connectionCheckValue && connectionCheckValue !== 'null') {
    // If the connectionCheckValue is null, it doesn't get included in the input def.
    code.check = JSON.parse(connectionCheckValue);
  }

  // All fields associated with an input are in the argument list just
  // ahead of their input, so prepend the field code to the final
  // input code.
  const fields = generator.statementToCode(block, 'FIELDS');

  return fields + (fields ? ',\n' : '') + JSON.stringify(code);
};

/* eslint-disable @typescript-eslint/naming-convention
 -- These value names match the JSON block definition input names.
*/
const inputDropdownToJsName: Record<string, string> = {
  input_value: 'Value',
  input_statement: 'Statement',
  input_dummy: 'Dummy',
  input_end_row: 'EndRow',
};
/* eslint-enable @typescript-eslint/naming-convention */

const alignDropdownToJsName: Record<string, string> = {
  LEFT: 'Blockly.inputs.Align.LEFT',
  CENTRE: 'Blockly.inputs.Align.CENTRE',
  RIGHT: 'Blockly.inputs.Align.RIGHT',
};

/**
 * JavaScript definition for the "input" block.
 *
 * @param block
 * @param generator
 * @returns The JavaScript code that will add this input to the block definition.
 */
javascriptDefinitionGenerator.forBlock['input'] = function (
  block: Blockly.Block,
  generator: JavascriptDefinitionGenerator,
): string {
  const name = block.getFieldValue('INPUTNAME');
  const inputType = inputDropdownToJsName[block.getFieldValue('INPUTTYPE')];
  const alignValue = block.getFieldValue('ALIGNMENT');
  const alignCode =
    alignValue === 'LEFT'
      ? ''
      : `\n.setAlign(${alignDropdownToJsName[alignValue]})`;

  const connectionCheckValue = block.getInput('CHECK')
    ? generator.valueToCode(block, 'CHECK', JsOrder.FUNCTION_CALL)
    : '';
  const checkCode =
    !connectionCheckValue || connectionCheckValue === 'null'
      ? ''
      : `\n.setCheck(${connectionCheckValue})`;

  const fields = generator.statementToCode(block, 'FIELDS');

  const code = `this.append${inputType}Input('${name}')${alignCode}${checkCode}${
    fields ? '\n' : ''
  }${fields};`;

  return code;
};

importHeaderGenerator.forBlock['input'] = function (
  block: Blockly.Block,
  generator: CodeHeaderGenerator,
): string {
  // Allow all the fields to add their headers, if they want to
  generator.statementToCode(block, 'FIELDS');
  return '';
};

scriptHeaderGenerator.forBlock['input'] = function (
  block: Blockly.Block,
  generator: CodeHeaderGenerator,
): string {
  // Allow all the fields to add their headers, if they want to
  generator.statementToCode(block, 'FIELDS');
  return '';
};

generatorStubGenerator.forBlock['input'] = function (
  block: Blockly.Block,
  generator: GeneratorStubGenerator,
): string {
  const inputType = inputDropdownToJsName[block.getFieldValue('INPUTTYPE')];
  const inputName = block.getFieldValue('INPUTNAME');
  const inputVar = generator.createVariableName(inputType, inputName);
  const fields = generator.statementToCode(block, 'FIELDS');
  const orderPrefix = generator.getScriptMode()
    ? generator.getLanguage() + '.'
    : '';
  const codeLines: string[] = [];

  if (inputType === 'Value') {
    codeLines.push(
      '// TODO: change Order.ATOMIC to the correct operator precedence strength',
    );
    codeLines.push(
      `const ${inputVar} = generator.valueToCode(block, ${generator.quote_(
        inputName,
      )}, ${orderPrefix}Order.ATOMIC);`,
    );
  } else if (inputType === 'Statement') {
    codeLines.push(
      `const ${inputVar} = generator.statementToCode(block, ${generator.quote_(
        inputName,
      )});`,
    );
  }

  if (!fields && !codeLines.length) return '';

  // Add 1 extra new line always, and 1 more if this isn't the last input in the stack
  codeLines.push('');
  if (block.getNextBlock()) codeLines.push('');
  return generator.prefixLines(fields + codeLines.join('\n'), '  ');
};
