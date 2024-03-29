/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {JavascriptGenerator} from 'blockly/javascript';

/**
 * This generator creates the "Generator Stub" output for block factory.
 * The generated code is the same for each language we support, so we use
 * the same generator for each programming language and control the output
 * with a variable, which is set by the block factory controls.
 */
export class GeneratorStubGenerator extends JavascriptGenerator {
  private language = 'javascript';
  private scriptMode = false;
  // Don't automatically indent statement inputs.
  override INDENT = '';

  setLanguage(language: string) {
    this.language = language;
  }

  getLanguage(): string {
    return this.language;
  }

  setScriptMode(scriptMode: boolean) {
    this.scriptMode = scriptMode;
  }

  getScriptMode(): boolean {
    return this.scriptMode;
  }

  /**
   * Creates a variable name for the input or field to be used in the
   * generator stub output. The type is lowercased and the name is made legal
   * (no spaces or quotes and encode special characters).
   *
   * @param type The type of field or input such as 'checkbox' or 'statement'
   * @param name The name of the field or input
   * @returns A valid JavaScript variable name as a string like 'checkbox_name'
   */
  createVariableName(type: string, name: string): string {
    name = encodeURI(
      name.toLowerCase().replace(/ /g, '_').replace(/[^\w]/g, ''),
    );
    return `${type.toLowerCase()}_${name}`;
  }
}

export const generatorStubGenerator = new GeneratorStubGenerator();
