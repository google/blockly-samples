/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Plugin test.
 */

import * as Blockly from 'blockly';
import {toolboxCategories} from '@blockly/dev-tools';
import {Minimap, PositionedMinimap} from '../src/index';

// Creates the primary workspace and adds the minimap.
const positionedWorkspace = Blockly.inject('positionedRoot',
    {toolbox: toolboxCategories});
const positionedMinimap = new PositionedMinimap(positionedWorkspace);
positionedMinimap.init();

// Creates the primary workspace and adds the minimap.
// const unpositionedWorkspace = Blockly.inject('unpositionedRoot',
//     {toolbox: toolboxCategories});
// const unpositionedMinimap = new Minimap(unpositionedWorkspace);
// unpositionedMinimap.init();


const seedTest = (workspace: Blockly.WorkspaceSvg): void => {
  // Creates 100 if blocks
  for (let i = 0; i < 100; i++) {
    const block = workspace.newBlock('controls_if');
    block.initSvg();
    block.render();
  }

  // Move the blocks to random locations.
  for (const block of workspace.getAllBlocks(true)) {
    const cord = new Blockly.utils.Coordinate(
        Math.round(Math.random() * 450 + 40),
        Math.round(Math.random() * 600 + 40));
    block.moveTo(cord);
  }
};
