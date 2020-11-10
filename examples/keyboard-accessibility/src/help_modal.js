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

export class HelpModal {
  constructor(modalId, modalButtonId) {
    /**
     * The id of the modal.
     * @type {string}
     */
    this.modalId = modalId;
    /**
     * The id of the button that opens the modal.
     * @type {string}
     */
    this.modalButtonId = modalButtonId;
  }

  /**
   * Initializes the help modal.
   */
  init() {
    this.createDom();
    document.getElementById(this.modalButtonId).addEventListener('click',
        () => {
          speaker.modalToText(document.getElementById(this.modalId));
        });

    document.getElementById(this.modalButtonId).addEventListener('focus',
        (e) => {
          speaker.speak('Hit enter to open the help menu');
        });
    document.getElementById('replayButton').addEventListener('click',
        () => {
          speaker.modalToText(document.getElementById(this.modalId));
        });
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
            Help Menu
          </h2>
          <button class="modal__close" aria-label="Close modal" data-micromodal-close></button>
        </header>
        <main class="modal__content" id="modal-1-content">
          <p>
            This is the help menu. This can be accessed at any time by hitting H.
            To close the menu press escape.
          </p>
        </main>
        <footer class="modal__footer">
          <button class="modal__btn modal__btn-primary" id="replayButton">Replay</button>
        </footer>
      </div>
    </div>`;
  }

}
