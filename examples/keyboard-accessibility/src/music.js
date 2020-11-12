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
import {CustomCursor} from './custom_cursor';
import './music_block_generators';
import Interpreter from 'js-interpreter';
import {notePlayer} from './note_player';


/**
 * Constant denoting a rest.
 */
const REST = 'REST';

/**
 * Class representing transcript of notes played.
 */
class Transcript {
  /**
   * Class for holding transcript of notes that were played. Expects
   * notesAndRests and durations to have a matching length.
   * @param {Array<string>} notesAndRests The notes and rests.
   * @param {Array<number>} durations The durations of the notes and rests.
   */
  constructor(notesAndRests = [], durations = []) {
    if (notesAndRests.length !== durations.length) {
      console.error('Transcript length mismatch.');
    }
    this.notesAndRests = [];
    this.durations = [];
    this.size = 0;
    this.readableText = '';
    for (let i = 0; i < notesAndRests.length; i++) {
      this.appendNote(notesAndRests[i], durations[i]);
    }
  }

  /**
   * Converts duration number into approriate string.
   * @param {number} duration The duration.
   * @return {string} The string version of duration.
   * @private
   */
  static getDurationText_(duration) {
    let durationText = 'unknown';
    switch (duration) {
      case 1:
        durationText = 'whole';
        break;
      case 0.5:
        durationText = 'half';
        break;
      case 0.25:
        durationText = 'quarter';
        break;
      case 0.125:
        durationText = 'eight';
        break;
    }
    return durationText;
  }

  /**
   * Internal method for appending text to transcript text.
   * @param {string} text The text to append.
   * @private
   */
  appendReadableText_(text) {
    if (this.readableText) {
      this.readableText += ', ';
    }
    this.readableText += text;
  }

  /**
   * Appends note to transcript.
   * @param {string} note The pitch of note to append.
   * @param {number} duration The duration of the note.
   */
  appendNote(note, duration) {
    this.notesAndRests.push(note);
    this.durations.push(duration);
    this.appendReadableText_(
        `play ${Transcript.getDurationText_(duration)} note ${note}`);
    this.size++;
  }
  /**
   * Appends rest to transcript.
   * @param {number} duration The duration of the rest.
   */
  appendRest(duration) {
    this.notesAndRests.push(REST);
    this.durations.push(duration);
    this.appendReadableText_(
        `${Transcript.getDurationText_(duration)} rest`);
    this.size++;
  }
}

/**
 * Class representing musical stave.
 */
class Stave {
  constructor(id, stateStack) {
    /**
     * The id.
     * @type {number}
     */
    this.id = id;
    /**
     * The state stack.
     * @type {Array<Interpreter.State>}
     */
    this.stateStack = stateStack;

    /**
     * Whether all the notes have ben played.
     * @type {boolean}
     */
    this.done = false;

    /**
     * The time to pause till.
     * @type {number}
     * @private
     */
    this.pauseUntil64ths_ = 0;

    /**
     * The transcript of notes played.
     * @type {Transcript}
     * @private
     */
    this.transcript_ = new Transcript();

    /**
     * Currently playing note.
     * @type {string}
     * @private
     */
    this.note_ = '';
  }

  /**
   * Whether this stave is currently paused.
   * @param {number} clock64ths Number of 1/64ths notes since the start.
   * @return {boolean} Whether this stave is paused.
   */
  isPaused(clock64ths) {
    return this.pauseUntil64ths_ > clock64ths;
  }

  /**
   * Play one note.
   * @param {number} duration Fraction of a whole note length to play.
   * @param {string} pitch Note to play.
   * @param {number} clock64ths Number of 1/64ths notes since the start.
   */
  play(duration, pitch, clock64ths) {
    this.stopSound();
    this.note_ = pitch;
    notePlayer.triggerAttack(pitch);
    this.pauseUntil64ths_ = duration * 64 + clock64ths;
    // Make a record of this note.
    this.transcript_.appendNote(pitch, duration);
  }

