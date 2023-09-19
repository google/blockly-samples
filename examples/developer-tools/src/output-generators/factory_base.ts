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

  let messageString = '';
  let numInputs = 0;
  let bl = block.getInput('INPUTS').connection.targetBlock();

  while (bl) {
    numInputs++;
    messageString += `%${numInputs} `;
    bl = bl.nextConnection?.targetBlock();
  }

  let args0 = '';
  const inputsStack = generator.statementToCode(block, 'INPUTS');
  if (inputsStack) {
    args0 = `"args0": [
  ${inputsStack}
  ],`;
  }

  let output = '';
  if (this.getInput('OUTPUTTYPE')) {
    output = `"output": ${generator.valueToCode(block, 'OUTPUTTYPE', Order.ATOMIC) || 'null'},`;
  }

  return `{
  "type": ${blockName},
  "message0": ${generator.quote_(messageString)},
  ${args0}
  ${output}
  "tooltip": ${tooltip},
  "helpUrl": ${helpUrl}
}`;
};

jsonDefinitionGenerator.forBlock['text'] = javascriptGenerator.forBlock['text'];
