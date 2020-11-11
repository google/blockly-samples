/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * @fileoverview Wrapper class for Tone.js.
 */

import * as Tone from 'tone';

/**
 * Wrapper class for Tone.js.
 * More information on tone.js can be found here:
 * https://tonejs.github.io/.
 */
export class NotePlayer {
  /**
   * Constructor for a class that plays notes.
   */
  constructor() {
    this.synth = new Tone.Synth().toDestination();
  }

  /**
   * Plays the given note for the given duration.
   * @param {string} note The note to play.
   * @param {string} duration The duration of the note (ex: 8n, 4n, 2n).
   */
  playNote(note, duration) {
    this.synth.triggerAttackRelease(note, duration);
  }

  /**
   * Triggers attack for specified note.
   * @param {string} note The note to start.
   */
  triggerAttack(note) {
    this.synth.triggerAttack(note, Tone.now());
  }
  /**
   * Triggers release of note.
   */
  triggerRelease() {
    this.synth.triggerRelease(Tone.now());
  }
}

export const notePlayer = new NotePlayer();
