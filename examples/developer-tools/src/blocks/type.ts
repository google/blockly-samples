/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';

interface TypeState {
  typeCount: number;
}

type TypeItemBlock = Blockly.Block & {valueConnection: Blockly.Connection};

/** Block representing a group of types. */
export const typeGroup = {
  init: function () {
    this.typeCount = 2;
    this.updateShape();
    this.setOutput(true, 'TypeArray');
    this.setMutator(new Blockly.icons.MutatorIcon(['type_group_item'], this));
    this.setStyle('type');
    this.setTooltip('Allows more than one type to be accepted.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=677');
  },
  saveExtraState: function (): TypeState {
    return {
      typeCount: this.typeCount,
    };
  },
  loadExtraState: function (extraState: TypeState) {
    this.typeCount = extraState.typeCount;
    this.updateShape();
  },
  decompose: function (workspace: Blockly.WorkspaceSvg) {
    // Populate the mutator's dialog with this block's components.
    const containerBlock = workspace.newBlock('type_group_container');
    containerBlock.initSvg();
    let connection = containerBlock.getInput('STACK').connection;
    for (let i = 0; i < this.typeCount; i++) {
      const typeBlock = workspace.newBlock('type_group_item');
      typeBlock.initSvg();
      connection.connect(typeBlock.previousConnection);
      connection = typeBlock.nextConnection;
    }
    return containerBlock;
  },
  compose: function (containerBlock: Blockly.BlockSvg) {
    // Reconfigure this block based on the mutator dialog's components.
    let typeBlock = containerBlock.getInputTargetBlock(
      'STACK',
    ) as TypeItemBlock;
    // Count number of inputs.
    const connections = [];
    while (typeBlock) {
      connections.push(typeBlock.valueConnection);
      typeBlock =
        typeBlock.nextConnection &&
        (typeBlock.nextConnection.targetBlock() as TypeItemBlock);
    }
    // Disconnect any children that don't belong.
    for (let i = 0; i < this.typeCount; i++) {
      const connection = this.getInput('TYPE' + i).connection.targetConnection;
      if (connection && connections.indexOf(connection) === -1) {
        connection.disconnect();
      }
    }
    this.typeCount = connections.length;
    this.updateShape();
    // Reconnect any child blocks.
    for (let i = 0; i < this.typeCount; i++) {
      connections[i]?.reconnect(this, 'TYPE' + i);
    }
  },
  saveConnections: function (containerBlock: Blockly.BlockSvg) {
    // Store a pointer to any connected child blocks.
    let typeBlock = containerBlock.getInputTargetBlock(
      'STACK',
    ) as TypeItemBlock;
    let i = 0;
    while (typeBlock) {
      const input = this.getInput('TYPE' + i);
      typeBlock.valueConnection = input && input.connection.targetConnection;
      i++;
      typeBlock =
        typeBlock.nextConnection &&
        (typeBlock.nextConnection.targetBlock() as TypeItemBlock);
    }
  },
  updateShape: function () {
    // Modify this block to have the correct number of inputs.
    // Add new inputs.
    let i = 0;
    for (i = 0; i < this.typeCount; i++) {
      if (!this.getInput('TYPE' + i)) {
        const input = this.appendValueInput('TYPE' + i);
        // Disallow chaining arrays of types together.
        input.setCheck('Type');
        if (i === 0) {
          input.appendField('any of');
        }
      }
    }
    // Remove deleted inputs.
    while (this.getInput('TYPE' + i)) {
      this.removeInput('TYPE' + i);
      i++;
    }
  },
};

/** Container block for the type group mutator. */
export const typeGroupContainer = {
  init: function () {
    this.appendDummyInput().appendField('add types');
    this.appendStatementInput('STACK');
    this.setStyle('type');
    this.setTooltip('Add or remove allowed type.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=677');
  },
};

/** Individual input block for the type group mutator. */
export const typeGroupItem = {
  init: function () {
    this.appendDummyInput().appendField('type');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setStyle('type');
    this.setTooltip('Add a new allowed type.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=677');
  },
};

const tooltip: Record<string, string> = {
  null: 'Any type is allowed.',
  Boolean: 'Booleans (true/false) are allowed.',
  Number: 'Numbers (int/float) are allowed.',
  String: 'Strings (text) are allowed.',
  Array: 'Arrays (lists) are allowed.',
  CUSTOM: 'Custom type to allow.',
};

/** Validator for type block dropdown. */
const adjustCustomTypeInput = function(value: string): undefined {
  const customTypeFieldName = 'CUSTOMTYPE';
  if (value === 'CUSTOM') {
    if (!this.getField(customTypeFieldName)) {
      this.getInput('TYPE').appendField(
        new Blockly.FieldTextInput(this.customType ?? ''),
        customTypeFieldName,
      );
    }
  } else {
    this.getInput('TYPE').removeField(customTypeFieldName, true);
  }
};

/** Block representing a single type. */
export const type = {
  init: function (this: Blockly.Block & {customType?: string}) {
    this.appendDummyInput('TYPE').appendField(
      new Blockly.FieldDropdown(
        [
          ['any', 'null'],
          ['Boolean', 'Boolean'],
          ['Number', 'Number'],
          ['String', 'String'],
          ['Array', 'Array'],
          ['other...', 'CUSTOM'],
        ],
        adjustCustomTypeInput.bind(this)
      ),
      'TYPEDROPDOWN',
    );
    this.setOutput(true, 'Type');
    this.setTooltip((): string => {
      const selectedType = this.getFieldValue('TYPEDROPDOWN');
      return tooltip[selectedType];
    });
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=602');
    this.setStyle('type');
  },
  saveExtraState: function () {
    if (this.getField('CUSTOMTYPE')) {
      return {customType: this.getFieldValue('CUSTOMTYPE')};
    }
  },
  loadExtraState: function (state: any) {
    this.customType = state?.customType;
    if (!this.getField('CUSTOMTYPE')) {
      this.getInput('TYPE').appendField(
        new Blockly.FieldTextInput(this.customType ?? ''),
        'CUSTOMTYPE',
      );
    }
  },
};
