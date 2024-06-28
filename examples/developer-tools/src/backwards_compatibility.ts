/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * This file contains methods that can convert blocks saved in the old
 * block factory tool that was hosted on app engine, into blocks that
 * can be used with this new tool.
 *
 * Many of the blocks from the old tool are the same as the blocks
 * in this tool. But in some cases, block, field, or input names have
 * been changed for clarity. This file will edit block json so that
 * the saved data from the old tool can be loaded into this tool.
 */

import * as Blockly from 'blockly/core';

/** Shadow state for a connection check block. */
const CONNECTION_CHECK_SHADOW = {
  type: 'connection_check',
  fields: {
    CHECKDROPDOWN: 'null',
  },
};

/**
 * The factory_base block is largely the same. However, the inputs that spawn
 * if the block has top/bottom/left connectors have been renamed from
 * `OUTPUTTYPE` to `OUTPUTCHECK`. The input blocks connected to this one
 * also need to be converted.
 *
 * @param oldBlock The JSON for the factory_base as saved from old tool.
 * @returns JSON that should be loaded instead.
 */
export function convertBaseBlock(
  oldBlock: Blockly.serialization.blocks.State,
): Blockly.serialization.blocks.State {
  if (oldBlock.type !== 'factory_base') {
    throw Error('Malformed block data');
  }

  const newBlock = {...oldBlock};
  // extraState from the old tool isn't relevant.
  delete newBlock.extraState;

  if (oldBlock.inputs?.INPUTS?.block) {
    newBlock.inputs.INPUTS.block = convertInput(oldBlock.inputs.INPUTS.block);
  }

  /**
   * Converts the top-level connection checks on the 'factory_base' block to the new level.
   *
   * @param connectionName Name of the input to create the connection check block for.
   */
  function convertFactoryBaseConnectionChecks(
    connectionName: 'OUTPUT' | 'TOP' | 'BOTTOM',
  ) {
    // The names of the input on the old and new blocks
    // e.g. 'OUTPUTTYPE' vs 'OUTPUTCHECK'
    const oldInputName = connectionName + 'TYPE';
    const newInputName = connectionName + 'CHECK';

    // If this input didn't exist in the old block, it also doesn't
    // exist on the new block. Nothing to do here.
    if (!oldBlock.inputs || !oldBlock.inputs[oldInputName]) return;

    const newCheckInput: Blockly.serialization.blocks.ConnectionState = {};
    // Shadow block always exists.
    newCheckInput.shadow = CONNECTION_CHECK_SHADOW;
    if (oldBlock.inputs[oldInputName].block) {
      // Real block only exists if it existed in the old block too.
      newCheckInput.block = convertCheck(oldBlock.inputs[oldInputName].block);
    }
    newBlock.inputs[newInputName] = newCheckInput;
    // New block doesn't need the input with the old name.
    delete newBlock.inputs[oldInputName];
  }

  convertFactoryBaseConnectionChecks('OUTPUT');
  convertFactoryBaseConnectionChecks('BOTTOM');
  convertFactoryBaseConnectionChecks('TOP');

  return newBlock;
}

/**
 * The input blocks are different. In the old tool, each type of input had its own
 * block definition. In this tool, there is one "input" block that has a dropdown
 * to select an input type. Also, the old blocks have a connection "type" while
 * the new blocks have a connection "check".
 *
 * @param oldBlock JSON for the "input_foo" block as saved from old tool.
 * @returns JSON that should be used for the replacement "input" block.
 */
function convertInput(
  oldBlock: Blockly.serialization.blocks.State,
): Blockly.serialization.blocks.State {
  const newBlock: Blockly.serialization.blocks.State = {
    type: 'input',
    fields: {
      INPUTTYPE: oldBlock.type,
    },
    inputs: {},
  };

  if (oldBlock.fields?.ALIGN) {
    // Note new name in new tool.
    newBlock.fields.ALIGNMENT = oldBlock.fields?.ALIGN;
  }

  if (oldBlock.fields?.INPUTNAME) {
    newBlock.fields.INPUTNAME = oldBlock.fields.INPUTNAME;
  }

  if (oldBlock.inputs?.TYPE) {
    newBlock.inputs.CHECK = {
      shadow: CONNECTION_CHECK_SHADOW,
    };
    if (oldBlock.inputs.TYPE.block) {
      newBlock.inputs.CHECK.block = convertCheck(oldBlock.inputs.TYPE.block);
    }
  }

  if (oldBlock.inputs?.FIELDS?.block) {
    newBlock.inputs.FIELDS = {
      block: convertField(oldBlock.inputs.FIELDS.block),
    };
  }

  if (oldBlock.next?.block) {
    newBlock.next = {
      block: convertInput(oldBlock.next.block),
    };
  }
  return newBlock;
}

