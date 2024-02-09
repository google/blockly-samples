/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';
import {JavascriptGenerator} from 'blockly/javascript';

export class JavascriptDefinitionGenerator extends JavascriptGenerator {
  /**
   * Scrub handles concatenating "next" connection blocks.
   * This is a copy of the regular scrub_ function for JS, but
   * we also add newlines between next blocks.
   *
   * @override
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  scrub_(block: Blockly.Block, code: string, thisOnly = false): string {
    let commentCode = '';
    // Only collect comments for blocks that aren't inline.
    if (!block.outputConnection || !block.outputConnection.targetConnection) {
      // Collect comment for this block.
      let comment = block.getCommentText();
      if (comment) {
        comment = Blockly.utils.string.wrap(comment, this.COMMENT_WRAP - 3);
        commentCode += this.prefixLines(comment + '\n', '// ');
      }
      // Collect comments for all value arguments.
      // Don't collect comments for nested statements.
      for (let i = 0; i < block.inputList.length; i++) {
        if (block.inputList[i].type === Blockly.inputs.inputTypes.VALUE) {
          const childBlock = block.inputList[i].connection.targetBlock();
          if (childBlock) {
            comment = this.allNestedComments(childBlock);
            if (comment) {
              commentCode += this.prefixLines(comment, '// ');
            }
          }
        }
      }
    }
    const nextBlock =
      block.nextConnection && block.nextConnection.targetBlock();
    const nextCode = thisOnly ? '' : this.blockToCode(nextBlock);
    const newLine = nextCode ? '\n' : '';
    return commentCode + code + newLine + nextCode;
  }
}

export const javascriptDefinitionGenerator =
  new JavascriptDefinitionGenerator();