  /**
   * Wait one rest.
   * @param {number} duration Fraction of a whole note length to rest.
   * @param {number} clock64ths Number of 1/64ths notes since the start.
   */
  rest(duration, clock64ths) {
    this.stopSound();
    this.pauseUntil64ths_ = duration * 64 + clock64ths;
    // Make a record of this rest.
    this.transcript_.appendRest(duration);
  }

  /**
   * Stops currently playing note.
   */
  stopSound() {
    if (this.note_) {
      notePlayer.triggerRelease();
      this.note_ = '';
    }
  }

  /**
   * Returns feedback on what is different between the loaded transcript and the
   * expected one, or empty string if they are equal.
   * @param {Transcript} expectedTranscript The expected transcript.
   * @return {string} The feedback.
   */
  getFeedback(expectedTranscript) {
    let feedback = '';

    // There could be extra or missing notes.
    const actualSize = this.transcript_.size;
    const expectedSize = expectedTranscript.size;
    const sizeMismatch = actualSize !== expectedSize;
    if (actualSize < expectedSize) {
      feedback += 'Your solution is missing notes.\n';
    } else if (actualSize > expectedSize) {
      feedback += 'Your solution has extra notes.\n';
    }

    // The notes played could be wrong (duration or note).
    let hasIncorrectNotes = false;
    let hasIncorrectDuration = false;
    for (let i = 0; i < actualSize && i < expectedSize; i++) {
      if (this.transcript_.notesAndRests[i] !==
          expectedTranscript.notesAndRests[i]) {
        hasIncorrectNotes = true;
      }
      if (this.transcript_.durations[i] !== expectedTranscript.durations[i]) {
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

    // Append the actual and expected notes played.
    if (sizeMismatch || hasIncorrectNotes || hasIncorrectDuration) {
      feedback += `\nYour solution: ${this.transcript_.readableText}\n`;
      feedback += `Expected solution: ${expectedTranscript.readableText}`;
    }
    return feedback;
  }
}

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
     * The currently loaded level. 0 if no level loaded.
     */
    this.level = 0;

    /**
     * The HTML element containing the goal text for the game.
     * @type {HTMLElement}
     * @private
     */
    this.goalTextElement_ = document.getElementById('goalText');

    /**
     * The HTML element containing the feedback text for the game.
     * @type {HTMLElement}
     * @private
     */
    this.feedbackTextElement_ = document.getElementById('feedbackText');

    /**
     * The expected answer.
     * @type {Array<Transcript>}
     * @private
     */
    this.expectedAnswer_ = [];

    /**
     * The interpreter.
     * @type {?Interpreter}
     * @private
     */
    this.interpreter_ = null;

    /**
     * @type {Array<Stave>}
     * @private
     */
    this.staves_ = [];

    /**
     * The current active stave.
     * @type {?Stave}
     * @private
     */
    this.activeStave_ = null;

    /**
     * Time of start of execution.
     * @type {number}
     * @private
     */
    this.startTime_ = 0;

    /**
     * Number of 1/64ths notes since the start.
     * @type {number}
     * @private
     */
    this.clock64ths_ = 0;

    /**
     * The speed at which to play notes. Between 0 and 1, with 0 being slow,
     * 0.5 being normal speed, and 1 being fast.
     * @type {number}
     * @private
     */
    this.speed_ = 0.5;

    /**
     * The id of the last setTimeout call. Used for game reset.
     * @type {number}
     * @private
     */
    this.pid_ = 0;

    /**
     * The callback function on level success.
     * @type {function()}
     * @private
     */
    this.onSuccessCallback_ = () => {
      console.log('SUCCESS');
    };

    /**
     * The callback function on level failure.
     * @type {function(string)}
     * @param {string} feedback The level feedback.
     * @private
     */
    this.onFailureCallback_ = (feedback) => {
      console.log('FAILURE');
      console.log(feedback);
    };
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
    Blockly.ASTNode.NAVIGATE_ALL_FIELDS = true;
    workspace.getMarkerManager().setCursor(new CustomCursor());
    workspace.addChangeListener((event) => speaker.nodeToSpeech(event));
    workspace.getFlyout().getWorkspace().addChangeListener(
        (event) => speaker.nodeToSpeech(event));
    return workspace;
  }

