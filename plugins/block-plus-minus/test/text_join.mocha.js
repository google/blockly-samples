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

suite('Text join block', function() {
  /**
   * Asserts that the join block has the inputs and fields we expect.
   * @param {!Blockly.Block} block The text join block.
   * @param {number=} inputCount The number of inputs we expect.
   */
  function assertTextJoinBlockStructure(block, inputCount) {
    if (!inputCount) {
      assert.equal(block.inputList.length, 1);
      const input = block.inputList[0];
      assert.equal(input.type, Blockly.DUMMY_INPUT);
      assert.equal(input.name, 'EMPTY');
      assert.isNull(block.getField('MINUS'));
      // Easy way to test we're displaying quotes instead of normal text.
      assert.equal(block.toString(), '“ ”');
      return;
    }

    assert.equal(block.inputList.length, inputCount);
    for (let i = 0; i < inputCount; i++) {
      chai.assert.equal(block.inputList[i].name, 'ADD' + i);
    }
    assert.isNotNull(block.getField('MINUS'));
    // Easy way to test we're displaying normal text instead of quotes.
    assert.notEqual(block.toString(), '“ ”');
  }

  setup(function() {
    this.workspace = new Blockly.Workspace();
  });

  teardown(function() {
    this.workspace.dispose();
  });

  test('Structure', function() {
    this.block = this.workspace.newBlock('text_join');
    assertTextJoinBlockStructure(this.block, 2);
  });

  suite.skip('blockToCode', function() {
    const trivialCreateBlock = (workspace) => {
      return workspace.newBlock('text_join');
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
    {title: 'Empty XML', xml: '<block type="text_join"/>',
      expectedXml:
          '<block type="text_join">\n' +
          '  <mutation items="2"/>\n' +
          '</block>',
      assertBlockStructure:
        (block) => {
          assertTextJoinBlockStructure(block, 2);
        },
    },
    {title: '0 items',
      xml:
          '<block type="text_join">\n' +
          '  <mutation items="0"/>\n' +
          '</block>',
      assertBlockStructure:
          (block) => {
            assertTextJoinBlockStructure(block, 0);
          },
    },
    {title: '3 items',
      xml:
          '<block type="text_join">\n' +
          '  <mutation items="3"/>\n' +
          '</block>',
      assertBlockStructure:
          (block) => {
            assertTextJoinBlockStructure(block, 3);
          },
    },
  ];
  // TODO(kozbial) add this test case
  // test('Child attached', () => {
  //   const childBlock = this.workspace.newBlock('logic_boolean');
  //   this.joinBlock.plus();
  //   this.joinBlock.getInput('ADD2').connection
  //       .connect(childBlock.outputConnection);
  //   this.assertRoundTrip(this.joinBlock, (block) => {
  //     assertJoin(block, 3);
  //     const child = block.getInputTargetBlock('ADD2');
  //     assert.isNotNull(child);
  //     assert.equal(child.type, 'logic_boolean');
  //   });

  runSerializationTestSuite(testCases);//, Blockly);

  suite('Adding and removing inputs', function() {
    setup(function() {
      this.block = this.workspace.newBlock('text_join');
    });

    test('Add', function() {
      assertTextJoinBlockStructure(this.block, 2);
      this.block.plus();
      assertTextJoinBlockStructure(this.block, 3);
    });

    test('Add lots', function() {
      assertTextJoinBlockStructure(this.block, 2);
      for (let i = 0; i < 8; i++) {
        this.block.plus();
      }
      assertTextJoinBlockStructure(this.block, 10);
    });

    test('Remove', function() {
      assertTextJoinBlockStructure(this.block, 2);
      this.block.minus();
      assertTextJoinBlockStructure(this.block, 1);
    });

    test('Remove too many', function() {
      assertTextJoinBlockStructure(this.block, 2);
      for (let i = 0; i < 3; i++) {
        this.block.minus();
      }
      assertTextJoinBlockStructure(this.block, 0);
    });

    test('Remove lots', function() {
      assertTextJoinBlockStructure(this.block, 2);
      for (let i = 0; i < 8; i++) {
        this.block.plus();
      }
      for (let i = 0; i < 5; i++) {
        this.block.minus();
      }
      assertTextJoinBlockStructure(this.block, 5);
    });

    test('Remove attached', function() {
      const childBlock = this.workspace.newBlock('logic_boolean');
      assertTextJoinBlockStructure(this.block, 2);
      this.block.getInput('ADD1').connection
          .connect(childBlock.outputConnection);
      assert.equal(this.block.getInputTargetBlock('ADD1'), childBlock);
      this.block.minus();
      assert.isNull(this.block.getInputTargetBlock('ADD1'));
      assert.isNull(childBlock.outputConnection.targetBlock());
    });
  });
});
