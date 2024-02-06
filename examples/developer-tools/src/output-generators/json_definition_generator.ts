/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';

/**
 * We will never need parentheses for the JSON definition, so
 * order precedence can be ignored.
 */
export const Order = {
  ATOMIC: 0,
};

/**
 * A CodeGenerator that generates a JSON block definition for a block defined
 * in the Block Factory.
 */
export class JsonDefinitionGenerator extends Blockly.CodeGenerator {
  /**
   * Creates a new JsonDefinitionGenerator.
   *
   * @param name Registered name for the generator.
   */
  constructor(name = 'JsonBlockDefinition') {
    super(name);
    // this.isInitialized = false;

    // TODO: List any reserved words.
    // this.addReservedWords();
  }

  /**
   * Initialise the database of variable names.
   *
   * @param workspace Workspace to generate code from.
   */
  init(workspace: Blockly.Workspace) {
    // super.init(workspace);
    // if (!this.nameDB_) {
    //   this.nameDB_ = new Names(this.RESERVED_WORDS_);
    // } else {
    //   this.nameDB_.reset();
    // }
    // this.nameDB_.setVariableMap(workspace.getVariableMap());
    // this.nameDB_.populateVariables(workspace);
    // this.nameDB_.populateProcedures(workspace);
    // const defvars = [];
    // // Add developer variables (not created or named by the user).
    // const devVarList = Variables.allDeveloperVariables(workspace);
    // for (let i = 0; i < devVarList.length; i++) {
    //   defvars.push(
    //       this.nameDB_.getName(devVarList[i], NameType.DEVELOPER_VARIABLE));
    // }
    // // Add user variables, but only ones that are being used.
    // const variables = Variables.allUsedVarModels(workspace);
    // for (let i = 0; i < variables.length; i++) {
    //   defvars.push(
    //       this.nameDB_.getName(variables[i].getId(), NameType.VARIABLE));
    // }
    // // Declare all of the variables.
    // if (defvars.length) {
    //   this.definitions_['variables'] = 'var ' + defvars.join(', ') + ';';
    // }
    // this.isInitialized = true;
  }

  /**
   * Prepend the generated code with the variable definitions.
   *
   * @param code Generated code.
   * @returns Completed code.
   */
  // finish(code) {
  //   // Convert the definitions dictionary into a list.
  //   const definitions = Object.values(this.definitions_);
  //   // Call Blockly.CodeGenerator's finish.
  //   super.finish(code);
  //   this.isInitialized = false;

  //   this.nameDB_.reset();
  //   return definitions.join('\n\n') + '\n\n\n' + code;
  // }

  /**
   * Naked values are top-level blocks with outputs that aren't plugged into
   * anything. These are not legal, so nothing should be returned.
   *
   * @param line Line of generated code.
   * @returns Empty string.
   */
  scrubNakedValue(line: string) {
    return '';
  }

  /**
   * Encode a string as a properly escaped JSON string, complete with
   * quotes.
   *
   * @param string Text to encode.
   * @returns JSON string.
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  quote_(string: string) {
    // Can't use goog.string.quote since Google's style guide recommends
    // JS string literals use single quotes.
    string = string
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\\n')
      // .replace(/'/g, '\\\'')
      .replace(/"/g, '\\"');
    return '"' + string + '"';
  }

  /**
   * There are no multiline strings in JSON, so we probably shouldn't use this.
   *
   * @param string Text to encode.
   * @return JavaScript string.
   */
  // multiline_quote_(string) {
  //   // Can't use goog.string.quote since Google's style guide recommends
  //   // JS string literals use single quotes.
  //   // const lines = string.split(/\n/g).map(this.quote_);
  //   // return lines.join(' + \'\\n\' +\n');
  // }

  /**
   * Common tasks for generating JSON block definitions from blocks.
   * Calls any statements following this block.
   *
   * @param block The current block.
   * @param code The JSON code created for this block.
   * @param thisOnly True to generate code for only this
   *     statement.
   * @returns JSON block definition with subsequent blocks added.
   * @protected
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  scrub_(block: Blockly.Block, code: string, thisOnly = false) {
    const nextBlock =
      block.nextConnection && block.nextConnection.targetBlock();
    let nextCode = thisOnly ? '' : this.blockToCode(nextBlock);
    if (nextCode) {
      nextCode = ',\n  ' + nextCode;
    }
    return code + nextCode;
  }
}

export const jsonDefinitionGenerator = new JsonDefinitionGenerator();
