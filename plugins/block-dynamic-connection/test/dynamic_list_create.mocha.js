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

suite('List create block', function() {
  /**
   * Asserts that the list create block has the expected inputs.
   * @param {!Blockly.Block} block The block to check.
   * @param {!Array<string>} expectedInputs The expected inputs.
   * @type {string=} The block type expected. Defaults to 'dynamic_list_create'.
   */
  function assertBlockStructure(
      block, expectedInputs, type = 'dynamic_list_create'
  ) {
    assert.equal(block.type, type);
    assert.equal(block.inputList.length, expectedInputs.length);
    assert.isTrue(expectedInputs.length >= 2);
    for (let i = 0; i < expectedInputs.length; i++) {
      assert.equal(block.inputList[i].name, expectedInputs[i]);
    }
  }

  /**
   * Creates a block and connects it to the specified connection.
   * @param {!Blockly.Workspace} workspace The workspace.
   * @param {!Blockly.Connection} connection The connection to connect a new
   *    block to.
   */
  function connectBlockToConnection(workspace, connection) {
    const newBlock = workspace.newBlock('text');
    const targetConnection = newBlock.outputConnection;
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
    const block = this.workspace.newBlock('dynamic_list_create');
    assertBlockStructure(block, ['ADD0', 'ADD1']);
  });

  suite('onPendingConnection', function() {
    test('pending connection with empty connection', function() {
      const block = this.workspace.newBlock('dynamic_list_create');
      const connection = block.inputList[0].connection;
      block.onPendingConnection(connection);
      assertBlockStructure(block, ['ADD0', 'ADD1']);
    });

    test('pending connection with empty next connection', function() {
      const block = this.workspace.newBlock('dynamic_list_create');
      const connection = block.inputList[0].connection;
      connectBlockToConnection(this.workspace, block.inputList[0].connection);
      block.onPendingConnection(connection);
      assertBlockStructure(block, ['ADD0', 'ADD1']);
    });

    test('pending connection adds connection', function() {
      const block = this.workspace.newBlock('dynamic_list_create');
      connectBlockToConnection(this.workspace, block.inputList[0].connection);
      connectBlockToConnection(this.workspace, block.inputList[1].connection);
      block.onPendingConnection(block.inputList[0].connection);
      assertBlockStructure(block, ['ADD0', 'ADD2', 'ADD1']);
      block.onPendingConnection(block.inputList[2].connection);
      assertBlockStructure(block, ['ADD0', 'ADD2', 'ADD1', 'ADD3']);
    });
  });

  suite('finalizeConnections', function() {
    test('does not go below 2 connections', function() {
      const block = this.workspace.newBlock('dynamic_list_create');
      assertBlockStructure(block, ['ADD0', 'ADD1']);
      block.finalizeConnections();
      assertBlockStructure(block, ['ADD0', 'ADD1']);
    });

    test('removes empty connections', function() {
      const block = this.workspace.newBlock('dynamic_list_create');
      connectBlockToConnection(this.workspace, block.inputList[0].connection);
      connectBlockToConnection(this.workspace, block.inputList[1].connection);
      block.onPendingConnection(block.inputList[0].connection);
      assertBlockStructure(block, ['ADD0', 'ADD2', 'ADD1']);
      block.finalizeConnections();
      assertBlockStructure(block, ['ADD0', 'ADD1']);
    });

    test('updates the field if the first connection is removed', function() {
      const block = this.workspace.newBlock('dynamic_list_create');
      connectBlockToConnection(this.workspace, block.inputList[1].connection);
      block.onPendingConnection(block.inputList[1].connection);
      connectBlockToConnection(this.workspace, block.inputList[2].connection);
      block.finalizeConnections();
      assertBlockStructure(block, ['ADD1', 'ADD2']);
      assert.equal(block.inputList[0].fieldRow[0].value_,
          Blockly.Msg.LISTS_CREATE_WITH_INPUT_WITH);
    });
  });

  const testCases = [
    {
      title: 'empty XML',
      xml: '<block type="dynamic_list_create"/>',
      expectedXml:
          '<block xmlns="https://developers.google.com/blockly/xml" ' +
          'type="dynamic_list_create" id="1">\n' +
          '  <mutation inputs="ADD0,ADD1" next="2"></mutation>\n</block>',
      assertBlockStructure: (block) => {
        assertBlockStructure(block, ['ADD0', 'ADD1']);
      },
    },
    {
      title: 'two inputs with one child',
      xml:
          '<block xmlns="https://developers.google.com/blockly/xml"' +
          ' type="dynamic_list_create" id="1">\n' +
          '  <mutation inputs="ADD0,ADD1" next="2"></mutation>\n' +
          '  <value name="ADD1">\n' +
          '    <block type="text" id="2">\n' +
          '      <field name="TEXT">abc</field>\n' +
          '    </block>\n  </value>\n</block>',
      assertBlockStructure: (block) => {
        assertBlockStructure(block, ['ADD0', 'ADD1']);
      },
    },
    {
      title: 'multiple inputs with children',
      xml:
          '<block xmlns="https://developers.google.com/blockly/xml"' +
          ' type="dynamic_list_create" id="1">\n' +
          '  <mutation inputs="ADD1,ADD5,ADD2,ADD4" next="6"></mutation>\n' +
          '  <value name="ADD1">\n' +
          '    <block type="text" id="2">\n' +
          '      <field name="TEXT">b</field>\n' +
          '    </block>\n  </value>\n' +
          '  <value name="ADD5">\n' +
          '    <block type="text" id="3">\n' +
          '      <field name="TEXT">d</field>\n' +
          '    </block>\n  </value>\n' +
          '  <value name="ADD2">\n' +
          '    <block type="text" id="4">\n' +
          '      <field name="TEXT">c</field>\n' +
          '    </block>\n  </value>\n' +
          '  <value name="ADD4">\n' +
          '    <block type="text" id="5">\n' +
          '      <field name="TEXT">a</field>\n' +
          '    </block>\n  </value>\n</block>',
      assertBlockStructure: (block) => {
        assertBlockStructure(block, ['ADD1', 'ADD5', 'ADD2', 'ADD4']);
      },
    },
    {
      title: 'standard/core XML is deserialized correctly',
      xml:
        '<block type="lists_create_with" id="1" x="63" y="113">' +
        '  <mutation items="3"></mutation>' +
        '</block>',
      expectedXml:
          '<block xmlns="https://developers.google.com/blockly/xml" ' +
          'type="lists_create_with" id="1">\n' +
          '  <mutation inputs="ADD0,ADD1,ADD2" next="3"></mutation>\n</block>',
      assertBlockStructure: (block) => {
        assertBlockStructure(
            block, ['ADD0', 'ADD1', 'ADD2'], 'lists_create_with');
      },
    },
    {
      title: 'standard/core XML still maintains minimum inputs',
      xml:
        '<block type="lists_create_with" id="1" x="63" y="113">' +
        '  <mutation items="0"></mutation>' +
        '</block>',
      expectedXml:
          '<block xmlns="https://developers.google.com/blockly/xml" ' +
          'type="lists_create_with" id="1">\n' +
          '  <mutation inputs="ADD0,ADD1" next="2"></mutation>\n</block>',
      assertBlockStructure: (block) => {
        assertBlockStructure(block, ['ADD0', 'ADD1'], 'lists_create_with');
      },
    },
  ];
  testHelpers.runSerializationTestSuite(testCases);
});
