/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  JsonDefinitionGenerator,
  Order,
  jsonDefinitionGenerator,
} from './json_definition_generator';
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
jsonDefinitionGenerator.forBlock['colour_hue'] = function (
  block: Blockly.Block,
  generator: JsonDefinitionGenerator,
): [string, number] {
  return [this.getFieldValue('HUE').toString(), Order.ATOMIC];
};
