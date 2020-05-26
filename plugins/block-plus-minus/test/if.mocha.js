/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const chai = require('chai');
const Blockly = require('blockly');
const {testHelpers} = require('@blockly/dev-tools');
require('../dist/index');

const assert = chai.assert;

const {CodeGenerationTestSuite, runCodeGenerationTestSuites,
  runSerializationTestSuite, SerializationTestCase} = testHelpers;

suite('If block', function() {
  /**
   * Asserts that the if block has the expected inputs and fields.
   * @param {!Blockly.Block} block The if block to check.
   * @param {number} ifCount The number of ifs we expect.
   * @param {boolean=} hasElse If we expect an else input.
   */
  function assertIfBlockStructure(block, ifCount, hasElse) {
    assert.equal(block.type, 'controls_if');
    const inputs = block.inputList;
    assert.exists(inputs);
    const length = inputs.length;
    const expectedLength = hasElse ? ifCount * 2 + 1 : ifCount * 2;
    assert.equal(length, expectedLength);
    for (let i = 0; i < ifCount; i++) {
      assert.equal(inputs[i * 2].name, 'IF' + i);
      assert.equal(inputs[i * 2 + 1].name, 'DO' + i);
      if (i > 0) {
        assert.isNotNull(block.getField('MINUS' + i));
      }
    }
    if (hasElse) {
      assert.equal(inputs[length - 1].name, 'ELSE');
    }
  }

  setup(function() {
    this.workspace = new Blockly.Workspace();
  });

  teardown(function() {
    this.workspace.dispose();
  });

  test('Structure', function() {
    this.block = this.workspace.newBlock('controls_if');
    assertIfBlockStructure(this.block, 1);
  });

  suite('blockToCode', function() {
    const trivialCreateBlock = (workspace) => {
      return workspace.newBlock('controls_if');
    };

    /**
     * Test suites for code generation tests.
     * @type {Array<CodeGenerationTestSuite>}
     */
    const testSuites = [
      {title: 'Dart', generator: Blockly.Dart,
        testCases: [
          {title: 'Trivial', expectedCode: 'if (false) {\n}\n',
            createBlock: trivialCreateBlock},
        ]},
      {title: 'JavaScript', generator: Blockly.JavaScript,
        testCases: [

          {title: 'Trivial', expectedCode: 'if (false) {\n}\n',
            createBlock: trivialCreateBlock},
        ]},
      {title: 'Lua', generator: Blockly.Lua,
        testCases: [
          {title: 'Trivial', expectedCode: 'if false then\nend\n',
            createBlock: trivialCreateBlock},
        ]},
      {title: 'PHP', generator: Blockly.PHP,
        testCases: [
          {title: 'Trivial', expectedCode: 'if (false) {\n}\n',
            createBlock: trivialCreateBlock},
        ]},
      {title: 'Python', generator: Blockly.Python,
        testCases: [
          {title: 'Trivial', expectedCode: 'if False:\nundefined',
            createBlock: trivialCreateBlock},
        ]},
    ];
    runCodeGenerationTestSuites(testSuites);
  });

  /**
   * Test cases for serialization tests.
   * @type {Array<SerializationTestCase>}
   */
  const testCases = [
    {title: 'Empty XML', xml: '<block type="controls_if"/>',
      expectedXml:
          '<block xmlns="https://developers.google.com/blockly/xml" ' +
          'type="controls_if" id="1"></block>',
      assertBlockStructure:
          (block) => {
            assertIfBlockStructure(block, 1);
          },
    },
    {title: '2 elseif no else',
      xml:
          '<block xmlns="https://developers.google.com/blockly/xml" ' +
          'type="controls_if" id="1">\n' +
          '  <mutation elseif="2"></mutation>\n' +
          '</block>',
      assertBlockStructure:
          (block) => {
            assertIfBlockStructure(block, 3);
          },
    },
    {title: '3 elseif with else',
      xml:
          '<block xmlns="https://developers.google.com/blockly/xml" ' +
          'type="controls_if" id="1">\n' +
          '  <mutation elseif="3" else="1"></mutation>\n' +
          '</block>',
      assertBlockStructure:
          (block) => {
            assertIfBlockStructure(block, 4, true);
          },
    },
  ];
  runSerializationTestSuite(testCases, Blockly);

  suite('Adding and removing inputs', function() {
    setup(function() {
      this.block = this.workspace.newBlock('controls_if');
    });

    test('Add', function() {
      assertIfBlockStructure(this.block, 1);
      this.block.plus();
      assertIfBlockStructure(this.block, 2);
    });

    test('Add lots', function() {
      assertIfBlockStructure(this.block, 1);
      for (let i = 0; i < 9; i++) {
        this.block.plus();
      }
      assertIfBlockStructure(this.block, 10);
    });

    test('Remove nothing', function() {
      assertIfBlockStructure(this.block, 1);
      this.block.minus();
      assertIfBlockStructure(this.block, 1);
    });

    test('Remove', function() {
      assertIfBlockStructure(this.block, 1);
      this.block.plus();
      this.block.minus();
      assertIfBlockStructure(this.block, 1);
    });

    test('Remove lots', function() {
      assertIfBlockStructure(this.block, 1);
      for (let i = 0; i < 9; i++) {
        this.block.plus();
      }
      for (let i = 0; i < 5; i++) {
        this.block.minus();
      }
      assertIfBlockStructure(this.block, 5);
    });

    test('Remove attached', function() {
      const block = this.workspace.newBlock('logic_boolean');

      assertIfBlockStructure(this.block, 1);
      this.block.plus();
      this.block.getInput('IF1').connection
          .connect(block.outputConnection);
      assert.equal(this.block.getInputTargetBlock('IF1'), block);

      this.block.minus();
      assertIfBlockStructure(this.block, 1);
      assert.isNull(block.outputConnection.targetBlock());

      // Assert that it does not get reattached. Only reattach on undo.
      this.block.plus();
      assertIfBlockStructure(this.block, 2);
      assert.isNull(block.outputConnection.targetBlock());
    });
  });
});
