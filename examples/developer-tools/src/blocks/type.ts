/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';

interface TypeState {
  typeCount: number;
}

type TypeItemBlock = Blockly.Block & {valueConnection: Blockly.Connection};

export const typeGroup = {
  // Group of types.
  init: function() {
    this.typeCount = 2;
    this.updateShape();
    this.setOutput(true, 'TypeArray');
    this.setMutator(new Blockly.icons.MutatorIcon(['type_group_item'], this));
    this.setColour(230);
    this.setTooltip('Allows more than one type to be accepted.');
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=677');
  },
  saveExtraState: function(): TypeState {
    return {
      typeCount: this.typeCount,
    };
  },
  loadExtraState: function(extraState: TypeState) {
    this.typeCount = extraState.typeCount;
    this.updateShape();
  },
  decompose: function(workspace: Blockly.WorkspaceSvg) {
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
  compose: function(containerBlock: Blockly.BlockSvg) {
    // Reconfigure this block based on the mutator dialog's components.
    let typeBlock = containerBlock.getInputTargetBlock('STACK') as TypeItemBlock;
    // Count number of inputs.
    const connections = [];
    while (typeBlock) {
      connections.push(typeBlock.valueConnection);
      typeBlock = typeBlock.nextConnection &&
          typeBlock.nextConnection.targetBlock() as TypeItemBlock;
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
  saveConnections: function(containerBlock: Blockly.BlockSvg) {
    // Store a pointer to any connected child blocks.
    let typeBlock = containerBlock.getInputTargetBlock('STACK') as TypeItemBlock;
    let i = 0;
    while (typeBlock) {
      const input = this.getInput('TYPE' + i);
      typeBlock.valueConnection = input && input.connection.targetConnection;
      i++;
      typeBlock = typeBlock.nextConnection &&
          typeBlock.nextConnection.targetBlock() as TypeItemBlock;
    }
  },
  updateShape: function() {
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

export const typeGroupContainer = {
  // Container.
  init: function() {
    this.jsonInit({
      'message0': 'add types %1 %2',
      'args0': [
        {'type': 'input_dummy'},
        {'type': 'input_statement', 'name': 'STACK'},
      ],
      'colour': 230,
      'tooltip': 'Add, or remove allowed type.',
      'helpUrl': 'https://www.youtube.com/watch?v=s2_xaEvcVI0#t=677',
    });
  },
};

export const typeGroupItem = {
  // Add type.
  init: function() {
    this.jsonInit({
      'message0': 'type',
      'previousStatement': null,
      'nextStatement': null,
      'colour': 230,
      'tooltip': 'Add a new allowed type.',
      'helpUrl': 'https://www.youtube.com/watch?v=s2_xaEvcVI0#t=677',
    });
  },
};

const tooltip: Record<string, string> = {
  'null': 'Any type is allowed.',
  'Boolean': 'Booleans (true/false) are allowed.',
  'Number': 'Numbers (int/float) are allowed.',
  'String': 'Strings (text) are allowed.',
  'Array': 'Arrays (lists) are allowed.',
  'CUSTOM': 'Custom type to allow.',
};

export const type = {
  init: function(this: Blockly.Block & {customType?: string}) {
    this.appendDummyInput('TYPE').appendField(new Blockly.FieldDropdown([
      ['any', 'null'],
      ['Boolean', 'Boolean'],
      ['Number', 'Number'],
      ['String', 'String'],
      ['Array', 'Array'],
      ['other...', 'CUSTOM'],
    ], (value: string): string => {
      const customType = 'CUSTOMTYPE';
      if (value === 'CUSTOM') {
        if (!this.getField(customType)) {
          this.getInput('TYPE').appendField(new Blockly.FieldTextInput(this.customType ?? ''), customType);
        }
      } else {
        this.getInput('TYPE').removeField(customType, true);
      }
      return value;
    }), 'TYPEDROPDOWN');
    this.setOutput(true, 'Type');
    this.setTooltip((): string => {
      const selectedType = this.getFieldValue('TYPEDROPDOWN');
      return tooltip[selectedType];
    });
    this.setHelpUrl('https://www.youtube.com/watch?v=s2_xaEvcVI0#t=602');
    this.setColour(230);
  },
  saveExtraState: function() {
    if (this.getField('CUSTOMTYPE')) {
      return {'customType': this.getFieldValue('CUSTOMTYPE')};
    }
  },
  loadExtraState: function(state: any) {
    this.customType = state?.customType;
    if (this.getFieldValue('TYPEDROPDOWN') === 'CUSTOM') {
      if (!this.getField('CUSTOMTYPE')) {
        this.getInput('TYPE').appendField(new Blockly.FieldTextInput(this.customType ?? ''), 'CUSTOMTYPE');
      }
    }
  },
};
