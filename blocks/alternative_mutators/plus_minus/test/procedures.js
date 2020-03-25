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
  suite('Renaming args', () => {
    setup(() => {
      this.assertVars = function(varsArray) {
        var varNames = this.workspace.getVariablesOfType('').map(
            model => model.name );
        console.log(varNames);
        assert.sameMembers(varNames, varsArray);
      };
    });

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
  })
});
