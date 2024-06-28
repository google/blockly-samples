/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';

interface ConnectionCheckGroupState {
  checkCount: number;
}

type ConnectionCheckBlock = Blockly.Block & {
  valueConnection: Blockly.Connection;
};

/** Block representing a group of types. */
export const connectionCheckGroup = {
  init: function () {
    this.checkCount = 2;
    this.updateShape();
    this.setOutput(true, 'ConnectionCheckArray');
    this.setMutator(
      new Blockly.icons.MutatorIcon(['connection_check_group_item'], this),
    );
    this.setStyle('connectionCheck');
    this.setTooltip(
      'Allows more than one connection check string to be accepted.',
    );
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=677');
  },
  saveExtraState: function (): ConnectionCheckGroupState {
    return {
      checkCount: this.checkCount,
    };
  },
  loadExtraState: function (extraState: ConnectionCheckGroupState) {
    this.checkCount = extraState.checkCount;
    this.updateShape();
  },
  decompose: function (workspace: Blockly.WorkspaceSvg) {
    // Populate the mutator's dialog with this block's components.
    const containerBlock = workspace.newBlock(
      'connection_check_group_container',
    );
    containerBlock.initSvg();
    let connection = containerBlock.getInput('STACK').connection;
    for (let i = 0; i < this.checkCount; i++) {
      const itemBlock = workspace.newBlock('connection_check_group_item');
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },
  compose: function (containerBlock: Blockly.BlockSvg) {
    // Reconfigure this block based on the mutator dialog's components.
    let itemBlock = containerBlock.getInputTargetBlock(
      'STACK',
    ) as ConnectionCheckBlock;
    // Count number of inputs.
    const connections = [];
    while (itemBlock) {
      connections.push(itemBlock.valueConnection);
      itemBlock =
        itemBlock.nextConnection &&
        (itemBlock.nextConnection.targetBlock() as ConnectionCheckBlock);
    }
    // Disconnect any children that don't belong.
    for (let i = 0; i < this.checkCount; i++) {
      const connection = this.getInput('CHECK' + i).connection.targetConnection;
      if (connection && connections.indexOf(connection) === -1) {
        connection.disconnect();
      }
    }
    this.checkCount = connections.length;
    this.updateShape();
    // Reconnect any child blocks.
    for (let i = 0; i < this.checkCount; i++) {
      connections[i]?.reconnect(this, 'CHECK' + i);
    }
  },
  saveConnections: function (containerBlock: Blockly.BlockSvg) {
    // Store a pointer to any connected child blocks.
    let checkBlock = containerBlock.getInputTargetBlock(
      'STACK',
    ) as ConnectionCheckBlock;
    let i = 0;
    while (checkBlock) {
      const input = this.getInput('CHECK' + i);
      checkBlock.valueConnection = input && input.connection.targetConnection;
      i++;
      checkBlock =
        checkBlock.nextConnection &&
        (checkBlock.nextConnection.targetBlock() as ConnectionCheckBlock);
    }
  },
  updateShape: function () {
    // Modify this block to have the correct number of inputs.
    // Add new inputs.
    let i = 0;
    for (i = 0; i < this.checkCount; i++) {
      if (!this.getInput('CHECK' + i)) {
        const input = this.appendValueInput('CHECK' + i);
        // Disallow chaining arrays of types together.
        input.setCheck('ConnectionCheck');
        if (i === 0) {
          input.appendField('any of');
        }
      }
    }
    // Remove deleted inputs.
    while (this.getInput('CHECK' + i)) {
      this.removeInput('CHECK' + i);
      i++;
    }
  },
};

/** Container block for the type group mutator. */
export const connectionCheckContainer = {
  init: function () {
    this.appendDummyInput().appendField('add connection checks');
    this.appendStatementInput('STACK');
    this.setStyle('connectionCheck');
    this.setTooltip('Add or remove allowed connection check string.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=677');
  },
};

/** Individual input block for the type group mutator. */
export const connectionCheckItem = {
  init: function () {
    this.appendDummyInput().appendField('check');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setStyle('connectionCheck');
    this.setTooltip('Add a new allowed connection check string.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=677');
  },
};

const tooltip: Record<string, string> = {
  null: 'Any connection is allowed.',
  Boolean: 'Booleans (true/false) are allowed.',
  Number: 'Numbers (int/float) are allowed.',
  String: 'Strings (text) are allowed.',
  Array: 'Arrays (lists) are allowed.',
  CUSTOM: 'Custom connection check string to allow.',
};

/**
 * Validator for type block dropdown.
 *
 * @param value
 */
const adjustCustomCheckInput = function (value: string): undefined {
  const customCheckFieldName = 'CUSTOMCHECK';
  if (value === 'CUSTOM') {
    if (!this.getField(customCheckFieldName)) {
      this.getInput('CHECK').appendField(
        new Blockly.FieldTextInput(this.customCheck ?? ''),
        customCheckFieldName,
      );
    }
  } else {
    this.getInput('CHECK').removeField(customCheckFieldName, true);
  }
};

interface ConnectionCheckState {
  customCheck?: string;
}

/** Block representing a single type. */
export const connectionCheck = {
  init: function (this: Blockly.Block & {customCheck?: string}) {
    this.appendDummyInput('CHECK').appendField(
      new Blockly.FieldDropdown(
        [
          ['any', 'null'],
          ['Boolean', 'Boolean'],
          ['Number', 'Number'],
          ['String', 'String'],
          ['Array', 'Array'],
          ['other...', 'CUSTOM'],
        ],
        adjustCustomCheckInput.bind(this),
      ),
      'CHECKDROPDOWN',
    );
    this.setOutput(true, 'ConnectionCheck');
    this.setTooltip((): string => {
      const selectedType = this.getFieldValue('CHECKDROPDOWN');
      return tooltip[selectedType];
    });
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=602');
    this.setStyle('connectionCheck');
  },
  saveExtraState: function (): ConnectionCheckState {
    if (this.getField('CUSTOMCHECK')) {
      return {customCheck: this.getFieldValue('CUSTOMCHECK')};
    }
    return {};
  },
  loadExtraState: function (state: ConnectionCheckState) {
    this.customCheck = state?.customCheck;
    if (!this.getField('CUSTOMCHECK')) {
      this.getInput('CHECK').appendField(
        new Blockly.FieldTextInput(this.customCheck ?? ''),
        'CUSTOMCHECK',
      );
    }
  },
};
