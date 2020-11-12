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
     * @type {Array<string|number>}
     * @private
     */
    this.transcript_ = [];

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
    this.transcript_.push(pitch, duration);
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
    const transcriptLen = this.transcript_.length;
    if (transcriptLen > 1 && this.transcript_[transcriptLen - 2] === REST) {
      // Concatenate this rest with previous one.
      this.transcript_[transcriptLen - 1] += duration;
    } else {
      this.transcript_.push(REST, duration);
    }
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
   * Returns whether the transcript matched expected.
   * @param {Array<string|number>} expectedTranscript The expected transcript.
   * @return {boolean} Whether the transcript matches.
   */
  checkTranscript(expectedTranscript) {
    return JSON.stringify(
        expectedTranscript) === JSON.stringify(this.transcript_);
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
     * The expected answer.
     * @type {Array<Array<string|number>>}
     * @private
     */
    this.expectedAnswer_ = [[]];

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
  updateGoal_() {
    let goalText = '';
    switch (this.level) {
      case 1:
        goalText = 'Play c4 d4 e4 c4';
        this.expectedAnswer_ =
            [['C4', 0.25, 'D4', 0.25, 'E4', 0.25, 'C4', 0.25]];
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
            'blockxml': "<block type='music_note'><value name='PITCH'><shadow type='music_pitch'><field name='PITCH'>C4</field></shadow></value></block>",
          },
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
    if (this.level === 2) {
      levelXml =
          `<xml>
            <block type="music_start" deletable="false" x="180"
            y="50">
              <statement name="STACK">
                <block type="music_note">
                  <field name="DURATION">0.25</field>
                  <value name="PITCH">
                    <shadow type="music_pitch">
                      <field name="PITCH">C4</field>
                    </shadow>
                  </value>
                  <next>
                    <block type="music_note">
                      <field name="DURATION">0.25</field>
                      <value name="PITCH">
                        <shadow type="music_pitch">
                          <field name="PITCH">D4</field>
                        </shadow>
                      </value>
                      <next>
                        <block type="music_note">
                          <field name="DURATION">0.25</field>
                          <value name="PITCH">
                            <shadow type="music_pitch">
                              <field name="PITCH">E4</field>
                            </shadow>
                          </value>
                          <next>
                            <block type="music_note">
                              <field name="DURATION">0.25</field>
                              <value name="PITCH">
                                <shadow type="music_pitch">
                                  <field name="PITCH">C4</field>
                                </shadow>
                              </value>
                            </block>
                          </next>
                        </block>
                      </next>
                    </block>
                  </next>
                </block>
              </statement>
            </block>
          </xml>`;
    } else if (this.level < 6) {
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
    this.updateGoal_();
    this.updateToolbox_();
    this.loadLevelBlocks_();
  }

  /**
   * Generates code and logs it to the console.
   */
  logGeneratedCode() {
    const codeJs = Blockly.JavaScript.workspaceToCode(this.workspace);
    console.log(codeJs);
  }

  /**
   * Evaluates whether the answer for the currently loaded level is correct.
   * @return {boolean} Whether the answer is correct.
   */
  checkAnswer_() {
    let correct = true;
    for (let i = 0; i < this.expectedAnswer_.length; i++) {
      if (!this.staves_[i].checkTranscript(this.expectedAnswer_[i])) {
        correct = false;
        break;
      }
    }
    return correct;
  }

  /**
   * Play one note.
   * @param {number} duration Fraction of a whole note length to play.
   * @param {string} pitch Note play.
   */
  play_(duration, pitch) {
    this.activeStave_.play(duration, pitch, this.clock64ths_);
  }

  /**
   * Wait one rest.
   * @param {number} duration Fraction of a whole note length to rest.
   */
  rest_(duration) {
    this.activeStave_.rest(duration, this.clock64ths_);
  }

  /**
   * Inject the Music API into a JavaScript interpreter.
   * @param {!Interpreter} interpreter The JS-Interpreter.
   * @param {!Interpreter.Object} globalObject Global object.
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

    // TODO implement changing instrument.
    // wrapper = function(instrument, id) {
    //   Music.setInstrument(instrument, id);
    // };
    // interpreter.setProperty(globalObject, 'setInstrument',
    //     interpreter.createNativeFunction(wrapper));
  }

  /**
   * Execute a bite-sized chunk of the user's code.
   * @param {Stave} stave The stave to execute.
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
      if (this.checkAnswer_()) {
        console.log('CORRECT');
      } else {
        console.log('INCORRECT');
      }
    } else {
      this.clock64ths_++;
      const ms =
          (this.startTime_ + this.clock64ths_ * scaleDuration) - Date.now();
      this.pid = setTimeout(() => this.tick_(), ms);
    }
  }

  /**
   * Reset the music to the start position, clear the display, and kill any
   * pending tasks.
   */
  reset() {
    // Kill any task.
    clearTimeout(this.pid);
    this.staves_.forEach((stave) => {
      stave.stopSound();
    });
    this.interpreter_ = null;
    this.activeStave_ = null;
    this.staves_.length = 0;
    this.clock64ths_ = 0;
    this.startTime_ = 0;
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
    // TODO support multiple threads
    // Assume only one thread.
    const interpreter = new Interpreter('');
    // Replace this thread's global scope with the cross-thread global.
    interpreter.stateStack[0].scope = this.interpreter_.globalScope;
    // Add start call.
    interpreter.appendCode('start();\n');
    this.staves_.push(new Stave(0, interpreter.stateStack));

    setTimeout(() => this.tick_(), 100);
  }
}
