/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Unit tests for TypedVariableModal.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */

const assert = require('assert');
const Blockly = require('blockly');
const sinon = require('sinon');

const TypedVariableModal = require('../dist/index.js').TypedVariableModal;

suite('TypedVariableModal', () => {
  function workspaceSetup(rtl, toolbox, types) {
    const options = {};
    const createFlyout = function(workspace) {
      let xmlList = [];
      const button = document.createElement('button');
      button.setAttribute('text', 'Create Typed Variable');
      button.setAttribute('callbackKey', 'CREATE_TYPED_VARIABLE');

      xmlList.push(button);

      const blockList = Blockly.VariablesDynamic.flyoutCategoryBlocks(workspace);
      xmlList = xmlList.concat(blockList);
      return xmlList;
    };
    options.rtl = rtl;
    options.toolbox = toolbox;

    const ws = Blockly.inject('blocklyDiv', options);
    ws.registerToolboxCategoryCallback('CREATE_TYPED_VARIABLE', createFlyout);
    return ws;
  }
  function getTestToolbox() {
      const toolbox = `
        <xml>
          <category name="Typed Variables" categorystyle="variable_category" custom="CREATE_TYPED_VARIABLE"></category>
        </xml>
      `;
      return toolbox;
  }

  setup(() => {
    this.jsdomCleanup =
        require('jsdom-global')('<!DOCTYPE html><div id="blocklyDiv"></div>');
    const types = [["Penguin", "PENGUIN"],["Giraffe", "GIRAFFE"]];
    this.workspace = workspaceSetup(false, getTestToolbox(), types);    
    this.typedVarModal = new TypedVariableModal(this.workspace, 'CREATE_TYPED_VARIABLE', types);
  });

  teardown(() => {
    this.jsdomCleanup();
    sinon.restore();
  });

  suite('init()', () => {
    test('Render is called', async () => {
      this.workspace.registerButtonCallback = sinon.fake();
      this.typedVarModal.init();
      assert(this.workspace.registerButtonCallback.calledOnce);
    });
  });

  suite('show()', () => {
    test('Elements focused', async () => {
      this.typedVarModal.init();
      this.typedVarModal.show();
      assert.equal(this.typedVarModal.firstFocusableEl_.className, 'blocklyModalBtn blocklyModalBtnClose');
      assert.equal(this.typedVarModal.lastFocusableEl_.className, 'blocklyModalBtn');
    });
  });

  suite('dispose()', () => {
    test('Events and button callback removed', async () => {
      this.typedVarModal.init();
      this.workspace.removeButtonCallback = sinon.fake();
      const numEvents = this.typedVarModal.boundEvents_.length;
      Blockly.unbindEvent_ = sinon.fake();
      this.typedVarModal.dispose();

      assert(this.workspace.removeButtonCallback.calledOnce);
      assert.equal(document.querySelector('.blocklyModalOverlay'), null);
      assert.equal(Blockly.unbindEvent_.callCount, numEvents);
    });
  });

  suite('handleKeyDown()', () => {
    setup(() => {
      this.typedVarModal.init();
      this.typedVarModal.show();
    });
    function makeEvent(keyCode, shift) {
      const event = {
        keyCode: keyCode,
        shiftKey: shift,
      };
      event.stopPropagation = sinon.fake();
      event.preventDefault = sinon.fake();
      return event;
    }
    test('Tab pressed', async () => {
      var event = makeEvent(Blockly.utils.KeyCodes.TAB, false);
      this.typedVarModal.handleForwardTab_ = sinon.fake();
      this.typedVarModal.handleKeyDown_(event);
      assert(this.typedVarModal.handleForwardTab_.calledOnce);
    });
    test('Shift tab pressed', async () => {
      var event = makeEvent(Blockly.utils.KeyCodes.TAB, true);
      this.typedVarModal.handleBackwardTab_ = sinon.fake();
      this.typedVarModal.handleKeyDown_(event);
      assert(this.typedVarModal.handleBackwardTab_.calledOnce);
    });
    test('Escape pressed', async () => {
      var event = makeEvent(Blockly.utils.KeyCodes.ESC, false);
      this.typedVarModal.hide = sinon.fake();
      this.typedVarModal.handleKeyDown_(event);
      assert(this.typedVarModal.hide.calledOnce);
    });
  }); 

  suite('setLocale()', () => {
    test('Messages added', async () => {
      this.typedVarModal.init();
      const messages = {
        "TYPED_VAR_MODAL_CONFIRM_BUTTON": "confirm_test",
        "TYPED_VAR_MODAL_VARIABLE_NAME_LABEL": "variable_label"
      };
      this.typedVarModal.setLocale(messages);

      assert.equal(Blockly.Msg['TYPED_VAR_MODAL_CONFIRM_BUTTON'], 'confirm_test');
    });
  });

  suite('onConfirm_()', () => {
    setup(() => {
      Blockly.alert = sinon.fake();
      this.typedVarModal.init();
      this.typedVarModal.getSelectedType_ = sinon.fake.returns('Giraffe');
      this.typedVarModal.getDisplayName_ = sinon.fake.returns('Giraffe');
    });
    test('No text', async () => {
      this.typedVarModal.getValidInput_ = sinon.fake.returns(null);
      this.typedVarModal.onConfirm_();
      assert(Blockly.alert.calledWith('Name is not valid. Please choose a different name.'));
    });
    test('Valid Name', async () => {
      this.typedVarModal.getValidInput_ = sinon.fake.returns('varName');
      this.workspace.createVariable = sinon.fake();
      this.typedVarModal.onConfirm_();
      assert(this.workspace.createVariable.calledOnce);
    });
    test('Variable with different type already exists', async () => {
      Blockly.Variables.nameUsedWithAnyType_ = sinon.fake.returns({"type": "Penguin", "name":"varName"});
      this.typedVarModal.getValidInput_ = sinon.fake.returns('varName');
      this.typedVarModal.onConfirm_();
      assert(Blockly.alert.calledWith("A variable named 'varName' already exists for another type: 'Giraffe'."));
    });
    test('Variable with same type already exits', async () => {
      Blockly.Variables.nameUsedWithAnyType_ = sinon.fake.returns({"type": "Giraffe", "name":"varName"});
      this.typedVarModal.getValidInput_ = sinon.fake.returns('varName');
      this.typedVarModal.onConfirm_();
      assert(Blockly.alert.calledWith("A variable named 'varName' already exists."));
    });
  });

  suite('getDisplayName_()', () => {
    test('Get display name', async () => {
      assert.equal(this.typedVarModal.getDisplayName_('GIRAFFE'), 'Giraffe');
    });
    test('No display name', async () => {
      assert.equal(this.typedVarModal.getDisplayName_('SOMETHING'), '');
    });
  });

  suite('getValidInput_()', () => {
    setup(() => {
      this.typedVarModal.init();
    });
    test('Using rename variable name', async () => {
      this.typedVarModal.variableNameInput_.value = 'Rename variable...';
      assert.equal(this.typedVarModal.getValidInput_(), null);
    });
    test('Using new variable name', async () => {
      this.typedVarModal.variableNameInput_.value = 'Create variable...';
      assert.equal(this.typedVarModal.getValidInput_(), null);
    });
    test('Valid variable name', async () => {
      this.typedVarModal.variableNameInput_.value = 'varName';
      assert.equal(this.typedVarModal.getValidInput_(), 'varName');
    });
  });

  suite('render', () => {
    setup(() => {
      this.typedVarModal.render();
    });
    test('renderContent_()', async () => {
      const htmlDiv = this.typedVarModal.htmlDiv_;
      const modalContent = htmlDiv.querySelector('.blocklyModalContent');
      assert(modalContent.querySelector('.typedModalVariableNameInput'));
      assert(modalContent.querySelector('.typedModalTypes'));
    });
    test('renderFooter_()', async () => {
      const htmlDiv = this.typedVarModal.htmlDiv_;
      const modalFooter = htmlDiv.querySelector('.blocklyModalFooter');
      const allBtns = modalFooter.querySelectorAll('.blocklyModalBtn');
      assert(allBtns.length, 2);
    });
  });

  suite('create', () => {
    test('createConfirmBtn_()', async () => {
      const btn = this.typedVarModal.createConfirmBtn_();
      assert.equal(btn.className, 'blocklyModalBtn blocklyModalBtnPrimary');
    });
    test('createCancelBtn_()', async () => {
      const btn = this.typedVarModal.createCancelBtn_();
      assert.equal(btn.className, 'blocklyModalBtn');
    });
    test('createVariableTypeContainer_()', async () => {
      const types = this.typedVarModal.types_;
      const typeList = this.typedVarModal.createVariableTypeContainer_(types);
      assert.equal(typeList.querySelectorAll('.typedModalTypes').length, types.length);
    });
    test('createVarNameContainer_()', async () => {
      const container = this.typedVarModal.createVarNameContainer_();
      const varNameInput = container.querySelector('.typedModalVariableNameInput');
      const varNameLabel = container.querySelector('.typedModalVariableLabel');
      assert.equal(varNameLabel.getAttribute('for'), 'variableInput');
      assert.equal(varNameInput.id, 'variableInput');
    });
  });
});
