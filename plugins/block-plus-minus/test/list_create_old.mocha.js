const chai = require('chai');
const assert = chai.assert;
const Blockly = require('blockly');

require('../dist/index');

suite.skip('list create', () => {
  /**
   * Asserts that the list block has the inptus and fields we expect.
   * @param {!Blockly.Block} block The list block.
   * @param {number} inputCount The number of inputs we expect.
   */
  function assertList(block, inputCount) {
    if (inputCount == 0) {
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

  setup(() => {
    this.workspace = new Blockly.Workspace();
    this.listBlock = this.workspace.newBlock('lists_create_with');
  });
  teardown(() => {
    this.workspace.dispose();
    delete this.workspace;
    delete this.listBlock;
  });
  suite('Serialization matches old', () => {
    setup(() => {
      this.workspace.clear();
    });
    test('Simple', () => {
      const oldText = '<xml xmlns="https://developers.google.com/blockly/xml">\n' +
          '  <block type="lists_create_with" id="list" x="128" y="173">\n' +
          '    <mutation items="5"></mutation>\n' +
          '  </block>\n' +
          '</xml>';
      Blockly.Xml.domToWorkspace(
          Blockly.Xml.textToDom(oldText), this.workspace);
      assertList(this.workspace.getBlockById('list'), 5);
      const xml = Blockly.Xml.workspaceToDom(this.workspace);
      const newText = Blockly.Xml.domToPrettyText(xml);
      assert.equal(newText, oldText);
    });
    test('No mutation', () => {
      const given = '<xml xmlns="https://developers.google.com/blockly/xml">\n' +
          '  <block type="lists_create_with" id="list" x="128" y="173">' +
          '  </block>\n' +
          '</xml>';
      const expected = '<xml xmlns="https://developers.google.com/blockly/xml">\n' +
          '  <block type="lists_create_with" id="list" x="128" y="173">\n' +
          '    <mutation items="3"></mutation>\n' +
          '  </block>\n' +
          '</xml>';
      Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(given), this.workspace);
      assertList(this.workspace.getBlockById('list'), 3);
      const xml = Blockly.Xml.workspaceToDom(this.workspace);
      const newText = Blockly.Xml.domToPrettyText(xml);
      assert.equal(newText, expected);
    });
    test('No inputs', () => {
      const oldText = '<xml xmlns="https://developers.google.com/blockly/xml">\n' +
          '  <block type="lists_create_with" id="list" x="128" y="173">\n' +
          '    <mutation items="0"></mutation>\n' +
          '  </block>\n' +
          '</xml>';
      Blockly.Xml.domToWorkspace(
          Blockly.Xml.textToDom(oldText), this.workspace);
      assertList(this.workspace.getBlockById('list'), 0);
      const xml = Blockly.Xml.workspaceToDom(this.workspace);
      const newText = Blockly.Xml.domToPrettyText(xml);
      assert.equal(newText, oldText);
    });
  });
  suite('Creation', () => {
    test('Programmatic', () => {
      const listBlock = this.workspace.newBlock('lists_create_with');
      assertList(listBlock, 3);
    });
    test('Empty XML', () => {
      const listBlock = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
          '<block type="lists_create_with"/>'
      ), this.workspace);
      assertList(listBlock, 3);
    });
    test('0 items', () => {
      const listBlock = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
          '<block type="lists_create_with">' +
          '  <mutation items="0"/>' +
          '</block>'
      ), this.workspace);
      assertList(listBlock, 0);
    });
    test('4 items', () => {
      const listBlock = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
          '<block type="lists_create_with">' +
          '  <mutation items="4"/>' +
          '</block>'
      ), this.workspace);
      assertList(listBlock, 4);
    });
  });
  suite('Adding and removing inputs', () => {
    test('Add', () => {
      assertList(this.listBlock, 3);
      this.listBlock.plus();
      assertList(this.listBlock, 4);
    });
    test('Add lots', () => {
      assertList(this.listBlock, 3);
      for (let i = 0; i < 7; i++) {
        this.listBlock.plus();
      }
      assertList(this.listBlock, 10);
    });
    test('Remove', () => {
      assertList(this.listBlock, 3);
      this.listBlock.minus();
      assertList(this.listBlock, 2);
    });
    test('Remove too many', () => {
      assertList(this.listBlock, 3);
      for (let i = 0; i < 4; i++) {
        this.listBlock.minus();
      }
      assertList(this.listBlock, 0);
    });
    test('Remove lots', () => {
      assertList(this.listBlock, 3);
      for (let i = 0; i < 7; i++) {
        this.listBlock.plus();
      }
      for (let i = 0; i < 5; i++) {
        this.listBlock.minus();
      }
      assertList(this.listBlock, 5);
    });
    test('Remove attached', () => {
      const childBlock = this.workspace.newBlock('logic_boolean');
      assertList(this.listBlock, 3);
      this.listBlock.getInput('ADD2').connection
          .connect(childBlock.outputConnection);
      assert.equal(this.listBlock.getInputTargetBlock('ADD2'), childBlock);
      this.listBlock.minus();
      assert.isNull(this.listBlock.getInputTargetBlock('ADD2'));
      assert.isNull(childBlock.outputConnection.targetBlock());
    });
  });
  suite('Xml round-tripping', () => {
    setup(() => {
      this.assertRoundTrip = (block, func) => {
        func(block);
        const xml = Blockly.Xml.blockToDom(block);
        const newBlock = Blockly.Xml.domToBlock(xml, this.workspace);
        func(newBlock);
      };
    });
    teardown( () => {
      delete this.assertRoundTrip;
    });

    test('Unmutated', () => {
      this.assertRoundTrip(this.listBlock, (block) => {
        assertList(block, 3);
      });
    });
    test('Mutated', () => {
      this.listBlock.plus();
      this.assertRoundTrip(this.listBlock, (block) => {
        assertList(block, 4);
      });
    });
    test('Child attached', () => {
      const childBlock = this.workspace.newBlock('logic_boolean');
      this.listBlock.plus();
      this.listBlock.getInput('ADD3').connection
          .connect(childBlock.outputConnection);
      this.assertRoundTrip(this.listBlock, (block) => {
        assertList(block, 4);
        const child = block.getInputTargetBlock('ADD3');
        assert.isNotNull(child);
        assert.equal(child.type, 'logic_boolean');
      });
    });
  });
});
