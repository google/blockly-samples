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


import * as Blockly from 'blockly/core';
import { Modal } from './Modal.js';

/**
 * Class for displaying a modal used for creating typed variables.
 */
export class TypedModal extends Modal {
  /**
   * Constructor for creating a typed modal.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace that the modal will
   *     be registered on.
   * @param {string} btnCallbackName The name used to register the button
   *     callback.
   * @param {Array<Array<string>>} types An array holding arrays with the
   *     display name as the first value and the type as the second.
   *     Ex: [['Penguin', 'PENGUIN'], ['Giraffe', 'GIRAFFE']].
   * @param {TypedModalMessages} opt_messages The messages for a typed modal.
   */
  constructor(workspace, btnCallbackName, types, opt_messages) {
    const title = opt_messages ? opt_messages["TYPED_MODAL_TITLE"] :
        'Create Typed Variable';
    super(title, workspace);

    /**
     * The id of the currently selected type.
     * @type {?string}
     * @private
     */
    this.selectedType_ = null;

    /**
     * The input div holding the name of the variable.
     * @type {HTMLInputElement}
     * @protected
     */
    this.variableNameInput_ = null;

    /**
     * The div holding the list of variable types.
     * @type {HTMLElement}
     * @protected
     */
    this.variableTypesDiv_ = null;

    /**
     * The first type input.
     * @type {HTMLInputElement}
     * @protected
     */
    this.firstTypeInput_ = null;

    /**
     * The name used to register the button callback.
     * @type {string}
     * @private
     */
    this.btnCallBackName_ = btnCallbackName;

    /**
     * An array holding arrays with the name of the type and the display name
     *     for the type. Ex: [['Penguin', 'PENGUIN'], ['Giraffe', 'GIRAFFE']].
     * @type {Array<Array<string>>}
     * @protected
     */
    this.types_ = types;

    /**
     * The messages for a typed modal.
     * @type {!TypedModalMessages}
     */
    this.messages = opt_messages || {
      "TYPED_MODAL_TITLE": "Create Typed Variable",
      "TYPED_MODAL_VARIABLE_NAME_LABEL": "Variable Name: ",
      "TYPED_MODAL_TYPES_LABEL": "Variable Types",
      "TYPED_MODAL_CONFIRM_BUTTON": "Ok",
      "TYPED_MODAL_CANCEL_BUTTON": "Cancel",
      "TYPED_MODAL_INVALID_NAME":
          "Name is not valid. Please choose a different name."
    };

    /**
     * If true close the modal when the user clicks outside the modal.
     * Otherwise, only close when user hits the 'X' button or escape.
     * @type {boolean}
     * @override
     */
    this.closeOnClick = false;
  }

  /**
   * The messages for a typed modal.
   * @typedef {{
   *     TYPED_MODAL_CONFIRM_BUTTON: string,
   *     TYPED_MODAL_VARIABLE_NAME_LABEL: string,
   *     TYPED_MODAL_TYPES_LABEL: string,
   *     TYPED_MODAL_CANCEL_BUTTON: string,
   *     TYPED_MODAL_TITLE: string,
   *     TYPED_MODAL_INVALID_NAME: string
   * }} TypedModalMessages
   */

  /**
   * Create a typed modal and display it on the given button name.
   */
  init() {
    super.init();
    this.workspace_.registerButtonCallback(this.btnCallBackName_, () => {
      this.show();
    });
  }

  /**
   * Dispose of the typed modal.
   * @override
   */
  dispose() {
    super.dispose();
    this.workspace_.removeButtonCallback(this.btnCallBackName_);
    this.variableNameInput_ = null;
    this.variableTypesDiv_ = null;
    this.firstTypeInput_ = null;
    // TODO: Remove style tag.
  }

  /**
   * Get the selected type.
   * @return {?string} The selected type.
   */
  getSelectedType() {
    return this.selectedType_;
  }

  /**
   * Set the messages for the typed modal.
   * Used to change the location.
   * @param {!TypedModalMessages} messages The messages needed to create a typed
   *     modal.
   */
  setLocale(messages) {
    Object.keys(messages).forEach(function (k) {
      this.messages[k] = messages[k];
    });
  }

  /**
   * Disposes of any events or dom-references belonging to the editor and resets
   * the inputs.
   * @override
   */
  widgetDispose_() {
    super.widgetDispose_();
    this.resetModalInputs_();
  }

