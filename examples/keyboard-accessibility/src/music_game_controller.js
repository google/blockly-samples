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
import {MusicGame} from './game';
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
     * The music logic object.
     * @type {Music}
     * @private
     */
    this.music_ = new Music(this.workspace);

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
   * @param {function=} onEndSpeak The function to run after the text has been
   *     spoken.
   */
  setGoalText(text, onEndSpeak) {
    const feedbackTextEl = document.getElementById('goalText');
    feedbackTextEl.innerHTML = text;
    speaker.speak(text, true, onEndSpeak);
  }

  /**
   * Get the current game object.
   * @return {Music} The current game object.
   */
  getMusic() {
    return this.music_;
  }

  /**
   * Start the tutorial.
   */
  runTutorial() {
    new Tutorial(this.workspace, this.music_,
        (text) => this.setGoalText(text),
        () => this.runGame()
    ).init();
  }

  /**
   * Start the Game.
   */
  runGame() {
    new MusicGame(this.workspace, this.music_,
        (goalText) => {
          this.setGoalText(goalText, () => {
            Blockly.navigation.enableKeyboardAccessibility();
          });
        },
        () => {
          this.setFeedbackText('Congratulations. You did it!');
        },
        (feedback) => {
          this.setFeedbackText(feedback);
        }).init();
  }

  /**
   * Show the welcome modal.
   */
  showWelcomeModal() {
    new WelcomeModal(() => this.runTutorial(), () => this.runGame()).init();
  }
}
