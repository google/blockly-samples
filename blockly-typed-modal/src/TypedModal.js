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

import { injectTypedModalCss } from './css.js';
import * as Blockly from 'blockly/core';

/**
 * Class for displaying a modal used for creating typed variables.
 */
export class TypedModal {
  /**
   * Constructor for creating and registering a typed modal.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace that the button
   *     callback will be registered on.
   * @param {boolean=} opt_requireType If true require the user to create a
   *     variable with one of the types.
   */
  constructor(workspace, opt_requireType) {

    /**
     * The workspace that the button callback will be registered on.
     * @type {!Blockly.WorkspaceSvg}
     * @private
     */
    this.workspace_ = workspace;

    /**
     * HTML container for the typed modal.
     * @type {?HTMLElement}
     * @private
     */
    this.htmlDiv_ = null;

    /**
     * True to require a type in the modal.
     * @type {boolean}
     * @private
     */
    this.requireType_ = !!opt_requireType;

    /**
     * The selected type for the modal.
     * @type {?string}
     * @private
     */
    this.selectedType_ = null;
  }

  /**
   * Create a typed modal and register it with the given button name.
   * @param {string} btnCallbackName The name the button will be registered
   *     under.
   * @param {Array<Array<string>>}types An array holding arrays with the name of
   *     the type and the display name for the type.
   *     Ex: [['Penguin', 'PENGUIN'], ['Giraffe', 'GIRAFFE']].
   */
  init(btnCallbackName, types) {
    injectTypedModalCss();
    this.htmlDiv_ = this.createDom(types, this.createVariable_, this.hide);
    this.workspace_.registerButtonCallback(btnCallbackName, (button) => {
      this.show(button.getTargetWorkspace());
    });
  }

  /**
   * Shows the typed modal.
   * @param {!Blockly.WorkspaceSvg} workspace The button's target workspace.
   */
  show(workspace) {
    // TODO: Fix the dispose method
    Blockly.WidgetDiv.show(this, workspace.RTL, () => {});
    this.widgetCreate_();
    this.focusableEls[0].focus();
  }

  /**
   * Hide the typed modal.
   */
  hide() {
    Blockly.WidgetDiv.hide();
  }

  /**
   * Add the typed modal html to the widget div.
   * @private
   */
  widgetCreate_() {
    const widgetDiv = Blockly.WidgetDiv.DIV;
    const htmlInput_ = this.htmlDiv_;
    widgetDiv.appendChild(htmlInput_);
  };

  /**
   * Handle when the user does a backwards tab.
   * @param {KeyboardEvent} e The keydown event.
   * @private
   */
  handleBackwardTab_(e) {
    if (document.activeElement === this.focusableEls[0]) {
      e.preventDefault();
      this.focusableEls[this.focusableEls.length - 1].focus();
    }
  };

  /**
   * Handle when the user does a forward tab.
   * @param {KeyboardEvent} e The keydown event.
   * @private
   */
  handleForwardTab_(e) {
    const focusedElements = this.focusableEls;
    if (document.activeElement === focusedElements[focusedElements.length - 1]) {
      e.preventDefault();
      this.focusableEls[0].focus();
    }
  };

