const chai = require('chai');
const sinon = require('sinon');
const Blockly = require('blockly');

require('../dist/plus-minus-mutators.umd');

suite('if & ifelse', () => {
  function assertIf(block, ifCount) {
    var hasElse = block.type == 'controls_ifelse';
    var inputs = block.inputList;
    var length = inputs.length;
    chai.assert.equal(length, hasElse ? ifCount * 2 + 1 : ifCount * 2);
    for (var i = 0; i < ifCount; i++) {
      chai.assert.equal(inputs[i * 2].name, 'IF' + i);
      chai.assert.equal(inputs[i * 2 + 1].name, 'DO' + i);
    }
    if (hasElse) {
      chai.assert.equal(inputs[length - 1].name, 'ELSE');
    }
    if (ifCount == 1) {
      chai.assert.isNull(block.getField('MINUS'));
    } else {
      chai.assert.isNotNull(block.getField('MINUS'));
    }
  }

  setup(() => {
    this.workspace = new Blockly.Workspace();
    this.ifBlock = this.workspace.newBlock('controls_if');
    this.ifelseBlock = this.workspace.newBlock('controls_ifelse');
    this.clock = sinon.useFakeTimers();
  });
  suite('Adding and removing inputs', () => {
    test('Add', () => {
      assertIf(this.ifelseBlock, 1);
      this.ifelseBlock.plus();
      assertIf(this.ifelseBlock, 2);
    });
    test('Add lots', () => {
      assertIf(this.ifelseBlock, 1);
      for (var i = 0; i < 9; i++) {
        this.ifelseBlock.plus()
      }
      assertIf(this.ifelseBlock, 10);
    });
    test('Remove nothing', () => {
      assertIf(this.ifelseBlock, 1);
      this.ifelseBlock.minus();
      assertIf(this.ifelseBlock, 1);
    });
    test('Remove', () => {
      assertIf(this.ifelseBlock, 1);
      this.ifelseBlock.plus();
      this.ifelseBlock.minus();
      assertIf(this.ifelseBlock, 1);
    });
    test('Remove lots', () => {
      assertIf(this.ifelseBlock, 1);
      for (var i = 0; i < 9; i++) {
        this.ifelseBlock.plus()
      }
      for (var i = 0; i < 5; i++) {
        this.ifelseBlock.minus()
      }
      assertIf(this.ifelseBlock, 5);
    });
    test('Remove attached', () => {
      var block = this.workspace.newBlock('logic_boolean');

      assertIf(this.ifelseBlock, 1);
      this.ifelseBlock.plus();
      this.ifelseBlock.getInput('IF1').connection
          .connect(block.outputConnection);
      chai.assert.equal(this.ifelseBlock.getInputTargetBlock('IF1'), block);

      this.ifelseBlock.minus();
      assertIf(this.ifelseBlock, 1);
      chai.assert.isNull(block.outputConnection.targetBlock());

      // Assert that it does not get reattached. Only reattach on undo.
      this.ifelseBlock.plus();
      assertIf(this.ifelseBlock, 2);
      chai.assert.isNull(block.outputConnection.targetBlock());
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
      this.assertRoundTrip(this.ifelseBlock, (block) => {
        assertIf(block, 1);
      });
    });
    test('Else if', () => {
      this.ifelseBlock.plus();
      this.assertRoundTrip(this.ifelseBlock, (block) => {
        assertIf(block, 2);
      });
    });
    test('Attached block', () => {
      var childBlock = this.workspace.newBlock('logic_boolean');
      this.ifelseBlock.plus();
      this.ifelseBlock.getInput('IF1').connection
          .connect(childBlock.outputConnection);
      this.assertRoundTrip(this.ifelseBlock, (block) => {
        assertIf(block, 2);
        chai.assert.equal(block.getInputTargetBlock('IF1'), childBlock);
      })
    })
  });
});
