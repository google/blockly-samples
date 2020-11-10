/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview
 */
'use strict';

import {speaker} from './speaker';
import MicroModal from 'micromodal';

export class WelcomeModal {
  constructor() {
    /**
     * The id of the modal.
     * @type {string}
     */
    this.modalId = 'welcomeModal';
  }

  /**
   * Initializes the welcome modal.
   */
  init() {
    this.createDom();
    document.getElementById('replayButton').addEventListener('click',
        () => {
          speaker.modalToText(document.getElementById(this.modalId));
        });
    MicroModal.show(this.modalId);

    this.listener = this.onKeyPress_.bind(this);
    document.getElementById(this.modalId)
        .addEventListener('keydown', this.listener);
    document.getElementById('welcomeButtonReplay').addEventListener('click',
        () => {
          speaker.cancel();
          speaker.modalToText(document.getElementById(this.modalId));
        });
  }

  /**
   * Handles the first key press event on the page. Removes itself after the
   * first key press.
   * @param {Event} e The key press event.
   * @private
   */
  onKeyPress_(e) {
    const modal = document.getElementById(this.modalId);
    console.log(modal);
    speaker.modalToText(modal);
    speaker.resume();
    document.getElementById(this.modalId)
        .removeEventListener('keydown', this.listener);
    e.preventDefault();
  }

  /**
   * Creates the dom for the modal.
   */
  createDom() {
    document.getElementById(this.modalId).innerHTML = `
     <div class="modal__overlay" tabindex="-1" data-micromodal-close>
      <div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="modal-1-title">
        <header class="modal__header">
          <h2 class="modal__title" id="modal-1-title">
            Welcome To Blockly Games Music!
          </h2>
          <button class="modal__close" aria-label="Close modal" data-micromodal-close></button>
        </header>
        <main class="modal__content" id="modal-1-content">
          <p>
            Use the tab key to cycle through your options. If you have never
            played before we recommend you start with the tutorial.
          </p>
        </main>
        <footer class="modal__footer">
          <button class="modal__btn modal__btn-primary" id="tutorialButton">Go To The Tutorial</button>
          <button class="modal__btn modal__btn-primary" id="gameButton">Go To The Game</button>
          <button class="modal__btn modal__btn-primary" id="welcomeButtonReplay">Replay</button>
        </footer>
      </div>
    </div>`;
  }

}
