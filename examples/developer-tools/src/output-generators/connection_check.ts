/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';
import {
  JsonDefinitionGenerator,
  Order,
  jsonDefinitionGenerator,
} from './json_definition_generator';

/**
 * JSON definition for a single "connection_check" block.
 *
 * @param block
 * @param generator
 * @returns A connection check string corresponding to the option chosen.
 *    If custom option is chosen and not specified, returns null.
 */
jsonDefinitionGenerator.forBlock['connection_check'] = function (
  block: Blockly.Block,
  generator: JsonDefinitionGenerator,
): [string, number] {
  const selected = block.getFieldValue('CHECKDROPDOWN');
  let output = '';
  switch (selected) {
    case 'null': {
      output = null;
      break;
    }
    case 'CUSTOM': {
      output = block.getFieldValue('CUSTOMCHECK') || null;
      break;
    }
    default: {
      output = selected;
    }
  }

  return [JSON.stringify(output), Order.ATOMIC];
};

/**
 * JSON Definition for the "any of" check block.
 *
 * @param block
 * @param generator
 * @returns stringified version of:
 *     - null if the list is empty or contains the "any" check
 *     - a single check string if that is the only check present in the list
 *     - an array of all checks in the list, deduplicated
 */
jsonDefinitionGenerator.forBlock['connection_check_group'] = function (
  block: Blockly.Block,
  generator: JsonDefinitionGenerator,
): [string, number] {
  const checks = new Set<string>();
  for (const input of block.inputList) {
    const value = generator.valueToCode(block, input.name, Order.ATOMIC);
    if (!value) continue; // No block connected to this input
    const check = JSON.parse(value) || '';
    if (check === null) {
      // If the list contains 'any' then the check is simplified to 'any'
      return [JSON.stringify(null), Order.ATOMIC];
    }
    if (check) checks.add(check);
  }

  if (checks.size === 0) {
    // No checks were connected to the block.
    return [JSON.stringify(null), Order.ATOMIC];
  }
  if (checks.size === 1) {
    // If there's only one check, we return it directly instead of
    // returning an array with one member.
    return [JSON.stringify(Array.from(checks)[0]), Order.ATOMIC];
  }
  return [JSON.stringify(Array.from(checks)), Order.ATOMIC];
};
