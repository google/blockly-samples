/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class responsible for creating a modal used for creating typed
 *     variables.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */

// TODO: Update css names
// TODO: Test on mobile
// TODO: Make sure we are properly cleaning up after ourselves.
// TODO: Look at how I am dealing with css.
// TODO: How should be exporting.
// TODO: CHeck that it works in ie11
// TODO: Clean up createDOM method

import { injectTypedModalCss } from './typedModalCss.js';
import * as Blockly from 'blockly/core';
import { Modal } from './Modal.js';

/**
 * Class for displaying a modal used for creating typed variables.
 */
export class TypedModal extends Modal {
  /**
   * Constructor for creating and registering a typed modal.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace that the modal will
   *     be registered to work on.
   * @param {string} btnCallbackName The name used to register the button
   *     callback.
   * @param {Array<Array<string>>}types An array holding arrays with the name of
   *     the type and the display name for the type.
   *     Ex: [['Penguin', 'PENGUIN'], ['Giraffe', 'GIRAFFE']].
   */
  constructor(workspace, btnCallbackName, types) {
    super('Create Typed Variable', workspace);

    /**
     * The selected type for the modal.
     * @type {?string}
     * @private
     */
    this.selectedType_ = null;

    /**
     * The name used to register the button callback.
     * @type {string}
     * @private
     */
    this.btnCallBackName_ = btnCallbackName;

    /**
     * An array holding arrays with the name of the type and the display name
     *     for the type.
     * @type {Array<Array<string>>}
     * @private
     */
    this.types_ = types;
  }

  /**
   * Create a typed modal and register it with the given button name.
   */
  init() {
    super.init();
    injectTypedModalCss();
    this.workspace_.registerButtonCallback(this.btnCallBackName_, (button) => {
      this.show(button.getTargetWorkspace());
    });
  }

  /**
   * Dispose of the typed modal.
   */
  dispose() {
    super.dispose();
    this.workspace_.removeButtonCallback(this.btnCallBackName_);
  }

  /**
   * Disposes of any events or dom-references belonging to the editor and resets
   * the inputs.
   * @override
   */
  widgetDispose_() {
    super.widgetDispose_();

    this.checkFirstType_();
    this.getTextInputDiv_().value = '';
  }

  /**
   * Get the function to be called when the user confirms.
   * @override
   */
  getConfirmAction() {
    return this.createVariable_;
  }

  /**
   * Get the valid variable name, or null if the name is not valid.
   * @return {string} The valid variable name, or null if the name exists.
   * @private
   */
  getValidInput_() {
    let newVar = this.dialogInput.value;
    if (newVar) {
      newVar = newVar.replace(/[\s\xa0]+/g, ' ').trim();
      if (newVar === Blockly.Msg['RENAME_VARIABLE'] ||
          newVar === Blockly.Msg['NEW_VARIABLE']) {
        // Ok, not ALL names are legal...
        newVar = null;
      }
    }
    return newVar;
  }

  /**
   * Callback for when someone hits the create variable button. Creates a
   * variable if the name is valid, otherwise creates a pop up.
   * @private
   */
  createVariable_() {
    const text = this.getValidInput_();
    const type = this.selectedType_ || '';
    if (text) {
      const existing =
          Blockly.Variables.nameUsedWithAnyType_(text, this.workspace_);
      if (existing) {
        let msg = '';
        if (existing.type === type) {
          msg = Blockly.Msg['VARIABLE_ALREADY_EXISTS'].replace(
              '%1', existing.name);
        } else {
          msg =
              Blockly.Msg['VARIABLE_ALREADY_EXISTS_FOR_ANOTHER_TYPE'];
          msg = msg.replace('%1', existing.name).replace('%2', existing.type);
        }
        Blockly.alert(msg);
      } else {
        // No conflict
        this.workspace_.createVariable(text, type);
        this.hide();
      }
    }
  }

  /**
   * Create the typed modal's dom.
   */
  createDom() {
    /*
     * Creates a modal with types. The generated typed modal:
     * TODO: Redo this to reflect new html.
     */
    super.createDom();
    this.dialogInputDiv = this.createDialogInputDiv_();

    const dialogVariableDiv = document.createElement('div');
    Blockly.utils.dom.addClass(dialogVariableDiv, 'typed-modal-dialog-variables');
    dialogVariableDiv.innerHTML = "Variable Types";

    this.typeList = this.createTypeList_(this.types_);
    this.checkFirstType_();
    dialogVariableDiv.appendChild(this.typeList);

    const contentDiv = this.getContentDiv();
    contentDiv.appendChild(this.dialogInputDiv);
    contentDiv.appendChild(dialogVariableDiv);
  }

  /**
   * Get the input div.
   * @return {null|HTMLInputElement} The text input that holds the variable name.
   * @private
   */
  getTextInputDiv_() {
    return this.dialogInputDiv.querySelector('.typed-modal-dialog-input');
  }

  /**
   * Check the first type in the list.
   * @private
   */
  checkFirstType_() {
    const firstType = this.typeList.querySelector('.typed-modal-types');
    firstType.checked = true;
    this.selectedType_ = firstType.id;
  }

  /**
   * Creates an unordered list containing all the types.
   * @param {Array<Array<string>>}types An array holding arrays with the name of
   *     the type and the display name for the type.
   *     Ex: [['Penguin', 'PENGUIN'], ['Giraffe', 'GIRAFFE']].
   * @return {HTMLUListElement} The list of types.
   * @private
   */
  createTypeList_(types) {
    const typeList = document.createElement('ul');
    Blockly.utils.dom.addClass(typeList, 'typed-modal-list');
    for (const type of types) {
      const typeName = type[0];
      const typeDisplayName = type[1];
      const typeLi = document.createElement('li');
      const typeInput = document.createElement('input');
      Blockly.utils.dom.addClass(typeInput, 'typed-modal-types');
      typeInput.type = "radio";
      typeInput.id = typeName;
      typeInput.name = "variableType";
      Blockly.bindEventWithChecks_(typeInput, 'click', this, function(e) {
        this.selectedType_ = e.target.id;
      });

      const typeLabel = document.createElement("Label");
      typeLabel.innerText = typeDisplayName;
      typeLabel.setAttribute('for', typeName);

      typeLi.appendChild(typeInput);
      typeLi.appendChild(typeLabel);
      typeList.appendChild(typeLi);
    }
    return typeList;
  }

  /**
   * Create the div that holds the text input and label for the text input.
   * @return {HTMLDivElement} The div holding the text input and label for text
   *     input.
   * @private
   */
  createDialogInputDiv_() {
    const dialogInputDiv = document.createElement('div');
    Blockly.utils.dom.addClass(dialogInputDiv, 'typed-modal-dialog-input-wrapper');

    const inputLabel = document.createElement("Label");
    inputLabel.innerText = 'Variable Name';
    inputLabel.setAttribute('for', 'variableInput');

    const dialogInput = document.createElement('input');
    Blockly.utils.dom.addClass(dialogInput, 'typed-modal-dialog-input');
    dialogInput.type = 'text';
    dialogInput.id = 'variableInput';

    dialogInputDiv.appendChild(inputLabel);
    dialogInputDiv.appendChild(dialogInput);
    this.dialogInput = dialogInput;
    return dialogInputDiv;
  }
}
