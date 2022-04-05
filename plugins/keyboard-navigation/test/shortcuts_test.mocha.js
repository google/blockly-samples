/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const sinon = require('sinon');

const Blockly = require('blockly/node');

const {NavigationController} = require('../src/index');
const {createNavigationWorkspace, createKeyDownEvent} =
    require('./test_helper');

suite('Shortcut Tests', function() {
  /**
   * Creates a test for not running keyDown events when the workspace is in read
   * only mode.
   * @param {string} testCaseName The name of the test case.
   * @param {Object} keyEvent Mocked key down event. Use createKeyDownEvent.
   */
  function runReadOnlyTest(testCaseName, keyEvent) {
    test(testCaseName, function() {
      this.workspace.options.readOnly = true;
      const hideChaffSpy = sinon.spy(this.workspace, 'hideChaff');
      Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, keyEvent);
      sinon.assert.notCalled(hideChaffSpy);
    });
  }

  /**
   * Creates a test for not runnin a shortcut when a gesture is in progress.
   * @param {string} testCaseName The name of the test case.
   * @param {Object} keyEvent Mocked key down event. Use createKeyDownEvent.
   */
  function testGestureInProgress(testCaseName, keyEvent) {
    test(testCaseName, function() {
      sinon.stub(Blockly.Gesture, 'inProgress').returns(true);
      Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, keyEvent);
      const hideChaffSpy = sinon.spy(this.workspace, 'hideChaff');
      const copySpy = sinon.spy(Blockly.clipboard, 'copy');
      sinon.assert.notCalled(copySpy);
      sinon.assert.notCalled(hideChaffSpy);
    });
  }

  /**
   * Creates a test for not running a shortcut when a the cursor is not on a
   * block.
   * @param {string} testCaseName The name of the test case.
   * @param {Object} keyEvent Mocked key down event. Use createKeyDownEvent.
   */
  function testCursorOnShadowBlock(testCaseName, keyEvent) {
    test(testCaseName, function() {
      const hideChaffSpy = sinon.spy(this.workspace, 'hideChaff');
      const copySpy = sinon.spy(Blockly.clipboard, 'copy');
      Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, keyEvent);
      sinon.assert.notCalled(copySpy);
      sinon.assert.notCalled(hideChaffSpy);
    });
  }

  /**
   * Creates a test for not running a shortcut when the block is not deletable.
   * @param {string} testCaseName The name of the test case.
   * @param {Object} keyEvent Mocked key down event. Use createKeyDownEvent.
   */
  function testBlockIsNotDeletable(testCaseName, keyEvent) {
    test(testCaseName, function() {
      sinon.stub(this.basicBlock, 'isDeletable').returns(false);
      Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, keyEvent);
      const hideChaffSpy = sinon.spy(this.workspace, 'hideChaff');
      const copySpy = sinon.spy(Blockly.clipboard, 'copy');
      sinon.assert.notCalled(copySpy);
      sinon.assert.notCalled(hideChaffSpy);
    });
  }

  /**
   * Creates a test for not running a shortcut when the cursor is not on a
   * block.
   * @param {string} testCaseName The name of the test case.
   * @param {Object} keyEvent Mocked key down event. Use createKeyDownEvent.
   */
  function testCursorIsNotOnBlock(testCaseName, keyEvent) {
    test(testCaseName, function() {
      const hideChaffSpy = sinon.spy(this.workspace, 'hideChaff');
      const copySpy = sinon.spy(Blockly.clipboard, 'copy');
      Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, keyEvent);
      sinon.assert.notCalled(copySpy);
      sinon.assert.notCalled(hideChaffSpy);
    });
  }

  setup(function() {
    this.jsdomCleanup =
        require('jsdom-global')('<!DOCTYPE html><div id="blocklyDiv"></div>');
    Blockly.utils.dom.getFastTextWidthWithSizeString = function() {
      return 10;
    };
    Blockly.defineBlocksWithJsonArray([{
      'type': 'basic_block',
      'message0': '',
      'previousStatement': null,
      'nextStatement': null,
    }]);
    this.controller = new NavigationController();
    this.controller.init();
    this.navigation = this.controller.navigation;
    this.workspace = createNavigationWorkspace(this.navigation, true);
    this.controller.addWorkspace(this.workspace);
    this.basicBlock = this.workspace.newBlock('basic_block');
  });

  teardown(function() {
    this.jsdomCleanup();
    this.controller.dispose();
    delete Blockly.Blocks['basic_block'];
    this.workspace.dispose();
  });

  suite('Copy', function() {
    teardown(function() {
      sinon.restore();
    });
    const testCases = [
      [
        'Control C',
        createKeyDownEvent(
            Blockly.utils.KeyCodes.C, 'NotAField',
            [Blockly.utils.KeyCodes.CTRL]),
      ],
      [
        'Meta C',
        createKeyDownEvent(
            Blockly.utils.KeyCodes.C, 'NotAField',
            [Blockly.utils.KeyCodes.META]),
      ],
      [
        'Alt C',
        createKeyDownEvent(
            Blockly.utils.KeyCodes.C, 'NotAField',
            [Blockly.utils.KeyCodes.ALT]),
      ],
    ];

    // Copy a block.
    suite('Simple', function() {
      setup(function() {
        const blockNode = Blockly.ASTNode.createBlockNode(this.basicBlock);
        this.workspace.getCursor().setCurNode(blockNode);
      });

      testCases.forEach(function(testCase) {
        const testCaseName = testCase[0];
        const keyEvent = testCase[1];
        test(testCaseName, function() {
          const hideChaffSpy = sinon.spy(this.workspace, 'hideChaff');
          const copySpy = sinon.spy(Blockly.clipboard, 'copy');
          Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, keyEvent);
          sinon.assert.calledOnce(copySpy);
          sinon.assert.calledOnce(hideChaffSpy);
        });
      });
    });

    // Do not copy the block if the cursor is on the workspace.
    suite('Cursor is not on a block', function() {
      setup(function() {
        const workspaceNode = Blockly.ASTNode.createWorkspaceNode(
            this.workspace, new Blockly.utils.Coordinate(100, 100));
        this.workspace.getCursor().setCurNode(workspaceNode);
      });
      testCases.forEach(function(testCase) {
        const testCaseName = testCase[0];
        const keyEvent = testCase[1];
        testCursorIsNotOnBlock(testCaseName, keyEvent);
      });
    });

    // Do not copy a block if the block is a shadow block
    suite('Cursor is on a shadow block', function() {
      setup(function() {
        this.basicBlock.setShadow(true);
        const blockNode = Blockly.ASTNode.createBlockNode(this.basicBlock);
        this.workspace.getCursor().setCurNode(blockNode);
      });
      testCases.forEach(function(testCase) {
        const testCaseName = testCase[0];
        const keyEvent = testCase[1];
        testCursorOnShadowBlock(testCaseName, keyEvent);
      });
    });

    // Do not copy a block if a workspace is in readonly mode.
    suite('Not called when readOnly is true', function() {
      testCases.forEach(function(testCase) {
        const testCaseName = testCase[0];
        const keyEvent = testCase[1];
        runReadOnlyTest(testCaseName, keyEvent);
      });
    });

    // Do not copy a block if a gesture is in progress.
    suite('Gesture in progress', function() {
      testCases.forEach(function(testCase) {
        const testCaseName = testCase[0];
        const keyEvent = testCase[1];
        testGestureInProgress(testCaseName, keyEvent);
      });
    });

    // Do not copy a block if is is not deletable.
    suite('Block is not deletable', function() {
      testCases.forEach(function(testCase) {
        const testCaseName = testCase[0];
        const keyEvent = testCase[1];
        testBlockIsNotDeletable(testCaseName, keyEvent);
      });
    });
  });

  suite('Delete Block', function() {
    setup(function() {
      const blockNode = Blockly.ASTNode.createBlockNode(this.basicBlock);
      this.workspace.getCursor().setCurNode(blockNode);
    });

    teardown(function() {
      sinon.restore();
    });

    const testCases = [
      [
        'Delete',
        createKeyDownEvent(Blockly.utils.KeyCodes.DELETE, 'NotAField'),
      ],
      [
        'Backspace',
        createKeyDownEvent(Blockly.utils.KeyCodes.BACKSPACE, 'NotAField'),
      ],
    ];
    // Delete a block.
    suite('Simple', function() {
      testCases.forEach(function(testCase) {
        const testCaseName = testCase[0];
        const keyEvent = testCase[1];
        test(testCaseName, function() {
          const deleteSpy = sinon.spy(this.basicBlock, 'checkAndDelete');
          const moveCursorSpy =
              sinon.spy(this.navigation, 'moveCursorOnBlockDelete');
          Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, keyEvent);
          sinon.assert.calledOnce(moveCursorSpy);
          sinon.assert.calledOnce(deleteSpy);
        });
      });
    });
    // Do not delete a block if workspace is in readOnly mode.
    suite('Not called when readOnly is true', function() {
      testCases.forEach(function(testCase) {
        const testCaseName = testCase[0];
        const keyEvent = testCase[1];
        runReadOnlyTest(testCaseName, keyEvent);
      });
    });
  });

  suite('Cut', function() {
    const testCases = [
      [
        'Control X',
        createKeyDownEvent(
            Blockly.utils.KeyCodes.X, 'NotAField',
            [Blockly.utils.KeyCodes.CTRL]),
      ],
      [
        'Meta X',
        createKeyDownEvent(
            Blockly.utils.KeyCodes.X, 'NotAField',
            [Blockly.utils.KeyCodes.META]),
      ],
      [
        'Alt X',
        createKeyDownEvent(
            Blockly.utils.KeyCodes.X, 'NotAField',
            [Blockly.utils.KeyCodes.ALT]),
      ],
    ];

    teardown(function() {
      sinon.restore();
    });

    // Cut block.
    suite('Cursor is not on a block', function() {
      setup(function() {
        const blockNode = Blockly.ASTNode.createBlockNode(this.basicBlock);
        this.workspace.getCursor().setCurNode(blockNode);
      });
      testCases.forEach(function(testCase) {
        const testCaseName = testCase[0];
        const keyEvent = testCase[1];
        test(testCaseName, function() {
          const deleteSpy = sinon.spy(this.basicBlock, 'checkAndDelete');
          const copySpy = sinon.spy(Blockly.clipboard, 'copy');
          const moveCursorSpy =
              sinon.spy(this.navigation, 'moveCursorOnBlockDelete');
          Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, keyEvent);
          sinon.assert.calledOnce(copySpy);
          sinon.assert.calledOnce(deleteSpy);
          sinon.assert.calledOnce(moveCursorSpy);
        });
      });
    });

    // Do not copy the block if the cursor is on the workspace.
    suite('Cursor is not on a block', function() {
      setup(function() {
        const workspaceNode = Blockly.ASTNode.createWorkspaceNode(
            this.workspace, new Blockly.utils.Coordinate(100, 100));
        this.workspace.getCursor().setCurNode(workspaceNode);
      });
      testCases.forEach(function(testCase) {
        const testCaseName = testCase[0];
        const keyEvent = testCase[1];
        testCursorIsNotOnBlock(testCaseName, keyEvent);
      });
    });

    // Do not copy a block if the block is a shadow block
    suite('Cursor is on a shadow block', function() {
      setup(function() {
        this.basicBlock.setShadow(true);
        const blockNode = Blockly.ASTNode.createBlockNode(this.basicBlock);
        this.workspace.getCursor().setCurNode(blockNode);
      });
      testCases.forEach(function(testCase) {
        const testCaseName = testCase[0];
        const keyEvent = testCase[1];
        testCursorOnShadowBlock(testCaseName, keyEvent);
      });
    });

    // Do not copy a block if a workspace is in readonly mode.
    suite('Not called when readOnly is true', function() {
      testCases.forEach(function(testCase) {
        const testCaseName = testCase[0];
        const keyEvent = testCase[1];
        runReadOnlyTest(testCaseName, keyEvent);
      });
    });

    // Do not copy a block if a gesture is in progress.
    suite('Gesture in progress', function() {
      testCases.forEach(function(testCase) {
        const testCaseName = testCase[0];
        const keyEvent = testCase[1];
        testGestureInProgress(testCaseName, keyEvent);
      });
    });

    // Do not copy a block if is is not deletable.
    suite('Block is not deletable', function() {
      testCases.forEach(function(testCase) {
        const testCaseName = testCase[0];
        const keyEvent = testCase[1];
        testBlockIsNotDeletable(testCaseName, keyEvent);
      });
    });
  });

  suite('Paste', function() {
    const testCases = [
      [
        'Control X',
        createKeyDownEvent(
            Blockly.utils.KeyCodes.V, 'NotAField',
            [Blockly.utils.KeyCodes.CTRL]),
      ],
      [
        'Meta X',
        createKeyDownEvent(
            Blockly.utils.KeyCodes.V, 'NotAField',
            [Blockly.utils.KeyCodes.META]),
      ],
      [
        'Alt X',
        createKeyDownEvent(
            Blockly.utils.KeyCodes.V, 'NotAField',
            [Blockly.utils.KeyCodes.ALT]),
      ],
    ];

    teardown(function() {
      sinon.restore();
    });

    // Paste block.
    suite('Simple', function() {
      setup(function() {
        const blockNode = Blockly.ASTNode.createBlockNode(this.basicBlock);
        this.workspace.getCursor().setCurNode(blockNode);
      });
      testCases.forEach(function(testCase) {
        const testCaseName = testCase[0];
        const keyEvent = testCase[1];
        test(testCaseName, function() {
          const pasteSpy = sinon.stub(this.navigation, 'paste');
          Blockly.ShortcutRegistry.registry.onKeyDown(this.workspace, keyEvent);
          sinon.assert.calledOnce(pasteSpy);
        });
      });
    });
  });
});
