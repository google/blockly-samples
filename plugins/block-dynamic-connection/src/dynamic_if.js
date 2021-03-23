Blockly.Blocks['dynamic_if'] = {
  inputCounter: 1,
  minInputs: 1,
  /**
   * Block for concatenating any number of strings.
   * @this {Blockly.Block}
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg['CONTROLS_IF_HELPURL']);
    this.setStyle('logic_blocks');

    this.appendValueInput('IF0')
        .setCheck('Boolean')
        .appendField(Blockly.Msg['CONTROLS_IF_MSG_IF'], 'if');
    this.appendStatementInput('DO0');

    this.setTooltip(Blockly.Msg['LISTS_CREATE_WITH_TOOLTIP']);
  },

  findInputIndexForConnection: function(connection) {
    for (let i = 0; i < this.inputList.length; i++) {
      const input = this.inputList[i];
      if (input.connection == connection) {
        return i;
      }
    }
  },

  insertElseIf: function(index) {
    const caseNumber = this.inputCounter;
    this
        .appendValueInput('IF' + caseNumber)
        .setCheck('Boolean')
        .appendField(Blockly.Msg['CONTROLS_IF_MSG_ELSEIF'], 'elseif');
    this.appendStatementInput('DO' + caseNumber);
    this.moveInputBefore('IF' + caseNumber, this.inputList[index].name);
    this.moveInputBefore('DO' + caseNumber, this.inputList[index + 1].name);
    this.inputCounter++;
  },

  onPendingConnection: function(connection) {
    if (!this.getInput('ELSE')) {
      this.appendStatementInput('ELSE')
          .appendField(Blockly.Msg['CONTROLS_IF_MSG_ELSE'], 'else');
    }
    const inputIndex = this.findInputIndexForConnection(connection);
    const input = this.inputList[inputIndex];
    if (connection.targetConnection && input.name.includes('IF')) {
      const nextIfInput = this.inputList[inputIndex + 2];
      if (nextIfInput && nextIfInput.name == 'ELSE') {
        this.insertElseIf(inputIndex + 2);
      } else {
        const nextIfConnection = nextIfInput &&
          nextIfInput.connection.targetConnection;
        if (
          nextIfConnection &&
          !nextIfConnection.sourceBlock_.isInsertionMarker()
        ) {
          this.insertElseIf(inputIndex + 2);
        }
      }
    }
  },

  finalizeConnections: function() {
    const inputInfo = this.inputList.map((input) => {
      return {name: input.name, target: input.connection.targetConnection};
    });
    const toRemove = [];
    // Remove Else If inputs if neither the if nor the do has a connected block.
    for (let i = 2; i < inputInfo.length - 2; i += 2) {
      const ifConnection = inputInfo[i];
      const doConnection = inputInfo[i + 1];
      if (!ifConnection.target && !doConnection.target) {
        toRemove.push(ifConnection.name);
        toRemove.push(doConnection.name);
      }
    }
    toRemove.forEach((input) => this.removeInput(input));

    // Remove Else input if it doesn't have a connected block.
    const elseInput = inputInfo[inputInfo.length - 1];
    if (!elseInput.target) {
      this.removeInput(elseInput.name);
    }

    // Remove the If input if it is empty and there is at least one Else If
    if (this.inputList.length > 2 && this.inputList[2].name.includes('IF')) {
      if (!inputInfo[0].target && !inputInfo[1].target) {
        this.removeInput(inputInfo[0].name);
        this.removeInput(inputInfo[1].name);
        this.inputList[0].removeField('elseif');
        this.inputList[0].appendField(Blockly.Msg['CONTROLS_IF_MSG_IF'], 'if');
      }
    }
  },
};
