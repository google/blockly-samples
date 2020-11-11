/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Multi-step tutorial using modals.
 */
'use strict';

import {TutorialStep} from './tutorial_step';
import MicroModal from 'micromodal';

/**
 * A multi-step tutorial for the accessible music game.
 */
export class Tutorial {
  /**
   * Class for a tutorial.
   * @constructor
   */
  constructor() {
    /**
     * The id of the modal.
     * @type {string}
     */
    this.modalId = 'tutorialModal';

    /**
     * The id of the tutorial text.
     * @type {string}
     */
    this.stepTextId = this.modalId + 'Text';

    /**
     * The id of the next step button.
     * @type {string}
     */
    this.stepButtonId = this.modalId + 'StepBtn';

    /**
     * The id of the hide modal button.
     * @type {string}
     */
    this.hideButtonId = this.modalId + 'HideBtn';

    /**
     * An array of steps in the tutorial.
     * @type {Array<!TutorialStep>}
     */
    this.steps = Tutorial.STEPS_TEXT.map(
        (text) => new TutorialStep(text, this.stepTextId, this.nextStep)
    );

    /**
     * The index of the currently active step.
     * @type {number}
     */
    this.curStepIndex = 0;

    /**
     * The currently active step.
     * @type {TutorialStep}
     */
    this.curStep = this.steps[this.curStepIndex];
  }

  /**
   * Initialize DOM and show.
   */
  init() {
    this.createDom();
    this.addCallbacks();
    MicroModal.show(this.modalId);
    this.curStep.show();
  }

  /**
   * Display the next step, or end the tutorial if there are no more steps.
   */
  nextStep() {
    this.curStepIndex++;
    if (this.curStepIndex < this.steps.length) {
      this.curStep = this.steps[this.curStepIndex];
      this.curStep.show();
    } else {
      this.done();
    }
  }

  /**
   * End the tutorial.
   */
  done() {
    MicroModal.close(this.modalId);
  }

  /**
   * Add necessary handlers for any buttons on the modal.
   */
  addCallbacks() {
    document.getElementById(this.stepButtonId).addEventListener('click',
        () => {
          this.nextStep();
        });
    document.getElementById(this.hideButtonId).addEventListener('click',
        () => {
          MicroModal.close(this.modalId);
        });
  }

  /**
   * Create the dom for the modal.
   */
  createDom() {
    /* eslint-disable max-len */
    document.getElementById(this.modalId).innerHTML = `
     <div class="modal__overlay" tabindex="-1" data-micromodal-close>
      <div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="modal-1-title">
        <header class="modal__header">
          <button class="modal__close" aria-label="Close modal" id="tutorialCloseBtn" data-micromodal-close></button>
        </header>
        <main class="modal__content" id="modal-1-content">
          <h2 class="modal__title" id="${this.stepTextId}"></h2>
        </main>
        <footer class="modal__footer">
          <button class="modal__btn modal__btn-primary" aria-label="Hide modal" id="${this.hideButtonId}">Hide modal</button>
          <button class="modal__btn modal__btn-primary" aria-label="Next step" id="${this.stepButtonId}">Next step</button>
        </footer>
      </div>
    </div>`;
    /* eslint-enable max-len */
  }
}

Tutorial.STEPS_TEXT = [
  'Hit enter to move focus to the workspace',
  'Enable keyboard nav by pressing Cmd+Shift+K',
  'Press X to navigate to the first stack of blocks',
  'Press Y to navigate to the first block',
  'Press enter to mark the first block',
];
