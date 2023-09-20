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
 * The message should have label fields' text inlined into the message.
 * Doing so makes the message more translatable as fields can be moved around.
 * @param argsList The list of fields and inputs generated from the input stack.
 * @returns An object containing:
 *    - a message string with one placeholder '%i`
 *      for each field and input in the block
 *    - the new args list, with field lables removed
 */
const buildMessageString = function(argsList: Array<Record<string, unknown>>) {
  let i = 0;
  let messageString = '';
  const newArgs = [];
  for (const arg of argsList) {
    if (arg.type === 'field_label') {
      // Label fields get added directly to the message string.
      // They are removed from the arg list so they don't appear twice.
      messageString += `${arg.text} `;
    } else {
      i++;
      messageString += `%${i} `;
      newArgs.push(arg);
    }
  }

  return {
    message: messageString.trim(),
    args: newArgs,
  };
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


  const inputsStack = generator.statementToCode(block, 'INPUTS');
  if (inputsStack) {
    // If there is a stack, they come back as the inner pieces of an array
    // Can possibly fix this in scrub?
    const args0 = JSON.parse(`[${inputsStack}]`);
    const {args, message} = buildMessageString(args0);
    code.message0 = message;
    code.args0 = args;
  } else {
    code.message0 = '';
  }


  if (this.getInput('OUTPUTTYPE')) {
    // If there is no set type, we still need to add 'null` to the output check
    const output = generator.valueToCode(block, 'OUTPUTTYPE', Order.ATOMIC);
    code.output = output ? JSON.parse(output) : null;
  }

  return JSON.stringify(code, undefined, 2);
};

jsonDefinitionGenerator.forBlock['text'] = javascriptGenerator.forBlock['text'];
