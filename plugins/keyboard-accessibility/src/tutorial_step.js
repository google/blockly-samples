/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A single step in the tutorial.
 */
'use strict';

import {speaker} from './speaker';
/**
 * A step in the tutorial.
 */
export class TutorialStep {
  /**
   * Class for a single step in the tutorial.
   * @param {string} text The text to show on the modal.
   * @param {string} textId The ID of the element where the text will be
   *     displayed.
   * @param {Function} doneCb The function to call when the step is completed
   *     by the user.
   * @constructor
   */
  constructor(text, textId, doneCb, goalText) {
    /**
     * The text being displayed to the user.
     * @type {string}
     */
    this.text = text;

    /**
     * The ID of the element where the text will be displayed.
     * @type {string}
     */
    this.textId = textId;

    /**
     * The function to call when the step is completed by the user.
     * @type {Function}
     */
    this.doneCb = doneCb;

    /**
     * The goal text.
     * @type {string}
     */
    this.goalText = goalText;
  }

  /**
   * Show this step in the modal, and speak it out loud.
   */
  show() {
    document.getElementById(this.textId).innerHTML = this.text;
    speaker.speak(this.text, true);
  }
}
