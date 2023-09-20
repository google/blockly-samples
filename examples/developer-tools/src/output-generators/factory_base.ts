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
  // Tooltip and Helpurl string blocks can't be removed, so we don't care what happens if the block doesn't exist
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

  /**
   * Sets the type check for the given input, if present. If the input exists
   * but doesn't have a block attached or a value, the connection property is
   * still added to the output with a check of 'null'. If the input doesn't
   * exist, that means the block should not have that type of connection, and no
   * property is added to the output.
   * @param inputName The name of the input that would contain the type check.
   * @param connectionName The name of the connection in the definition output.
   */
  const setConnectionTypes = (inputName: string, connectionName: string) => {
    if (this.getInput(inputName)) {
      // If there is no set type, we still need to add 'null` to the check
      const output = generator.valueToCode(block, inputName, Order.ATOMIC);
      code[connectionName] = output ? JSON.parse(output) : null;
    }
  };

  setConnectionTypes('OUTPUTTYPE', 'output');
  setConnectionTypes('TOPTYPE', 'previousStatement');
  setConnectionTypes('BOTTOMTYPE', 'nextStatement');


  const colour = generator.valueToCode(block, 'COLOUR', Order.ATOMIC);
  if (colour !== '') {
    code.colour = JSON.parse(colour);
  }

  const inputsAlign = block.getFieldValue('INLINE');
  switch (inputsAlign) {
    case 'EXT': {
      code.inputsInline = false;
      break;
    }
    case 'INT': {
      code.inputsInline = true;
      break;
    }
    default: {
      // Don't add anything for "auto".
    }
  }

  return JSON.stringify(code, undefined, 2);
};

jsonDefinitionGenerator.forBlock['text'] = javascriptGenerator.forBlock['text'];
