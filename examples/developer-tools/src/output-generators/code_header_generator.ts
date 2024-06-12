/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';

/**
 * A CodeGenerator that generates the code headers.
 *
 * None of the blocks currently actually return code strings. They just add header lines,
 * which will be deduplicated and joined when `workspaceToCode` is called.
 *
 * If you add a field which doesn't need any additional imports, just return an empty string
 * from its generator function for these generators. If your field is in a plugin,
 * the code generator function for the field should add
 * the appropriate import/script that will load the field's plugin.
 */
export class CodeHeaderGenerator extends Blockly.CodeGenerator {
  private headerLines = new Set();
  private language = 'javascript';

  /**
   * Resets the headers every time workspaceToCode is called.
   *
   * @override
   */
  init() {
    this.headerLines = new Set();
  }

  /**
   * Adds a line of code that is needed as a code header, such as an import statement.
   *
   * @param header
   */
  addHeaderLine(header: string) {
    this.headerLines.add(header);
  }

  setLanguage(language: string) {
    this.language = language;
  }

  getLanguage(): string {
    return this.language;
  }

  /**
   * Concatenates code from next blocks.
   *
   * @override
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  scrub_(block: Blockly.Block, code: string, thisOnly?: boolean): string {
    const nextBlock =
      block.nextConnection && block.nextConnection.targetBlock();
    const nextCode = thisOnly ? '' : this.blockToCode(nextBlock);
    return code + nextCode;
  }

  /** @override */
  workspaceToCode(workspace: Blockly.Workspace): string {
    // This should be an empty string, but it kicks off code generation
    super.workspaceToCode(workspace);
    const headers = Array.from(this.headerLines).join('\n');
    return headers;
  }
}

export const importHeaderGenerator = new CodeHeaderGenerator(
  'importHeaderGenerator',
);
export const scriptHeaderGenerator = new CodeHeaderGenerator(
  'scriptHeaderGenerator',
);
