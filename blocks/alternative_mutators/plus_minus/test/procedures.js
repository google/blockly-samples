const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');
const Blockly = require('blockly');

require('../dist/plus-minus-mutators.umd');

suite('procedures', () => {
  function assertProc(def, call, argCount, opt_args) {
    if (opt_args) {
      assert.sameOrderedMembers(def.arguments_, opt_args);
    }

    var defInputs = def.inputList;
    var callInputs = call.inputList;
    var defLength = defInputs.length;

    // Just looking at var inputs.
    assert.equal(defLength - 3, callInputs.length - 1,
        'def and call have the same number of args');
    assert.equal(defLength - 3, argCount,
        'blocks have the expected number of args');

    if (argCount == 0) {
      assert.notInclude(def.toString(), 'with');
      assert.notInclude(call.toString(), 'with');
      return;
    }

    assert.include(def.toString(), 'with');
    assert.include(call.toString(), 'with');

    for (var i = 1; i < defLength - 2; i++) {
      var varName = opt_args[i - 1];
      var defInput = defInputs[i];
      var callInput = callInputs[i];
      assert.equal(defInput.type, Blockly.DUMMY_INPUT);
      assert.equal(callInput.type, Blockly.INPUT_VALUE);
      assert.equal(defInput.name, def.argIds_[i - 1]);
      assert.equal(defInput.fieldRow[2].getValue(), varName,
          'Def vars did not match expected');
      assert.equal(callInput.name, 'ARG' + (i - 1));
      assert.equal(callInput.fieldRow[0].getValue(), varName,
          'Call vars did not match expected.');
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
      var oldText = '<xml xmlns="https://developers.google.com/blockly/xml">\n' +
          '  <variables>\n' +
          '    <variable id="O:Sr,z]cTdOh.rxYtbpK">x</variable>\n' +
          '    <variable id="b0khn,ShlhUP,dU}e+;-">y</variable>\n' +
          '    <variable id="@O5;lK8){`{*?=-t:Yxy">z</variable>\n' +
          '  </variables>\n' +
          '  <block type="procedures_defreturn" id="def" x="63" y="-477">\n' +
          '    <mutation>\n' +
          '      <arg name="x" varid="O:Sr,z]cTdOh.rxYtbpK"/>\n' +
          '      <arg name="y" varid="b0khn,ShlhUP,dU}e+;-"/>\n' +
          '      <arg name="z" varid="@O5;lK8){`{*?=-t:Yxy"/>\n' +
          '    </mutation>\n' +
          '    <field name="NAME">do something</field>\n' +
          '    <comment pinned="false" h="80" w="160">Describe this function...</comment>\n' +
          '  </block>\n' +
          '  <block type="procedures_callreturn" id="call" x="56" y="-282">\n' +
          '    <mutation name="do something">\n' +
          '      <arg name="x"/>\n' +
          '      <arg name="y"/>\n' +
          '      <arg name="z"/>\n' +
          '    </mutation>\n' +
          '  </block>\n' +
          '</xml>';
      Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(oldText), this.workspace);
      assertProc(this.workspace.getBlockById('def'),
          this.workspace.getBlockById('call'), 3, ['x', 'y', 'z']);
      var xml = Blockly.Xml.workspaceToDom(this.workspace);

      // Remove extra fields.
      var blocks = xml.getElementsByTagName('block');
      for (var i = 0, block; (block = blocks[i]); i++) {
        var fields = block.getElementsByTagName('field');
        for (var j = fields.length - 1, field; (field = fields[j]); j--) {
          if (field.getAttribute('name') != 'NAME') {
            block.removeChild(field);
          }
        }
      }

      var newText = Blockly.Xml.domToPrettyText(xml);
      assert.equal(newText, oldText);
    });
    test('Duplicate Params', () => {
      var oldText = '<xml xmlns="https://developers.google.com/blockly/xml">\n' +
          '  <variables>\n' +
          '    <variable id="|bfmCeh02-k|go!MeHd6">x</variable>\n' +
          '  </variables>\n' +
          '  <block type="procedures_defreturn" id="def" x="92" y="113">\n' +
          '    <mutation>\n' +
          '      <arg name="x" varid="|bfmCeh02-k|go!MeHd6"/>\n' +
          '      <arg name="x" varid="|bfmCeh02-k|go!MeHd6"/>\n' +
          '      <arg name="x" varid="|bfmCeh02-k|go!MeHd6"/>\n' +
          '    </mutation>\n' +
          '    <field name="NAME">do something</field>\n' +
          '    <comment pinned="false" h="80" w="160">Describe this function...</comment>\n' +
          '  </block>\n' +
          '  <block type="procedures_callreturn" id="call" x="92" y="227">\n' +
          '    <mutation name="do something">\n' +
          '      <arg name="x"/>\n' +
          '      <arg name="x"/>\n' +
          '      <arg name="x"/>\n' +
          '    </mutation>\n' +
          '  </block>\n' +
          '</xml>';
      Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(oldText), this.workspace);
      assertProc(this.workspace.getBlockById('def'),
          this.workspace.getBlockById('call'), 3, ['x', 'x', 'x']);
      var xml = Blockly.Xml.workspaceToDom(this.workspace);

      // Remove extra fields.
      var blocks = xml.getElementsByTagName('block');
      for (var i = 0, block; (block = blocks[i]); i++) {
        var fields = block.getElementsByTagName('field');
        for (var j = fields.length - 1, field; (field = fields[j]); j--) {
          if (field.getAttribute('name') != 'NAME') {
            block.removeChild(field);
          }
        }
      }

      var newText = Blockly.Xml.domToPrettyText(xml);
      assert.equal(newText, oldText);
    });
    test('No Statements', () => {
      var oldText = '<xml xmlns="https://developers.google.com/blockly/xml">\n' +
          '  <block type="procedures_defreturn" id="def" x="80" y="130">\n' +
          '    <mutation statements="false"/>\n' +
          '    <field name="NAME">do something</field>\n' +
          '  </block>\n' +
          '  <block type="procedures_callreturn" id="call" x="86" y="209">\n' +
          '    <mutation name="do something"/>\n' +
          '  </block>\n' +
          '</xml>';
      Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(oldText), this.workspace);
      assertProc(this.workspace.getBlockById('def'),
          this.workspace.getBlockById('call'), 0);
      var xml = Blockly.Xml.workspaceToDom(this.workspace);
      var newText = Blockly.Xml.domToPrettyText(xml);
      assert.equal(newText, oldText);
    });
  });
  suite('Adding and removing', () => {
    test('Add', () => {
      this.def.plus();
      assertProc(this.def, this.call, 1, ['x']);
    });
    test('Add lots', () => {
      for (var i = 0; i < 5; i++) {
        this.def.plus();
      }
      assertProc(this.def, this.call, 5, ['x', 'y', 'z', 'a', 'b']);
    });
    test('Remove', () => {
      this.def.plus();
      this.def.minus(this.def.argIds_[0]);
      assertProc(this.def, this.call, 0);
    });
    test('Remove lots', () => {
      for (var i = 0; i < 10; i++) {
        this.def.plus();
      }
      // Remove every other input. Must do it backwards so that the array
      // doesn't get out of whack.
      for (var i = 9; i > 0; i-=2) {
        this.def.minus(this.def.argIds_[i]);
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
        var defXml = Blockly.Xml.blockToDom(def);
        var callXml = Blockly.Xml.blockToDom(call);
        var newDef = Blockly.Xml.domToBlock(defXml, this.workspace);
        var newCall = Blockly.Xml.domToBlock(callXml, this.workspace);
        func(def, call);
      }
    });
    teardown(() => {
      delete this.assertRoundTrip;
    });
    test('Unmutated', () => {
      this.assertRoundTrip(this.def, this.call, (def, call) => {
        assertProc(def, call, 0);
      })
    });
    test('Mutated', () => {
      this.def.plus();
      this.assertRoundTrip(this.def, this.call, (def, call) => {
        assertProc(this.def, this.call, 1, ['x']);
      })
    });
    test('Child attached', () => {
      var child1 = this.workspace.newBlock('logic_boolean');
      this.def.plus();
      this.call.getInput('ARG0').connection
          .connect(child1.outputConnection);
      this.assertRoundTrip(this.def, this.call, (def, call) => {
        assertProc(def, call, 1, ['x']);
        var child = call.getInputTargetBlock('ARG0');
        assert.isNotNull(child);
        assert.equal(child.type, 'logic_boolean');
      })
    });
    test('<> arg', () => {
      this.def.plus();
      var field = this.def.inputList[1].fieldRow[2];
      field.setValue('<>');
      this.assertRoundTrip(this.def, this.call, (def, call) => {
        assertProc(def, call, 1, ['<>']);
      })
    });
  });
  suite('Vars', () => {
    setup(() => {
      this.assertVars = function(varsArray) {
        var varNames = this.workspace.getVariablesOfType('').map(
            model => model.name );
        assert.sameMembers(varNames, varsArray);
      };
    });
    teardown(() => {
      delete this.assertVars;
    });

    suite('Renaming args', () => {
      test('Simple Rename', () => {
        this.def.plus();
        var field = this.def.inputList[1].fieldRow[2];
        field.setValue('newName');
        assertProc(this.def, this.call, 1, ['newName']);
        this.assertVars(['x', 'newName']);
      });
      test('Change Case', () => {
        this.def.plus();
        var field = this.def.inputList[1].fieldRow[2];
        field.setValue('X');
        assertProc(this.def, this.call, 1, ['X']);
        this.assertVars(['X']);
      });
      test('Empty', () => {
        this.def.plus();
        var field = this.def.inputList[1].fieldRow[2];
        field.setValue('');
        assertProc(this.def, this.call, 1, ['x']);
        this.assertVars(['x']);
      });
      test('Whitespace', () => {
        this.def.plus();
        var field = this.def.inputList[1].fieldRow[2];
        field.setValue('  newName   ');
        assertProc(this.def, this.call, 1, ['newName']);
        this.assertVars(['x', 'newName']);
      });
      test('Duplicate', () => {
        this.def.plus();
        this.def.plus();
        var field = this.def.inputList[1].fieldRow[2];
        field.setValue('y');
        assertProc(this.def, this.call, 2, ['x', 'y']);
        this.assertVars(['x', 'y']);
      });
      test('Duplicate Different Case', () => {
        this.def.plus();
        this.def.plus();
        var field = this.def.inputList[1].fieldRow[2];
        field.setValue('Y');
        assertProc(this.def, this.call, 2, ['x', 'y']);
        this.assertVars(['x', 'y']);
      });
      test('Match Existing', () => {
        this.workspace.createVariable('test', '');
        this.def.plus();
        var field = this.def.inputList[1].fieldRow[2];
        field.setValue('test');
        assertProc(this.def, this.call, 1, ['test']);
        this.assertVars(['x', 'test']);
        assert.equal(this.def.varIds_[0],
            this.workspace.getVariable('test', '').getId());
      });
    });
    suite('Vars Renamed Elsewhere', () => {
      test('Simple Rename', () => {
        this.def.plus();
        var variable = this.workspace.getVariable('x', '');
        this.workspace.renameVariableById(variable.getId(), 'test');
        assertProc(this.def, this.call, 1, ['test']);
        this.assertVars(['test']);
      });
      // Don't know how we want to react here.
      test.skip('Duplicate', () => {
        this.def.plus();
        this.def.plus();
        var variable = this.workspace.getVariable('x', '');
        this.workspace.renameVariableById(variable.getId(), 'y');
        // Don't know what we want to have happen.
      });
      test('Change Case', () => {
        this.def.plus();
        var variable = this.workspace.getVariable('x', '');
        this.workspace.renameVariableById(variable.getId(), 'X');
        assertProc(this.def, this.call, 1, ['X']);
        this.assertVars(['X']);
      });
      test('Coalesce Change Case', () => {
        var variable = this.workspace.createVariable('test');
        this.def.plus();
        this.workspace.renameVariableById(variable.getId(), 'X');
        assertProc(this.def, this.call, 1, ['X']);
        this.assertVars(['X']);
      });
    });
  });
});
