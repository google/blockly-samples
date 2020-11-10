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
import {WelcomeModal} from './welcome_modal';

export class KeyPressModal {
  constructor() {
    /**
     * The id of the modal.
     * @type {string}
     */
    this.modalId = 'keyPressModal';
  }

  /**
   * Initializes the welcome modal.
   */
  init() {
    this.createDom();
    document.getElementById('welcomeCloseButton').addEventListener(
        'blur', () => speaker.cancel());
    MicroModal.show(this.modalId);

    this.listener = this.onKeyPress_.bind(this);
    document.getElementById(this.modalId)
        .addEventListener('keydown', this.listener);
  }

  /**
   * Handles the first key press event on the page. Removes itself after the
   * first key press.
   * @param {Event} e The key press event.
   * @private
   */
  onKeyPress_(e) {
    MicroModal.close(this.modalId);
    speaker.resume();
    document.getElementById(this.modalId)
        .removeEventListener('keydown', this.listener);
    new WelcomeModal().init();
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
            Press any key to begin!
          </h2>
          <button class="modal__close" aria-label="Close modal" id="welcomeCloseButton" data-micromodal-close></button>
        </header>
      </div>
    </div>`;
  }

}
