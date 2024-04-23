/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';
import * as storage from './storage';

/**
 * Saves the state of the workspace to browser's local storage.
 *
 * @param workspace Blockly workspace to save.
 * @param e Blockly event triggering the save.
 */
export function saveOnChange(
  workspace: Blockly.Workspace,
  e: Blockly.Events.Abstract,
) {
  // Don't save if we're in the middle of updating the block's name.
  if (isChangingBlockName(workspace, e)) return;

  if (isFinalBlockNameChange(workspace, e)) {
    // If we've changed the block name, make sure the new name is unused and delete the old name.
    const event = e as Blockly.Events.BlockChange;
    const oldName = event.oldValue as string;
    const newName = event.newValue as string;
    if (storage.getBlock(newName)) {
      // This case should only happen if the field name change was actually invalid
      // This fires an incorrect block_change event due to google/blockly#7966
      // Don't do anything; the field will revert to the old name if the user presses enter
      return;
    }
    storage.removeBlock(oldName);
  }

  const data = Blockly.serialization.workspaces.save(workspace);
  const blockName = workspace
    .getBlocksByType('factory_base')[0]
    .getFieldValue('NAME');
  storage.updateBlock(blockName, JSON.stringify(data));
}

/**
 * Loads saved state from storage into the given workspace.
 * Creates a new block if there is no state to load.
 *
 * @param workspace Blockly workspace to load into.
 * @param blockName Name of saved block to load. If unset, loads the last edited block instead.
 */
export function loadBlock(workspace: Blockly.Workspace, blockName?: string) {
  const block = blockName
    ? storage.getBlock(blockName)
    : storage.getLastEditedBlock();
  if (block) {
    Blockly.serialization.workspaces.load(JSON.parse(block), workspace);
  } else {
    createNewBlock(workspace);
  }
}

/**
 * Creates a new block from scratch.
 *
 * @param workspace Blockly workspace to load into.
 */
export function createNewBlock(workspace: Blockly.Workspace) {
  // Disable events so we don't save while deleting blocks.
  Blockly.Events.disable();
  workspace.clear();
  Blockly.Events.enable();

  const blockName = storage.getNewUnusedName();
  const startBlockJson = createStartBlock(blockName);
  Blockly.serialization.workspaces.load(startBlockJson, workspace);
}

/**
 * Creates the inital block factory block setup with the given name.
 *
 * @param name Initial name of the block.
 * @returns Block JSON representing the factory start blocks.
 */
function createStartBlock(name: string): object {
  return {
    blocks: {
      languageVersion: 0,
      blocks: [
        {
          type: 'factory_base',
          deletable: false,
          x: 53,
          y: 23,
          fields: {
            NAME: name,
            INLINE: 'AUTO',
            CONNECTIONS: 'NONE',
          },
          inputs: {
            TOOLTIP: {
              block: {
                type: 'text',
                deletable: false,
                movable: false,
                fields: {
                  TEXT: '',
                },
              },
            },
            HELPURL: {
              block: {
                type: 'text',
                deletable: false,
                movable: false,
                fields: {
                  TEXT: '',
                },
              },
            },
            COLOUR: {
              block: {
                type: 'colour_hue',
                fields: {
                  HUE: 230,
                },
              },
            },
          },
        },
      ],
    },
  };
}

/**
 * Checks if the event represents an in-progress change of a block's name.
 *
 * @param workspace Blockly workspace the event was for.
 * @param e The change event to check.
 * @returns true if the event is an intermediate field change
 *    that changes the block's name field, else false.
 */
function isChangingBlockName(
  workspace: Blockly.Workspace,
  e: Blockly.Events.Abstract,
) {
  if (e.type === Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE) {
    const event = e as Blockly.Events.BlockFieldIntermediateChange;
    if (
      workspace.getBlockById(event.blockId)?.type === 'factory_base' &&
      event.name === 'NAME'
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Checks if the event represents a completed change of a block's name.
 *
 * @param workspace Blockly workspace the event was for.
 * @param e The change event to check.
 * @returns true ifthe event was a block change event that changes the
 *    block's name field, else false.
 */
function isFinalBlockNameChange(
  workspace: Blockly.Workspace,
  e: Blockly.Events.Abstract,
) {
  if (e.type === Blockly.Events.BLOCK_CHANGE) {
    const event = e as Blockly.Events.BlockChange;
    if (
      workspace.getBlockById(event.blockId)?.type === 'factory_base' &&
      event.name === 'NAME'
    ) {
      return true;
    }
  }
  return false;
}
