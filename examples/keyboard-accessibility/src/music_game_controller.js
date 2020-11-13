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

    /**
     * The shared Blockly Workspace.
     * @type {!Blockly.WorkspaceSvg}
     * @private
     */
    this.workspace = this.createWorkspace_();

    /**
     * The music logic object.
     * @type {Music}
     * @private
     */
    this.music_ = new Music(this.workspace);
    this.registerPlayShortcut_();

    /**
     * The music game object.
     * @type {MusicGame}
     * @private
     */
    this.game_ = this.createGame();

    const helpModal = new HelpModal('modal-1', 'modalButton');
    helpModal.init();

    // Start by showing the key press modal.
    new KeyPressModal(() => this.showWelcomeModal()).init();
  }

  /**
   * Creates a MusicGame object with the appropriate callbacks.
   * @return {!MusicGame} The Blockly workspace.
   * @private
   */
  createGame() {
    return new MusicGame(this.workspace, this.music_,
        (goalText, gameRef) => {
          this.setFeedbackText('');
          this.setGoalText(goalText);
          gameRef.speakGoal(() => {
            Blockly.navigation.enableKeyboardAccessibility();
          });
        },
        (gameRef) => {
          const successText = 'Congratulations. You did it!';
          this.setFeedbackText(successText);
          speaker.speak(successText, true, () => {
            setTimeout(() => gameRef.loadNextLevel(), 1000);
          });
        },
        (feedback, gameRef) => {
          this.setFeedbackText(feedback);
          gameRef.speakFeedback();
        });
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
    workspace.addChangeListener(Blockly.Events.disableOrphans);
    workspace.getFlyout().getWorkspace().addChangeListener(
        (event) => speaker.nodeToSpeech(event));
    return workspace;
  }

  /**
   * Registers a shortcut to play the notes on the workspace.
   * @private
   */
  registerPlayShortcut_() {
    /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
    const playShortcut = {
      name: 'playShortcut',
      preconditionFn: function(workspace) {
        return workspace.keyboardAccessibilityMode &&
            !workspace.options.readOnly;
      },
      callback: () => this.music_.execute(),
    };

    Blockly.ShortcutRegistry.registry.register(playShortcut);
    const shiftP = Blockly.ShortcutRegistry.registry.createSerializedKey(
        Blockly.utils.KeyCodes.P, [Blockly.utils.KeyCodes.SHIFT]);
    Blockly.ShortcutRegistry.registry.addKeyMapping(
        shiftP, playShortcut.name);
  }


  /**
   * Sets the feedback text and speaks it out.
   * @param {string} text The text to set the feedback to.
   */
  setFeedbackText(text) {
    const feedbackTextEl = document.getElementById('feedbackText');
    feedbackTextEl.innerHTML = text.replaceAll('\n', '<br>');
  }

  /**
   * Sets the goal text.
   * @param {string} text The text to set the goal to.
   */
  setGoalText(text) {
    const goalTextEl = document.getElementById('goalText');
    goalTextEl.innerHTML = text.replaceAll('\n', '<br>');
  }

  /**
   * Get the music object.
   * @return {Music} The current game object.
   */
  getMusic() {
    return this.music_;
  }

  /**
   * Get the game object.
   * @return {Music} The current game object.
   */
  getGame() {
    return this.game_;
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
    this.game_.init();
  }

  /**
   * Show the welcome modal.
   */
  showWelcomeModal() {
    new WelcomeModal(() => this.runTutorial(), () => this.runGame()).init();
  }
}
