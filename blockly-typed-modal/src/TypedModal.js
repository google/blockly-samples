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

// TODO: Test on mobile
// TODO: Make sure we are properly cleaning up after ourselves.
// TODO: How should be exporting.
// TODO: Clean up createDOM method

import * as Blockly from 'blockly/core';
import { Modal } from './Modal.js';
import { injectCss } from "./css";
import './typed_modal_messages';

/**
 * Class for displaying a modal used for creating typed variables.
 */
export class TypedModal extends Modal {
  /**
   * Constructor for creating and registering a typed modal.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace that the modal will
   *     be registered on.
   * @param {string} btnCallbackName The name used to register the button
   *     callback.
   * @param {Array<Array<string>>} types An array holding arrays with the
   *     display name as the first value and the type as the second.
   *     Ex: [['Penguin', 'PENGUIN'], ['Giraffe', 'GIRAFFE']].
   * @param {string=} opt_title A title for the typed modal. If none is provided
   *     will default to 'Create Typed Modal'.
   */
  constructor(workspace, btnCallbackName, types, opt_title) {
    const title = opt_title || Blockly.Msg['TYPED_MODAL_TITLE'];
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
  }

  /**
   * Create a typed modal and register it with the given button name.
   */
  init() {
    super.init();
    this.injectCss_();
    this.workspace_.registerButtonCallback(this.btnCallBackName_, (button) => {
      this.show(button.getTargetWorkspace());
    });
  }

  /**
   * Inject necessary css for a typed modal.
   * @override
   */
  injectCss_() {
    super.injectCss_();
    injectCss('typed-modal-css', `
      .typed-modal-title {
        font-weight: bold;
        font-size: 1em;
      }
      .typed-modal-variable-name-container {
        margin: 1em 0 1em 0;
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
      }`);
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
  onClose_() {
    super.onClose_();

    this.checkFirstType_();
    this.variableNameInput_.value = '';
  }

  /**
   * Get the function to be called when the user confirms.
   * @override
   */
  onConfirm_() {
    this.createVariable_();
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
   * Callback for when someone hits the create variable button. Creates a
   * variable if the name is valid, otherwise creates a pop up.
   * @private
   */
  createVariable_() {
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
    const varNameContainer = this.createVarNameContainer_();
    this.variableNameInput_ = varNameContainer
        .querySelector('.typed-modal-variable-name-input');

    const typedVarDiv = document.createElement('div');
    Blockly.utils.dom.addClass(typedVarDiv, 'typed-modal-types');
    typedVarDiv.innerText = Blockly.Msg["TYPED_MODAL_VARIABLE_TYPE_LABEL"];

    this.variableTypesDiv_ = this.createVariableTypeContainer_(this.types_);
    this.checkFirstType_();
    typedVarDiv.appendChild(this.variableTypesDiv_);

    this.contentDiv_.appendChild(varNameContainer);
    this.contentDiv_.appendChild(typedVarDiv);
  }

  /**
   * Check the first type in the list.
   * @protected
   */
  checkFirstType_() {
    this.firstTypeInput_.checked = true;
    this.selectedType_ = this.firstTypeInput_.id;
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
   * Get the selected type.
   * @return {?string} The selected type.
   */
  getSelectedType() {
    return this.selectedType_;
  }

  /**
   * Create the div that holds the text input and label for the text input.
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
    varNameLabel.innerText = Blockly.Msg["TYPED_MODAL_VARIABLES_DEFAULT_NAME"];
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