/**
 * The field blocks are all mostly the same, with a few exceptions:
 * "field_static" in the old tool is called "field_label" here.
 * "field_dropdown"'s extraState uses xml in the old tool and json in the new tool.
 *
 * TODO(#2290): Check for backwards-compatibility issues with plugin fields.
 *
 * @param oldBlock JSON for the "field_foo" block as saved from old tool.
 * @returns JSON that should be used for the replacement field block.
 */
function convertField(
  oldBlock: Blockly.serialization.blocks.State,
): Blockly.serialization.blocks.State {
  const newBlock = {...oldBlock};
  if (oldBlock.type === 'field_static') {
    newBlock.type = 'field_label';
  }

  if (oldBlock.type === 'field_dropdown' && oldBlock.extraState) {
    const extraState = Blockly.utils.xml.textToDom(oldBlock.extraState);
    const options = JSON.parse(extraState.getAttribute('options'));
    newBlock.extraState = {
      options: options,
    };
  }
  if (oldBlock.next?.block) {
    newBlock.next.block = convertField(oldBlock.next.block);
  }
  return newBlock;
}

/**
 * The type/check blocks are different. In the old tool, each "type"
 * (e.g. Number or Boolean) had its own block definition. In this
 * tool, there is one "connection_check" block that has a dropdown
 * to select a check. We prefer the term "check" to "type" in all cases,
 * to match documentation and reduce the confusion between multiple meanings of "type".
 *
 * @param oldBlock JSON for the "type_foo" block as saved from old tool.
 * @returns JSON that should be used for the replacement "connection_check" block.
 */
function convertCheck(
  oldBlock: Blockly.serialization.blocks.State,
): Blockly.serialization.blocks.State {
  const oldName = oldBlock.type; // The block type i.e. name of block definition
  if (!oldName.startsWith('type_')) {
    throw Error(
      `Found connection check block with unexpected block type ${oldName}`,
    );
  }
  let connectionCheck = oldName.substring(5);
  switch (connectionCheck) {
    case 'null':
      // check value does not change if 'null'
      break;
    case 'boolean':
      connectionCheck = 'Boolean';
      break;
    case 'number':
      connectionCheck = 'Number';
      break;
    case 'string':
      connectionCheck = 'String';
      break;
    case 'list':
      connectionCheck = 'Array';
      break;
    case 'other':
      return convertCustomCheck(oldBlock);
    case 'group':
      return convertGroupCheck(oldBlock);
    default:
      throw Error(
        `Found connection check block with unexpected type: ${connectionCheck}`,
      );
  }
  return {
    type: 'connection_check',
    fields: {
      CHECKDROPDOWN: connectionCheck,
    },
  };
}

/**
 * Converts an old "type_other" block into a "check" block with custom value.
 *
 * @param oldBlock JSON for the "type_other" block as saved from old tool.
 * @returns JSON that should be used for the replacement "connection_check" block.
 */
function convertCustomCheck(
  oldBlock: Blockly.serialization.blocks.State,
): Blockly.serialization.blocks.State {
  const customCheck = oldBlock.fields.TYPE;
  return {
    type: 'connection_check',
    extraState: {
      customCheck: customCheck,
    },
    fields: {
      CHECKDROPDOWN: 'CUSTOM',
      CUSTOMCHECK: customCheck,
    },
  };
}

/**
 * Converts an old "type_group" block into a "connection_check_group" block.
 * The old block has inputs named `TYPE0`, `TYPE1`, etc. The new block renames
 * these inputs to `CHECK0`, `CHECK1`, etc.
 *
 * @param oldBlock JSON for the "type_group" block as saved from old tool.
 * @returns JSON that should be used for the replacement "connection_check" block.
 */
function convertGroupCheck(
  oldBlock: Blockly.serialization.blocks.State,
): Blockly.serialization.blocks.State {
  const inputs: Record<string, object> = {};
  const checkCount = parseInt(
    Blockly.utils.xml.textToDom(oldBlock.extraState).getAttribute('types'),
  );
  for (let index = 0; index < checkCount; index++) {
    if (oldBlock.inputs['TYPE' + index]?.block) {
      inputs['CHECK' + index] = {
        block: convertCheck(oldBlock.inputs['TYPE' + index].block),
      };
    }
  }
  return {
    type: 'connection_check_group',
    inputs: inputs,
    extraState: {
      checkCount: checkCount,
    },
  };
}
