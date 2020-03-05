/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object responsible for creating a typed variable modal.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */

import { injectSearchCss } from './css.js';
import * as Blockly from 'blockly/core';

export class TypedVariableModal {
  /**
   * Class for workspace search.
   * @param {!Blockly.WorkspaceSvg} workspace The Blockly workspace.
   * @param {Array.<Array.<string>>} types The types of the variable.
   */
  constructor(workspace, types) {
    /**
     * The Blockly workspace.
     * @type {!Blockly.WorkspaceSvg}
     * @private
     */
    this.workspace_ = workspace;

    /**
     * An array of arrays that contain display name and type.
     * Example: [["Animal", "ANIMAL"], ["Mineral", "MINERAL"]]
     * @type {Array.<Array.<string>>}
     * @private
     */
    this.types_ = types;
    this.workspace_.registerButtonCallback('CREATE_VARIABLE', function(button) {
      Blockly.Variables.createVariableButtonHandler(button.getTargetWorkspace());
    });


  }

  /** 
   * Hide the modal.
   */
  hide () {
    console.log("Hidden");
  }

  /**
   * Show the modal.
   */
  show () {
    console.log("Showed");
    //TODO: Should I take in the variables to display here? 
    //When would they want to set the types they have? 
  }
}