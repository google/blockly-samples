/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  JsonDefinitionGenerator,
  Order,
  jsonDefinitionGenerator,
} from './json_definition_generator';
import * as Blockly from 'blockly/core';

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

  const connectionCheckValue = generator.valueToCode(
    block,
    'CHECK',
    Order.ATOMIC,
  );
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
