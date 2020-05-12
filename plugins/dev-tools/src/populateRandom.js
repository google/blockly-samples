/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Helper for randomly populating a workspace.
 * @author fenichel@google.com (Rachel Fenichel)
 */
import Blockly from 'blockly/core';

/**
 * Populate the workspace with a random set of blocks, for testing.
 * @param {Blockly.Workspace} workspace The workspace to populate.
 * @param {number} count How many blocks to create.
 */
export function populateRandom(workspace, count) {
  const names = [];
  for (const blockName in Blockly.Blocks) {
    if (Object.prototype.hasOwnProperty.call(Blockly.Blocks, blockName)) {
      names.push(blockName);
    }
  }

  for (let i = 0; i < count; i++) {
    const name = names[Math.floor(Math.random() * names.length)];
    const block = workspace.newBlock(name);
    block.initSvg();
    block.getSvgRoot().setAttribute('transform', 'translate(' +
        Math.round(Math.random() * 450 + 40) + ', ' +
        Math.round(Math.random() * 600 + 40) + ')');
    block.render();
  }
}

/**
 * Add a button to randomly populate the workspace.
 * @param {Blockly.Workspace} workspace The workspace to add blocks to.
 * @param {Element} location Where to append the new button.
 * @param {number} count How many blocks to create.
 * @return {Element} The new button.
 * @package
 */
export function populateRandomButton(workspace, location, count) {
  const button = document.createElement('input');
  button.type = 'button';
  button.id = 'populateRandomBtn';
  button.value = 'Add random blocks!';
  button.onclick = function() {
    populateRandom(workspace, count);
  };

  location.appendChild(button);
  return button;
}
