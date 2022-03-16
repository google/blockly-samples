/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly/core';
/**
 * Convert block to save info
 * @param {Blockly.block} block The block you want to convert
 * @return {object} save_info
 */
export function convertBlockToSaveInfo(block) {
  return {
    saveInfo: Blockly.serialization.blocks.save(
        block, {addCoordinates: true, addNextBlocks: false}),
    typeCounts: Blockly.common.getBlockTypeCounts(block, true),
  };
}
