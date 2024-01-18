/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';

export const factoryBase = {
  // Base of new block.
  init: function () {
    this.setStyle('base');
    this.appendDummyInput()
      .appendField('name')
      .appendField(new Blockly.FieldTextInput('block_type'), 'NAME');
    this.appendStatementInput('INPUTS').setCheck('Input').appendField('inputs');
    const inputsDropdown = new Blockly.FieldDropdown([
      ['automatic inputs', 'AUTO'],
      ['external inputs', 'EXT'],
      ['inline inputs', 'INT'],
    ]);
    this.appendDummyInput().appendField(inputsDropdown, 'INLINE');
    const connectionsDropdown = new Blockly.FieldDropdown(
      [
        ['no connections', 'NONE'],
        ['← left output', 'LEFT'],
        ['↕ top+bottom connections', 'BOTH'],
        ['↑ top connection', 'TOP'],
        ['↓ bottom connection', 'BOTTOM'],
      ],
      function (option: string): string {
        this.getSourceBlock().updateShape(option);
        // Connect a shadow block to this new input.
        this.getSourceBlock().spawnOutputShadow(option);
        return option;
      },
    );
    this.appendDummyInput().appendField(connectionsDropdown, 'CONNECTIONS');
    this.appendValueInput('TOOLTIP').setCheck('String').appendField('tooltip');
    this.appendValueInput('HELPURL').setCheck('String').appendField('help url');
    this.appendValueInput('COLOUR').setCheck('Colour').appendField('colour');
    this.setTooltip(
      'Build a custom block by plugging\n' +
        'fields, inputs and other blocks here.',
    );
    this.setHelpUrl(
      'https://developers.google.com/blockly/guides/create-custom-blocks/block-factory',
    );
  },
  spawnOutputShadow: function (option: string) {
    // Helper method for deciding which type of outputs this block needs
    // to attach shadow blocks to.
    switch (option) {
      case 'LEFT':
        this.connectOutputShadow('OUTPUTTYPE');
        break;
      case 'TOP':
        this.connectOutputShadow('TOPTYPE');
        break;
      case 'BOTTOM':
        this.connectOutputShadow('BOTTOMTYPE');
        break;
      case 'BOTH':
        this.connectOutputShadow('TOPTYPE');
        this.connectOutputShadow('BOTTOMTYPE');
        break;
    }
  },
  connectOutputShadow: function (outputType: string) {
    // Helper method to create & connect shadow block.
    const connection = this.getInput(outputType).connection;
    const shadowState = {
      type: 'type',
    };
    connection.setShadowState(shadowState);
  },
  updateShape: function (option: string) {
    const outputExists = this.getInput('OUTPUTTYPE');
    const topExists = this.getInput('TOPTYPE');
    const bottomExists = this.getInput('BOTTOMTYPE');
    if (option === 'LEFT') {
      if (!outputExists) {
        this.addTypeInput('OUTPUTTYPE', 'output type');
      }
    } else if (outputExists) {
      this.removeInput('OUTPUTTYPE');
    }
    if (option === 'TOP' || option === 'BOTH') {
      if (!topExists) {
        this.addTypeInput('TOPTYPE', 'top type');
      }
    } else if (topExists) {
      this.removeInput('TOPTYPE');
    }
    if (option === 'BOTTOM' || option === 'BOTH') {
      if (!bottomExists) {
        this.addTypeInput('BOTTOMTYPE', 'bottom type');
      }
    } else if (bottomExists) {
      this.removeInput('BOTTOMTYPE');
    }
  },
  addTypeInput: function (name: string, label: string) {
    this.appendValueInput(name)
      .setCheck(['Type', 'TypeArray'])
      .appendField(label);
    this.moveInputBefore(name, 'COLOUR');
  },
};
