const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');
const Blockly = require('blockly');

require('../dist/plus-minus-mutators.umd');

suite('join', () => {
  function assertJoin(block, inputCount) {
    if (inputCount == 0) {
      assert.equal(block.inputList.length, 1);
      var input = block.inputList[0];
      assert.equal(input.type, Blockly.DUMMY_INPUT);
      assert.equal(input.name, 'EMPTY');
      assert.isNull(block.getField('MINUS'));
      // Easy way to test we're displaying quotes instead of normal text.
      assert.equal(block.toString(), "“ ”");
      return;
    }

    assert.equal(block.inputList.length, inputCount);
    for (var i = 0; i < inputCount; i++) {
      chai.assert.equal(block.inputList[i].name, 'ADD' + i);
    }
    assert.isNotNull(block.getField('MINUS'));
    // Easy way to test we're displaying normal text instead of quotes.
    assert.notEqual(block.toString(), "“ ”");
  }



  setup(() => {
    this.workspace = new Blockly.Workspace();
    this.joinBlock = this.workspace.newBlock('text_join');
  });
  suite('Creation', () => {
    test('Programmatic', () => {
      var joinBlock = this.workspace.newBlock('text_join');
      assertJoin(joinBlock, 2);
    });
    test('Empty XML', () => {
      var joinBlock = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
             '<block type="text_join"/>'
          ), this.workspace);
      assertJoin(joinBlock, 2);
    });
    test('0 items', () => {
      var joinBlock = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
          '<block type="text_join">' +
          '  <mutation items="0"/>' +
          '</block>'
      ), this.workspace);
      assertJoin(joinBlock, 0);
    });
    test('3 items', () => {
      var joinBlock = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
        '<block type="text_join">' +
        '  <mutation items="3"/>' +
        '</block>'
    ), this.workspace);
      assertJoin(joinBlock, 3);
    });
  });
  suite('Adding and removing inputs', () => {
    test('Add', () => {
      assertJoin(this.joinBlock, 2);
      this.joinBlock.plus();
      assertJoin(this.joinBlock, 3);
    });
    test('Add lots', () => {
      assertJoin(this.joinBlock, 2);
      for (var i = 0; i < 8; i++) {
        this.joinBlock.plus();
      }
      assertJoin(this.joinBlock, 10);
    });
    test('Remove', () => {
      assertJoin(this.joinBlock, 2);
      this.joinBlock.minus();
      assertJoin(this.joinBlock, 1);
    });
    test('Remove too many', () => {
      assertJoin(this.joinBlock, 2);
      for (var i = 0; i < 3; i++) {
        this.joinBlock.minus();
      }
      assertJoin(this.joinBlock, 0);
    });
    test('Remove lots', () => {
      assertJoin(this.joinBlock, 2);
      for (var i = 0; i < 8; i++) {
        this.joinBlock.plus();
      }
      for (var i = 0; i < 5; i++) {
        this.joinBlock.minus();
      }
      assertJoin(this.joinBlock, 5);
    });
    test('Remove attached', () => {
      var childBlock = this.workspace.newBlock('logic_boolean');
      assertJoin(this.joinBlock, 2);
      this.joinBlock.getInput('ADD1').connection
          .connect(childBlock.outputConnection);
      assert.equal(this.joinBlock.getInputTargetBlock('ADD1'), childBlock);
      this.joinBlock.minus();
      assert.isNull(this.joinBlock.getInputTargetBlock('ADD1'));
      assert.isNull(childBlock.outputConnection.targetBlock());
    });
  });
  suite('Xml round-tripping', () => {
    setup(() => {
      this.assertRoundTrip = (block, func) => {
        func(block);
        var xml = Blockly.Xml.blockToDom(block);
        var newBlock = Blockly.Xml.domToBlock(xml, this.workspace);
        func(block);
      }
    });

    test('Unmutated', () => {
      this.assertRoundTrip(this.joinBlock, (block) => {
        assertJoin(block, 2);
      })
    });
    test('Mutated', () => {
      this.joinBlock.plus();
      this.assertRoundTrip(this.joinBlock, (block) => {
        assertJoin(block, 3);
      })
    });
    test('Child attached', () => {
      var childBlock = this.workspace.newBlock('logic_boolean');
      this.joinBlock.plus();
      this.joinBlock.getInput('ADD2').connection
          .connect(childBlock.outputConnection);
      this.assertRoundTrip(this.joinBlock, (block) => {
        assertJoin(block, 3);
        assert.equal(block.getInputTargetBlock('ADD2'), childBlock);
      })
    });
  });
});
