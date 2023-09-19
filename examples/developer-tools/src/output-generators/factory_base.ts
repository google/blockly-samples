/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';
import {javascriptGenerator} from 'blockly/javascript';
import {JsonDefinitionGenerator, jsonDefinitionGenerator, Order} from './json_definition_generator';

/**
 * Builds the 'message0' part of the JSON block definition.
 * TODO: handle fields as well.
 * @param block
 * @returns A message string with one placeholder '%i`
 *    for each field and input in the block.
 */
const buildMessageString = function(block: Blockly.Block) {
  let messageString = '';
  let numInputs = 0;
  let bl = block.getInput('INPUTS').connection.targetBlock();

  while (bl) {
    numInputs++;
    messageString += `%${numInputs} `;
    bl = bl.nextConnection?.targetBlock();
  }
  return messageString;
};

jsonDefinitionGenerator.forBlock['factory_base'] = function(
    block: Blockly.Block,
    generator: JsonDefinitionGenerator
): string {
  // TODO: Get a JSON-legal name for the block
  const blockName = block.getFieldValue('NAME');
  const tooltip = JSON.parse(generator.valueToCode(block, 'TOOLTIP', Order.ATOMIC));
  const helpUrl = JSON.parse(generator.valueToCode(block, 'HELPURL', Order.ATOMIC));

  const code: any = {
    type: blockName,
    tooltip: tooltip,
    helpUrl: helpUrl,
  };

  code.message0 = buildMessageString(block);

  const inputsStack = generator.statementToCode(block, 'INPUTS');
  if (inputsStack) {
    // If there is a stack, they come back as the inner pieces of an array
    // Can possibly fix this in scrub?
    const args0 = JSON.parse(`[${inputsStack}]`);
    code.args0 = args0;
  }


  if (this.getInput('OUTPUTTYPE')) {
    // If there is no set type, we still need to add 'null` to the output check
    const output = generator.valueToCode(block, 'OUTPUTTYPE', Order.ATOMIC);
    code.output = output ? JSON.parse(output) : null;
  }

  return JSON.stringify(code, undefined, 2);
};

jsonDefinitionGenerator.forBlock['text'] = javascriptGenerator.forBlock['text'];
