/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';
import * as storage from '../storage';

/** Base of new block. */
export const factoryBase = {
  init: function () {
    this.setStyle('base');
    this.appendDummyInput()
      .appendField('name')
      .appendField(
        new Blockly.FieldTextInput('block_type', (name) =>
          this.validateName(name),
        ),
        'NAME',
      );
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
      function (option: string): undefined {
        this.getSourceBlock().updateShape(option);
        // Connect a shadow block to this new input.
        this.getSourceBlock().spawnOutputShadow(option);
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
        this.connectOutputShadow('OUTPUTCHECK');
        break;
      case 'TOP':
        this.connectOutputShadow('TOPCHECK');
        break;
      case 'BOTTOM':
        this.connectOutputShadow('BOTTOMCHECK');
        break;
      case 'BOTH':
        this.connectOutputShadow('TOPCHECK');
        this.connectOutputShadow('BOTTOMCHECK');
        break;
    }
  },
  connectOutputShadow: function (outputType: string) {
    // Helper method to create & connect shadow block.
    const connection = this.getInput(outputType).connection;
    const shadowState = {
      type: 'connection_check',
    };
    connection.setShadowState(shadowState);
  },
  updateShape: function (option: string) {
    const outputExists = this.getInput('OUTPUTCHECK');
    const topExists = this.getInput('TOPCHECK');
    const bottomExists = this.getInput('BOTTOMCHECK');
    if (option === 'LEFT') {
      if (!outputExists) {
        this.addConnectionCheckInput('OUTPUTCHECK', 'output connection check');
      }
    } else if (outputExists) {
      this.removeInput('OUTPUTCHECK');
    }
    if (option === 'TOP' || option === 'BOTH') {
      if (!topExists) {
        this.addConnectionCheckInput('TOPCHECK', 'top connection check');
      }
    } else if (topExists) {
      this.removeInput('TOPCHECK');
    }
    if (option === 'BOTTOM' || option === 'BOTH') {
      if (!bottomExists) {
        this.addConnectionCheckInput('BOTTOMCHECK', 'bottom connection check');
      }
    } else if (bottomExists) {
      this.removeInput('BOTTOMCHECK');
    }
  },
  addConnectionCheckInput: function (name: string, label: string) {
    this.appendValueInput(name)
      .setCheck(['ConnectionCheck', 'ConnectionCheckArray'])
      .appendField(label);
    this.moveInputBefore(name, 'COLOUR');
  },
  validateName: function (name: string): string | null {
    // Name cannot be an empty string.
    if (name === '') return null;

    // If the name is prohibited then it's never valid
    if (storage.getProhibitedBlockNames().has(name)) return null;

    // If the name is the currently-being-edited block it's always valid
    // This most often occurs when loading a block from storage and we're
    // currently deserializing a block for the first time.
    if (storage.getLastEditedBlockName() === name) return name;

    // Otherwise, it's invalid if the name is already in storage but it's not
    // the one we're currently editing
    if (storage.getAllSavedBlockNames().has(name)) return null;

    return name;
  },
};
