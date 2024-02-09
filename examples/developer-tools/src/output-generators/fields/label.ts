/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';
import {
  JsonDefinitionGenerator,
  jsonDefinitionGenerator,
} from '../json_definition_generator';
import {
  JavascriptDefinitionGenerator,
  javascriptDefinitionGenerator,
} from '../javascript_definition_generator';

jsonDefinitionGenerator.forBlock['field_label'] = function (
  block: Blockly.Block,
  generator: JsonDefinitionGenerator,
): string {
  const code = {
    type: 'field_label',
    text: block.getFieldValue('TEXT'),
  };
  return JSON.stringify(code);
};

javascriptDefinitionGenerator.forBlock['field_label'] = function (
  block: Blockly.Block,
  generator: JavascriptDefinitionGenerator,
): string {
  const text = generator.quote_(block.getFieldValue('TEXT'));
  const code = `.appendField(${text})`;
  return code;
};
