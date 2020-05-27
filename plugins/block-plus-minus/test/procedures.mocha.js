/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const chai = require('chai');
const sinon = require('sinon');
const Blockly = require('blockly/node');
const {testHelpers} = require('@blockly/dev-tools');
const procedureTestHelpers = require('./procedures_test_helpers.mocha');

require('../src/index');

const assert = chai.assert;
const {CodeGenerationTestSuite, runCodeGenerationTestSuites,
  runSerializationTestSuite, SerializationTestCase} = testHelpers;
const {assertDefBlockStructure, assertCallBlockStructure,
  assertProcBlocksStructure, createSimpleProcDefBlock,
  createSimpleProcCallBlock} = procedureTestHelpers;

suite.only('Procedure blocks', function() {
  setup(function() {
    this.workspace = new Blockly.Workspace();
    this.clock = sinon.useFakeTimers();
  });

  teardown(function() {
    // We have to make sure the procedure call gets the change event before
    // we teardown. Otherwise we get a race condition where it tries to create
    // a new def.
    this.clock.tick(100);
    this.workspace.dispose();
  });

  test('Structure', function() {
    const defBlock = this.workspace.newBlock('procedures_defnoreturn');
    assertDefBlockStructure(defBlock);
    const callBlock = this.workspace.newBlock('procedures_callnoreturn');
    assertCallBlockStructure(callBlock);
  });

  // TODO(kozbial): Fix errors with runCodeGenerationTestSuites call
  suite.skip('blockToCode', function() {
    const trivial = (workspace) => {
      return workspace.newBlock('procedures_defnoreturn');
    };

    /**
     * Test suites for code generation test.
     * @type {Array<CodeGenerationTestSuite>}
     */
    const testSuites = [
      {title: 'Dart', generator: Blockly.Dart,
        testCases: [
          {title: 'Trivial', expectedCode: 'if (false) {\n}\n',
            createBlock: createSimpleProcDefBlock},
        ]},
      {title: 'JavaScript', generator: Blockly.JavaScript,
        testCases: [
          {title: 'Trivial', expectedCode: 'if (false) {\n}\n',
            createBlock: trivial},
        ]},
      {title: 'Lua', generator: Blockly.Lua,
        testCases: [
          {title: 'Trivial', expectedCode: 'if false then\nend\n',
            createBlock: createSimpleProcDefBlock},
        ]},
      {title: 'PHP', generator: Blockly.PHP,
        testCases: [
          {title: 'Trivial', expectedCode: 'if (false) {\n}\n',
            createBlock: createSimpleProcDefBlock},
        ]},
      {title: 'Python', generator: Blockly.Python,
        testCases: [
          {title: 'Trivial', expectedCode: 'if False:\nundefined',
            createBlock: createSimpleProcDefBlock},
        ]},
    ];

    runCodeGenerationTestSuites(testSuites);
  });

  /**
   * Test cases for serialization tests.
   * @type {Array<SerializationTestCase>}
   */
  const testCases = [
    {title: 'Empty XML definition with return',
      xml: '<block type="procedures_defreturn"/>',
      expectedXml:
          '<block xmlns="https://developers.google.com/blockly/xml" ' +
          'type="procedures_defreturn" id="1">\n' +
          '  <field name="NAME"></field>\n' +
          '</block>',
      assertBlockStructure:
          (block) => {
            assertDefBlockStructure(block, [], true);
          },
    },
    {title: 'Empty XML definition no return',
      xml: '<block type="procedures_defnoreturn"/>',
      expectedXml:
          '<block xmlns="https://developers.google.com/blockly/xml" ' +
          'type="procedures_defnoreturn" id="1">\n' +
          '  <field name="NAME"></field>\n' +
          '</block>',
      assertBlockStructure:
          (block) => {
            assertDefBlockStructure(block);
          },
    },
    {title: 'Empty XML caller with return',
      xml: '<block type="procedures_callreturn"/>',
      expectedXml:
          '<block xmlns="https://developers.google.com/blockly/xml" ' +
          'type="procedures_callreturn" id="1">\n' +
          // TODO(kozbial) investigate whether callreturn and callnoreturn
          //  should have the same default value for name mutation.
          '  <mutation name=""></mutation>\n' +
          '</block>',
      assertBlockStructure:
          (block) => {
            assertCallBlockStructure(block);
          },
    },
    {title: 'Empty XML caller no return',
      xml: '<block type="procedures_callnoreturn"/>',
      expectedXml:
          '<block xmlns="https://developers.google.com/blockly/xml" ' +
          'type="procedures_callnoreturn" id="1">\n' +
          // TODO(kozbial) investigate whether callreturn and callnoreturn
          //  should have the same default value for name mutation.
          '  <mutation name="1"></mutation>\n' +
          '</block>',
      assertBlockStructure:
          (block) => {
            assertCallBlockStructure(block);
          },
    },
  ];
  runSerializationTestSuite(testCases);

  suite.skip('Adding and removing', function() {
    test('Add', function() {
      const def = createSimpleProcDefBlock(this.workspace);
      const call = createSimpleProcCallBlock(this.workspace);
      def.plus();
      assertProcBlocksStructure(def, call, ['x']);
    });
    test('Add lots', function() {
      const def = createSimpleProcDefBlock(this.workspace);
      const call = createSimpleProcCallBlock(this.workspace);
      for (let i = 0; i < 5; i++) {
        def.plus();
      }
      assertProcBlocksStructure(def, call, ['x', 'y', 'z', 'a', 'b']);
    });
    test('Add, no stack', function() {
      const xml = '<xml xmlns="https://developers.google.com/blockly/xml">\n' +
          '  <block type="procedures_defreturn" id="def">\n' +
          '    <mutation statements="false"></mutation>\n' +
          '    <field name="NAME">do something</field>\n' +
          '  </block>\n' +
          '  <block type="procedures_callreturn" id="call">\n' +
          '    <mutation name="do something"></mutation>\n' +
          '  </block>' +
          '</xml>';
      Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), this.workspace);
      const def = this.workspace.getBlockById('def');
      def.plus();
      assertProcBlocksStructure(
          def, this.workspace.getBlockById('call'), ['x'], false);
    });
    test('Remove', function() {
      const def = createSimpleProcDefBlock(this.workspace);
      const call = createSimpleProcCallBlock(this.workspace);
      def.plus();
      def.minus(def.argData_[0].argId);
      assertProcBlocksStructure(def, call);
    });
    test('Remove lots', function() {
      const def = createSimpleProcDefBlock(this.workspace);
      const call = createSimpleProcCallBlock(this.workspace);
      for (let i = 0; i < 10; i++) {
        def.plus();
      }
      // Remove every other input. Must do it backwards so that the array
      // doesn't get out of whack.
      for (let i = 9; i > 0; i-=2) {
        def.minus(def.argData_[i].argId);
      }
      assertProcBlocksStructure(def, call, ['x', 'z', 'b', 'd', 'f']);
    });
    test('Remove w/ no args', function() {
      const def = createSimpleProcDefBlock(this.workspace);
      const call = createSimpleProcCallBlock(this.workspace);
      def.minus('whatevs');
      assertProcBlocksStructure(def, call);
    });
    test('Remove bad arg', function() {
      const def = createSimpleProcDefBlock(this.workspace);
      const call = createSimpleProcCallBlock(this.workspace);
      def.plus();
      def.minus('whatevs');
      assertProcBlocksStructure(def, call, ['x']);
    });
  });

  suite('Vars', function() {
    setup(function() {
      this.assertVars = function(constsArray) {
        const constNames = this.workspace.getVariablesOfType('').map(
            (model) => model.name );
        assert.sameMembers(constNames, constsArray);
      };
    });
    teardown(function() {
      delete this.assertVars;
    });

    suite('Renaming args', function() {
      setup(function() {
        this.def = createSimpleProcDefBlock(this.workspace);
        this.call = createSimpleProcCallBlock(this.workspace);
      });
      test('Simple Rename', function() {
        this.def.plus();
        const field = this.def.inputList[1].fieldRow[2];
        field.setValue('newName');
        assertProcBlocksStructure(this.def, this.call, ['newName']);
        this.assertVars(['x', 'newName']);
      });
      test('Change Case', function() {
        this.def.plus();
        const field = this.def.inputList[1].fieldRow[2];
        field.setValue('X');
        assertProcBlocksStructure(this.def, this.call, ['X']);
        this.assertVars(['X']);
      });
      test('Empty', function() {
        this.def.plus();
        const field = this.def.inputList[1].fieldRow[2];
        field.setValue('');
        assertProcBlocksStructure(this.def, this.call, ['x']);
        this.assertVars(['x']);
      });
      test('Whitespace', function() {
        this.def.plus();
        const field = this.def.inputList[1].fieldRow[2];
        field.setValue('  newName   ');
        assertProcBlocksStructure(this.def, this.call, ['newName']);
        this.assertVars(['x', 'newName']);
      });
      test('Duplicate', function() {
        this.def.plus();
        this.def.plus();
        const field = this.def.inputList[1].fieldRow[2];
        field.setValue('y');
        assertProcBlocksStructure(this.def, this.call, ['x', 'y']);
        this.assertVars(['x', 'y']);
      });
      test('Duplicate Different Case', function() {
        this.def.plus();
        this.def.plus();
        const field = this.def.inputList[1].fieldRow[2];
        field.setValue('Y');
        assertProcBlocksStructure(this.def, this.call, ['x', 'y']);
        this.assertVars(['x', 'y']);
      });
      test('Match Existing', function() {
        this.workspace.createVariable('test', '');
        this.def.plus();
        const field = this.def.inputList[1].fieldRow[2];
        field.setValue('test');
        assertProcBlocksStructure(this.def, this.call, ['test']);
        this.assertVars(['x', 'test']);
        assert.equal(this.def.argData_[0].model.getId(),
            this.workspace.getVariable('test', '').getId());
      });
    });
    suite('Vars Renamed Elsewhere', function() {
      setup(function() {
        this.def = createSimpleProcDefBlock(this.workspace);
        this.call = createSimpleProcCallBlock(this.workspace);
      });
      test('Simple Rename', function() {
        this.def.plus();
        const Variable = this.workspace.getVariable('x', '');
        this.workspace.renameVariableById(Variable.getId(), 'test');
        assertProcBlocksStructure(this.def, this.call, ['test']);
        this.assertVars(['test']);
      });
      // Don't know how we want to react here.
      test.skip('Duplicate', function() {
        this.def.plus();
        this.def.plus();
        const Variable = this.workspace.getVariable('x', '');
        this.workspace.renameVariableById(Variable.getId(), 'y');
        // Don't know what we want to have happen.
      });
      test('Change Case', function() {
        this.def.plus();
        const Variable = this.workspace.getVariable('x', '');
        this.workspace.renameVariableById(Variable.getId(), 'X');
        assertProcBlocksStructure(this.def, this.call, ['X']);
        this.assertVars(['X']);
      });
      test('Coalesce Change Case', function() {
        const variable = this.workspace.createVariable('test');
        this.def.plus();
        this.workspace.renameVariableById(variable.getId(), 'X');
        assertProcBlocksStructure(this.def, this.call, ['X']);
        this.assertVars(['X']);
      });
    });
  });
});
