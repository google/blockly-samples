/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Game logic for music game.
 */

import Blockly from 'blockly/core';
import {Music, Transcript} from './music';
import {speaker} from './speaker';

/**
 * Game logic for music game.
 */
export class MusicGame {
  /**
   * Class for a music game.
   * @param {Blockly.WorkspaceSvg} workspace The Blockly workspace.
   * @param {Music} music A reference to the music object.
   * @param {function(string, MusicGame)} onGoalUpdateCb The callback function
   *    for goal change.
   * @param {function(MusicGame)} onSuccessCb The callback function for on
   *    success event.
   * @param {function(string, MusicGame)} onFailureCb The callback function for
   *    on failure event.
   * @constructor
   */
  constructor(workspace, music, onGoalUpdateCb, onSuccessCb, onFailureCb) {
    /**
     * The Blockly workspace associated with this game.
     * @type {!Blockly.WorkspaceSvg}
     */
    this.workspace = workspace;

    /**
     * The music logic object.
     * @type {Music}
     */
    this.music_ = music;

    /**
     * The currently loaded level. 0 if no level loaded.
     * @type {number}
     */
    this.level = 0;

    /**
     * The total supported levels.
     * @type {number}
     * @const
     */
    this.TOTAL_LEVELS = 2;

    /**
     * The expected answer.
     * @type {Array<Transcript>}
     * @private
     */
    this.expectedAnswer_ = [];

    /**
     * The last played answer.
     * @type {Array<Transcript>}
     * @private
     */
    this.answer_ = [];

    /**
     * Callback function for goal update.
     * @param {string} text The text to set the goal to.
     * @type {function(string, MusicGame)}
     * @private
     */
    this.onGoalUpdateCallback_ = onGoalUpdateCb;

    /**
     * The callback function on level success.
     * @type {function(MusicGame)}
     * @private
     */
    this.onSuccessCallback_ = onSuccessCb;

    /**
     * The callback function on level failure.
     * @type {function(string, MusicGame)}
     * @param {string} feedback The level feedback.
     * @private
     */
    this.onFailureCallback_ = onFailureCb;

    /**
     * The current level goal.
     * @private
     */
    this.goalText_ = '';

    /**
     * The current level feedback. Does not include transcript of actual and
     * expected solution. Empty if nothing has been played yet.
     * @private
     */
    this.feedback_ = '';

    /**
     * The full current level feedback. Empty if nothing has been played yet.
     * @private
     */
    this.feedback_ = '';
  }

  /**
   * Initializes the game and loads the first level.
   */
  init() {
    this.music_.setOnFinishPlayCallback(
        (transcripts) => this.onFinishPlay_(transcripts));
    this.loadLevel(1);
  }

  /**
   * Speaks the current goal.
   * @param {boolean} playOnly Whether to only play notes.
   * @param {function=} onEnd The function to run after the text has been
   *     spoken.
   */
  speakGoal(playOnly, onEnd) {
    speaker.speak('The goal is:', true, (event) => {
      this.expectedAnswer_[0].playback(this.music_.getBpm(), () => {
        if (!playOnly) {
          speaker.speak(this.goalText_, true, onEnd);
        }
      });
    });
  }

  /**
   * Speaks the current feedback.
   * @param {boolean} playOnly Whether to only play notes.
   * @param {function=} onEnd The function to run after the text has been
   *     spoken.
   */
  speakFeedback(playOnly, onEnd) {
    if (playOnly) {
      speaker.speak(this.feedback_, true, () => {
        speaker.speak('Your solution: ', true, () => {
          this.answer_[0].playback(this.music_.getBpm(), () => {
            speaker.speak('Expected solution: ', true, () => {
              this.expectedAnswer_[0].playback(this.music_.getBpm(), onEnd);
            });
          });
        });
      });
    } else {
      speaker.speak(this.fullFeedback_, true, onEnd);
    }
  }

  /**
   * Load the specified level.
   * @param {number|string} level The level to load.
   */
  loadLevel(level) {
    this.level = Number(level);
    this.loadLevelWorkspace_();
    this.updateLevelGoal_();
  }

  /**
   * Whether there is a next level.
   * @return {boolean} Whether there is a next level.
   */
  hasNextLevel() {
    return this.level <= this.TOTAL_LEVELS;
  }

  /**
   * Loads the next level, if available.
   */
  loadNextLevel() {
    if (this.hasNextLevel()) {
      this.loadLevel(this.level + 1);
    }
  }

