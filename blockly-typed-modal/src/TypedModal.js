/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object responsible for creating a typed variable modal.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */

/**
 * Class for workspace search.
 */
export class TypedVariableModal {
  /**
   * Constructor for creating a typed variable modal.
   * @param {Blockly.WorkspaceSvg} workspace  The workspace to add a typed variable modal to.
   * @param {Array<Array<string>>} types  An array of arrays that contain display name and type.
   *     Example: [["Animal", "ANIMAL"], ["Mineral", "MINERAL"]]
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
    const that = this;
    this.workspace_.registerButtonCallback('CREATE_VARIABLE', function(button) {
      that.show();
    });
  }

  /**
   * Hide the modal.
   */
  hide() {
    console.log("Hidden");
  }

  /**
   * Show the modal.
   */
  show() {
    console.log("Showed");
    // TODO: Should I take in the variables to display here?
    // When would they want to set the types they have?
  }
}
