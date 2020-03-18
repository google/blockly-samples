const assert = require('assert');
const Blockly = require('blockly');

require('../dist/plus-minus-mutators.umd');

suite('If Blocks', () => {
  setup(() => {
    this.workspace = new Blockly.Workspace();
  });
  test('test test', () => {
    var block = this.workspace.newBlock('controls_if');
  });
  test('fail test', () => {
    chai.assert.fail();
  });
});
