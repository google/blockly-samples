/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object responsible for creating a typed variable modal.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */

// TODO: How will multiple workspaces work in this scenario
// TODO: Should this be a class?
// TODO: Update css names
// TODO: Test on mobile
// TODO: Look at how I am dealing with css.
// TODO: How should be exporting.
// TODO: CHeck that it works in ie11
// TODO: Clean up createDOM method

import { injectTypedModalCss } from './css.js';
import * as Blockly from 'blockly/core';

export const TypedModal = {};

TypedModal.init = function(workspace, types) {
  injectTypedModalCss();
  TypedModal.htmlDiv_ = TypedModal.createDom(types, TypedModal.createVariable_, TypedModal.hide);
  workspace.registerToolboxCategoryCallback('CREATE_TYPED_VARIABLE', TypedModal.createTypedFlyout_);
  workspace.registerButtonCallback('CREATE_TYPED_VARIABLE', function(button) {
    TypedModal.show(button.getTargetWorkspace());
  });
};

TypedModal.show = function(workspace) {
  TypedModal.workspace = workspace;
  // TODO: Fix the dispose method
  Blockly.WidgetDiv.show(TypedModal, workspace.RTL, () => {});
  TypedModal.widgetCreate_();
  TypedModal.focusableEls[0].focus();
};

TypedModal.hide = function() {
  Blockly.WidgetDiv.hide();
};

TypedModal.createTypedFlyout_ = function(workspace) {
  let xmlList = [];
  const button = document.createElement('button');
  button.setAttribute('text', 'Create Typed Variable');
  button.setAttribute('callbackKey', 'CREATE_TYPED_VARIABLE');
  xmlList.push(button);

  // TODO: Can I use this?
  const blockList = Blockly.VariablesDynamic.flyoutCategoryBlocks(workspace);
  xmlList = xmlList.concat(blockList);
  return xmlList;
};


TypedModal.widgetCreate_ = function() {
  const widgetDiv = Blockly.WidgetDiv.DIV;
  const htmlInput_ = TypedModal.htmlDiv_;
  widgetDiv.appendChild(htmlInput_);
};

TypedModal.handleBackwardTab_ = function(e) {
  if (document.activeElement === TypedModal.focusableEls[0]) {
    e.preventDefault();
    TypedModal.focusableEls[TypedModal.focusableEls.length - 1].focus();
  }
};

TypedModal.handleForwardTab_ = function(e) {
  const focusedElements = TypedModal.focusableEls;
  if (document.activeElement === focusedElements[focusedElements.length - 1]) {
    e.preventDefault();
    TypedModal.focusableEls[0].focus();
  }
};

TypedModal.handleKeyDown_ = function(e) {
  if (e.keyCode === Blockly.utils.KeyCodes.TAB) {
    if (TypedModal.focusableEls.length === 1) {
      e.preventDefault();
      return;
    }
    if (e.shiftKey) {
      TypedModal.handleBackwardTab_(e);
    } else {
      TypedModal.handleForwardTab_(e);
    }
  } else if (e.keyCode === Blockly.utils.KeyCodes.ESC) {
    TypedModal.hide();
  }
};

TypedModal.getValidInput_ = function() {
  let newVar = TypedModal.dialogInput.value;
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

TypedModal.createVariable_ = function(e, opt_callback) {
  const text = TypedModal.getValidInput_();
  const type = TypedModal.selected ? TypedModal.selected.id : '';
  if (text) {
    const existing =
        Blockly.Variables.nameUsedWithAnyType_(text, TypedModal.workspace);
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
      Blockly.alert(msg,
          function() {
            TypedModal.createVariable();  // Recurse
          });
    } else {
      // No conflict
      TypedModal.workspace.createVariable(text, type);
      TypedModal.hide();
      if (opt_callback) {
        opt_callback(text);
      }
    }
  } else {
    // User canceled prompt.
    if (opt_callback) {
      opt_callback(null);
    }
  }
};

TypedModal.createDom = function(types, onCreate, onCancel) {
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

  const dialogInputDiv = TypedModal.createDialogInputDiv_();

  const dialogVariableDiv = document.createElement('div');
  Blockly.utils.dom.addClass(dialogVariableDiv, 'typed-modal-dialog-variables');
  dialogVariableDiv.innerHTML = "Variable Types";

  const typeList = TypedModal.createTypeList_(types);
  dialogVariableDiv.appendChild(typeList);

  const actions = TypedModal.createActions_(onCreate, onCancel);

  dialogContent.appendChild(dialogHeader);
  dialogContent.appendChild(dialogInputDiv);
  dialogContent.appendChild(dialogVariableDiv);
  dialogContent.appendChild(actions);
  dialog.appendChild(dialogContent);
  Blockly.bindEventWithChecks_(dialog, 'keydown', null, TypedModal.handleKeyDown_);
  TypedModal.focusableEls = dialog.querySelectorAll('a[href],' +
      'area[href], input:not([disabled]), select:not([disabled]),' +
      'textarea:not([disabled]), button:not([disabled]), [tabindex="0"]');
  return dialog;
};


TypedModal.createTypeList_ = function(types) {
  const typeList = document.createElement('ul');

  for (const type of types) {
    const typeName = type[0];
    const typeDisplayName = type[1];
    const typeLi = document.createElement('li');
    const typeInput = document.createElement('input');
    typeInput.type = "radio";
    typeInput.id = typeName;
    typeInput.name = "variableType";
    Blockly.bindEventWithChecks_(typeInput, 'click', null, function(e) {
      TypedModal.selected = e.target;
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

TypedModal.createDialogInputDiv_ = function() {
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
  TypedModal.dialogInput = dialogInput;
  return dialogInputDiv;
};

TypedModal.createActions_ = function(onCreate, onCancel) {
  const actions = document.createElement('div');
  Blockly.utils.dom.addClass(actions, 'typed-modal-actions');

  const createBtn = TypedModal.createCreateVariableBtn_(onCreate);
  const cancelBtn = TypedModal.createCancelBtn_(onCancel);
  actions.appendChild(createBtn);
  actions.appendChild(cancelBtn);
  return actions;
};

TypedModal.createCancelBtn_ = function(onCancel) {
  const cancelBtn = document.createElement('button');
  cancelBtn.innerText = "Cancel";
  Blockly.bindEventWithChecks_(cancelBtn, 'click', null, onCancel);
  return cancelBtn;
};

TypedModal.createCreateVariableBtn_ = function(onCreate) {
  const createBtn = document.createElement('button');
  createBtn.innerText = "Create";
  Blockly.bindEventWithChecks_(createBtn, 'click', null, onCreate);
  return createBtn;
};