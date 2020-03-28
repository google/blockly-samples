const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');
const Blockly = require('blockly');

require('../dist/plus-minus-mutators.umd');

suite('if & ifelse', () => {
  function assertIf(block, ifCount, hasElse) {
    if (hasElse == undefined) hasElse = true;
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
    this.ifelseBlock = this.workspace.newBlock('controls_ifelse');
  });
  suite('Serialization Matches Old', () => {
    test('No else', () => {
      this.workspace.clear();
      var oldText = '<xml xmlns="https://developers.google.com/blockly/xml">\n' +
          '  <block type="controls_if" id="if" x="44" y="134">\n' +
          '    <mutation elseif="2"/>\n' +
          '  </block>\n' +
          '</xml>';
      Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(oldText), this.workspace);
      assertIf(this.workspace.getBlockById('if'), 3, false);
      var xml = Blockly.Xml.workspaceToDom(this.workspace);
      var newText = Blockly.Xml.domToPrettyText(xml);
      assert.equal(newText, oldText);
    });
    test('With else', () => {
      this.workspace.clear();
      var oldText = '<xml xmlns="https://developers.google.com/blockly/xml">\n' +
          '  <block type="controls_if" id="if" x="44" y="134">\n' +
          '    <mutation elseif="2" else="1"/>\n' +
          '  </block>\n' +
          '</xml>';
      Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(oldText), this.workspace);
      assertIf(this.workspace.getBlockById('if'), 3);
      var xml = Blockly.Xml.workspaceToDom(this.workspace);
      var newText = Blockly.Xml.domToPrettyText(xml);
      assert.equal(newText, oldText);
    })
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
      assert.equal(this.ifelseBlock.getInputTargetBlock('IF1'), block);

      this.ifelseBlock.minus();
      assertIf(this.ifelseBlock, 1);
      assert.isNull(block.outputConnection.targetBlock());

      // Assert that it does not get reattached. Only reattach on undo.
      this.ifelseBlock.plus();
      assertIf(this.ifelseBlock, 2);
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
        var child = block.getInputTargetBlock('IF1');
        assert.isNotNull(child);
        assert.equal(child.type, 'logic_boolean');
      })
    })
  });
});