  /**
   * Updates the goal based on the current level.
   * @private
   */
  updateLevelGoal_() {
    let goalText = '';
    switch (this.level) {
      case 1:
        this.expectedAnswer_ =
            [new Transcript(['C4', 'D4', 'E4', 'C4'], Array(4).fill(0.25))];
        this.goalText_ = this.expectedAnswer_[0].getReadableText();
        goalText = this.expectedAnswer_[0].getReadableText();
        break;
      case 2:
        this.expectedAnswer_ =
            [new Transcript(
                ['D4', 'F4', 'D4', 'C4'], [0.25, 0.125, 0.25, 0.25])];
        this.goalText_ = this.expectedAnswer_[0].getReadableText();
        goalText = this.expectedAnswer_[0].getReadableText();
        break;
    }
    this.onGoalUpdateCallback_(goalText, this);
  }

  /**
   * Updates the toolbox and workspace blocks based on the current level.
   * @private
   */
  loadLevelWorkspace_() {
    const toolboxDef = {
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
    };
    const levelXml =
        `<xml>
            <block type="music_start" deletable="false" x="180"
            y="50"></block>
          </xml>`;
    this.workspace.updateToolbox(toolboxDef);
    this.workspace.clear();
    Blockly.Xml.domToWorkspace(
        Blockly.Xml.textToDom(levelXml), this.workspace);
  }

  /**
   * Callback on finish playing user code.
   * @param {Array<Transcript>} transcripts The transcripts of the notes
   *    played.
   * @private
   */
  onFinishPlay_(transcripts) {
    // Program complete.
    const feedback = this.checkAnswer_(transcripts);
    if (feedback) {
      this.onFailureCallback_(feedback, this);
    } else {
      this.onSuccessCallback_(this);
    }
  }

  /**
   * Evaluates whether the answer for the currently loaded level is correct.
   * Returns level feedback if correct or empty string if correct.
   * @param {Array<Transcript>} transcripts The transcripts of the music played
   *    by the user's code.
   * @return {string} Level feedback or empty string.
   * @private
   */
  checkAnswer_(transcripts) {
    this.answer_ = transcripts;
    let feedback = '';
    let fullFeedback = '';
    if (transcripts.length !== this.expectedAnswer_.length) {
      console.warn('Multiple play blocks not fully supported');
      return `Expected ${this.expectedAnswer_.length} play blocks, but found ` +
          transcripts.length;
    }
    transcripts.forEach((transcript, i) => {
      const transcriptFeedback =
          MusicGame.getFeedback_(transcript, this.expectedAnswer_[i]);
      feedback += transcriptFeedback;
      fullFeedback += transcriptFeedback;
      if (transcriptFeedback) {
        fullFeedback +=
            `\nYour solution: ${transcript.getReadableText() || 'empty'}\n`;
        fullFeedback +=
            `Expected solution: ${this.expectedAnswer_[i].getReadableText()}`;
      }
    });
    this.feedback_ = feedback;
    this.fullFeedback_ = fullFeedback;
    return fullFeedback;
  }

  /**
   * Returns feedback on what is different between the actual and expected music
   * transcripts. Returns empty string if the provided transcripts are
   * equivalent.
   * @param {Transcript} actual The actual transcript.
   * @param {Transcript} expected The expected transcript.
   * @return {string} The feedback.
   * @private
   */
  static getFeedback_(actual, expected) {
    let feedback = '';

    // There could be extra or missing notes.
    const sizeMismatch = actual.size !== expected.size;
    if (actual.size < expected.size) {
      feedback += 'Your solution is missing notes.\n';
    } else if (actual.size > expected.size) {
      feedback += 'Your solution has extra notes.\n';
    }

    // The notes played could be wrong (duration or note).
    let hasIncorrectNotes = false;
    let hasIncorrectDuration = false;
    for (let i = 0; i < actual.size && i < expected.size; i++) {
      if (actual.notesAndRests[i] !== expected.notesAndRests[i]) {
        hasIncorrectNotes = true;
      }
      if (actual.durations[i] !== expected.durations[i]) {
        hasIncorrectDuration = true;
      }
    }
    if (hasIncorrectNotes) {
      feedback +=
          `Some of the notes ${sizeMismatch ? 'may be' : 'are'} incorrect.\n`;
    }
    if (hasIncorrectDuration) {
      feedback += `Some of the note durations ` +
          `${sizeMismatch ? 'may be' : 'are'} incorrect.\n`;
    }
    return feedback;
  }
}