  /**
   * Returns the workspace belonging to this game.
   * @return {Blockly.WorkspaceSvg} The workspace belonging to this game.
   */
  getWorkspace() {
    return this.workspace;
  }

  /**
   * Sets the goal text.
   * @param {string} text The text to set the goal to.
   */
  setGoalText(text) {
    this.goalTextElement_.innerHTML = text;
  }

  /**
   * Sets the feedback text.
   * @param {string} text The text to set the feedback to.
   */
  setFeedbackText(text) {
    this.feedbackTextElement_.innerHTML = text;
  }

  /**
   * Sets the behaviour on success.
   * @param {function()} onSuccessCallback The on success callback. The level
   *    code is passed in as parameter.
   */
  setOnSuccessCallback(onSuccessCallback) {
    this.onSuccessCallback_ = onSuccessCallback;
  }

  /**
   * Sets the behaviour on failure.
   * @param {function(string)} onFailureCallback The on failure callback. Level
   *    feedback is passed in as parameter.
   */
  setOnFailureCallback(onFailureCallback) {
    this.onFailureCallback_ = onFailureCallback;
  }

  /**
   * Clears the workspace and loads the specified blocks.
   * @param {string} blockXml The xml text string of blocks.
   */
  loadWorkspaceBlocks(blockXml) {
    this.workspace.clear();
    Blockly.Xml.domToWorkspace(
        Blockly.Xml.textToDom(blockXml), this.workspace);
  }

  /**
   * Updates the currently loaded toolbox.
   * @param {?Blockly.utils.toolbox.ToolboxDefinition} toolboxDef
   *    DOM tree of toolbox contents, string of toolbox contents, or JSON
   *    representing toolbox definition.
   */
  updateToolbox(toolboxDef) {
    this.workspace.updateToolbox(toolboxDef);
  }

  /**
   * Updates the goal based on the current level.
   * @private
   */
  updateLevelGoal_() {
    let goalText = '';
    switch (this.level) {
      case 1:
        goalText = 'Play c4 d4 e4 c4';
        this.expectedAnswer_ =
            [new Transcript(['C4', 'D4', 'E4', 'C4'], Array(4).fill(0.25))];
        break;
    }
    this.setGoalText(goalText);
  }

