/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';
import {javascriptGenerator} from 'blockly/javascript';
import {JsonDefinitionGenerator, jsonDefinitionGenerator, Order} from './json_definition_generator';

jsonDefinitionGenerator.forBlock['factory_base'] = function(
    block: Blockly.Block,
    generator: JsonDefinitionGenerator
): string {
  // TODO: Get a JSON-legal name for the block
  const blockName = generator.quote_(block.getFieldValue('NAME'));
  const tooltip = generator.valueToCode(block, 'TOOLTIP', Order.ATOMIC) || '';
  const helpUrl = generator.valueToCode(block, 'HELPURL', Order.ATOMIC) || '';

  return `{
  "type": ${blockName},
  "message0": "",
  "tooltip": ${tooltip},
  "helpUrl": ${helpUrl}
}`;
};

jsonDefinitionGenerator.forBlock['text'] = javascriptGenerator.forBlock['text'];
