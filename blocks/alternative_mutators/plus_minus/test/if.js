const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');
const Blockly = require('blockly');

require('../dist/plus-minus-mutators.umd');

suite('if & ifelse', () => {
  function assertIf(block, ifCount, hasElse) {
    var inputs = block.inputList;
    var length = inputs.length;
    assert.equal(length, hasElse ? ifCount * 2 + 1 : ifCount * 2);
    for (var i = 0; i < ifCount; i++) {
      assert.equal(inputs[i * 2].name, 'IF' + i);
      assert.equal(inputs[i * 2 + 1].name, 'DO' + i);
    }
    if (hasElse) {
      assert.equal(inputs[length - 1].name, 'ELSE');
    }
    if (ifCount == 1) {
      assert.isNull(block.getField('MINUS'));
    } else {
      assert.isNotNull(block.getField('MINUS'));
    }
  }

  setup(() => {
    this.workspace = new Blockly.Workspace();
    this.ifBlock = this.workspace.newBlock('controls_if');
  });
  suite('Serialization Matches Old', () => {
    setup(() => {
      this.workspace.clear();
    });
    test('No else', () => {
      var oldText = '<xml xmlns="https://developers.google.com/blockly/xml">\n' +
          '  <block type="controls_if" id="if" x="44" y="134">\n' +
          '    <mutation elseif="2"/>\n' +
          '  </block>\n' +
          '</xml>';
      Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(oldText), this.workspace);
      assertIf(this.workspace.getBlockById('if'), 3);
      var xml = Blockly.Xml.workspaceToDom(this.workspace);
      var newText = Blockly.Xml.domToPrettyText(xml);
      assert.equal(newText, oldText);
    });
    test('With else', () => {
      var oldText = '<xml xmlns="https://developers.google.com/blockly/xml">\n' +
          '  <block type="controls_if" id="if" x="44" y="134">\n' +
          '    <mutation elseif="2" else="1"/>\n' +
          '  </block>\n' +
          '</xml>';
      Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(oldText), this.workspace);
      assertIf(this.workspace.getBlockById('if'), 3, true);
      var xml = Blockly.Xml.workspaceToDom(this.workspace);
      var newText = Blockly.Xml.domToPrettyText(xml);
      assert.equal(newText, oldText);
    })
  });
  suite('Adding and removing inputs', () => {
    test('Add', () => {
      assertIf(this.ifBlock, 1);
      this.ifBlock.plus();
      assertIf(this.ifBlock, 2);
    });
    test('Add lots', () => {
      assertIf(this.ifBlock, 1);
      for (var i = 0; i < 9; i++) {
        this.ifBlock.plus()
      }
      assertIf(this.ifBlock, 10);
    });
    test('Remove nothing', () => {
      assertIf(this.ifBlock, 1);
      this.ifBlock.minus();
      assertIf(this.ifBlock, 1);
    });
    test('Remove', () => {
      assertIf(this.ifBlock, 1);
      this.ifBlock.plus();
      this.ifBlock.minus();
      assertIf(this.ifBlock, 1);
    });
    test('Remove lots', () => {
      assertIf(this.ifBlock, 1);
      for (var i = 0; i < 9; i++) {
        this.ifBlock.plus()
      }
      for (var i = 0; i < 5; i++) {
        this.ifBlock.minus()
      }
      assertIf(this.ifBlock, 5);
    });
    test('Remove attached', () => {
      var block = this.workspace.newBlock('logic_boolean');

      assertIf(this.ifBlock, 1);
      this.ifBlock.plus();
      this.ifBlock.getInput('IF1').connection
          .connect(block.outputConnection);
      assert.equal(this.ifBlock.getInputTargetBlock('IF1'), block);

      this.ifBlock.minus();
      assertIf(this.ifBlock, 1);
      assert.isNull(block.outputConnection.targetBlock());

      // Assert that it does not get reattached. Only reattach on undo.
      this.ifBlock.plus();
      assertIf(this.ifBlock, 2);
      assert.isNull(block.outputConnection.targetBlock());
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
      this.assertRoundTrip(this.ifBlock, (block) => {
        assertIf(block, 1);
      });
    });
    test('Else if', () => {
      this.ifBlock.plus();
      this.assertRoundTrip(this.ifBlock, (block) => {
        assertIf(block, 2);
      });
    });
    test('Attached block', () => {
      var childBlock = this.workspace.newBlock('logic_boolean');
      this.ifBlock.plus();
      this.ifBlock.getInput('IF1').connection
          .connect(childBlock.outputConnection);
      this.assertRoundTrip(this.ifBlock, (block) => {
        assertIf(block, 2);
        var child = block.getInputTargetBlock('IF1');
        assert.isNotNull(child);
        assert.equal(child.type, 'logic_boolean');
      })
    })
  });
});
