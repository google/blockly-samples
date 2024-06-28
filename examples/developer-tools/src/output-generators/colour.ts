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
  JavascriptDefinitionGenerator,
  javascriptDefinitionGenerator,
} from './javascript_definition_generator';
import {Order as JsOrder} from 'blockly/javascript';
import * as Blockly from 'blockly/core';

/**
 * JSON definition for the "colour_hue" block.
 *
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
  return [this.getFieldValue('HUE').toString(), JsonOrder.ATOMIC];
};

/**
 * JavaScript definition for the "colour_hue" block.
 *
 * @param block
 * @param generator
 * @returns The value of the colour field, as a string.
 */
javascriptDefinitionGenerator.forBlock['colour_hue'] = function (
  block: Blockly.Block,
  generator: JavascriptDefinitionGenerator,
): [string, number] {
  return [this.getFieldValue('HUE').toString(), JsOrder.ATOMIC];
};
