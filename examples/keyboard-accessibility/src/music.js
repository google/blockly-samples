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
export class Transcript {
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
    this.readableText_ = '';
    for (let i = 0; i < notesAndRests.length; i++) {
      this.appendNote(notesAndRests[i], durations[i]);
    }
  }

  /**
   * Converts duration number into appropriate string.
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
    if (this.readableText_) {
      this.readableText_ += ', ';
    } else {
      text = text.charAt(0).toUpperCase() + text.slice(1);
    }
    this.readableText_ += text;
  }

  /**
   * Returns sentence representing the notes played in this transcript.
   * @return {string} The sentence.
   */
  getReadableText() {
    if (!this.readableText_) {
      return 'Empty.';
    }
    const items = this.readableText_.split(',');
    if (items.length > 1) {
      items[items.length - 1] = ' and ' + items[items.length - 1];
    }
    return items.join(',') + '.';
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
 * Class representing musical stave (staff) of notes to play.
 */
class Stave {
  /**
   * Class holding code for music to play.
   * @param {Array<Interpreter.State>} stateStack The stateStack containing code
   *    for this stave.
   */
  constructor(stateStack) {
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
   * Returns the transcript for this stave.
   * @return {Transcript} The transcript.
   */
  getTranscript() {
    return this.transcript_;
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
}

/**
 * Logic for playing music.
 */
export class Music {
  /**
   * Class for a music game.
   * @param {Blockly.WorkspaceSvg} workspace The Blockly workspace.
   * @constructor
   */
  constructor(workspace) {
    /**
     * The Blockly workspace associated with this game.
     * @type {!Blockly.WorkspaceSvg}
     */
    this.workspace = workspace;

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
     * Callback function for on finish playing.
     * @param {Array<Transcript>} transcripts The transcripts for the notes
     *    played.
     * @private
     */
    this.onFinishPlayCb_ = null;

    this.registerPlayShortcut_();
  }

  /**
   * Sets the callback for on finish playing.
   * @param {function(Array<Transcript>)} onFinishPlayCb The call back to set
   *    for calling after code has finished playing.
   */
  setOnFinishPlayCallback(onFinishPlayCb) {
    this.onFinishPlayCb_ = onFinishPlayCb;
  }

  /**
   * Registers a shortcut to play the notes on the workspace.
   * @private
   */
  registerPlayShortcut_() {
    // TODO update4 to use arrow function
    const newFunction = function() {
      this.execute();
    }.bind(this);
    /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
    const playShortcut = {
      name: 'playShortcut',
      preconditionFn: function(workspace) {
        return workspace.keyboardAccessibilityMode &&
            !workspace.options.readOnly;
      },
      callback: newFunction,
    };

    Blockly.ShortcutRegistry.registry.register(playShortcut);
    const shiftW = Blockly.ShortcutRegistry.registry.createSerializedKey(
        Blockly.utils.KeyCodes.P, [Blockly.utils.KeyCodes.SHIFT]);
    Blockly.ShortcutRegistry.registry.addKeyMapping(
        shiftW, playShortcut.name);
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
    // TODO add support for multiple threads (staves).
    const interpreter = new Interpreter('');
    // Replace this thread's global scope with the cross-thread global.
    interpreter.stateStack[0].scope = this.interpreter_.globalScope;
    // Add start call.
    interpreter.appendCode('start();\n');
    this.staves_.push(new Stave(interpreter.stateStack));

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
      if (this.onFinishPlayCb_) {
        const finishedTranscripts =
            Array.from(this.staves_, (stave) => stave.getTranscript());
        this.onFinishPlayCb_(finishedTranscripts);
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
}
