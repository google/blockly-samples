/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';
import {
  JsonDefinitionGenerator,
  Order,
  jsonDefinitionGenerator,
} from './json_definition_generator';

/**
 * JSON definition for a single "type" block.
 * @param block
 * @param generator
 * @returns A type string corresponding to the option chosen.
 *    If custom option is chosen and not specified, returns null.
 */
jsonDefinitionGenerator.forBlock['type'] = function (
  block: Blockly.Block,
  generator: JsonDefinitionGenerator,
): [string, number] {
  const selected = block.getFieldValue('TYPEDROPDOWN');
  let output = '';
  switch (selected) {
    case 'null': {
      output = null;
      break;
    }
    case 'CUSTOM': {
      output = block.getFieldValue('CUSTOMTYPE') || null;
      break;
    }
    default: {
      output = selected;
    }
  }

  return [JSON.stringify(output), Order.ATOMIC];
};

/**
 * JSON Definition for the "any of" types block.
 * @param block
 * @param generator
 * @returns stringified version of:
 *     - null if the list is empty or contains the "any" type
 *     - a single type string if that is the only type present in the list
 *     - an array of all types in the list, deduplicated
 */
jsonDefinitionGenerator.forBlock['type_group'] = function (
  block: Blockly.Block,
  generator: JsonDefinitionGenerator,
): [string, number] {
  const types = new Set<string>();
  for (const input of block.inputList) {
    const value = generator.valueToCode(block, input.name, Order.ATOMIC);
    if (!value) continue; // No block connected to this input
    const type = JSON.parse(value) || '';
    if (type === null) {
      // If the list contains 'any' then the type check is simplified to 'any'
      return [JSON.stringify(null), Order.ATOMIC];
    }
    if (type) types.add(type);
  }

  if (types.size === 0) {
    // This shouldn't be possible, but for safety.
    return [JSON.stringify(null), Order.ATOMIC];
  }
  if (types.size === 1) {
    // If there's only one type, we return it directly instead of
    // returning an array with one member.
    return [JSON.stringify(Array.from(types)[0]), Order.ATOMIC];
  }
  return [JSON.stringify(Array.from(types)), Order.ATOMIC];
};
