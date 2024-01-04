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

jsonDefinitionGenerator.forBlock['field_label_serializable'] = function (
  block: Blockly.Block,
  generator: JsonDefinitionGenerator,
): string {
  const code = {
    type: 'field_label_serializable',
    text: block.getFieldValue('TEXT'),
    name: block.getFieldValue('FIELDNAME'),
  };
  return JSON.stringify(code);
};