  /**
   * Get the function to be called when the user tries to create a variable.
   * @protected
   */
  onConfirm_() {
    const text = this.getValidInput_();
    const type = this.getSelectedType() || '';
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
          msg = msg.replace('%1', existing.name).replace('%2',
              this.getDisplayName_(existing.type));
        }
        Blockly.alert(msg);
      } else {
        // No conflict
        this.workspace_.createVariable(text, type);
        this.hide();
      }
    } else {
      Blockly.alert(this.messages['TYPED_MODAL_INVALID_NAME']);
    }
  }

  /**
   * Get the display name for the given type.
   * @param {string} type The type to get the display name for.
   * @return {string} The display name for the type.
   * @private
   */
  getDisplayName_(type) {
    for (let i = 0; i < this.types_.length; i++) {
      const typeNames = this.types_[i];
      if (type === typeNames[1]) {
        return typeNames[0];
      }
    }
    return '';
  }

  /**
   * Get the valid variable name, or null if the name is not valid.
   * @return {string} The valid variable name, or null if the name exists.
   * @private
   */
  getValidInput_() {
    let newVar = this.variableNameInput_.value;
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
   * Render content for the modal content div.
   * @param {HTMLDivElement} contentContainer The modal's content div.
   * @override
   */
  renderContent_(contentContainer) {
    const varNameContainer = this.createVarNameContainer_();
    this.variableNameInput_ = varNameContainer
        .querySelector('.typed-modal-variable-name-input');

    const typedVarDiv = document.createElement('div');
    Blockly.utils.dom.addClass(typedVarDiv, 'typed-modal-types');
    typedVarDiv.innerText = this.messages["TYPED_MODAL_TYPES_LABEL"];

    this.variableTypesDiv_ = this.createVariableTypeContainer_(this.types_);
    this.resetModalInputs_();
    typedVarDiv.appendChild(this.variableTypesDiv_);
    contentContainer.appendChild(varNameContainer);
    contentContainer.appendChild(typedVarDiv);
  }

  /**
   * Render content for the modal footer.
   * @param {HTMLElement} footerContainer The modal's footer div.
   * @override
   */
  renderFooter_(footerContainer) {
    const createBtn = document.createElement('button');
    Blockly.utils.dom.addClass(createBtn, 'blockly-modal-btn');
    Blockly.utils.dom.addClass(createBtn, 'blockly-modal-btn-primary');
    createBtn.innerText = this.messages['TYPED_MODAL_CONFIRM_BUTTON'];
    this.addEvent_(createBtn, 'click', this, this.onConfirm_);

    const cancelBtn = document.createElement('button');
    Blockly.utils.dom.addClass(cancelBtn, 'blockly-modal-btn');
    cancelBtn.innerText = this.messages['TYPED_MODAL_CANCEL_BUTTON'];
    this.addEvent_(cancelBtn, 'click', this, this.onCancel_);

    footerContainer.appendChild(createBtn);
    footerContainer.appendChild(cancelBtn);
  }

  /**
   * Check the first type in the list.
   * @protected
   */
  resetModalInputs_() {
    this.firstTypeInput_.checked = true;
    this.selectedType_ = this.firstTypeInput_.id;
    this.variableNameInput_.value = '';
  }

  /**
   * Creates an unordered list containing all the types.
   * @param {Array<Array<string>>} types An array holding arrays with the
   *     display name as the first value and the type as the second.
   *     Ex: [['Penguin', 'PENGUIN'], ['Giraffe', 'GIRAFFE']].
   * @return {HTMLElement} The list of types.
   * @protected
   */
  createVariableTypeContainer_(types) {
    const typeList = document.createElement('ul');
    Blockly.utils.dom.addClass(typeList, 'typed-modal-list');
    for (let i = 0; i < types.length; i++) {
      const type = types[i];
      const typeDisplayName = type[0];
      const typeName = type[1];
      const typeLi = document.createElement('li');
      const typeInput = document.createElement('input');
      Blockly.utils.dom.addClass(typeInput, 'typed-modal-types');
      typeInput.type = "radio";
      typeInput.id = typeName;
      typeInput.name = "blocklyVariableType";
      this.addEvent_(typeInput, 'click', this, (e) => {
        this.selectedType_ = e.target.id;
      });
      this.firstTypeInput_ = typeList.querySelector('.typed-modal-types');
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
   * Create the div that holds the text input and label for the variable name
   * input.
   * @return {HTMLDivElement} The div holding the text input and label for text
   *     input.
   * @protected
   */
  createVarNameContainer_() {
    const varNameContainer = document.createElement('div');
    Blockly.utils.dom.addClass(varNameContainer,
        'typed-modal-variable-name-container');

    const varNameLabel = document.createElement("Label");
    Blockly.utils.dom.addClass(varNameLabel,
        'typed-modal-variable-name-label');
    varNameLabel.innerText = this.messages["TYPED_MODAL_VARIABLE_NAME_LABEL"];
    varNameLabel.setAttribute('for', 'variableInput');

    const varNameInput = document.createElement('input');
    Blockly.utils.dom.addClass(varNameInput, 'typed-modal-variable-name-input');
    varNameInput.type = 'text';
    varNameInput.id = 'variableInput';

    varNameContainer.appendChild(varNameLabel);
    varNameContainer.appendChild(varNameInput);
    return varNameContainer;
  }
}

Blockly.Css.register([`
      .typed-modal-title {
        font-weight: bold;
        font-size: 1em;
      }
      .typed-modal-variable-name-container {
        margin: 1em 0 1em 0;
      }
      .typed-modal-variable-name-label{
        margin-right: .5em;
      }
      .typed-modal-types ul{
        display: flex;
        flex-wrap: wrap;
        list-style-type: none;
        padding: 0;
      }
      .typed-modal-types li {
        margin-right: 1em;
        display: flex;
      }`]);
