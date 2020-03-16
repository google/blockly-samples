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
  TypedModal.htmlDiv_ = TypedModal.createDom(types, TypedModal.createVariable, TypedModal.hide);
  workspace.registerButtonCallback('CREATE_TYPED_VARIABLE', function(button) {
    TypedModal.show(button.getTargetWorkspace());
  });
};

TypedModal.show = function(workspace) {
  TypedModal.workspace = workspace;

  if (!document.getElementById('typed-modal-dialog')) {
    document.body.appendChild(TypedModal.htmlDiv_);
  }
  TypedModal.htmlDiv_.style.display = 'block';
};


TypedModal.getValidInput_ = function() {
  let newVar = TypedModal.dialogInput.value;
  if (newVar) {
    newVar = newVar.replace(/[\s\xa0]+/g, ' ').trim();
    if (newVar == Blockly.Msg['RENAME_VARIABLE'] ||
        newVar == Blockly.Msg['NEW_VARIABLE']) {
      // Ok, not ALL names are legal...
      newVar = null;
    }
  }
  return newVar;
};

TypedModal.createVariable = function(e, opt_callback) {
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

TypedModal.hide = function() {
  TypedModal.htmlDiv_.style.display = 'none';
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

  const dialogInputDiv = TypedModal.createDialogInput_();

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
    Blockly.bindEventWithChecks_(typeInput, 'click', TypedModal, function(e) {
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

TypedModal.createDialogInput_ = function() {
  // TODO: Make this into a label
  const dialogInputDiv = document.createElement('div');
  Blockly.utils.dom.addClass(dialogInputDiv, 'typed-modal-dialog-input');
  dialogInputDiv.innerHTML = 'Name';

  const dialogInput = document.createElement('input');
  dialogInput.type = 'text';
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
  // TODO: Check on using TypedModal here.
  Blockly.bindEventWithChecks_(cancelBtn, 'click', TypedModal, onCancel);
  return cancelBtn;
};

TypedModal.createCreateVariableBtn_ = function(onCreate) {
  const createBtn = document.createElement('button');
  createBtn.innerText = "Create";
  Blockly.bindEventWithChecks_(createBtn, 'click', TypedModal, function() {});
  createBtn.addEventListener('click', onCreate);
  return createBtn;
};