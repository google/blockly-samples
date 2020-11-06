/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * @fileoverview Speaker used for speaking out text.
 */

/**
 * Convenience methods for speaking out text.
 * More information on speakers can be found here:
 * https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis.
 */
export class Speaker {
  /**
   * Constructor for a speaker.
   */
  constructor() {}

  /**
   * Speaks out the text that was given to it.
   * @param {string} text The text to speak out.
   * @param {boolean=} shouldCancel True to stop the current utterance, false to
   *     wait until the current utterance is done before speaking.
   * @param {function=} onEnd The function to run after the text has been
   *     spoken.
   * @param {function=} onStart The function run when the text has begun to
   *     be spoken.
   * @public
   */
  speak(text, shouldCancel, onEnd, onStart) {
    const audio = new SpeechSynthesisUtterance(text);

    if (shouldCancel && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    if (onEnd) {
      audio.onend = onEnd;
    }

    if (onStart) {
      audio.onstart = onStart;
    }
    window.speechSynthesis.speak(audio);
  }

  /**
   * Speaks out an audio representation of the given node.
   * @param {Blockly.ASTNode} node The node to speak out.
   * @public
   */
  nodeToVoice(node) {}
}

export const speaker = new Speaker();
