/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Game logic for music game.
 */

import Blockly from 'blockly/core';
import {speaker} from './speaker';
import {toolboxPitch} from './music_blocks';

/**
 * Game logic for music game.
 */
export class Music {
  /**
   * Class for a music game.
   * @constructor
   */
  constructor() {
    /**
     * The Blockly workspace associated with this game.
     * @type {!Blockly.WorkspaceSvg}
     */
    this.workspace = this.createWorkspace_();

    /**
     * The HTML element containing the goal text for the game.
     * @type {HTMLElement}
     */
    this.goalTextElement_ = document.getElementById('goalText');
  }

  /**
   * Initializes the Blockly workspace.
   * @return {!Blockly.WorkspaceSvg} The Blockly workspace.
   * @private
   */
  createWorkspace_() {
    // Initialize Blockly workspace.
    const blocklyDiv = document.getElementById('blocklyDiv');
    const workspace = Blockly.inject(blocklyDiv, {
      toolbox: toolboxPitch,
    });
    workspace.addChangeListener((event) => speaker.nodeToSpeech(event));
    return workspace;
  }

  /**
   * Sets the goal text.
   * @param {string} text The text to set the goal to.
   */
  setGoalText(text) {
    this.goalTextElement_.innerHTML = text;
  }
}
