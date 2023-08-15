/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const chai = require('chai');
const Blockly = require('blockly/node');
const {Navigation} = require('../src/navigation');
const assert = chai.assert;
const {testHelpers} = require('@blockly/dev-tools');
const {captureWarnings} = testHelpers;

suite('Insert/Modify', function() {
  /**
   * Check that modify failed.
   * @param {Navigation} navigation The class under test.
   * @param {Blockly.WorkspaceSvg} workspace The main workspace.
   * @param {!Blockly.ASTNode} markerNode The node to try to connect to.
   * @param {!Blockly.ASTNode} cursorNode The node to connect to the markerNode.
   */
  function assertModifyFails(navigation, workspace, markerNode, cursorNode) {
    let modifyResult;
    const warnings = captureWarnings(function() {
      modifyResult = navigation.tryToConnectMarkerAndCursor(
          workspace, markerNode, cursorNode);
    });
    assert.isFalse(modifyResult);
    assert.equal(
        warnings.length, 1, 'Expecting 1 warnings for why modify failed.');
  }

  /**
   * Define default blocks.
   */
  function defineTestBlocks() {
    Blockly.defineBlocksWithJsonArray([
      {
        'type': 'stack_block',
        'message0': '',
        'previousStatement': null,
        'nextStatement': null,
      },
      {
        'type': 'row_block',
        'message0': '%1',
        'args0': [
          {
            'type': 'input_value',
            'name': 'INPUT',
          },
        ],
        'output': null,
      },
      {
        'type': 'statement_block',
        'message0': '%1',
        'args0': [
          {
            'type': 'input_statement',
            'name': 'NAME',
          },
        ],
        'previousStatement': null,
        'nextStatement': null,
        'colour': 230,
        'tooltip': '',
        'helpUrl': '',
      },
    ]);
  }

  setup(function() {
    this.jsdomCleanup =
        require('jsdom-global')('<!DOCTYPE html><div id="blocklyDiv"></div>');
    // We are running these tests in node even thought they require a rendered
    // workspace, which doesn't exactly work. The rendering system expects
    // cancelAnimationFrame to be defined so we need to define it.
    window.cancelAnimationFrame = function() {};

    // NOTE: block positions chosen such that they aren't unintentionally
    // bumped out of bounds during tests.
    const xmlText = `<xml xmlns="https://developers.google.com/blockly/xml">
        <block type="stack_block" id="stack_block_1" x="22" y="38"></block>
        <block type="stack_block" id="stack_block_2" x="22" y="113"></block>
        <block type="row_block" id="row_block_1" x="23" y="213"></block>
        <block type="row_block" id="row_block_2" x="22" y="288"></block>
        <block type="statement_block" id="statement_block_1" x="22" y="288">
        </block>
        <block type="statement_block" id="statement_block_2" x="22" y="288">
        </block>
        </xml>`;

    defineTestBlocks();


    this.workspace = Blockly.inject('blocklyDiv', {
      toolbox: `
    <xml xmlns="https://developers.google.com/blockly/xml"
      id="toolbox-connections" style="display: none">
      <block type="stack_block"></block>
      <block type="row_block"></block>
    </xml>`,
    });
    Blockly.Xml.domToWorkspace(
        Blockly.utils.xml.textToDom(xmlText), this.workspace);
    this.navigation = new Navigation();
    this.navigation.addWorkspace(this.workspace);


    this.stack_block_1 = this.workspace.getBlockById('stack_block_1');
    this.stack_block_2 = this.workspace.getBlockById('stack_block_2');
    this.row_block_1 = this.workspace.getBlockById('row_block_1');
    this.row_block_2 = this.workspace.getBlockById('row_block_2');
    this.statement_block_1 = this.workspace.getBlockById('statement_block_1');
    this.statement_block_2 = this.workspace.getBlockById('statement_block_2');
    this.navigation.enableKeyboardAccessibility(this.workspace);
  });

  teardown(function() {
    delete Blockly.Blocks['stack_block'];
    delete Blockly.Blocks['row_block'];
    delete Blockly.Blocks['statement_block'];
    window.cancelAnimationFrame = undefined;
    this.jsdomCleanup();
  });

  suite('Marked Connection', function() {
    suite('Marker on next', function() {
      setup(function() {
        this.markerNode = Blockly.ASTNode.createConnectionNode(
            this.stack_block_1.nextConnection);
      });
      test('Cursor on workspace', function() {
        const cursorNode = Blockly.ASTNode.createWorkspaceNode(
            this.workspace, new Blockly.utils.Coordinate(0, 0));
        assertModifyFails(
            this.navigation, this.workspace, this.markerNode, cursorNode);
      });
      test('Cursor on compatible connection', function() {
        const cursorNode = Blockly.ASTNode.createConnectionNode(
            this.stack_block_2.previousConnection);
        assert.isTrue(this.navigation.tryToConnectMarkerAndCursor(
            this.workspace, this.markerNode, cursorNode));
        assert.equal(this.stack_block_1.getNextBlock().id, 'stack_block_2');
      });
      test('Cursor on incompatible connection', function() {
        // Connect method will try to find a way to connect blocks with
        // incompatible types.
        const cursorNode = Blockly.ASTNode.createConnectionNode(
            this.stack_block_2.nextConnection);
        assert.isTrue(this.navigation.tryToConnectMarkerAndCursor(
            this.workspace, this.markerNode, cursorNode));
        assert.equal(this.stack_block_1.getNextBlock(), this.stack_block_2);
      });
      test('Cursor on really incompatible connection', function() {
        const cursorNode = Blockly.ASTNode.createConnectionNode(
            this.row_block_1.outputConnection);
        assertModifyFails(
            this.navigation, this.workspace, this.markerNode, cursorNode);
        assert.isNull(this.stack_block_1.getNextBlock());
      });
      test('Cursor on block', function() {
        const cursorNode = Blockly.ASTNode.createBlockNode(this.stack_block_2);
        assert.isTrue(this.navigation.tryToConnectMarkerAndCursor(
            this.workspace, this.markerNode, cursorNode));
        assert.equal(this.stack_block_1.getNextBlock().id, 'stack_block_2');
      });
    });

    suite('Marker on previous', function() {
      setup(function() {
        this.markerNode = Blockly.ASTNode.createConnectionNode(
            this.stack_block_1.previousConnection);
      });
      test('Cursor on compatible connection', function() {
        const cursorNode = Blockly.ASTNode.createConnectionNode(
            this.stack_block_2.nextConnection);
        assert.isTrue(this.navigation.tryToConnectMarkerAndCursor(
            this.workspace, this.markerNode, cursorNode));
        assert.equal(this.stack_block_1.getPreviousBlock().id, 'stack_block_2');
      });
      test('Cursor on incompatible connection', function() {
        const cursorNode = Blockly.ASTNode.createConnectionNode(
            this.stack_block_2.previousConnection);
        assertModifyFails(
            this.navigation, this.workspace, this.markerNode, cursorNode);
        assert.isNull(this.stack_block_1.getPreviousBlock());
      });
      test('Cursor on really incompatible connection', function() {
        const cursorNode = Blockly.ASTNode.createConnectionNode(
            this.row_block_1.outputConnection);
        assertModifyFails(
            this.navigation, this.workspace, this.markerNode, cursorNode);
        assert.isNull(this.stack_block_1.getNextBlock());
      });
      test('Cursor on block', function() {
        const cursorNode = Blockly.ASTNode.createBlockNode(this.stack_block_2);
        assert.isTrue(this.navigation.tryToConnectMarkerAndCursor(
            this.workspace, this.markerNode, cursorNode));
        assert.equal(this.stack_block_1.getPreviousBlock().id, 'stack_block_2');
      });
      test('Cursor on incompatible block', function() {
        const cursorNode = Blockly.ASTNode.createBlockNode(this.row_block_1);
        assertModifyFails(
            this.navigation, this.workspace, this.markerNode, cursorNode);
        assert.isNull(this.stack_block_1.getPreviousBlock());
      });
    });

    suite('Marker on value input', function() {
      setup(function() {
        this.markerNode = Blockly.ASTNode.createConnectionNode(
            this.row_block_1.inputList[0].connection);
      });
      test('Cursor on compatible connection', function() {
        const cursorNode = Blockly.ASTNode.createConnectionNode(
            this.row_block_2.outputConnection);
        assert.isTrue(this.navigation.tryToConnectMarkerAndCursor(
            this.workspace, this.markerNode, cursorNode));
        assert.equal(this.row_block_2.getParent().id, 'row_block_1');
      });
      test('Cursor on incompatible connection', function() {
        // Connect method will try to find a way to connect blocks with
        // incompatible types.
        const cursorNode = Blockly.ASTNode.createConnectionNode(
            this.row_block_2.inputList[0].connection);
        assert.isTrue(this.navigation.tryToConnectMarkerAndCursor(
            this.workspace, this.markerNode, cursorNode));
        assert.equal(
            this.row_block_1.inputList[0].connection.targetBlock(),
            this.row_block_2);
      });
      test('Cursor on really incompatible connection', function() {
        const cursorNode = Blockly.ASTNode.createConnectionNode(
            this.stack_block_1.previousConnection);
        assertModifyFails(
            this.navigation, this.workspace, this.markerNode, cursorNode);
      });
      test('Cursor on block', function() {
        const cursorNode = Blockly.ASTNode.createBlockNode(this.row_block_2);
        assert.isTrue(this.navigation.tryToConnectMarkerAndCursor(
            this.workspace, this.markerNode, cursorNode));
        assert.equal(this.row_block_2.getParent().id, 'row_block_1');
      });
    });

    suite('Marked Statement input', function() {
      setup(function() {
        this.statement_block_1.inputList[0].connection.connect(
            this.stack_block_1.previousConnection);
        this.stack_block_1.nextConnection.connect(
            this.stack_block_2.previousConnection);
        this.markerNode = Blockly.ASTNode.createInputNode(
            this.statement_block_1.inputList[0]);
      });
      test('Cursor on block inside statement', function() {
        const cursorNode = Blockly.ASTNode.createConnectionNode(
            this.stack_block_2.previousConnection);
        assert.isTrue(this.navigation.tryToConnectMarkerAndCursor(
            this.workspace, this.markerNode, cursorNode));
        assert.equal(
            this.stack_block_2.previousConnection.targetBlock(),
            this.statement_block_1);
      });
      test('Cursor on stack', function() {
        const cursorNode =
            Blockly.ASTNode.createStackNode(this.statement_block_2);
        assert.isTrue(this.navigation.tryToConnectMarkerAndCursor(
            this.workspace, this.markerNode, cursorNode));
        assert.equal(
            this.statement_block_2.getParent().id, 'statement_block_1');
      });
      test('Cursor on incompatible type', function() {
        const cursorNode = Blockly.ASTNode.createConnectionNode(
            this.row_block_1.outputConnection);
        assertModifyFails(
            this.navigation, this.workspace, this.markerNode, cursorNode);
        assert.isNull(this.row_block_1.getParent());
      });
    });

    suite('Marker on output', function() {
      setup(function() {
        this.markerNode = Blockly.ASTNode.createConnectionNode(
            this.row_block_1.outputConnection);
      });
      test('Cursor on compatible connection', function() {
        const cursorNode = Blockly.ASTNode.createConnectionNode(
            this.row_block_2.inputList[0].connection);
        assert.isTrue(this.navigation.tryToConnectMarkerAndCursor(
            this.workspace, this.markerNode, cursorNode));
        assert.equal(this.row_block_1.getParent().id, 'row_block_2');
      });
      test('Cursor on incompatible connection', function() {
        const cursorNode = Blockly.ASTNode.createConnectionNode(
            this.row_block_2.outputConnection);
        assertModifyFails(
            this.navigation, this.workspace, this.markerNode, cursorNode);
      });
      test('Cursor on really incompatible connection', function() {
        const cursorNode = Blockly.ASTNode.createConnectionNode(
            this.stack_block_1.previousConnection);
        assertModifyFails(
            this.navigation, this.workspace, this.markerNode, cursorNode);
      });
      test('Cursor on block', function() {
        const cursorNode = Blockly.ASTNode.createBlockNode(this.row_block_2);
        assert.isTrue(this.navigation.tryToConnectMarkerAndCursor(
            this.workspace, this.markerNode, cursorNode));
        assert.equal(this.row_block_1.getParent().id, 'row_block_2');
      });
    });
  });


  suite('Marked Workspace', function() {
    setup(function() {
      this.markerNode = Blockly.ASTNode.createWorkspaceNode(
          this.workspace, new Blockly.utils.Coordinate(100, 200));
    });
    test('Cursor on row block', function() {
      const cursorNode = Blockly.ASTNode.createBlockNode(this.row_block_1);
      assert.isTrue(this.navigation.tryToConnectMarkerAndCursor(
          this.workspace, this.markerNode, cursorNode));
      const pos = this.row_block_1.getRelativeToSurfaceXY();
      assert.equal(pos.x, 100);
      assert.equal(pos.y, 200);
    });

    test('Cursor on output connection', function() {
      const cursorNode = Blockly.ASTNode.createConnectionNode(
          this.row_block_1.outputConnection);
      assert.isTrue(this.navigation.tryToConnectMarkerAndCursor(
          this.workspace, this.markerNode, cursorNode));
      const pos = this.row_block_1.getRelativeToSurfaceXY();
      assert.equal(pos.x, 100);
      assert.equal(pos.y, 200);
    });

    test('Cursor on previous connection', function() {
      const cursorNode = Blockly.ASTNode.createConnectionNode(
          this.stack_block_1.previousConnection);
      assert.isTrue(this.navigation.tryToConnectMarkerAndCursor(
          this.workspace, this.markerNode, cursorNode));
      const pos = this.stack_block_1.getRelativeToSurfaceXY();
      assert.equal(pos.x, 100);
      assert.equal(pos.y, 200);
    });

    test('Cursor on input connection', function() {
      // Move the source block to the marked location on the workspace.
      const cursorNode = Blockly.ASTNode.createConnectionNode(
          this.row_block_1.inputList[0].connection);
      assert.isTrue(this.navigation.tryToConnectMarkerAndCursor(
          this.workspace, this.markerNode, cursorNode));
    });

    test('Cursor on next connection', function() {
      // Move the source block to the marked location on the workspace.
      const cursorNode = Blockly.ASTNode.createConnectionNode(
          this.stack_block_1.nextConnection);
      assert.isTrue(this.navigation.tryToConnectMarkerAndCursor(
          this.workspace, this.markerNode, cursorNode));
    });

    test('Cursor on child block (row)', function() {
      this.row_block_1.inputList[0].connection.connect(
          this.row_block_2.outputConnection);

      const cursorNode = Blockly.ASTNode.createBlockNode(this.row_block_2);
      assert.isTrue(this.navigation.tryToConnectMarkerAndCursor(
          this.workspace, this.markerNode, cursorNode));
      assert.isNull(this.row_block_2.getParent());
      const pos = this.row_block_2.getRelativeToSurfaceXY();
      assert.equal(pos.x, 100);
      assert.equal(pos.y, 200);
    });

    test('Cursor on child block (stack)', function() {
      this.stack_block_1.nextConnection.connect(
          this.stack_block_2.previousConnection);

      const cursorNode = Blockly.ASTNode.createBlockNode(this.stack_block_2);
      assert.isTrue(this.navigation.tryToConnectMarkerAndCursor(
          this.workspace, this.markerNode, cursorNode));
      assert.isNull(this.stack_block_2.getParent());
      const pos = this.stack_block_2.getRelativeToSurfaceXY();
      assert.equal(pos.x, 100);
      assert.equal(pos.y, 200);
    });

    test('Cursor on workspace', function() {
      const cursorNode = Blockly.ASTNode.createWorkspaceNode(
          this.workspace, new Blockly.utils.Coordinate(100, 100));
      assertModifyFails(
          this.navigation, this.workspace, this.markerNode, cursorNode);
    });
  });

  suite('Marked Block', function() {
    suite('Marked any block', function() {
      // These tests are using a stack block, but do not depend on the type of
      // the block.
      setup(function() {
        this.markerNode = Blockly.ASTNode.createBlockNode(this.stack_block_1);
      });
      test('Cursor on workspace', function() {
        const cursorNode = Blockly.ASTNode.createWorkspaceNode(
            this.workspace, new Blockly.utils.Coordinate(100, 100));
        assertModifyFails(
            this.navigation, this.workspace, this.markerNode, cursorNode);
      });
    });
    suite('Marked stack block', function() {
      setup(function() {
        this.markerNode = Blockly.ASTNode.createBlockNode(this.stack_block_1);
      });
      test('Cursor on row block', function() {
        const cursorNode = Blockly.ASTNode.createBlockNode(this.row_block_1);
        assertModifyFails(
            this.navigation, this.workspace, this.markerNode, cursorNode);
      });
      test('Cursor on stack block', function() {
        const cursorNode = Blockly.ASTNode.createBlockNode(this.stack_block_1);
        assertModifyFails(
            this.navigation, this.workspace, this.markerNode, cursorNode);
      });
      test('Cursor on next connection', function() {
        const cursorNode = Blockly.ASTNode.createConnectionNode(
            this.stack_block_2.nextConnection);
        assertModifyFails(
            this.navigation, this.workspace, this.markerNode, cursorNode);
      });
      test('Cursor on previous connection', function() {
        const cursorNode = Blockly.ASTNode.createConnectionNode(
            this.stack_block_2.previousConnection);
        assertModifyFails(
            this.navigation, this.workspace, this.markerNode, cursorNode);
      });
    });
    suite('Marked row block', function() {
      setup(function() {
        this.markerNode = Blockly.ASTNode.createBlockNode(this.row_block_1);
      });
      test('Cursor on stack block', function() {
        const cursorNode = Blockly.ASTNode.createBlockNode(this.stack_block_1);
        assertModifyFails(
            this.navigation, this.workspace, this.markerNode, cursorNode);
      });
      test('Cursor on row block', function() {
        const cursorNode = Blockly.ASTNode.createBlockNode(this.row_block_1);
        assertModifyFails(
            this.navigation, this.workspace, this.markerNode, cursorNode);
      });
      test('Cursor on value input connection', function() {
        const cursorNode = Blockly.ASTNode.createConnectionNode(
            this.row_block_2.inputList[0].connection);
        assertModifyFails(
            this.navigation, this.workspace, this.markerNode, cursorNode);
      });
      test('Cursor on output connection', function() {
        const cursorNode = Blockly.ASTNode.createConnectionNode(
            this.row_block_2.outputConnection);
        assertModifyFails(
            this.navigation, this.workspace, this.markerNode, cursorNode);
      });
    });
  });
});
