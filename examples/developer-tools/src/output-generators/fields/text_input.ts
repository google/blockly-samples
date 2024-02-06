/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';
import {
  JsonDefinitionGenerator,
  jsonDefinitionGenerator,
} from '../json_definition_generator';

jsonDefinitionGenerator.forBlock['field_input'] = function (
  block: Blockly.Block,
  generator: JsonDefinitionGenerator,
): string {
  const code = {
    type: 'field_input',
    name: block.getFieldValue('FIELDNAME'),
    text: block.getFieldValue('TEXT'),
  };
  return JSON.stringify(code);
};
