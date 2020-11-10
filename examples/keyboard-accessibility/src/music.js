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

    /**
     * The currently loaded level. 0 if no level loaded.
     */
    this.level = 0;
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

  /**
   * Update the goal based on the current level.
   * @private
   */
  updateGoalText_() {
    let goalText = '';
    switch (this.level) {
      case 1:
        goalText = 'Play c4 d4 e4 c4';
        break;
    }
    this.setGoalText(goalText);
  }

  /**
   * Update the toolbox based on the current level.
   * @private
   */
  updateToolbox_() {
    let toolboxJson = toolboxPitch; // Use toolboxPitch as default.
    if (this.level < 6) {
      toolboxJson = {
        'kind': 'flyoutToolbox',
        'contents': [
          {
            'kind': 'block',
            'type': 'pitch_test',
          },

          {
            'kind': 'block',
            'type': 'music_pitch',
          },
          {
            'kind': 'block',
            'type': 'music_note',
          },
          {
            'kind': 'block',
            'type': 'music_rest_whole',
          },
          {
            'kind': 'block',
            'type': 'music_rest',
          },
          {
            'kind': 'block',
            'type': 'music_instrument',
          },
        ],
      };
    }
    this.workspace.updateToolbox(toolboxJson);
  }

  /**
   * Update the workspace blocks based on the current level.
   * @private
   */
  loadLevelBlocks_() {
    this.workspace.clear();
    let levelXml = '';
    if (this.level < 6) {
      levelXml =
          `<xml>
            <block type="music_start" deletable="${this.level > 6}" x="180" 
            y="50"></block>
          </xml>`;
    }
    if (levelXml) {
      Blockly.Xml.domToWorkspace(
          Blockly.Xml.textToDom(levelXml), this.workspace);
    }
  }

  /**
   * Load the specified level.
   * @param {number|string} level The level to load.
   */
  loadLevel(level) {
    this.level = Number(level);
    this.updateGoalText_();
    this.updateToolbox_();
    this.loadLevelBlocks_();
  }

  /**
   * Evaluates whether the answer for the currently loaded level is correct.
   * @return {boolean} Whether the answer is correct.
   */
  checkAnswer() {
    // TODO
    return true;
  }
}
