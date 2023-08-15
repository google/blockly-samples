/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';


const chai = require('chai');
const sinon = require('sinon');

const Blockly = require('blockly/node');
const {NavigationController, Constants} = require('../src/index');
const {createNavigationWorkspace, createKeyDownEvent} =
    require('./test_helper');

suite('Navigation', function() {
  setup(function() {
    this.jsdomCleanup =
        require('jsdom-global')('<!DOCTYPE html><div id="blocklyDiv"></div>');
    // We are running these tests in node even thought they require a rendered
    // workspace, which doesn't exactly work. The rendering system expects
    // cancelAnimationFrame to be defined so we need to define it.
    window.cancelAnimationFrame = function() {};
    this.controller = new NavigationController();
    this.controller.init();
    this.navigation = this.controller.navigation;
  });

  teardown(function() {
    this.controller.dispose();
    window.cancelAnimationFrame = undefined;
    this.jsdomCleanup();
  });

  // Test that toolbox key handlers call through to the right functions and
  // transition correctly between toolbox, workspace, and flyout.
  suite('Tests toolbox keys', function() {
    setup(function() {
      Blockly.defineBlocksWithJsonArray([{
        'type': 'basic_block',
        'message0': '%1',
        'args0': [
          {
            'type': 'field_colour',
            'name': 'COLOURFIELD',
            'colour': '#ff4040',
          },
        ],
      }]);
      this.workspace = createNavigationWorkspace(this.navigation, true);
      this.navigation.focusToolbox(this.workspace);
    });

    teardown(function() {
      this.navigation.removeWorkspace(this.workspace);
      this.workspace.dispose();
      sinon.restore();
      delete Blockly.Blocks['basic_block'];
    });

    const testCases = [
      [
        'Calls toolbox selectNext',
        createKeyDownEvent(Blockly.utils.KeyCodes.S, 'NotAField'),
        'selectNext_',
      ],
      [
        'Calls toolbox selectPrevious',
        createKeyDownEvent(Blockly.utils.KeyCodes.W, 'NotAField'),
        'selectPrevious_',
      ],
      [
        'Calls toolbox selectParent',
        createKeyDownEvent(Blockly.utils.KeyCodes.D, 'NotAField'),
        'selectChild_',
      ],
      [
        'Calls toolbox selectChild',
        createKeyDownEvent(Blockly.utils.KeyCodes.A, 'NotAField'),
        'selectParent_',
      ],
    ];

    testCases.forEach(function(testCase) {
      const testCaseName = testCase[0];
      const mockEvent = testCase[1];
      const stubName = testCase[2];
      test(testCaseName, function() {
        const toolbox = this.workspace.getToolbox();
        const selectStub = sinon.stub(toolbox, stubName);
        toolbox.selectedItem_ = toolbox.contents_[0];
        Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, mockEvent);
        sinon.assert.called(selectStub);
      });
    });

    test('Go to flyout', function() {
      const navigation = this.navigation;
      const mockEvent =
          createKeyDownEvent(Blockly.utils.KeyCodes.D, 'NotAField');
      const keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');

      Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, mockEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      chai.assert.equal(
          navigation.getState(this.workspace), Constants.STATE.FLYOUT);

      const flyoutCursor = navigation.getFlyoutCursor(this.workspace);
      // See test_helper.js for hardcoded field values.
      chai.assert.equal(
          flyoutCursor.getCurNode().getLocation().getFieldValue('COLOURFIELD'),
          '#ff0000');
    });

    test('Focuses workspace from toolbox (e)', function() {
      const navigation = this.navigation;
      navigation.setState(this.workspace, Constants.STATE.TOOLBOX);
      const mockEvent =
          createKeyDownEvent(Blockly.utils.KeyCodes.E, 'NotAField');
      const keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');

      Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, mockEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      chai.assert.equal(
          navigation.getState(this.workspace), Constants.STATE.WORKSPACE);
    });
    test('Focuses workspace from toolbox (escape)', function() {
      const navigation = this.navigation;
      navigation.setState(this.workspace, Constants.STATE.TOOLBOX);
      const mockEvent =
          createKeyDownEvent(Blockly.utils.KeyCodes.ESC, 'NotAField');
      const keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');

      Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, mockEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      chai.assert.equal(
          navigation.getState(this.workspace), Constants.STATE.WORKSPACE);
    });
  });

  // Test that flyout key handlers call through to the right functions and
  // transition correctly between toolbox, workspace, and flyout.
  suite('Tests flyout keys', function() {
    setup(function() {
      Blockly.defineBlocksWithJsonArray([{
        'type': 'basic_block',
        'message0': '%1',
        'args0': [
          {
            'type': 'field_colour',
            'name': 'COLOURFIELD',
            'colour': '#ff4040',
          },
        ],
      }]);
      this.workspace = createNavigationWorkspace(this.navigation, true);
      this.navigation.focusToolbox(this.workspace);
      this.navigation.focusFlyout(this.workspace);
    });

    teardown(function() {
      this.navigation.removeWorkspace(this.workspace);
      this.workspace.dispose();
      sinon.restore();
      delete Blockly.Blocks['basic_block'];
    });
    // Should be a no-op
    test('Previous at beginning', function() {
      const mockEvent =
          createKeyDownEvent(Blockly.utils.KeyCodes.W, 'NotAField');
      const keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');

      Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, mockEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.FLYOUT);
      // See test_helper.js for hardcoded field values.
      chai.assert.equal(
          this.navigation.getFlyoutCursor(this.workspace)
              .getCurNode()
              .getLocation()
              .getFieldValue('COLOURFIELD'),
          '#ff0000');
    });
    test('Previous', function() {
      const flyoutBlocks =
          this.workspace.getFlyout().getWorkspace().getTopBlocks();
      this.navigation.getFlyoutCursor(this.workspace)
          .setCurNode(Blockly.ASTNode.createStackNode(flyoutBlocks[1]));
      let flyoutBlock = this.navigation.getFlyoutCursor(this.workspace)
          .getCurNode()
          .getLocation();
      // See test_helper.js for hardcoded field values.
      chai.assert.equal(
          flyoutBlock.getFieldValue('COLOURFIELD'), '#00ff00');

      const mockEvent =
          createKeyDownEvent(Blockly.utils.KeyCodes.W, 'NotAField');
      const keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');

      Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, mockEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.FLYOUT);
      flyoutBlock = this.navigation.getFlyoutCursor(this.workspace)
          .getCurNode()
          .getLocation();
      // See test_helper.js for hardcoded field values.
      chai.assert.equal(
          flyoutBlock.getFieldValue('COLOURFIELD'), '#ff0000');
    });

    test('Next', function() {
      const mockEvent =
          createKeyDownEvent(Blockly.utils.KeyCodes.S, 'NotAField');
      const keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');

      Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, mockEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.FLYOUT);
      const flyoutBlock = this.navigation.getFlyoutCursor(this.workspace)
          .getCurNode()
          .getLocation();
      // See test_helper.js for hardcoded field values.
      chai.assert.equal(
          flyoutBlock.getFieldValue('COLOURFIELD'), '#00ff00');
    });

    test('Out', function() {
      const mockEvent =
          createKeyDownEvent(Blockly.utils.KeyCodes.A, 'NotAField');
      const keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');

      Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, mockEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.TOOLBOX);
    });

    test('Mark', function() {
      const mockEvent =
          createKeyDownEvent(Blockly.utils.KeyCodes.ENTER, 'NotAField');
      const keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');

      Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, mockEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.WORKSPACE);
      chai.assert.equal(this.workspace.getTopBlocks().length, 1);
    });

    test('Mark - Disabled Block', function() {
      this.navigation.loggingCallback = function(type, msg) {
        chai.assert.equal(msg, 'Can\'t insert a disabled block.');
      };
      const flyout = this.workspace.getFlyout();
      const topBlock = flyout.getWorkspace().getTopBlocks()[0];
      topBlock.setEnabled(false);
      const mockEvent =
          createKeyDownEvent(Blockly.utils.KeyCodes.ENTER, 'NotAField');
      const keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');

      Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, mockEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.FLYOUT);
      chai.assert.equal(this.workspace.getTopBlocks().length, 0);
      this.navigation.loggingCallback = null;
    });

    test('Exit', function() {
      const mockEvent =
          createKeyDownEvent(Blockly.utils.KeyCodes.ESC, 'NotAField');
      const keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');

      Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, mockEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.WORKSPACE);
    });
  });
  // Test that workspace key handlers call through to the right functions and
  // transition correctly between toolbox, workspace, and flyout.
  suite('Tests workspace keys', function() {
    setup(function() {
      Blockly.defineBlocksWithJsonArray([{
        'type': 'basic_block',
        'message0': '%1',
        'args0': [
          {
            'type': 'field_colour',
            'name': 'COLOURFIELD',
            'colour': '#ff4040',
          },
        ],
        'previousStatement': null,
        'nextStatement': null,
      }]);
      this.workspace = createNavigationWorkspace(this.navigation, true);
      this.basicBlock = this.workspace.newBlock('basic_block');
    });

    teardown(function() {
      this.navigation.removeWorkspace(this.workspace);
      this.workspace.dispose();
      sinon.restore();
      delete Blockly.Blocks['basic_block'];
    });

    test('Previous', function() {
      const prevSpy = sinon.spy(this.workspace.getCursor(), 'prev');
      const keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');
      const wEvent = createKeyDownEvent(Blockly.utils.KeyCodes.W, '');

      Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, wEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      sinon.assert.calledOnce(prevSpy);
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.WORKSPACE);
    });

    test('Next', function() {
      const nextSpy = sinon.spy(this.workspace.getCursor(), 'next');
      const keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');
      const sEvent = createKeyDownEvent(Blockly.utils.KeyCodes.S, '');

      Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, sEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      sinon.assert.calledOnce(nextSpy);
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.WORKSPACE);
    });

    test('Out', function() {
      const outSpy = sinon.spy(this.workspace.getCursor(), 'out');
      const keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');
      const aEvent = createKeyDownEvent(Blockly.utils.KeyCodes.A, '');

      Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, aEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      sinon.assert.calledOnce(outSpy);
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.WORKSPACE);
    });

    test('In', function() {
      const inSpy = sinon.spy(this.workspace.getCursor(), 'in');
      const keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');
      const dEvent = createKeyDownEvent(Blockly.utils.KeyCodes.D, '');

      Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, dEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      sinon.assert.calledOnce(inSpy);
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.WORKSPACE);
    });

    test('Insert', function() {
      const blockNode = Blockly.ASTNode.createBlockNode(this.basicBlock);
      this.navigation.getMarker(this.workspace).setCurNode(blockNode);
      // Stub modify as we are not testing its behavior, only if it was called.
      // Otherwise, there is a warning because there is no marked node.
      const modifyStub =
          sinon.stub(this.navigation, 'tryToConnectMarkerAndCursor')
              .returns(true);
      const keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');
      const iEvent = createKeyDownEvent(Blockly.utils.KeyCodes.I, '');

      Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, iEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      sinon.assert.calledOnce(modifyStub);
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.WORKSPACE);
    });

    test('Mark', function() {
      this.workspace.getCursor().setCurNode(
          Blockly.ASTNode.createConnectionNode(
              this.basicBlock.previousConnection));
      const keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');
      const enterEvent = createKeyDownEvent(Blockly.utils.KeyCodes.ENTER, '');

      Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, enterEvent);

      const markedNode =
          this.workspace.getMarker(this.navigation.MARKER_NAME).getCurNode();
      chai.assert.isTrue(keyDownSpy.returned(true));
      chai.assert.equal(
          markedNode.getLocation(), this.basicBlock.previousConnection);
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.WORKSPACE);
    });

    test('Toolbox', function() {
      const keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');
      const tEvent = createKeyDownEvent(Blockly.utils.KeyCodes.T, '');

      Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, tEvent);

      const firstCategory = this.workspace.getToolbox().contents_[0];
      chai.assert.isTrue(keyDownSpy.returned(true));
      chai.assert.equal(
          this.workspace.getToolbox().getSelectedItem(), firstCategory);
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.TOOLBOX);
    });
  });

  suite('Test key press', function() {
    setup(function() {
      Blockly.defineBlocksWithJsonArray([{
        'type': 'basic_block',
        'message0': '%1',
        'args0': [
          {
            'type': 'field_colour',
            'name': 'COLOURFIELD',
            'colour': '#ff4040',
          },
        ],
      }]);
      this.workspace = createNavigationWorkspace(this.navigation, true);

      this.workspace.getCursor().drawer_ = null;
      this.basicBlock = this.workspace.newBlock('basic_block');
      this.basicBlock.initSvg();
      this.basicBlock.render();
    });
    teardown(function() {
      this.navigation.removeWorkspace(this.workspace);
      this.workspace.dispose();
      sinon.restore();
      delete Blockly.Blocks['basic_block'];
    });

    test('Action does not exist', function() {
      const block = this.workspace.getTopBlocks()[0];
      const field = block.inputList[0].fieldRow[0];
      const fieldSpy = sinon.spy(field, 'onShortcut');
      const mockEvent = createKeyDownEvent(Blockly.utils.KeyCodes.N, '');
      const keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');
      this.workspace.getCursor().setCurNode(
          Blockly.ASTNode.createFieldNode(field));

      Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, mockEvent);

      chai.assert.isFalse(keyDownSpy.returned(true));
      sinon.assert.notCalled(fieldSpy);
    });

    test('Action exists - field handles action', function() {
      const block = this.workspace.getTopBlocks()[0];
      const field = block.inputList[0].fieldRow[0];
      const mockEvent = createKeyDownEvent(Blockly.utils.KeyCodes.A, '');
      const fieldSpy = sinon.stub(field, 'onShortcut').returns(true);
      const keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');
      this.workspace.getCursor().setCurNode(
          Blockly.ASTNode.createFieldNode(field));

      Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, mockEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      sinon.assert.calledOnce(fieldSpy);
    });

    test('Action exists - field does not handle action', function() {
      const block = this.workspace.getTopBlocks()[0];
      const field = block.inputList[0].fieldRow[0];
      const mockEvent = createKeyDownEvent(Blockly.utils.KeyCodes.A, '');
      const fieldSpy = sinon.spy(field, 'onShortcut');
      const keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');
      this.workspace.getCursor().setCurNode(
          Blockly.ASTNode.createFieldNode(field));

      Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, mockEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      sinon.assert.calledOnce(fieldSpy);
    });

    test('Toggle Action Off', function() {
      const mockEvent = createKeyDownEvent(
          Blockly.utils.KeyCodes.K, '',
          [Blockly.utils.KeyCodes.SHIFT, Blockly.utils.KeyCodes.CTRL]);
      const keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');
      this.workspace.keyboardAccessibilityMode = true;

      Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, mockEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      chai.assert.isFalse(this.workspace.keyboardAccessibilityMode);
    });

    test('Toggle Action On', function() {
      const mockEvent = createKeyDownEvent(
          Blockly.utils.KeyCodes.K, '',
          [Blockly.utils.KeyCodes.SHIFT, Blockly.utils.KeyCodes.CTRL]);
      const keyDownSpy =
          sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');
      this.workspace.keyboardAccessibilityMode = false;

      Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, mockEvent);

      chai.assert.isTrue(keyDownSpy.returned(true));
      chai.assert.isTrue(this.workspace.keyboardAccessibilityMode);
    });

    suite('Test key press in read only mode', function() {
      setup(function() {
        Blockly.defineBlocksWithJsonArray([{
          'type': 'field_block',
          'message0': '%1 %2',
          'args0': [
            {
              'type': 'field_colour',
              'name': 'COLOURFIELD',
              'colour': '#ff4040',
            },
            {
              'type': 'input_value',
              'name': 'NAME',
            },
          ],
          'previousStatement': null,
          'nextStatement': null,
          'colour': 230,
          'tooltip': '',
          'helpUrl': '',
        }]);
        this.workspace = createNavigationWorkspace(this.navigation, true, true);
        Blockly.common.setMainWorkspace(this.workspace);
        this.workspace.getCursor().drawer_ = null;

        this.fieldBlock1 = this.workspace.newBlock('field_block');
        this.fieldBlock1.initSvg();
        this.fieldBlock1.render();
      });

      teardown(function() {
        this.navigation.removeWorkspace(this.workspace);
        this.workspace.dispose();
        sinon.restore();
        delete Blockly.Blocks['field_block'];
      });

      test('Perform valid action for read only', function() {
        const astNode = Blockly.ASTNode.createBlockNode(this.fieldBlock1);
        const mockEvent = createKeyDownEvent(Blockly.utils.KeyCodes.S, '');
        this.workspace.getCursor().setCurNode(astNode);
        const keyDownSpy =
            sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');

        Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, mockEvent);

        chai.assert.isTrue(keyDownSpy.returned(true));
      });

      test('Perform invalid action for read only', function() {
        const astNode = Blockly.ASTNode.createBlockNode(this.fieldBlock1);
        const mockEvent = createKeyDownEvent(Blockly.utils.KeyCodes.I, '');
        this.workspace.getCursor().setCurNode(astNode);
        const keyDownSpy =
            sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');

        Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, mockEvent);

        chai.assert.isTrue(keyDownSpy.returned(false));
      });

      test('Try to perform action on a field', function() {
        const field = this.fieldBlock1.inputList[0].fieldRow[0];
        const astNode = Blockly.ASTNode.createFieldNode(field);
        const mockEvent = createKeyDownEvent(Blockly.utils.KeyCodes.ENTER, '');
        this.workspace.getCursor().setCurNode(astNode);
        const keyDownSpy =
            sinon.spy(Blockly.ShortcutRegistry.registry, 'onKeyDown');

        Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, mockEvent);

        chai.assert.isTrue(keyDownSpy.returned(false));
      });
    });
  });
  suite('Insert Functions', function() {
    setup(function() {
      Blockly.defineBlocksWithJsonArray([{
        'type': 'basic_block',
        'message0': '%1',
        'args0': [
          {
            'type': 'field_colour',
            'name': 'COLOURFIELD',
            'colour': '#ff4040',
          },
        ],
        'previousStatement': null,
        'nextStatement': null,
      }]);

      this.workspace = createNavigationWorkspace(this.navigation, true);

      const basicBlock = this.workspace.newBlock('basic_block');
      const basicBlock2 = this.workspace.newBlock('basic_block');

      this.basicBlock = basicBlock;
      this.basicBlock2 = basicBlock2;
    });

    teardown(function() {
      this.navigation.removeWorkspace(this.workspace);
      this.workspace.dispose();
      sinon.restore();
      delete Blockly.Blocks['basic_block'];
    });

    test('Insert from flyout with a valid connection marked', function() {
      const previousConnection = this.basicBlock.previousConnection;
      const prevNode = Blockly.ASTNode.createConnectionNode(previousConnection);
      this.workspace.getMarker(this.navigation.MARKER_NAME)
          .setCurNode(prevNode);

      this.navigation.focusToolbox(this.workspace);
      this.navigation.focusFlyout(this.workspace);
      this.navigation.insertFromFlyout(this.workspace);

      const insertedBlock = this.basicBlock.previousConnection.targetBlock();

      chai.assert.isTrue(insertedBlock !== null);
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.WORKSPACE);
    });

    test('Insert Block from flyout without marking a connection', function() {
      this.navigation.focusToolbox(this.workspace);
      this.navigation.focusFlyout(this.workspace);
      this.navigation.insertFromFlyout(this.workspace);

      const numBlocks = this.workspace.getTopBlocks().length;

      // Make sure the block was not connected to anything
      chai.assert.isNull(this.basicBlock.previousConnection.targetConnection);
      chai.assert.isNull(this.basicBlock.nextConnection.targetConnection);

      // Make sure that the block was added to the workspace
      chai.assert.equal(numBlocks, 3);
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.WORKSPACE);
    });

    test('Connect two blocks that are on the workspace', function() {
      const targetNode = Blockly.ASTNode.createConnectionNode(
          this.basicBlock.previousConnection);
      const sourceNode =
          Blockly.ASTNode.createConnectionNode(this.basicBlock2.nextConnection);

      this.navigation.tryToConnectMarkerAndCursor(
          this.workspace, targetNode, sourceNode);
      const insertedBlock = this.basicBlock.previousConnection.targetBlock();

      chai.assert.isNotNull(insertedBlock);
    });
  });
  suite('Connect Blocks', function() {
    setup(function() {
      Blockly.defineBlocksWithJsonArray([
        {
          'type': 'basic_block',
          'message0': '',
          'previousStatement': null,
          'nextStatement': null,
        },
        {
          'type': 'inline_block',
          'message0': '%1 %2',
          'args0': [
            {
              'type': 'input_value',
              'name': 'NAME',
            },
            {
              'type': 'input_value',
              'name': 'NAME',
            },
          ],
          'inputsInline': true,
          'output': null,
          'tooltip': '',
          'helpUrl': '',
        },
      ]);

      this.workspace = createNavigationWorkspace(this.navigation, true);

      const basicBlock = this.workspace.newBlock('basic_block');
      const basicBlock2 = this.workspace.newBlock('basic_block');
      const basicBlock3 = this.workspace.newBlock('basic_block');
      const basicBlock4 = this.workspace.newBlock('basic_block');

      const inlineBlock1 = this.workspace.newBlock('inline_block');
      const inlineBlock2 = this.workspace.newBlock('inline_block');
      const inlineBlock3 = this.workspace.newBlock('inline_block');


      this.basicBlock = basicBlock;
      this.basicBlock2 = basicBlock2;
      this.basicBlock3 = basicBlock3;
      this.basicBlock4 = basicBlock4;

      this.inlineBlock1 = inlineBlock1;
      this.inlineBlock2 = inlineBlock2;
      this.inlineBlock3 = inlineBlock3;

      this.basicBlock.nextConnection.connect(
          this.basicBlock2.previousConnection);

      this.basicBlock3.nextConnection.connect(
          this.basicBlock4.previousConnection);

      this.inlineBlock1.inputList[0].connection.connect(
          this.inlineBlock2.outputConnection);
    });

    teardown(function() {
      this.navigation.removeWorkspace(this.workspace);
      this.workspace.dispose();
      sinon.restore();
      delete Blockly.Blocks['basic_block'];
      delete Blockly.Blocks['inline_block'];
    });

    test('Connect cursor on previous into stack', function() {
      const markedLocation = this.basicBlock2.previousConnection;
      const cursorLocation = this.basicBlock3.previousConnection;

      this.navigation.connect(cursorLocation, markedLocation);

      chai.assert.equal(
          this.basicBlock.nextConnection.targetBlock(), this.basicBlock3);
      chai.assert.equal(
          this.basicBlock2.previousConnection.targetBlock(), this.basicBlock4);
    });

    test('Connect marker on previous into stack', function() {
      const markedLocation = this.basicBlock3.previousConnection;
      const cursorLocation = this.basicBlock2.previousConnection;

      this.navigation.connect(cursorLocation, markedLocation);

      chai.assert.equal(
          this.basicBlock.nextConnection.targetBlock(), this.basicBlock3);
      chai.assert.equal(
          this.basicBlock2.previousConnection.targetBlock(), this.basicBlock4);
    });

    test('Connect cursor on next into stack', function() {
      const markedLocation = this.basicBlock2.previousConnection;
      const cursorLocation = this.basicBlock4.nextConnection;

      this.navigation.connect(cursorLocation, markedLocation);

      chai.assert.equal(
          this.basicBlock.nextConnection.targetBlock(), this.basicBlock4);
      chai.assert.isNull(this.basicBlock3.nextConnection.targetConnection);
    });

    test('Connect cursor with parents', function() {
      const markedLocation = this.basicBlock3.previousConnection;
      const cursorLocation = this.basicBlock2.nextConnection;

      this.navigation.connect(cursorLocation, markedLocation);

      chai.assert.equal(
          this.basicBlock3.previousConnection.targetBlock(), this.basicBlock2);
    });

    test('Try to connect input that is descendant of output', function() {
      const markedLocation = this.inlineBlock2.inputList[0].connection;
      const cursorLocation = this.inlineBlock1.outputConnection;

      this.navigation.connect(cursorLocation, markedLocation);

      chai.assert.isNull(this.inlineBlock2.outputConnection.targetBlock());
      chai.assert.equal(
          this.inlineBlock1.outputConnection.targetBlock(), this.inlineBlock2);
    });
    test.skip('Do not connect a shadow block', function() {
      // TODO(https://github.com/google/blockly-samples/issues/538): Update
      // tests after this bug is fixed.
      this.inlineBlock2.setShadow(true);

      const markedLocation = this.inlineBlock2.outputConnection;
      const cursorLocation = this.inlineBlock3.inputList[0].connection;
      const didConnect =
          this.navigation.connect(cursorLocation, markedLocation);
      chai.assert.isFalse(didConnect);
      chai.assert.isNull(this.inlineBlock2.outputConnection.targetBlock());
      chai.assert.equal(
          this.inlineBlock1.outputConnection.targetBlock(), this.inlineBlock2);
    });
  });

  suite('Test cursor move on block delete', function() {
    setup(function() {
      Blockly.defineBlocksWithJsonArray([{
        'type': 'basic_block',
        'message0': '',
        'previousStatement': null,
        'nextStatement': null,
      }]);
      this.workspace = createNavigationWorkspace(this.navigation, true);

      this.basicBlockA = this.workspace.newBlock('basic_block');
      this.basicBlockB = this.workspace.newBlock('basic_block');
    });

    teardown(function() {
      this.navigation.removeWorkspace(this.workspace);
      this.workspace.dispose();
      sinon.restore();
      delete Blockly.Blocks['basic_block'];
    });

    test('Delete block - has parent ', function() {
      this.basicBlockA.nextConnection.connect(
          this.basicBlockB.previousConnection);
      const astNode = Blockly.ASTNode.createBlockNode(this.basicBlockB);
      // Set the cursor to be on the child block
      this.workspace.getCursor().setCurNode(astNode);
      // Remove the child block
      const mockEvent = createKeyDownEvent(Blockly.utils.KeyCodes.DELETE, '');

      // Actions that happen when a block is deleted were causing problems.
      // Since this is not what we are trying to test and does not effect the
      // feature, disable events.
      Blockly.Events.disable();
      Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, mockEvent);
      Blockly.Events.enable();

      chai.assert.equal(
          this.workspace.getCursor().getCurNode().getType(),
          Blockly.ASTNode.types.NEXT);
    });

    test('Delete block - no parent ', function() {
      const astNode = Blockly.ASTNode.createBlockNode(this.basicBlockB);
      this.workspace.getCursor().setCurNode(astNode);

      const mockEvent = createKeyDownEvent(Blockly.utils.KeyCodes.DELETE, '');

      // Actions that happen when a block is deleted were causing problems.
      // Since this is not what we are trying to test and does not effect the
      // feature, disable events.
      Blockly.Events.disable();
      Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, mockEvent);
      Blockly.Events.enable();

      chai.assert.equal(
          this.workspace.getCursor().getCurNode().getType(),
          Blockly.ASTNode.types.WORKSPACE);
    });

    test('Delete parent block', function() {
      this.basicBlockA.nextConnection.connect(
          this.basicBlockB.previousConnection);
      const astNode = Blockly.ASTNode.createBlockNode(this.basicBlockB);
      const mockDeleteBlockEvent = {
        'blockId': this.basicBlockA,
        'ids': [
          this.basicBlockA.id,
          this.basicBlockB.id,
        ],
      };
      // Set the cursor to be on the child block
      this.workspace.getCursor().setCurNode(astNode);
      // Remove the parent block
      this.navigation.handleBlockDeleteByDrag(
          this.workspace, mockDeleteBlockEvent);
      chai.assert.equal(
          this.workspace.getCursor().getCurNode().getType(),
          Blockly.ASTNode.types.WORKSPACE);
    });

    test('Delete top block in stack', function() {
      this.basicBlockA.nextConnection.connect(
          this.basicBlockB.previousConnection);
      const astNode = Blockly.ASTNode.createStackNode(this.basicBlockA);
      const mockDeleteBlockEvent = {
        'blockId': this.basicBlockA.id,
        'ids': [
          this.basicBlockA.id,
          this.basicBlockB.id,
        ],
      };
      // Set the cursor to be on the stack
      this.workspace.getCursor().setCurNode(astNode);
      // Remove the top block in the stack
      this.navigation.handleBlockDeleteByDrag(
          this.workspace, mockDeleteBlockEvent);
      chai.assert.equal(
          this.workspace.getCursor().getCurNode().getType(),
          Blockly.ASTNode.types.WORKSPACE);
    });
  });

  suite('Test workspace listener', function() {
    setup(function() {
      Blockly.defineBlocksWithJsonArray([{
        'type': 'basic_block',
        'message0': '%1',
        'args0': [
          {
            'type': 'field_colour',
            'name': 'COLOURFIELD',
            'colour': '#ff4040',
          },
        ],
        'previousStatement': null,
        'nextStatement': null,
      }]);
      this.workspace = createNavigationWorkspace(this.navigation, true);
      this.workspaceChangeListener = this.navigation.wsChangeWrapper;
      this.basicBlockA = this.workspace.newBlock('basic_block');
    });

    teardown(function() {
      this.navigation.removeWorkspace(this.workspace);
      this.workspace.dispose();
      delete Blockly.Blocks['basic_block'];
      sinon.restore();
    });

    test('Handle block mutation', function() {
      const e = {
        type: Blockly.Events.BLOCK_CHANGE,
        element: 'mutation',
        blockId: this.basicBlockA.id,
        workspaceId: this.workspace.id,
      };
      const cursor = this.workspace.getCursor();
      const nextNode =
          Blockly.ASTNode.createConnectionNode(this.basicBlockA.nextConnection);
      cursor.setCurNode(nextNode);
      this.workspaceChangeListener(e);
      chai.assert.equal(
          cursor.getCurNode().getType(), Blockly.ASTNode.types.BLOCK);
    });
    test('Handle workspace click', function() {
      const e = {
        type: Blockly.Events.CLICK,
        workspaceId: this.workspace.id,
      };
      this.navigation.focusFlyout(this.workspace);
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.FLYOUT);

      this.workspaceChangeListener(e);

      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.WORKSPACE);
    });
    test('Focus toolbox if category clicked', function() {
      const e = {
        type: Blockly.Events.TOOLBOX_ITEM_SELECT,
        workspaceId: this.workspace.id,
        newItem: true,
      };
      const toolboxFocusStub = sinon.spy(this.navigation, 'focusToolbox');

      this.navigation.focusWorkspace(this.workspace);
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.WORKSPACE);

      this.workspaceChangeListener(e);

      sinon.assert.calledOnce(toolboxFocusStub);
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.TOOLBOX);
    });
    test('Focus workspace if toolbox is unselected', function() {
      const e = {
        type: Blockly.Events.TOOLBOX_ITEM_SELECT,
        workspaceId: this.workspace.id,
        newItem: false,
      };
      const resetFlyoutStub = sinon.spy(this.navigation, 'resetFlyout');
      this.navigation.setState(this.workspace, Constants.STATE.TOOLBOX);

      this.workspaceChangeListener(e);

      sinon.assert.calledOnce(resetFlyoutStub);
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.WORKSPACE);
    });
    test('Focus workspace when block created on workspace', function() {
      const e = {
        type: Blockly.Events.BLOCK_CREATE,
        workspaceId: this.workspace.id,
      };
      const resetFlyoutStub = sinon.spy(this.navigation, 'resetFlyout');
      // Only works when someone is in the flyout.
      this.navigation.setState(this.workspace, Constants.STATE.FLYOUT);

      this.workspaceChangeListener(e);

      sinon.assert.calledOnce(resetFlyoutStub);
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.WORKSPACE);
    });
  });

  suite('Test simple flyout listener', function() {
    setup(function() {
      Blockly.defineBlocksWithJsonArray([{
        'type': 'basic_block',
        'message0': '%1',
        'args0': [
          {
            'type': 'field_colour',
            'name': 'COLOURFIELD',
            'colour': '#ff4040',
          },
        ],
      }]);
      this.workspace = createNavigationWorkspace(this.navigation, true);
      this.flyoutChangeListener = this.navigation.flyoutChangeWrapper;
      this.basicBlockA = this.workspace.newBlock('basic_block');

      this.navigation.focusToolbox(this.workspace);
      this.workspace.getFlyout().autoClose = false;
    });

    teardown(function() {
      delete Blockly.Blocks['basic_block'];
      this.navigation.removeWorkspace(this.workspace);
      this.workspace.dispose();
      sinon.restore();
    });
    test('Handle block click in flyout - click event', function() {
      const flyout = this.workspace.getFlyout();
      const flyoutWorkspace = flyout.getWorkspace();
      const firstFlyoutBlock = flyoutWorkspace.getTopBlocks()[0];
      const e = {
        type: Blockly.Events.CLICK,
        workspaceId: flyoutWorkspace.id,
        targetType: 'block',
        blockId: firstFlyoutBlock.id,
      };
      const flyoutCursor = flyoutWorkspace.getCursor();
      this.navigation.focusWorkspace(this.workspace);

      this.flyoutChangeListener(e);

      chai.assert.equal(
          flyoutCursor.getCurNode().getType(), Blockly.ASTNode.types.STACK);
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.FLYOUT);
    });
    test('Handle block click in flyout - select event', function() {
      const flyout = this.workspace.getFlyout();
      const flyoutWorkspace = flyout.getWorkspace();
      const firstFlyoutBlock = flyoutWorkspace.getTopBlocks()[0];
      const e = {
        type: Blockly.Events.SELECTED,
        workspaceId: flyoutWorkspace.id,
        newElementId: firstFlyoutBlock.id,
      };
      const flyoutCursor = flyoutWorkspace.getCursor();
      this.navigation.focusWorkspace(this.workspace);

      this.flyoutChangeListener(e);

      chai.assert.equal(
          flyoutCursor.getCurNode().getType(), Blockly.ASTNode.types.STACK);
      chai.assert.equal(
          this.navigation.getState(this.workspace), Constants.STATE.FLYOUT);
    });
  });

  suite('Test clean up methods', function() {
    setup(function() {
      this.workspace = createNavigationWorkspace(this.navigation, true);
    });
    test('All listeners and markers removed', function() {
      const numListeners = this.workspace.listeners.length;
      const markerName = this.navigation.MARKER_NAME;
      this.navigation.removeWorkspace(this.workspace);
      chai.assert.equal(this.workspace.listeners.length, numListeners - 1);

      const marker = this.workspace.getMarkerManager().getMarker(markerName);
      chai.assert.isNull(marker);
    });
    test('Keyboard accessibility mode can not be enabled', function() {
      this.navigation.removeWorkspace(this.workspace);
      this.navigation.enableKeyboardAccessibility(this.workspace);
      chai.assert.isFalse(this.workspace.keyboardAccessibilityMode);
    });
    test('Dispose', function() {
      const numListeners = this.workspace.listeners.length;
      const flyout = this.workspace.getFlyout();
      const numFlyoutListeners = flyout.getWorkspace().listeners.length;
      this.navigation.dispose();
      chai.assert.equal(this.workspace.listeners.length, numListeners - 1);
      chai.assert.equal(
          flyout.getWorkspace().listeners.length, numFlyoutListeners - 1);
    });
  });
});
