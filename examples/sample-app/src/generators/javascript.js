/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {javascriptGenerator} from 'blockly/javascript';

// Export all the code generators for our custom blocks,
// but don't register them with Blockly yet.
// This file has no side effects!
export const generator = Object.create(null);

generator['add_text'] = function(block) {
  const text = javascriptGenerator.valueToCode(block, 'TEXT',
      javascriptGenerator.ORDER_NONE) || '\'\'';
  const color = javascriptGenerator.valueToCode(block, 'COLOR',
      javascriptGenerator.ORDER_ATOMIC) || '\'#ffffff\'';

  const addText = javascriptGenerator.provideFunction_(
      'addText',
      ['function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ +
          '(text, color) {',
      '  // Add text to the output area.',
      '  const outputDiv = document.getElementById(\'output\');',
      '  const textEl = document.createElement(\'p\');',
      '  textEl.innerText = text;',
      '  textEl.style.color = color;',
      '  outputDiv.appendChild(textEl);',
      '}']);
    // Generate the function call for this block.
  const code = `${addText}(${text}, ${color});\n`;
  return code;
};
