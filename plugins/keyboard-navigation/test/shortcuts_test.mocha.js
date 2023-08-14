/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const sinon = require('sinon');
const chai = require('chai');

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
    window.cancelAnimationFrame = function() {};
  });

  teardown(function() {
    this.jsdomCleanup();
    this.controller.dispose();
    delete Blockly.Blocks['basic_block'];
    this.workspace.dispose();
  });

  suite('Deleting blocks', function() {
    setup(function() {
      const blockNode = Blockly.ASTNode.createBlockNode(this.basicBlock);
      this.workspace.getCursor().setCurNode(blockNode);
    });

    teardown(function() {
      sinon.restore();
    });

    const testCases = [
      {
        name: 'Delete',
        deleteEvent:
            createKeyDownEvent(Blockly.utils.KeyCodes.DELETE, 'NotAField'),
      },
      {
        name: 'Backspace',
        deleteEvent:
            createKeyDownEvent(Blockly.utils.KeyCodes.BACKSPACE, 'NotAField'),
      },
    ];

    suite('delete keybinds trigger deletion', function() {
      testCases.forEach(function(testCase) {
        test(testCase.name, function() {
          Blockly.ShortcutRegistry.registry.onKeyDown(
              this.workspace, testCase.deleteEvent);
          chai.assert.equal(
              this.workspace.getTopBlocks().length,
              0,
              'Expected the block to be deleted.');
        });
      });
    });

    suite(
        'delete keybinds do not trigger deletion if workspace is readonly',
        function() {
          testCases.forEach(function(testCase) {
            test(testCase.name, function() {
              this.workspace.options.readOnly = true;
              Blockly.ShortcutRegistry.registry.onKeyDown(
                  this.workspace, testCase.deleteEvent);
              chai.assert.equal(
                  this.workspace.getTopBlocks().length,
                  1,
                  'Expected the block to not be deleted.');
            });
          });
        });
  });

  suite('Copy and paste', function() {
    teardown(function() {
      sinon.restore();
    });
    const testCases = [
      {
        name: 'Control',
        copyEvent: createKeyDownEvent(
            Blockly.utils.KeyCodes.C, 'NotAField',
            [Blockly.utils.KeyCodes.CTRL]),
        pasteEvent: createKeyDownEvent(
            Blockly.utils.KeyCodes.V, 'NotAField',
            [Blockly.utils.KeyCodes.CTRL]),
      },
      {
        name: 'Meta',
        copyEvent: createKeyDownEvent(
            Blockly.utils.KeyCodes.C, 'NotAField',
            [Blockly.utils.KeyCodes.META]),
        pasteEvent: createKeyDownEvent(
            Blockly.utils.KeyCodes.V, 'NotAField',
            [Blockly.utils.KeyCodes.META]),
      },
      {
        name: 'Alt',
        copyEvent: createKeyDownEvent(
            Blockly.utils.KeyCodes.C, 'NotAField',
            [Blockly.utils.KeyCodes.ALT]),
        pasteEvent: createKeyDownEvent(
            Blockly.utils.KeyCodes.V, 'NotAField',
            [Blockly.utils.KeyCodes.ALT]),
      },
    ];

    suite('copy and paste keybinds duplicate blocks', function() {
      setup(function() {
        const blockNode = Blockly.ASTNode.createBlockNode(this.basicBlock);
        this.workspace.getCursor().setCurNode(blockNode);
      });

      testCases.forEach(function(testCase) {
        test(testCase.name, function() {
          Blockly.ShortcutRegistry.registry.onKeyDown(
              this.workspace, testCase.copyEvent);
          Blockly.ShortcutRegistry.registry.onKeyDown(
              this.workspace, testCase.pasteEvent);
          chai.assert.equal(
              this.workspace.getTopBlocks().length,
              2,
              'Expected the block to be duplicated.');
        });
      });
    });

    suite(
        'copy and paste does nothing if the cursor is not on a block',
        function() {
          setup(function() {
            const workspaceNode = Blockly.ASTNode.createWorkspaceNode(
                this.workspace, new Blockly.utils.Coordinate(100, 100));
            this.workspace.getCursor().setCurNode(workspaceNode);
          });
          testCases.forEach(function(testCase) {
            test(testCase.name, function() {
              Blockly.ShortcutRegistry.registry.onKeyDown(
                  this.workspace, testCase.copyEvent);
              Blockly.ShortcutRegistry.registry.onKeyDown(
                  this.workspace, testCase.pasteEvent);
              chai.assert.equal(
                  this.workspace.getTopBlocks().length,
                  1,
                  'Expected the block to not be duplicated.');
            });
          });
        });

    suite(
        'copy and paste do nothing if the cursor is on a shadow block',
        function() {
          setup(function() {
            this.basicBlock.setShadow(true);
            const blockNode = Blockly.ASTNode.createBlockNode(this.basicBlock);
            this.workspace.getCursor().setCurNode(blockNode);
          });
          testCases.forEach(function(testCase) {
            test(testCase.name, function() {
              Blockly.ShortcutRegistry.registry.onKeyDown(
                  this.workspace, testCase.copyEvent);
              Blockly.ShortcutRegistry.registry.onKeyDown(
                  this.workspace, testCase.pasteEvent);
              chai.assert.equal(
                  this.workspace.getTopBlocks().length,
                  1,
                  'Expected the block to not be duplicated.');
            });
          });
        });

    suite('copy and paste do nothing if the workspace is readonly', function() {
      setup(function() {
        this.workspace.options.readonly = true;
      });
      testCases.forEach(function(testCase) {
        test(testCase.name, function() {
          Blockly.ShortcutRegistry.registry.onKeyDown(
              this.workspace, testCase.copyEvent);
          Blockly.ShortcutRegistry.registry.onKeyDown(
              this.workspace, testCase.pasteEvent);
          chai.assert.equal(
              this.workspace.getTopBlocks().length,
              1,
              'Expected the block to not be duplicated.');
        });
      });
    });

    suite('copy and paste do nothing if a gesture is in progress', function() {
      setup(function() {
        sinon.stub(Blockly.Gesture, 'inProgress').returns(true);
      });
      testCases.forEach(function(testCase) {
        test(testCase.name, function() {
          Blockly.ShortcutRegistry.registry.onKeyDown(
              this.workspace, testCase.copyEvent);
          Blockly.ShortcutRegistry.registry.onKeyDown(
              this.workspace, testCase.pasteEvent);
          chai.assert.equal(
              this.workspace.getTopBlocks().length,
              1,
              'Expected the block to not be duplicated.');
        });
      });
    });

    suite(
        'copy and paste do nothing if the block is not deletable',
        function() {
          setup(function() {
            this.basicBlock.setDeletable(false);
          });
          testCases.forEach(function(testCase) {
            test(testCase.name, function() {
              Blockly.ShortcutRegistry.registry.onKeyDown(
                  this.workspace, testCase.copyEvent);
              Blockly.ShortcutRegistry.registry.onKeyDown(
                  this.workspace, testCase.pasteEvent);
              chai.assert.equal(
                  this.workspace.getTopBlocks().length,
                  1,
                  'Expected the block to not be duplicated.');
            });
          });
        });
  });

  suite('Cut and paste', function() {
    teardown(function() {
      sinon.restore();
    });
    const testCases = [
      {
        name: 'Control',
        cutEvent: createKeyDownEvent(
            Blockly.utils.KeyCodes.X, 'NotAField',
            [Blockly.utils.KeyCodes.CTRL]),
        pasteEvent: createKeyDownEvent(
            Blockly.utils.KeyCodes.V, 'NotAField',
            [Blockly.utils.KeyCodes.CTRL]),
      },
      {
        name: 'Meta',
        cutEvent: createKeyDownEvent(
            Blockly.utils.KeyCodes.X, 'NotAField',
            [Blockly.utils.KeyCodes.META]),
        pasteEvent: createKeyDownEvent(
            Blockly.utils.KeyCodes.V, 'NotAField',
            [Blockly.utils.KeyCodes.META]),
      },
      {
        name: 'Alt',
        cutEvent: createKeyDownEvent(
            Blockly.utils.KeyCodes.X, 'NotAField',
            [Blockly.utils.KeyCodes.ALT]),
        pasteEvent: createKeyDownEvent(
            Blockly.utils.KeyCodes.V, 'NotAField',
            [Blockly.utils.KeyCodes.ALT]),
      },
    ];

    suite('cut and paste keybinds duplicate blocks', function() {
      setup(function() {
        const blockNode = Blockly.ASTNode.createBlockNode(this.basicBlock);
        this.workspace.getCursor().setCurNode(blockNode);
      });

      testCases.forEach(function(testCase) {
        test(testCase.name, function() {
          Blockly.ShortcutRegistry.registry.onKeyDown(
              this.workspace, testCase.cutEvent);
          chai.assert.equal(
              this.workspace.getTopBlocks().length,
              0,
              'Expected the block to be deleted.');
          Blockly.ShortcutRegistry.registry.onKeyDown(
              this.workspace, testCase.pasteEvent);
          chai.assert.equal(
              this.workspace.getTopBlocks().length,
              1,
              'Expected the block to be duplicated.');
        });
      });
    });

    suite(
        'cut and paste does nothing if the cursor is not on a block',
        function() {
          setup(function() {
            const workspaceNode = Blockly.ASTNode.createWorkspaceNode(
                this.workspace, new Blockly.utils.Coordinate(100, 100));
            this.workspace.getCursor().setCurNode(workspaceNode);
          });
          testCases.forEach(function(testCase) {
            test(testCase.name, function() {
              Blockly.ShortcutRegistry.registry.onKeyDown(
                  this.workspace, testCase.cutEvent);
              chai.assert.equal(
                  this.workspace.getTopBlocks().length,
                  1,
                  'Expected the block to not be deleted.');
              Blockly.ShortcutRegistry.registry.onKeyDown(
                  this.workspace, testCase.pasteEvent);
              chai.assert.equal(
                  this.workspace.getTopBlocks().length,
                  1,
                  'Expected the block to not be duplicated.');
            });
          });
        });

    suite(
        'cut and paste do nothing if the cursor is on a shadow block',
        function() {
          setup(function() {
            this.basicBlock.setShadow(true);
            const blockNode = Blockly.ASTNode.createBlockNode(this.basicBlock);
            this.workspace.getCursor().setCurNode(blockNode);
          });
          testCases.forEach(function(testCase) {
            test(testCase.name, function() {
              Blockly.ShortcutRegistry.registry.onKeyDown(
                  this.workspace, testCase.cutEvent);
              chai.assert.equal(
                  this.workspace.getTopBlocks().length,
                  1,
                  'Expected the block to not be deleted.');
              Blockly.ShortcutRegistry.registry.onKeyDown(
                  this.workspace, testCase.pasteEvent);
              chai.assert.equal(
                  this.workspace.getTopBlocks().length,
                  1,
                  'Expected the block to not be duplicated.');
            });
          });
        });

    suite('cut and paste do nothing if the workspace is readonly', function() {
      setup(function() {
        this.workspace.options.readonly = true;
      });
      testCases.forEach(function(testCase) {
        test(testCase.name, function() {
          Blockly.ShortcutRegistry.registry.onKeyDown(
              this.workspace, testCase.cutEvent);
          chai.assert.equal(
              this.workspace.getTopBlocks().length,
              1,
              'Expected the block to not be deleted.');
          Blockly.ShortcutRegistry.registry.onKeyDown(
              this.workspace, testCase.pasteEvent);
          chai.assert.equal(
              this.workspace.getTopBlocks().length,
              1,
              'Expected the block to not be duplicated.');
        });
      });
    });

    suite('cut and paste do nothing if a gesture is in progress', function() {
      setup(function() {
        sinon.stub(Blockly.Gesture, 'inProgress').returns(true);
      });
      testCases.forEach(function(testCase) {
        test(testCase.name, function() {
          Blockly.ShortcutRegistry.registry.onKeyDown(
              this.workspace, testCase.cutEvent);
          chai.assert.equal(
              this.workspace.getTopBlocks().length,
              1,
              'Expected the block to not be deleted.');
          Blockly.ShortcutRegistry.registry.onKeyDown(
              this.workspace, testCase.pasteEvent);
          chai.assert.equal(
              this.workspace.getTopBlocks().length,
              1,
              'Expected the block to not be duplicated.');
        });
      });
    });

    suite(
        'cut and paste do nothing if the block is not deletable',
        function() {
          setup(function() {
            this.basicBlock.setDeletable(false);
          });
          testCases.forEach(function(testCase) {
            test(testCase.name, function() {
              Blockly.ShortcutRegistry.registry.onKeyDown(
                  this.workspace, testCase.cutEvent);
              chai.assert.equal(
                  this.workspace.getTopBlocks().length,
                  1,
                  'Expected the block to not be deleted.');
              Blockly.ShortcutRegistry.registry.onKeyDown(
                  this.workspace, testCase.pasteEvent);
              chai.assert.equal(
                  this.workspace.getTopBlocks().length,
                  1,
                  'Expected the block to not be duplicated.');
            });
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
