/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {JsonDefinitionGenerator, Order, jsonDefinitionGenerator} from './json_definition_generator';
import * as Blockly from 'blockly';

/**
 * JSON definition for the "input" block.
 * @param block
 * @param generator
 * @returns The stringified JSON representing the stack of input blocks.
 *    The entire stack will be returned due to the `scrub_` function.
 *    The JSON returned here should be part of the `args0` of the JSON
 *    in the final block definition.
 */
jsonDefinitionGenerator.forBlock['input'] = function(
    block: Blockly.Block,
    generator: JsonDefinitionGenerator
): string {
  const name = block.getFieldValue('INPUTNAME');
  const inputType = block.getFieldValue('INPUT_TYPE');

  const code: any = {
    type: inputType,
    name: name,
  };

  const align = block.getFieldValue('ALIGNMENT');
  if (align !== 'LEFT') {
    code.align = align;
  }

  const typeValue = generator.valueToCode(block, 'TYPE', Order.ATOMIC);
  if (typeValue && typeValue !== 'null') {
    // If the typeValue is null, it doesn't get included in the input def.
    code.check = JSON.parse(typeValue);
  }

  return JSON.stringify(code);
};
