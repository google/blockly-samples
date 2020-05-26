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

suite('List create block', function() {
  /**
   * Asserts that the list block has the inputs and fields we expect.
   * @param {!Blockly.Block} block The list block.
   * @param {number=} inputCount The number of inputs we expect.
   */
  function assertListBlockStructure(block, inputCount = 0) {
    assert.equal(block.type, 'lists_create_with');
    if (inputCount === 0) {
      assert.equal(block.inputList.length, 1);
      const input = block.inputList[0];
      assert.equal(input.type, Blockly.DUMMY_INPUT);
      assert.equal(input.name, 'EMPTY');
      assert.isNull(block.getField('MINUS'));
      // Easy way to test we're displaying empty instead of normal text.
      assert.equal(block.toString(), 'create empty list');
      return;
    }

    assert.equal(block.inputList.length, inputCount);
    for (let i = 0; i < inputCount; i++) {
      chai.assert.equal(block.inputList[i].name, 'ADD' + i);
    }
    assert.isNotNull(block.getField('MINUS'));
    // Easy way to test we're displaying normal text instead of empty.
    assert.notEqual(block.toString(), 'create empty list');
  }

  setup(function() {
    this.workspace = new Blockly.Workspace();
  });

  teardown(function() {
    this.workspace.dispose();
  });

  test('Structure', function() {
    this.block = this.workspace.newBlock('lists_create_with');
    assertListBlockStructure(this.block, 3);
  });

  suite('blockToCode', function() {
    const trivialCreateBlock = (workspace) => {
      return workspace.newBlock('lists_create_with');
    };

    /**
     * Test suites for code generation tests.
     * @type {Array<CodeGenerationTestSuite>}
     */
    const testSuites = [
      {title: 'Dart', generator: Blockly.Dart,
        testCases: [
          {title: 'Trivial', expectedCode: '[null, null, null]',
            createBlock: trivialCreateBlock},
        ]},
      {title: 'JavaScript', generator: Blockly.JavaScript,
        testCases: [

          {title: 'Trivial', expectedCode: '[null, null, null]',
            createBlock: trivialCreateBlock},
        ]},
      {title: 'Lua', generator: Blockly.Lua,
        testCases: [
          {title: 'Trivial', expectedCode: '{None, None, None}',
            createBlock: trivialCreateBlock},
        ]},
      {title: 'PHP', generator: Blockly.PHP,
        testCases: [
          {title: 'Trivial', expectedCode: 'array(null, null, null)',
            createBlock: trivialCreateBlock},
        ]},
      {title: 'Python', generator: Blockly.Python,
        testCases: [
          {title: 'Trivial', expectedCode: '[None, None, None]',
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
    {title: 'Empty XML', xml: '<block type="lists_create_with"/>',
      expectedXml:
          '<block xmlns="https://developers.google.com/blockly/xml" ' +
          'type="lists_create_with" id="1">\n' +
          '  <mutation items="3"></mutation>\n' +
          '</block>',
      assertBlockStructure:
          (block) => {
            assertListBlockStructure(block, 3);
          },
    },
    {title: '3 items',
      xml:
          '<block xmlns="https://developers.google.com/blockly/xml" ' +
          'type="lists_create_with" id="1">\n' +
          '  <mutation items="3"></mutation>\n' +
          '</block>',
      assertBlockStructure:
          (block) => {
            assertListBlockStructure(block, 3);
          },
    },
    {title: '5 items',
      xml:
          '<block xmlns="https://developers.google.com/blockly/xml" ' +
          'type="lists_create_with" id="1">\n' +
          '  <mutation items="5"></mutation>\n' +
          '</block>',
      assertBlockStructure:
          (block) => {
            assertListBlockStructure(block, 5);
          },
    },
    {title: '0 items',
      xml:
          '<block xmlns="https://developers.google.com/blockly/xml" ' +
          'type="lists_create_with" id="1">\n' +
          '  <mutation items="0"></mutation>\n' +
          '</block>',
      assertBlockStructure:
          (block) => {
            assertListBlockStructure(block, 0);
          },
    },
  ];
  // TODO(kozbial) add this test case
  // test.skip('Child attached', function() {
  //   const block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
  //       `<block type="lists_create_with">
  //             <mutation items="4"></mutation>
  //             <value name="ADD3">
  //               <block type="logic_boolean">
  //                 <field name="BOOL">TRUE</field>
  //               </block>
  //             </value>
  //           </block>`
  //   ), this.workspace);
  //   const expectedBlockContents =
  //       new RegExp(
  //           '<mutation items="4"></mutation>\\s*' +
  //           '<value name="ADD3">\\s*' +
  //           '<block[^>]* type="logic_boolean"[^>]*>\\s*' +
  //           '<field name="BOOL">TRUE</field>\\s*' +
  //           '</block>\\s*' +
  //           '</value>');
  //   const xml =
  //       Blockly.Xml.domToPrettyText(Blockly.Xml.blockToDom(block));
  //   assertBlockXmlContentsMatch(xml, 'lists_create_with',
  //       expectedBlockContents);
  //
  //   const childBlock = this.workspace.newBlock('logic_boolean');
  //   this.listBlock.plus();
  //   this.listBlock.getInput('ADD3').connection
  //       .connect(childBlock.outputConnection);
  //   this.assertRoundTrip(this.listBlock, (block) => {
  //     assertList(block, 4);
  //     const child = block.getInputTargetBlock('ADD3');
  //     assert.isNotNull(child);
  //     assert.equal(child.type, 'logic_boolean');
  //   });
  // });

  runSerializationTestSuite(testCases, Blockly);

  suite('Adding and removing inputs', function() {
    setup(function() {
      this.block = this.workspace.newBlock('lists_create_with');
    });

    test('Add', function() {
      assertListBlockStructure(this.block, 3);
      this.block.plus();
      assertListBlockStructure(this.block, 4);
    });

    test('Add lots', function() {
      assertListBlockStructure(this.block, 3);
      for (let i = 0; i < 7; i++) {
        this.block.plus();
      }
      assertListBlockStructure(this.block, 10);
    });

    test('Remove', function() {
      assertListBlockStructure(this.block, 3);
      this.block.minus();
      assertListBlockStructure(this.block, 2);
    });

    test('Remove too many', function() {
      assertListBlockStructure(this.block, 3);
      for (let i = 0; i < 4; i++) {
        this.block.minus();
      }
      assertListBlockStructure(this.block, 0);
    });

    test('Remove lots', function() {
      assertListBlockStructure(this.block, 3);
      for (let i = 0; i < 7; i++) {
        this.block.plus();
      }
      for (let i = 0; i < 5; i++) {
        this.block.minus();
      }
      assertListBlockStructure(this.block, 5);
    });

    test('Remove attached', function() {
      const childBlock = this.workspace.newBlock('logic_boolean');
      assertListBlockStructure(this.block, 3);
      this.block.getInput('ADD2').connection
          .connect(childBlock.outputConnection);
      assert.equal(this.block.getInputTargetBlock('ADD2'), childBlock);
      this.block.minus();
      assert.isNull(this.block.getInputTargetBlock('ADD2'));
      assert.isNull(childBlock.outputConnection.targetBlock());
    });
  });
});
