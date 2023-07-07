/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Plugin test.
 */

import * as Blockly from 'blockly';
import {toolboxCategories, createPlayground} from '@blockly/dev-tools';
import {Minimap, PositionedMinimap} from '../src/index';

// Creates the primary workspace and adds the minimap.
const workspace = Blockly.inject('primaryDiv', {toolbox: toolboxCategories});
const minimap = new Minimap(workspace);
minimap.init();

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