  /**
   * Updates the toolbox based on the current level.
   * @private
   */
  updateLevelToolbox_() {
    const toolboxJson = {
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
    this.updateToolbox(toolboxJson);
  }

  /**
   * Update the workspace blocks based on the current level.
   * @private
   */
  loadLevelBlocks_() {
    const levelXml =
        `<xml>
            <block type="music_start" deletable="false" x="180"
            y="50"></block>
          </xml>`;
    this.loadWorkspaceBlocks(levelXml);
  }

  /**
   * Load the specified level.
   * @param {number|string} level The level to load.
   */
  loadLevel(level) {
    this.level = Number(level);
    this.updateLevelGoal_();
    this.updateLevelToolbox_();
    this.loadLevelBlocks_();
  }

  /**
   * Set the speed (Number between 0 and 1).
   * @param {number} speed The speed to set to.
   */
  setSpeed(speed) {
    if (speed <= 0 || speed > 1) {
      console.error('Invalid speed');
      return;
    }
    this.speed_ = speed;
    this.startTime_ = 0;
  }

  /**
   * Generates code and logs it to the console.
   */
  logGeneratedCode() {
    const codeJs = Blockly.JavaScript.workspaceToCode(this.workspace);
    console.log(codeJs);
  }

  /**
   * Reset the music to the start position, clear the display, and kill any
   * pending tasks.
   */
  reset() {
    // Kill any task.
    clearTimeout(this.pid_);
    this.staves_.forEach((stave) => {
      stave.stopSound();
    });
    this.interpreter_ = null;
    this.activeStave_ = null;
    this.staves_.length = 0;
    this.clock64ths_ = 0;
    this.startTime_ = 0;
    this.setFeedbackText('');
  }

  /**
   * Plays music based on the blocks on the workspace.
   */
  execute() {
    this.reset();
    // Get generated code from workspace
    const code = Blockly.JavaScript.workspaceToCode(this.workspace);

    // Run user code.
    this.interpreter_ = new Interpreter(code, this.interpreterInit_.bind(this));
    // TODO add support for multiple threads.
    const interpreter = new Interpreter('');
    // Replace this thread's global scope with the cross-thread global.
    interpreter.stateStack[0].scope = this.interpreter_.globalScope;
    // Add start call.
    interpreter.appendCode('start();\n');
    this.staves_.push(new Stave(0, interpreter.stateStack));

    this.pid_ = setTimeout(() => this.tick_(), 100);
  }

  /**
   * Inject the Music API into a JavaScript interpreter.
   * @param {!Interpreter} interpreter The JS-Interpreter.
   * @param {!Interpreter.Object} globalObject Global object.
   * @private
   */
  interpreterInit_(interpreter, globalObject) {
    // API
    let wrapper;
    wrapper = (duration, pitch, _id) => {
      this.play_(duration, pitch);
    };
    interpreter.setProperty(globalObject, 'play',
        interpreter.createNativeFunction(wrapper));
    wrapper = (duration, _id) => {
      this.rest_(duration);
    };
    interpreter.setProperty(globalObject, 'rest',
        interpreter.createNativeFunction(wrapper));

    // TODO implement setInstrument API.
  }

  /**
   * Play one note.
   * @param {number} duration Fraction of a whole note length to play.
   * @param {string} pitch Note play.
   * @private
   */
  play_(duration, pitch) {
    this.activeStave_.play(duration, pitch, this.clock64ths_);
  }

  /**
   * Wait one rest.
   * @param {number} duration Fraction of a whole note length to rest.
   * @private
   */
  rest_(duration) {
    this.activeStave_.rest(duration, this.clock64ths_);
  }
  /**
   * Execute a 1/64th tick of the program.
   * @private
   */
  tick_() {
    // Delay between start of each beat (1/64ths of a whole note).
    // Reminder: The startTime_ should be reset after the slider is adjusted.
    const scaleDuration = 1000 * (2.5 - 2 * this.speed_) / 64;
    if (!this.startTime_) {
      // Either the first tick, or first tick after slider was adjusted.
      this.startTime_ = Date.now() - this.clock64ths_ * scaleDuration;
    }
    let done = true;
    this.staves_.forEach((stave) => {
      if (!stave.done) {
        done = false;
        if (!stave.isPaused(this.clock64ths_)) {
          this.executeChunk_(stave);
        }
      }
    });

    if (done) {
      // Program complete.
      const feedback = this.checkAnswer_();
      if (feedback) {
        this.onFailureCallback_(feedback);
      } else {
        this.onSuccessCallback_();
      }
    } else {
      this.clock64ths_++;
      const ms =
          (this.startTime_ + this.clock64ths_ * scaleDuration) - Date.now();
      this.pid_ = setTimeout(() => this.tick_(), ms);
    }
  }

  /**
   * Execute a bite-sized chunk of the user's code.
   * @param {Stave} stave The stave to execute.
   * @private
   */
  executeChunk_(stave) {
    this.activeStave_ = stave;
    // Switch the interpreter to run the provided staff.
    this.interpreter_.stateStack = stave.stateStack;
    let ticks = 10000;
    let go;
    do {
      try {
        go = this.interpreter_.step();
      } catch (e) {
        // User error, terminate in shame.
        alert(e);
        go = false;
      }
      if (ticks-- == 0) {
        console.warn('Staff ' + stave.id + ' is running slowly.');
        return;
      }
      if (stave.isPaused(this.clock64ths_)) {
        // Previously executed command (play or rest) requested a pause.
        return;
      }
    } while (go);
    // Thread complete.  Wrap up.
    stave.stopSound(stave);
    stave.done = true;
  }

  /**
   * Evaluates whether the answer for the currently loaded level is correct.
   * Returns level feedback if correct or empty string if correct.
   * @return {string} Level feedback or empty string.
   * @private
   */
  checkAnswer_() {
    let feedback = '';
    for (let i = 0; i < this.expectedAnswer_.length; i++) {
      const staveFeedback =
          this.staves_[i].getFeedback(this.expectedAnswer_[i]);
      if (staveFeedback) {
        feedback += staveFeedback;
      }
    }
    return feedback;
  }
}
