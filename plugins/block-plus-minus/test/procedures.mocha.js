const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');
const Blockly = require('blockly');

require('../dist/index');

suite('procedures', () => {
  /**
   * Asserts that the procedure def and caller have the inputs and fields
   * we expect.
   * @param {!Blockly.Block} def The procedure definition block.
   * @param {!Blockly.Block} call The procedure call block.
   * @param {number} argCount The number of arguements we expect.
   * @param {Array<string>?} opt_args An optional array of argument names.
   * @param {boolean?} opt_hasStatements If we expect the procedure def to have
   *     a statement input or not.
   */
  function assertProc(def, call, argCount, opt_args, opt_hasStatements) {
    if (opt_hasStatements === false) {
      assert.isNull(def.getInput('STACK'));
    } else {
      opt_hasStatements = true;
      assert.isNotNull(def.getInput('STACK'));
    }
    if (opt_args) {
      assert.sameOrderedMembers(def.getVars(), opt_args);
    }

    const defInputs = def.inputList;
    const callInputs = call.inputList;
    const defLength = defInputs.length;
    const defArgCount = opt_hasStatements ? defLength - 3 : defLength - 2;

    // Just looking at const inputs.
    assert.equal(defArgCount, callInputs.length - 1,
        'def and call have the same number of args');
    assert.equal(defArgCount, argCount,
        'blocks have the expected number of args');

    if (argCount == 0) {
      assert.notInclude(def.toString(), 'with');
      assert.notInclude(call.toString(), 'with');
      return;
    }

    assert.include(def.toString(), 'with');
    assert.include(call.toString(), 'with');

    const argIds = def.argData_.map((element) => element.argId);
    for (let i = 1; i < defLength - 2; i++) {
      const constName = opt_args[i - 1];
      const defInput = defInputs[i];
      const callInput = callInputs[i];
      assert.equal(defInput.type, Blockly.DUMMY_INPUT);
      assert.equal(callInput.type, Blockly.INPUT_VALUE);
      assert.equal(defInput.name, argIds[i - 1]);
      assert.equal(defInput.fieldRow[2].getValue(), constName,
          'Def consts did not match expected');
      assert.equal(callInput.name, 'ARG' + (i - 1));
      assert.equal(callInput.fieldRow[0].getValue(), constName,
          'Call consts did not match expected.');
    }

    // Assert the last input is not a dummy. Sometimes
    // arg inputs don't get moved which is bad.
    assert.equal(defInputs[defLength -1].type, Blockly.INPUT_VALUE);
  }

  setup(() => {
    this.workspace = new Blockly.Workspace();
    this.def = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
        '<block type="procedures_defreturn">' +
        '  <field name="NAME">proc name</field>' +
        '</block>'
    ), this.workspace);
    this.call = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
        '<block type="procedures_callreturn">' +
        '  <mutation name="proc name"/>' +
        '</block>'
    ), this.workspace);
    this.clock = sinon.useFakeTimers();
  });
  teardown(() => {
    // We have to make sure the procedure call gets the change event before
    // we teardown. Otherwise we get a race condition where it tries to create
    // a new def.
    this.clock.tick(100);
    this.workspace.dispose();
    delete this.def;
    delete this.call;
    delete this.workspace;
  });
  suite('Serialization Matches Old', () => {
    setup(() => {
      this.workspace.clear();
    });
    test('Simple', () => {
      const oldText = '<xml xmlns="https://developers.google.com/blockly/xml">\n' +
          '  <variables>\n' +
          '    <variable id="O:Sr,z]cTdOh.rxYtbpK">x</variable>\n' +
          '    <variable id="b0khn,ShlhUP,dU}e+;-">y</variable>\n' +
          '    <variable id="@O5;lK8){`{*?=-t:Yxy">z</variable>\n' +
          '  </variables>\n' +
          '  <block type="procedures_defreturn" id="def" x="63" y="-477">\n' +
          '    <mutation>\n' +
          '      <arg name="x" varid="O:Sr,z]cTdOh.rxYtbpK"></arg>\n' +
          '      <arg name="y" varid="b0khn,ShlhUP,dU}e+;-"></arg>\n' +
          '      <arg name="z" varid="@O5;lK8){`{*?=-t:Yxy"></arg>\n' +
          '    </mutation>\n' +
          '    <field name="NAME">do something</field>\n' +
          '    <comment pinned="false" h="80" w="160">' +
          '      Describe this function...' +
          '    </comment>\n' +
          '  </block>\n' +
          '  <block type="procedures_callreturn" id="call" x="56" y="-282">\n' +
          '    <mutation name="do something">\n' +
          '      <arg name="x"></arg>\n' +
          '      <arg name="y"></arg>\n' +
          '      <arg name="z"></arg>\n' +
          '    </mutation>\n' +
          '  </block>\n' +
          '</xml>';
      Blockly.Xml.domToWorkspace(
          Blockly.Xml.textToDom(oldText), this.workspace);
      assertProc(this.workspace.getBlockById('def'),
          this.workspace.getBlockById('call'), 3, ['x', 'y', 'z']);
      const xml = Blockly.Xml.workspaceToDom(this.workspace);

      // Remove extra fields.
      const blocks = xml.getElementsByTagName('block');
      for (let i = 0, block; (block = blocks[i]); i++) {
        const fields = block.getElementsByTagName('field');
        for (let j = fields.length - 1, field; (field = fields[j]); j--) {
          if (field.getAttribute('name') != 'NAME') {
            block.removeChild(field);
          }
        }
      }

      const newText = Blockly.Xml.domToPrettyText(xml);
      assert.equal(newText, oldText);
    });
    test('Duplicate Params', () => {
      const oldText = '<xml xmlns="https://developers.google.com/blockly/xml">\n' +
          '  <variables>\n' +
          '    <variable id="|bfmCeh02-k|go!MeHd6">x</variable>\n' +
          '  </variables>\n' +
          '  <block type="procedures_defreturn" id="def" x="92" y="113">\n' +
          '    <mutation>\n' +
          '      <arg name="x" varid="|bfmCeh02-k|go!MeHd6"></arg>\n' +
          '      <arg name="x" varid="|bfmCeh02-k|go!MeHd6"></arg>\n' +
          '      <arg name="x" varid="|bfmCeh02-k|go!MeHd6"></arg>\n' +
          '    </mutation>\n' +
          '    <field name="NAME">do something</field>\n' +
          '    <comment pinned="false" h="80" w="160">' +
          '      Describe this function...' +
          '    </comment>\n' +
          '  </block>\n' +
          '  <block type="procedures_callreturn" id="call" x="92" y="227">\n' +
          '    <mutation name="do something">\n' +
          '      <arg name="x"></arg>\n' +
          '      <arg name="x"></arg>\n' +
          '      <arg name="x"></arg>\n' +
          '    </mutation>\n' +
          '  </block>\n' +
          '</xml>';
      Blockly.Xml.domToWorkspace(
          Blockly.Xml.textToDom(oldText), this.workspace);
      assertProc(this.workspace.getBlockById('def'),
          this.workspace.getBlockById('call'), 3, ['x', 'x', 'x']);
      const xml = Blockly.Xml.workspaceToDom(this.workspace);

      // Remove extra fields.
      const blocks = xml.getElementsByTagName('block');
      for (let i = 0, block; (block = blocks[i]); i++) {
        const fields = block.getElementsByTagName('field');
        for (let j = fields.length - 1, field; (field = fields[j]); j--) {
          if (field.getAttribute('name') != 'NAME') {
            block.removeChild(field);
          }
        }
      }

      const newText = Blockly.Xml.domToPrettyText(xml);
      assert.equal(newText, oldText);
    });
    test('No Statements', () => {
      const oldText = '<xml xmlns="https://developers.google.com/blockly/xml">\n' +
          '  <block type="procedures_defreturn" id="def" x="80" y="130">\n' +
          '    <mutation statements="false"></mutation>\n' +
          '    <field name="NAME">do something</field>\n' +
          '  </block>\n' +
          '  <block type="procedures_callreturn" id="call" x="86" y="209">\n' +
          '    <mutation name="do something"></mutation>\n' +
          '  </block>\n' +
          '</xml>';
      Blockly.Xml.domToWorkspace(
          Blockly.Xml.textToDom(oldText), this.workspace);
      assertProc(this.workspace.getBlockById('def'),
          this.workspace.getBlockById('call'), 0, [], false);
      const xml = Blockly.Xml.workspaceToDom(this.workspace);
      const newText = Blockly.Xml.domToPrettyText(xml);
      assert.equal(newText, oldText);
    });
  });
  suite('Adding and removing', () => {
    test('Add', () => {
      this.def.plus();
      assertProc(this.def, this.call, 1, ['x']);
    });
    test('Add lots', () => {
      for (let i = 0; i < 5; i++) {
        this.def.plus();
      }
      assertProc(this.def, this.call, 5, ['x', 'y', 'z', 'a', 'b']);
    });
    test('Add, no stack', () => {
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
      assertProc(def, this.workspace.getBlockById('call'), 1, ['x'], false);
    });
    test('Remove', () => {
      this.def.plus();
      this.def.minus(this.def.argData_[0].argId);
      assertProc(this.def, this.call, 0);
    });
    test('Remove lots', () => {
      for (let i = 0; i < 10; i++) {
        this.def.plus();
      }
      // Remove every other input. Must do it backwards so that the array
      // doesn't get out of whack.
      for (let i = 9; i > 0; i-=2) {
        this.def.minus(this.def.argData_[i].argId);
      }
      assertProc(this.def, this.call, 5, ['x', 'z', 'b', 'd', 'f']);
    });
    test('Remove w/ no args', () => {
      this.def.minus('whatevs');
      assertProc(this.def, this.call, 0);
    });
    test('Remove bad arg', () => {
      this.def.plus();
      this.def.minus('whatevs');
      assertProc(this.def, this.call, 1, ['x']);
    });
  });
  suite('Xml round-tripping', () => {
    setup(() => {
      this.assertRoundTrip = (def, call, func) => {
        func(def, call);
        const defXml = Blockly.Xml.blockToDom(def);
        const callXml = Blockly.Xml.blockToDom(call);
        const newDef = Blockly.Xml.domToBlock(defXml, this.workspace);
        const newCall = Blockly.Xml.domToBlock(callXml, this.workspace);
        func(newDef, newCall);
      };
    });
    teardown(() => {
      delete this.assertRoundTrip;
    });
    test('Unmutated', () => {
      this.assertRoundTrip(this.def, this.call, (def, call) => {
        assertProc(def, call, 0);
      });
    });
    test('Mutated', () => {
      this.def.plus();
      this.assertRoundTrip(this.def, this.call, (def, call) => {
        assertProc(this.def, this.call, 1, ['x']);
      });
    });
    test('Child attached', () => {
      const child1 = this.workspace.newBlock('logic_boolean');
      this.def.plus();
      this.call.getInput('ARG0').connection
          .connect(child1.outputConnection);
      this.assertRoundTrip(this.def, this.call, (def, call) => {
        assertProc(def, call, 1, ['x']);
        const child = call.getInputTargetBlock('ARG0');
        assert.isNotNull(child);
        assert.equal(child.type, 'logic_boolean');
      });
    });
    test('<> arg', () => {
      this.def.plus();
      const field = this.def.inputList[1].fieldRow[2];
      field.setValue('<>');
      this.assertRoundTrip(this.def, this.call, (def, call) => {
        assertProc(def, call, 1, ['<>']);
      });
    });
  });
  suite('Vars', () => {
    setup(() => {
      this.assertVars = function(constsArray) {
        const constNames = this.workspace.getVariablesOfType('').map(
            (model) => model.name );
        assert.sameMembers(constNames, constsArray);
      };
    });
    teardown(() => {
      delete this.assertVars;
    });

    suite('Renaming args', () => {
      test('Simple Rename', () => {
        this.def.plus();
        const field = this.def.inputList[1].fieldRow[2];
        field.setValue('newName');
        assertProc(this.def, this.call, 1, ['newName']);
        this.assertVars(['x', 'newName']);
      });
      test('Change Case', () => {
        this.def.plus();
        const field = this.def.inputList[1].fieldRow[2];
        field.setValue('X');
        assertProc(this.def, this.call, 1, ['X']);
        this.assertVars(['X']);
      });
      test('Empty', () => {
        this.def.plus();
        const field = this.def.inputList[1].fieldRow[2];
        field.setValue('');
        assertProc(this.def, this.call, 1, ['x']);
        this.assertVars(['x']);
      });
      test('Whitespace', () => {
        this.def.plus();
        const field = this.def.inputList[1].fieldRow[2];
        field.setValue('  newName   ');
        assertProc(this.def, this.call, 1, ['newName']);
        this.assertVars(['x', 'newName']);
      });
      test('Duplicate', () => {
        this.def.plus();
        this.def.plus();
        const field = this.def.inputList[1].fieldRow[2];
        field.setValue('y');
        assertProc(this.def, this.call, 2, ['x', 'y']);
        this.assertVars(['x', 'y']);
      });
      test('Duplicate Different Case', () => {
        this.def.plus();
        this.def.plus();
        const field = this.def.inputList[1].fieldRow[2];
        field.setValue('Y');
        assertProc(this.def, this.call, 2, ['x', 'y']);
        this.assertVars(['x', 'y']);
      });
      test('Match Existing', () => {
        this.workspace.createVariable('test', '');
        this.def.plus();
        const field = this.def.inputList[1].fieldRow[2];
        field.setValue('test');
        assertProc(this.def, this.call, 1, ['test']);
        this.assertVars(['x', 'test']);
        assert.equal(this.def.argData_[0].model.getId(),
            this.workspace.getVariable('test', '').getId());
      });
    });
    suite('Vars Renamed Elsewhere', () => {
      test('Simple Rename', () => {
        this.def.plus();
        const Variable = this.workspace.getVariable('x', '');
        this.workspace.renameVariableById(Variable.getId(), 'test');
        assertProc(this.def, this.call, 1, ['test']);
        this.assertVars(['test']);
      });
      // Don't know how we want to react here.
      test.skip('Duplicate', () => {
        this.def.plus();
        this.def.plus();
        const Variable = this.workspace.getVariable('x', '');
        this.workspace.renameVariableById(Variable.getId(), 'y');
        // Don't know what we want to have happen.
      });
      test('Change Case', () => {
        this.def.plus();
        const Variable = this.workspace.getVariable('x', '');
        this.workspace.renameVariableById(Variable.getId(), 'X');
        assertProc(this.def, this.call, 1, ['X']);
        this.assertVars(['X']);
      });
      test('Coalesce Change Case', () => {
        const variable = this.workspace.createVariable('test');
        this.def.plus();
        this.workspace.renameVariableById(variable.getId(), 'X');
        assertProc(this.def, this.call, 1, ['X']);
        this.assertVars(['X']);
      });
    });
  });
});
