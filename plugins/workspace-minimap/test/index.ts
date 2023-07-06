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
const ws = Blockly.inject('primaryDiv', {toolbox: toolboxCategories});
const mp = new Minimap(ws);
mp.init();

// Creates 100 random blocks
for (let i = 0; i < 100; i++) {
  const prototype = 'controls_if';
  const block = ws.newBlock(prototype);
  block.initSvg();
  block.render();
}

// Move the blocks to random locations.
for (const block of ws.getAllBlocks(true)) {
  const cord = new Blockly.utils.Coordinate(
      Math.round(Math.random() * 450 + 40),
      Math.round(Math.random() * 600 + 40));
  block.moveTo(cord, ['drag']);
}
