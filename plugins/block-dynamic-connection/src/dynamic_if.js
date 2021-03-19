Blockly.Blocks['dynamic_if'] = {
  inputCounter: 0,
  minInputs: 0,
  /**
   * Block for concatenating any number of strings.
   * @this {Blockly.Block}
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg['CONTROLS_IF_HELPURL']);
    this.setStyle('logic_blocks');

    this.appendValueInput('IF0').appendField(Blockly.Msg['CONTROLS_IF_MSG_IF']);
    this
        .appendStatementInput('DO0')
        .appendField(Blockly.Msg['CONTROLS_IF_MSG_THEN']);
    this
        .appendStatementInput('ELSE')
        .appendField(Blockly.Msg['CONTROLS_IF_MSG_ELSE']);

    this.setTooltip(Blockly.Msg['LISTS_CREATE_WITH_TOOLTIP']);
  },
};
