/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


import * as Blockly from 'blockly/core';

/**
 * Create a human-readable text representation of a stack of blocks and their
 * children.
 *
 * @param {!Block} block Top block of stack.
 * @param {string} indent Whitespace or other text to indent statements from
 *     statement inputs by.
 * @param {string} emptyToken The placeholder string used to denote an empty
 *     input.
 * @returns {string} Text describing blocks.
 */
export function blocksToString(
    block, opt_maxLength, indent = '  ', emptyToken = '<unspecified>') {

  const NEWLINE = Symbol();
  const INDENT = Symbol();
  const OUTDENT = Symbol();

  const tokens = [];

  /**
   * Converts stack starting at given block to tokens.  Pushes tokens onto
   * tokens array.
   */
  function blocksToTokens(block, stringifyNext = true) {
    /**
     * Whether or not to add parentheses around an input.
     *
     * @param connection The connection.
     * @returns True if we should add parentheses around the input.
     */
    function shouldAddParentheses(connection) {
      let checks =
          connection.getCheck() ?? connection.targetConnection?.getCheck();
      return checks?.includes('Boolean') || checks?.includes('Number');
    }

    for (const input of block.inputList) {
      if (input.name == Blockly.constants.COLLAPSED_INPUT_NAME) {
        continue;
      }
      tokens.push(...input.fieldRow.map(field => field.getText()));

      if (input.connection) {
        const child = input.connection.targetBlock();
        if (input.type === Blockly.inputTypes.STATEMENT) {
          tokens.push(NEWLINE);
          tokens.push(INDENT);
        }
        if (child) {
          const shouldAddParens = shouldAddParentheses(input.connection);
          if (shouldAddParens) tokens.push('(');
          blocksToTokens(child);
          if (shouldAddParens) tokens.push(')');
        } else {
          tokens.push(emptyToken);
        }
        if (input.type === Blockly.inputTypes.STATEMENT) {
          tokens.push(OUTDENT);
        }
      }
    }
    const nextBlock = block.getNextBlock();
    if (nextBlock && stringifyNext) {
      tokens.push(NEWLINE);
      blocksToTokens(nextBlock);
    }
  }

  blocksToTokens(block, false);

  // Run through our tokens array and simplify expression to remove
  // parentheses around single field blocks.
  // E.g. ['repeat', '(', '10', ')', 'times', 'do', '?']
  for (let i = 2; i < tokens.length; i++) {
    if (tokens[i - 2] === '(' && tokens[i] === ')' &&
        typeof tokens[i - 1] === 'string') {
      tokens[i - 2] = tokens[i - 1];
      tokens.splice(i - 1, 2);
    }
  }

  // Join the text array, adding indentation as requested.
  let text = '';
  let depth = 0;
  let prev = undefined;
  for (const token of tokens) {
    if (token === NEWLINE) {
        text += '\n' + indent.repeat(depth);
    } else if (token === INDENT) {
      depth++;
      text += indent;
    } else if (token === OUTDENT) {
      depth--;
    } else {
      // Skip spaces inside parens.
      text += (prev === '(' || token === ')' ? '' : ' ') + token;
    }
    prev = token;
  }
  return text;
}
