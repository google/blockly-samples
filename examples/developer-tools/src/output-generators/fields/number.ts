/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';
import {
  JsonDefinitionGenerator,
  jsonDefinitionGenerator,
} from '../json_definition_generator';

jsonDefinitionGenerator.forBlock['field_number'] = function (
  block: Blockly.Block,
  generator: JsonDefinitionGenerator,
): string {
  const code: Record<string, string | number> = {
    type: 'field_number',
    name: block.getFieldValue('FIELDNAME'),
    value: block.getFieldValue('VALUE'),
  };
  const min = block.getFieldValue('MIN');
  const max = block.getFieldValue('MAX');
  const precision = block.getFieldValue('PRECISION');
  if (min !== -Infinity) code.min = min;
  if (max !== Infinity) code.max = max;
  if (precision !== 0) code.precision = precision;
  return JSON.stringify(code);
};
