/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Music game controller.
 */


import Blockly from 'blockly/core';
import MicroModal from 'micromodal';
import {Music} from './music';
import {HelpModal} from './help_modal';
import {KeyPressModal} from './key_press_modal';
import {WelcomeModal} from './welcome_modal';
import {speaker} from './speaker';
import {Tutorial} from './tutorial';
import {CustomCursor} from './custom_cursor';

/**
 * Class for a controller for the music game, which handles
 * creation of the game and coordination of related modals, tutorials,
 * etc.
 */
export class MusicGameController {
  /**
   * The constructor for the music game controller.
   */
  constructor() {
    MicroModal.init({
      onClose: () => speaker.cancel(),
    });

    this.workspace = this.createWorkspace_();

    /**
     * The actual game object.
     * @type {Music}
     */
    this.game = new Music(this.workspace, (text) => this.setGoalText(text),
        () => {
          this.setFeedbackText('Congratulations. You did it!');
        }, (feedback) => {
          this.setFeedbackText(feedback);
        });

    const helpModal = new HelpModal('modal-1', 'modalButton');
    helpModal.init();

    // Start by showing the key press modal.
    new KeyPressModal(() => this.showWelcomeModal()).init();
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
      toolbox: {
        'kind': 'flyoutToolbox',
        'contents': [
          {
            'kind': 'block',
            'blockxml': `<block type="music_note">
                          <field name="DURATION">0.25</field>
                          <value name="PITCH">
                            <shadow type="music_pitch">
                              <field name="PITCH">C4</field>
                            </shadow>
                          </value>
                        </block>`,
          },
          {
            'kind': 'block',
            'type': 'music_rest',
          },
        ],
      },
    });
    Blockly.ASTNode.NAVIGATE_ALL_FIELDS = true;
    workspace.getMarkerManager().setCursor(new CustomCursor());
    workspace.addChangeListener((event) => speaker.nodeToSpeech(event));
    workspace.getFlyout().getWorkspace().addChangeListener(
        (event) => speaker.nodeToSpeech(event));
    return workspace;
  }


  /**
   * Sets the feedback text.
   * @param {string} text The text to set the feedback to.
   */
  setFeedbackText(text) {
    const feedbackTextEl = document.getElementById('feedbackText');
    feedbackTextEl.innerHTML = text.replaceAll('\n', '<br>');
    speaker.speak(text, true);
  }

  /**
   * Sets the goal text.
   * @param {string} text The text to set the goal to.
   */
  setGoalText(text) {
    const feedbackTextEl = document.getElementById('goalText');
    feedbackTextEl.innerHTML = text;
    speaker.speak(text, true);
  }

  /**
   * Get the current game object.
   * @return {Music} The current game object.
   */
  getGame() {
    return this.game;
  }

  /**
   * Start the tutorial.
   */
  runTutorial() {
    new Tutorial(this.workspace, (text) => this.setGoalText(text)).init();
  }

  /**
   * Start the Game.
   */
  runGame() {
    this.game.loadLevel(1);
  }

  /**
   * Show the welcome modal.
   */
  showWelcomeModal() {
    new WelcomeModal(() => this.runTutorial(), () => this.runGame()).init();
  }
}
