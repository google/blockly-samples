/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';
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

/**
 * Gets the selected check from the block.
 *
 * @param selected Dropdown option selected.
 * @param block Connection check block.
 * @returns A custom option the user has typed in, the selected dropdown option,
 * or null if `any` or a blank custom option is chosen.
 */
function getSelectedCheck(
  selected: string,
  block: Blockly.Block,
): string | null {
  switch (selected) {
    case 'null':
      return null;
    case 'CUSTOM':
      return block.getFieldValue('CUSTOMCHECK') || null;
    default:
      return selected;
  }
}

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
  const output = getSelectedCheck(selected, block);

  return [JSON.stringify(output), JsonOrder.ATOMIC];
};

/**
 * JSON definition for the "any of" check block.
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
    const value = generator.valueToCode(block, input.name, JsonOrder.ATOMIC);
    if (!value) continue; // No block connected to this input
    const check = JSON.parse(value) || '';
    if (check === null) {
      // If the list contains 'any' then the check is simplified to 'any'
      return [JSON.stringify(null), JsonOrder.ATOMIC];
    }
    if (check) checks.add(check);
  }

  if (checks.size === 0) {
    // No checks were connected to the block.
    return [JSON.stringify(null), JsonOrder.ATOMIC];
  }
  if (checks.size === 1) {
    // If there's only one check, we return it directly instead of
    // returning an array with one member.
    return [JSON.stringify(Array.from(checks)[0]), JsonOrder.ATOMIC];
  }
  return [JSON.stringify(Array.from(checks)), JsonOrder.ATOMIC];
};

/**
 * JavaScript definition for a single "connection_check" block.
 *
 * @param block
 * @param generator
 * @returns A connection check string corresponding to the option chosen.
 *    If custom option is chosen and not specified, returns null.
 */
javascriptDefinitionGenerator.forBlock['connection_check'] = function (
  block: Blockly.Block,
  generator: JavascriptDefinitionGenerator,
): [string, number] {
  const selected = block.getFieldValue('CHECKDROPDOWN');
  const output = getSelectedCheck(selected, block);

  return [output ? generator.quote_(output) : 'null', JsOrder.ATOMIC];
};

/**
 * JavaScript definition for the "any of" check block.
 *
 * @param block
 * @param generator
 * @returns one of:
 *     - null if the list is empty or contains the "any" check
 *     - a single check string if that is the only check present in the list
 *     - an array of all checks in the list, deduplicated
 */
javascriptDefinitionGenerator.forBlock['connection_check_group'] = function (
  block: Blockly.Block,
  generator: JavascriptDefinitionGenerator,
): [string, number] {
  const checks = new Set<string>();
  for (const input of block.inputList) {
    const value = generator.valueToCode(block, input.name, JsOrder.ATOMIC);
    if (!value) continue; // No block connected to this input
    if (value === 'null') {
      // If the list contains 'any' then the check is simplified to 'any'
      return ['null', JsOrder.ATOMIC];
    }
    if (value) checks.add(value);
  }

  if (checks.size === 0) {
    // No checks were connected to the block.
    return ['null', JsOrder.ATOMIC];
  }
  if (checks.size === 1) {
    // If there's only one check, we return it directly instead of
    // returning an array with one member.
    return [Array.from(checks)[0], JsOrder.ATOMIC];
  }
  return [`[${Array.from(checks).join(', ')}]`, JsOrder.ATOMIC];
};