  /**
   * Handles keydown event for the typed modal.
   * @param {KeyboardEvent} e The keydown event.
   * @private
   */
  handleKeyDown_(e) {
    if (e.keyCode === Blockly.utils.KeyCodes.TAB) {
      if (this.focusableEls.length === 1) {
        e.preventDefault();
        return;
      }
      if (e.shiftKey) {
        this.handleBackwardTab_(e);
      } else {
        this.handleForwardTab_(e);
      }
    } else if (e.keyCode === Blockly.utils.KeyCodes.ESC) {
      this.hide();
    }
  };

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
  };

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
  };

  /**
   * Create the typed modal's dom.
   * @param {Array<Array<string>>}types An array holding arrays with the name of
   *     the type and the display name for the type.
   *     Ex: [['Penguin', 'PENGUIN'], ['Giraffe', 'GIRAFFE']].
   * @param {Function} onCreate Function to be called on create.
   * @param {Function} onCancel Function to be called on cancel.
   * @return {HTMLDivElement} The html for the dialog.
   */
  createDom(types, onCreate, onCancel) {
    /*
     * Creates the search bar. The generated search bar looks like:
     * <div class="typed-modal-dialog">
     *   <div class="typed-modal-dialog-title">Create New Variable</div>
     *   <div class="typed-modal-dialog-input">
     *     Name:
     *     <input type="text"><br><br>
     *   </div>
     *   <div class="typed-modal-dialog-variables">
     *     Variable Types
     *     <ul>
     *       [ list of types goes here ]
     *     </ul>
     *   </div>
     *   <div class="typed-modal-actions">
     *     <button>Cancel</button>
     *     <button>Create</button>
     *   </div>
     * </div>
     */

    const dialog = document.createElement('div');
    Blockly.utils.dom.addClass(dialog, 'typed-modal');

    const dialogContent = document.createElement('div');
    Blockly.utils.dom.addClass(dialogContent, 'typed-modal-dialog');
    dialogContent.setAttribute('role', 'dialog');
    dialogContent.setAttribute('aria-labelledby', 'Typed Variable Dialog');
    dialogContent.setAttribute('aria-describedby', 'Dialog for creating a types variable.');

    const dialogHeader = document.createElement('H1');
    const dialogTitle = document.createTextNode("Create New Variable");
    dialogHeader.appendChild(dialogTitle);
    Blockly.utils.dom.addClass(dialogHeader, 'typed-modal-dialog-title');

    const dialogInputDiv = this.createDialogInputDiv_();

    const dialogVariableDiv = document.createElement('div');
    Blockly.utils.dom.addClass(dialogVariableDiv, 'typed-modal-dialog-variables');
    dialogVariableDiv.innerHTML = "Variable Types";

    const typeList = this.createTypeList_(types);
    dialogVariableDiv.appendChild(typeList);

    const actions = this.createActions_(onCreate, onCancel);

    dialogContent.appendChild(dialogHeader);
    dialogContent.appendChild(dialogInputDiv);
    dialogContent.appendChild(dialogVariableDiv);
    dialogContent.appendChild(actions);
    dialog.appendChild(dialogContent);
    Blockly.bindEventWithChecks_(dialog, 'keydown', this, this.handleKeyDown_);
    this.focusableEls = dialog.querySelectorAll('a[href],' +
        'area[href], input:not([disabled]), select:not([disabled]),' +
        'textarea:not([disabled]), button:not([disabled]), [tabindex="0"]');
    return dialog;
  };

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

    for (const type of types) {
      const typeName = type[0];
      const typeDisplayName = type[1];
      const typeLi = document.createElement('li');
      const typeInput = document.createElement('input');
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
  };

  /**
   * Create the div that holds the text input and label for the text input.
   * @return {HTMLDivElement} The div holding the text input and label for text
   *     input.
   * @private
   */
  createDialogInputDiv_() {
    const dialogInputDiv = document.createElement('div');
    Blockly.utils.dom.addClass(dialogInputDiv, 'typed-modal-dialog-input');

    const inputLabel = document.createElement("Label");
    inputLabel.innerText = 'Variable Name';
    inputLabel.setAttribute('for', 'variableInput');

    const dialogInput = document.createElement('input');
    dialogInput.type = 'text';
    dialogInput.id = 'variableInput';

    dialogInputDiv.appendChild(inputLabel);
    dialogInputDiv.appendChild(dialogInput);
    this.dialogInput = dialogInput;
    return dialogInputDiv;
  };

  /**
   * Create the actions for the modal.
   * @param {Function} onCreate Function to be called on create.
   * @param {Function} onCancel Function to be called on cancel.
   * @return {HTMLDivElement} The div containing the cancel and create buttons.
   * @private
   */
  createActions_(onCreate, onCancel) {
    const actions = document.createElement('div');
    Blockly.utils.dom.addClass(actions, 'typed-modal-actions');

    const createBtn = this.createCreateVariableBtn_(onCreate);
    const cancelBtn = this.createCancelBtn_(onCancel);
    actions.appendChild(createBtn);
    actions.appendChild(cancelBtn);
    return actions;
  };

  /**
   * Create the cancel button.
   * @param {Function} onCancel Function to be called on cancel.
   * @return {HTMLButtonElement} The cancel button.
   * @private
   */
  createCancelBtn_(onCancel) {
    const cancelBtn = document.createElement('button');
    cancelBtn.innerText = "Cancel";
    Blockly.bindEventWithChecks_(cancelBtn, 'click', this, onCancel);
    return cancelBtn;
  };

  /**
   * Create the button for creating a variable.
   * @param {Function} onCreate Function to be called on create.
   * @return {HTMLButtonElement} The create button.
   * @private
   */
  createCreateVariableBtn_(onCreate) {
    const createBtn = document.createElement('button');
    createBtn.innerText = "Create";
    Blockly.bindEventWithChecks_(createBtn, 'click', this, onCreate);
    return createBtn;
  };
}