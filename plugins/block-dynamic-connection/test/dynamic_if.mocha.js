/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const chai = require('chai');
const {testHelpers} = require('@blockly/dev-tools');
const Blockly = require('blockly/node');
const {overrideOldBlockDefinitions} = require('../src/index');

const assert = chai.assert;

suite('If block', function() {
  /**
   * Asserts that the if block has the expected inputs.
   * @param {!Blockly.Block} block The block to check.
   * @param {!Array<string>} expectedInputs The expected inputs.
   * @type {string=} The block type expected. Defaults to 'dynamic_if'.
   */
  function assertBlockStructure(block, expectedInputs, type = 'dynamic_if') {
    assert.equal(block.type, type);
    assert.equal(block.inputList.length, expectedInputs.length);
    assert.isTrue(expectedInputs.length >= 2);
    for (let i = 0; i < expectedInputs.length; i++) {
      assert.equal(block.inputList[i].name, expectedInputs[i]);
    }
  }

  /**
   * Creates a boolean block and connects it to the specified connection.
   * @param {!Blockly.Workspace} workspace The workspace.
   * @param {!Blockly.Connection} connection The connection to connect a new
   *    block to.
   */
  function connectBooleanBlockToConnection(workspace, connection) {
    const newBlock = workspace.newBlock('logic_boolean');
    const targetConnection = newBlock.outputConnection;
    connection.connect(targetConnection);
  }

  /**
   * Creates a boolean block and connects it to the specified connection.
   * @param {!Blockly.Workspace} workspace The workspace.
   * @param {!Blockly.Connection} connection The connection to connect a new
   *    block to.
   */
  function connectStatementBlockToConnection(workspace, connection) {
    const newBlock = workspace.newBlock('text_print');
    const targetConnection = newBlock.previousConnection;
    connection.connect(targetConnection);
  }

  setup(function() {
    this.workspace = new Blockly.Workspace();
    overrideOldBlockDefinitions();
  });

  teardown(function() {
    this.workspace.dispose();
  });

  test('Creation', function() {
    const block = this.workspace.newBlock('dynamic_if');
    assertBlockStructure(block, ['IF0', 'DO0']);
  });

  suite('onPendingConnection', function() {
    test('pending connection with empty connection', function() {
      const block = this.workspace.newBlock('dynamic_if');
      const connection = block.inputList[0].connection;
      block.onPendingConnection(connection);
      assertBlockStructure(block, ['IF0', 'DO0']);
    });

    test('pending connection with empty next connection', function() {
      const block = this.workspace.newBlock('dynamic_if');
      const connection = block.inputList[0].connection;
      connectBooleanBlockToConnection(
          this.workspace, block.inputList[0].connection);
      block.onPendingConnection(connection);
      assertBlockStructure(block, ['IF0', 'DO0', 'IF1', 'DO1']);
      connectStatementBlockToConnection(
          this.workspace, block.inputList[3].connection);
      block.finalizeConnections();

      block.onPendingConnection(connection);
      assertBlockStructure(block, ['IF0', 'DO0', 'IF1', 'DO1']);
    });

    test('pending connection adds connection', function() {
      const block = this.workspace.newBlock('dynamic_if');
      connectBooleanBlockToConnection(
          this.workspace, block.inputList[0].connection);
      block.onPendingConnection(block.inputList[0].connection);
      assertBlockStructure(block, ['IF0', 'DO0', 'IF1', 'DO1']);
    });
  });

  suite('finalizeConnections', function() {
    test('does not go below 2 connections', function() {
      const block = this.workspace.newBlock('dynamic_if');
      assertBlockStructure(block, ['IF0', 'DO0']);
      block.finalizeConnections();
      assertBlockStructure(block, ['IF0', 'DO0']);
    });

    test('removes empty connections', function() {
      const block = this.workspace.newBlock('dynamic_if');
      connectBooleanBlockToConnection(
          this.workspace, block.inputList[0].connection);
      connectStatementBlockToConnection(
          this.workspace, block.inputList[1].connection);
      block.onPendingConnection(block.inputList[0].connection);
      assertBlockStructure(block, ['IF0', 'DO0', 'IF1', 'DO1']);
      block.finalizeConnections();
      assertBlockStructure(block, ['IF0', 'DO0']);
    });

    test('updates the field if the first connection is removed', function() {
      const block = this.workspace.newBlock('dynamic_if');
      connectBooleanBlockToConnection(
          this.workspace, block.inputList[0].connection);
      block.onPendingConnection(block.inputList[0].connection);
      assertBlockStructure(block, ['IF0', 'DO0', 'IF1', 'DO1']);
      // Add Else If
      connectBooleanBlockToConnection(
          this.workspace, block.inputList[2].connection);
      block.finalizeConnections();
      assertBlockStructure(block, ['IF0', 'DO0', 'IF1', 'DO1']);

      // Remove If
      block.inputList[0].connection.disconnect();
      block.finalizeConnections();
      assertBlockStructure(block, ['IF1', 'DO1']);
      assert.equal(block.inputList[0].fieldRow[0].value_,
          Blockly.Msg.CONTROLS_IF_MSG_IF);
    });
  });

  const testCases = [
    {
      title: 'empty XML',
      xml: '<block type="dynamic_if"/>',
      expectedXml:
          '<block xmlns="https://developers.google.com/blockly/xml" ' +
          'type="dynamic_if" id="1">\n' +
          '  <mutation inputs="0" else="false" next="1"></mutation>\n</block>',
      assertBlockStructure: (block) => {
        assertBlockStructure(block, ['IF0', 'DO0']);
      },
    },
    {
      title: 'one if one else',
      xml:
          '<block xmlns="https://developers.google.com/blockly/xml"' +
          ' type="dynamic_if" id="1">\n' +
          '  <mutation inputs="0" else="true" next="1"></mutation>\n' +
          '  <value name="IF0">\n' +
          '    <block type="logic_boolean" id="2">\n' +
          '      <field name="BOOL">TRUE</field>\n' +
          '    </block>\n' +
          '  </value>\n' +
          '  <statement name="ELSE">\n' +
          '    <block type="text_print" id="3">\n' +
          '      <value name="TEXT">\n' +
          '        <shadow type="text" id="4">\n' +
          '          <field name="TEXT">abc</field>\n' +
          '        </shadow>\n' +
          '      </value>\n' +
          '    </block>\n' +
          '  </statement>\n' +
          '</block>',
      assertBlockStructure: (block) => {
        assertBlockStructure(block, ['IF0', 'DO0', 'ELSE']);
      },
    },
    {
      title: 'multiple inputs with children',
      xml:
          '<block xmlns="https://developers.google.com/blockly/xml"' +
          ' type="dynamic_if" id="1">\n' +
          '  <mutation inputs="0,1,2" else="true" next="3"></mutation>\n' +
          '  <value name="IF0">\n' +
          '    <block type="logic_boolean" id="2">\n' +
          '      <field name="BOOL">TRUE</field>\n' +
          '    </block>\n' +
          '  </value>\n' +
          '  <statement name="DO0">\n' +
          '    <block type="text_print" id="3">\n' +
          '      <value name="TEXT">\n' +
          '        <shadow type="text" id="4">\n' +
          '          <field name="TEXT">abc</field>\n' +
          '        </shadow>\n' +
          '      </value>\n' +
          '    </block>\n' +
          '  </statement>\n' +
          '  <value name="IF1">\n' +
          '    <block type="logic_boolean" id="5">\n' +
          '      <field name="BOOL">TRUE</field>\n' +
          '    </block>\n' +
          '  </value>\n' +
          '  <statement name="DO2">\n' +
          '    <block type="text_print" id="6">\n' +
          '      <value name="TEXT">\n' +
          '        <shadow type="text" id="^7">\n' +
          '          <field name="TEXT">abc</field>\n' +
          '        </shadow>\n' +
          '      </value>\n' +
          '    </block>\n' +
          '  </statement>\n' +
          '  <statement name="ELSE">\n' +
          '    <block type="text_print" id="8">\n' +
          '      <value name="TEXT">\n' +
          '        <shadow type="text" id="9">\n' +
          '          <field name="TEXT">abc</field>\n' +
          '        </shadow>\n' +
          '      </value>\n' +
          '    </block>\n' +
          '  </statement>\n' +
          '</block>',
      assertBlockStructure: (block) => {
        assertBlockStructure(
            block, ['IF0', 'DO0', 'IF1', 'DO1', 'IF2', 'DO2', 'ELSE']);
      },
    },
    {
      title: 'standard/core XML is deserialized correctly',
      xml:
        '<block type="controls_if" id="1" x="38" y="63">' +
        '  <mutation elseif="1" else= "1" ></mutation>' +
        '</block>',
      expectedXml:
          '<block xmlns="https://developers.google.com/blockly/xml" ' +
          'type="controls_if" id="1">\n' +
          '  <mutation inputs="0,1" else="true" next="2"></mutation>\n</block>',
      assertBlockStructure: (block) => {
        assertBlockStructure(
            block, ['IF0', 'DO0', 'IF1', 'DO1', 'ELSE'], 'controls_if');
      },
    },
  ];
  testHelpers.runSerializationTestSuite(testCases);
});
