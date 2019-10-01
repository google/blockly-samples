import * as Blockly from 'blockly/core';
import BlocklyReactField from '../fields/BlocklyReactField';

Blockly.Blocks['test_react_field'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('custom field')
        .appendField(new BlocklyReactField('Click me'), 'FIELD');
    this.setStyle('loop_blocks');
  }
};
