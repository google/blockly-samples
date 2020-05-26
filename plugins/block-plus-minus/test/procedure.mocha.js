/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const chai = require('chai');
const sinon = require('sinon');
const Blockly = require('blockly');
const {testHelpers} = require('@blockly/dev-tools');
require('../dist/index');

const assert = chai.assert;
const {assertBlockXmlContentsMatch, CodeGenerationTestSuite,
  runCodeGenerationTestSuites} = testHelpers;

suite('Procedure block', function() {
  /**
   * Asserts that the procedure def and caller have the inputs and fields
   * we expect.
   * @param {!Blockly.Block} def The procedure definition block.
   * @param {!Blockly.Block} call The procedure call block.
   * @param {Array<string>=} args An array of argument names.
   * @param {boolean=} hasStatements If we expect the procedure def to have
   *     a statement input or not.
   */
  function assertProcBlockStructure(
      def, call, args = [], hasStatements = true) {
    if (hasStatements) {
      assert.isNotNull(def.getInput('STACK'));
    } else {
      assert.isNull(def.getInput('STACK'));
    }
    const defInputs = def.inputList;
    const callInputs = call.inputList;
    const defLength = defInputs.length;
    const defArgCount = hasStatements ? defLength - 3 : defLength - 2;

    // Just looking at const inputs.
    assert.equal(defArgCount, callInputs.length - 1,
        'def and call have the same number of args');
    assert.equal(defArgCount, args.length,
        'blocks have the expected number of args');

    if (!args.length) {
      assert.notInclude(def.toString(), 'with');
      assert.notInclude(call.toString(), 'with');
      return;
    }

    assert.sameOrderedMembers(def.getVars(), args);
    assert.include(def.toString(), 'with');
    assert.include(call.toString(), 'with');

    const argIds = def.argData_.map((element) => element.argId);
    for (let i = 0; i < defArgCount; i++) {
      const expectedName = args[i];
      const defInput = defInputs[i + 1];
      const callInput = callInputs[i + 1];
      assert.equal(defInput.type, Blockly.DUMMY_INPUT);
      assert.equal(callInput.type, Blockly.INPUT_VALUE);
      assert.equal(defInput.name, argIds[i]);
      assert.equal(defInput.fieldRow[2].getValue(), expectedName,
          'Def consts did not match expected');
      assert.equal(callInput.name, 'ARG' + i);
      assert.equal(callInput.fieldRow[0].getValue(), expectedName,
          'Call consts did not match expected.');
    }

    // Assert the last input is not a dummy. Sometimes
    // arg inputs don't get moved which is bad.
    assert.equal(defInputs[defLength -1].type, Blockly.INPUT_VALUE,
        'last input is not a dummy');
  }

  function createSimpleProcDefBlock(workspace, type='procedures_defreturn') {
    return Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
        '<block type="' + type + '">' +
        '  <field name="NAME">proc name</field>' +
        '</block>'
    ), workspace);
  }

  function createSimpleProcCallBlock(workspace, type='procedures_callreturn') {
    return Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
        '<block type="procedures_callreturn">' +
        '  <mutation name="proc name"/>' +
        '</block>'
    ), workspace);
  }

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

  test.skip('Structure', function() {
    this.block = this.workspace.newBlock('procedures_defnoreturn');
    assertProcBlockStructure(this.block, 1);
  });

  suite('blockToCode', function() {
    const trivialCreateBlock = (workspace) => {
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

    // runCodeGenerationTestSuites(testSuites);
  });

  suite('Serialization', function() {
    suite('blockToXml', function() {
      setup(function() {
        this.block = this.workspace.newBlock('procedures_defnoreturn');
      });

      test('Trivial', function() {
        // const xml =
        //     Blockly.Xml.domToPrettyText(Blockly.Xml.blockToDom(this.block));
        // assertBlockXmlContentsMatch(xml, 'procedures_defnoreturn');
      });
    });

    suite('xmlToBlock', function() {
      test('Trivial', function() {
        // const block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
        //     '<block type="procedures_defnoreturn"/>'
        // ), this.workspace);
        // assertIfBlockStructure(block, 1);
      });
    });
  });

  suite('Adding and removing', function() {
    test('Add', function() {
      const def = createSimpleProcDefBlock(this.workspace);
      const call = createSimpleProcCallBlock(this.workspace);
      def.plus();
      assertProcBlockStructure(def, call, ['x']);
    });
    test('Add lots', function() {
      const def = createSimpleProcDefBlock(this.workspace);
      const call = createSimpleProcCallBlock(this.workspace);
      for (let i = 0; i < 5; i++) {
        def.plus();
      }
      assertProcBlockStructure(def, call,['x', 'y', 'z', 'a', 'b']);
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
      assertProcBlockStructure(def, this.workspace.getBlockById('call'), ['x'], false);
    });
    test('Remove', function() {
      const def = createSimpleProcDefBlock(this.workspace);
      const call = createSimpleProcCallBlock(this.workspace);
      def.plus();
      def.minus(def.argData_[0].argId);
      assertProcBlockStructure(def, call);
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
      assertProcBlockStructure(def, call, ['x', 'z', 'b', 'd', 'f']);
    });
    test('Remove w/ no args', function() {
      const def = createSimpleProcDefBlock(this.workspace);
      const call = createSimpleProcCallBlock(this.workspace);
      def.minus('whatevs');
      assertProcBlockStructure(def, call);
    });
    test('Remove bad arg', function() {
      const def = createSimpleProcDefBlock(this.workspace);
      const call = createSimpleProcCallBlock(this.workspace);
      def.plus();
      def.minus('whatevs');
      assertProcBlockStructure(def, call,['x']);
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
        assertProcBlockStructure(this.def, this.call, ['newName']);
        this.assertVars(['x', 'newName']);
      });
      test('Change Case', function() {
        this.def.plus();
        const field = this.def.inputList[1].fieldRow[2];
        field.setValue('X');
        assertProcBlockStructure(this.def, this.call, ['X']);
        this.assertVars(['X']);
      });
      test('Empty', function() {
        this.def.plus();
        const field = this.def.inputList[1].fieldRow[2];
        field.setValue('');
        assertProcBlockStructure(this.def, this.call, ['x']);
        this.assertVars(['x']);
      });
      test('Whitespace', function() {
        this.def.plus();
        const field = this.def.inputList[1].fieldRow[2];
        field.setValue('  newName   ');
        assertProcBlockStructure(this.def, this.call, ['newName']);
        this.assertVars(['x', 'newName']);
      });
      test('Duplicate', function() {
        this.def.plus();
        this.def.plus();
        const field = this.def.inputList[1].fieldRow[2];
        field.setValue('y');
        assertProcBlockStructure(this.def, this.call, ['x', 'y']);
        this.assertVars(['x', 'y']);
      });
      test('Duplicate Different Case', function() {
        this.def.plus();
        this.def.plus();
        const field = this.def.inputList[1].fieldRow[2];
        field.setValue('Y');
        assertProcBlockStructure(this.def, this.call, ['x', 'y']);
        this.assertVars(['x', 'y']);
      });
      test('Match Existing', function() {
        this.workspace.createVariable('test', '');
        this.def.plus();
        const field = this.def.inputList[1].fieldRow[2];
        field.setValue('test');
        assertProcBlockStructure(this.def, this.call, ['test']);
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
        assertProcBlockStructure(this.def, this.call, ['test']);
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
        assertProcBlockStructure(this.def, this.call, ['X']);
        this.assertVars(['X']);
      });
      test('Coalesce Change Case', function() {
        const variable = this.workspace.createVariable('test');
        this.def.plus();
        this.workspace.renameVariableById(variable.getId(), 'X');
        assertProcBlockStructure(this.def, this.call, ['X']);
        this.assertVars(['X']);
      });
    });
  });
});
