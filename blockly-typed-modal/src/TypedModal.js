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


const TypedModal = {};

TypedModal.init = function(types) {
  TypedModal.TYPES = types;
  Blockly.VariablesDynamic.flyoutCategory = TypedModal.createTypedModalDialog;
};

TypedModal.createTypedModalDialog = function(workspace) {
  let xmlList = [];
  const button = document.createElement('button');
  button.setAttribute('text', Blockly.Msg['NEW_STRING_VARIABLE']);
  button.setAttribute('callbackKey', 'CREATE_VARIABLE_STRING');
  xmlList.push(button);

  workspace.registerButtonCallback('CREATE_VARIABLE_STRING', TypedModal.buttonHandler);


  const blockList = Blockly.VariablesDynamic.flyoutCategoryBlocks(workspace);
  xmlList = xmlList.concat(blockList);
  return xmlList;
};

TypedModal.buttonHandler = function(button) {
  TypedModal.createDom(TypedModal.TYPES);
  // TypedModal.createModal(button.getTargetWorkspace(), TypedModal.TYPES);
};

TypedModal.createModal = function(workspace, types) {
  console.log(workspace, types);
  const promptAndCheckWithAlert = function(defaultName) {
    Blockly.Variables.promptName(Blockly.Msg['NEW_VARIABLE_TITLE'], defaultName,
        function(text) {
          if (text) {
            const existing =
                Blockly.Variables.nameUsedWithAnyType_(text, workspace);
            if (existing) {
              if (existing.type == type) {
                let msg = Blockly.Msg['VARIABLE_ALREADY_EXISTS'].replace(
                    '%1', existing.name);
              } else {
                let msg =
                    Blockly.Msg['VARIABLE_ALREADY_EXISTS_FOR_ANOTHER_TYPE'];
                msg = msg.replace('%1', existing.name).replace('%2', existing.type);
              }
              Blockly.alert(msg,
                  function() {
                    promptAndCheckWithAlert(text);  // Recurse
                  });
            } else {
              // No conflict
              workspace.createVariable(text, type);
            }
          }
        });
  };
  promptAndCheckWithAlert('');
};

TypedModal.createDom = function(types) {
  /*
   * Creates the search bar. The generated search bar looks like:
   * <div class="typed-modal-dialog">
   *   <div class="typed-modal-dialog-title">Create New Variable</div>
   *   <div class="typed-modal-dialog-input">
   *     Name:
   *     <input type="text" id="variable-text"><br><br>
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

  const dialogTitle = document.createElement('div');
  Blockly.utils.dom.addClass(dialogTitle, 'typed-modal-dialog-title');
  dialogTitle.innerHTML = "Create New Variable";

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
    const typeDisplayName = type[0];
    const typeName = type[1];
    const typeLi = document.createElement('li');
    const typeInput = document.createElement('input');
    typeInput.type = "radio";
    typeInput.name = typeName;
    typeInput.innerHTML = typeDisplayName;
    typeLi.appendChild(typeInput);
    typeList.appendChild(typeLi);
  }
  dialogDiv.appendChild(dialogTitle);
  dialogDiv.appendChild(dialogInputDiv);
  dialogDiv.appendChild(dialogVariableDiv);
};


  /**
   * Creates and injects the search bar's DOM.
   * @protected
   */
  createDom_() {
    /*
     * Creates the search bar. The generated search bar looks like:
     * <div class="ws-search'>
     *   <div class="ws-search-container'>
     *     <div class="ws-search-content'>
     *       <div class="ws-search-input'>
     *         [... text input goes here ...]
     *       </div>
     *       [... actions div goes here ...]
     *     </div>
     *     [... close button goes here ...]
     *   </div>
     * </div>
     */
    const injectionDiv = this.workspace_.getInjectionDiv();
    this.addEvent_(injectionDiv, 'keydown', this, evt => this
        .onWorkspaceKeyDown_(/** @type {KeyboardEvent} */ evt));

    this.htmlDiv_ = document.createElement('div');
    Blockly.utils.dom.addClass(this.htmlDiv_, 'blockly-ws-search');
    this.positionSearchBar_();

    const searchContainer = document.createElement('div');
    Blockly.utils.dom.addClass(searchContainer, 'blockly-ws-search-container');

    const searchContent = document.createElement('div');
    Blockly.utils.dom.addClass(searchContent, 'blockly-ws-search-content');
    searchContainer.appendChild(searchContent);

    const inputWrapper = document.createElement('div');
    Blockly.utils.dom.addClass(inputWrapper, 'blockly-ws-search-input');
    this.inputElement_ = this.createTextInput_();
    this.addEvent_(this.inputElement_, 'keydown', this, evt => this
        .onKeyDown_(/** @type {KeyboardEvent} */ evt));
    this.addEvent_(this.inputElement_, 'input', this, () =>this
        .onInput_());
    this.addEvent_(this.inputElement_, 'click', this, () => this
        .searchAndHighlight(this.searchText_, this.preserveSelected));

    inputWrapper.appendChild(this.inputElement_);
    searchContent.appendChild(inputWrapper);

    this.actionDiv_ = document.createElement('div');
    Blockly.utils.dom.addClass(this.actionDiv_, 'blockly-ws-search-actions');
    searchContent.appendChild(this.actionDiv_);

    const nextBtn = this.createNextBtn_();
    if (nextBtn) {
      this.addActionBtn(nextBtn, () => this.next());
    }

    const previousBtn = this.createPreviousBtn_();
    if (previousBtn) {
      this.addActionBtn(previousBtn, () => this.previous());
    }

    const closeBtn = this.createCloseBtn_();
    if (closeBtn) {
      this.addBtnListener_(closeBtn, () => this.close());
      searchContainer.appendChild(closeBtn);
    }

    this.htmlDiv_.appendChild(searchContainer);

    injectionDiv.insertBefore(this.htmlDiv_, this.workspace_.getParentSvg());
  }



// const onCreateTypedVariable = function(button) {
//   console.log("HERE");
//   Blockly.Variables.createVariableButtonHandler(button.getTargetWorkspace(),
//       undefined, 'String');
//
// };
//
// Blockly.Variables.promptName =
//
const typedVariableButtonHandler = function(
    workspace, opt_callback, opt_type) {
  var type = opt_type || '';
  // This function needs to be named so it can be called recursively.
  var promptAndCheckWithAlert = function(defaultName) {
    Blockly.Variables.promptName(Blockly.Msg['NEW_VARIABLE_TITLE'], defaultName,
        function(text) {
          if (text) {
            var existing =
                Blockly.Variables.nameUsedWithAnyType_(text, workspace);
            if (existing) {
              if (existing.type == type) {
                var msg = Blockly.Msg['VARIABLE_ALREADY_EXISTS'].replace(
                    '%1', existing.name);
              } else {
                var msg =
                    Blockly.Msg['VARIABLE_ALREADY_EXISTS_FOR_ANOTHER_TYPE'];
                msg = msg.replace('%1', existing.name).replace('%2', existing.type);
              }
              Blockly.alert(msg,
                  function() {
                    promptAndCheckWithAlert(text);  // Recurse
                  });
            } else {
              // No conflict
              workspace.createVariable(text, type);
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
        });
  };
  promptAndCheckWithAlert('');
};

