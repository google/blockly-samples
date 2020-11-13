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

/**
 * A class for a modal that welcomes the users and helps them get oriented.
 */
export class WelcomeModal {
  /**
   * Constructor for the welcome modal.
   * @param {Function} tutorialButtonCb A function to call when the tutorial
   *     button is pressed, in addition to any cleanup this class chooses to do.
   * @param {Function} gameButtonCb A function to call when the game button is
   *     pressed, in addition to any cleanup this class chooses to do.
   * @constructor
   */
  constructor(tutorialButtonCb, gameButtonCb) {
    /**
     * The id of the modal.
     * @type {string}
     */
    this.modalId = 'welcomeModal';

    /**
     * A function to call when the tutorial button is pressed.
     * @type {Function}
     */
    this.tutorialButtonCb = tutorialButtonCb;


    /**
     * A function to call when the game button is pressed.
     * @type {Function}
     */
    this.gameButtonCb = gameButtonCb;
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
    document.getElementById('welcomeCloseButton').addEventListener(
        'blur', () => speaker.cancel());
    MicroModal.show(this.modalId);

    document.getElementById('welcomeButtonReplay').addEventListener('click',
        () => {
          speaker.cancel();
          speaker.modalToText(document.getElementById(this.modalId));
        });
    speaker.modalToText(document.getElementById(this.modalId));
    this.registerTutorialButton();
    this.registerGameButton();
  }

  /**
   * Adds a callback to the tutorial button.
   */
  registerTutorialButton() {
    document.getElementById('tutorialButton').addEventListener('click',
        () => {
          MicroModal.close(this.modalId);
          this.tutorialButtonCb();
        });
  }

  /**
   * Adds a callback to the tutorial button.
   */
  registerGameButton() {
    document.getElementById('gameButton').addEventListener('click',
        () => {
          MicroModal.close(this.modalId);
          this.gameButtonCb();
        });
  }

  /**
   * Creates the dom for the modal.
   */
  createDom() {
    /* eslint-disable max-len */
    document.getElementById(this.modalId).innerHTML = `
     <div class="modal__overlay" tabindex="-1" data-micromodal-close>
      <div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="modal-1-title">
        <header class="modal__header">
          <h2 class="modal__title" id="modal-1-title">
            Welcome To Blockly Games Music!
          </h2>
          <button class="modal__close" aria-label="Close modal" id="welcomeCloseButton" data-micromodal-close></button>
        </header>
        <main class="modal__content" id="modal-1-content">
          <p>
            Use the tab key to cycle through your options. If you have never
            played before we recommend you start with the tutorial.
          </p>
        </main>
        <footer class="modal__footer">
          <button class="modal__btn modal__btn-primary" id="tutorialButton">Go to the tutorial</button>
          <button class="modal__btn modal__btn-primary" id="gameButton">Go to the game</button>
          <button class="modal__btn modal__btn-primary" id="welcomeButtonReplay">Replay Instructions</button>
        </footer>
      </div>
    </div>`;
    /* eslint-enable max-len */
  }
}
