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

import { injectTypedModalCss } from './css.js';
import * as Blockly from 'blockly/core';

export const TypedModal = {};

TypedModal.init = function(workspace, types) {
  injectTypedModalCss();
  TypedModal.htmlDiv_ = TypedModal.createDom(types);
  workspace.registerButtonCallback('CREATE_TYPED_VARIABLE', TypedModal.show);
};

TypedModal.show = function() {
  if (!document.getElementById('typed-modal-dialog')) {
    document.body.appendChild(TypedModal.htmlDiv_);
  }
  TypedModal.htmlDiv_.style.display = 'flex';
};

TypedModal.hide = function() {
  TypedModal.htmlDiv_.style.display = 'none';
};

TypedModal.createDom = function(types) {
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
   * </div>
   */
  const dialogDiv = document.createElement('div');
  Blockly.utils.dom.addClass(dialogDiv, 'typed-modal-dialog');
  dialogDiv.setAttribute('role', 'dialog');
  dialogDiv.setAttribute('aria-labelledby', 'Typed Variable Dialog');
  dialogDiv.setAttribute('aria-describedby', 'Dialog for creating a types variable.');

  const dialogHeader = document.createElement('H1');
  const dialogTitle = document.createTextNode("Create New Variable");
  dialogHeader.appendChild(dialogTitle);
  Blockly.utils.dom.addClass(dialogHeader, 'typed-modal-dialog-title');

  const dialogInputDiv = document.createElement('div');
  Blockly.utils.dom.addClass(dialogInputDiv, 'typed-modal-dialog-input');
  dialogInputDiv.innerHTML = 'Name';

  const dialogInput = document.createElement('input');
  dialogInput.type = 'text';
  dialogInputDiv.appendChild(dialogInput);

  const dialogVariableDiv = document.createElement('div');
  Blockly.utils.dom.addClass(dialogVariableDiv, 'typed-modal-dialog-variables');
  dialogVariableDiv.innerHTML = "Variable Types";

  const typeList = document.createElement('ul');
  dialogVariableDiv.appendChild(typeList);

  for (const type of types) {
    const typeName = type[0];
    const typeDisplayName = type[1];
    const typeLi = document.createElement('li');
    const typeInput = document.createElement('input');
    typeInput.type = "radio";
    typeInput.id = typeName;
    typeInput.name = "variableType";

    const typeLabel = document.createElement("Label");
    typeLabel.innerText = typeDisplayName;
    typeLabel.setAttribute('for', typeName);
    typeLi.appendChild(typeInput);
    typeLi.appendChild(typeLabel);
    typeList.appendChild(typeLi);
  }
  dialogDiv.appendChild(dialogHeader);
  dialogDiv.appendChild(dialogInputDiv);
  dialogDiv.appendChild(dialogVariableDiv);

  return dialogDiv;
};
