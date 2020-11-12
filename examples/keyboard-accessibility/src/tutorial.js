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
import Blockly from 'blockly/core';
import MicroModal from 'micromodal';
import {speaker} from './speaker';

/**
 * A multi-step tutorial for the accessible music game.
 */
export class Tutorial {
  /**
   * Class for a tutorial.
   * @param {Blockly.WorkspaceSvg} workspace The workspace the user
   *     will interact with.
   * @constructor
   */
  constructor(workspace) {
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
    this.steps = Tutorial.STEP_OBJECTS.map(
        (obj) => new TutorialStep(obj.text, this.stepTextId, this.nextStep)
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

    /**
     * The Blockly workspace the user will interact with.
     * @type {Blockly.WorkspaceSvg}
     */
    this.workspace = workspace;

    /**
     * The node that was selected on the workspace when the modal
     * opened.
     * @type {Blockly.ASTNode}
     */
    this.curNode = null;
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
      MicroModal.show(this.modalId);
      this.curStep.show();
      this.stashCursor();
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
   * Save the current cursor node and disable keyboard nav.
   * Call this when opening the modal.
   */
  stashCursor() {
    this.curNode = this.workspace.getCursor().getCurNode();
    Blockly.navigation.disableKeyboardAccessibility();
  }

  /**
   * Reenable keyboard nav and move the cursor to the previously
   * selected cursor node. Call this when closing the modal.
   */
  popCursor() {
    Blockly.navigation.enableKeyboardAccessibility();
    if (this.curNode) {
      this.workspace.getCursor().setCurNode(this.curNode);
      speaker.cancel();
    }
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
        (e) => {
          MicroModal.close(this.modalId);
          this.popCursor();
          Tutorial.STEP_OBJECTS[this.curStepIndex].onStart(this);
          e.stopPropagation();
          e.preventDefault();
        });
  }

  /**
   * Create the dom for the modal.
   */
  createDom() {
    document.getElementById(this.modalId).innerHTML = `
     <div class="modal__overlay" tabindex="-1" data-micromodal-close>
      <div class="modal__container" role="dialog" aria-modal="true"
        aria-labelledby="modal-1-title">
        <header class="modal__header">
          <button class="modal__close" aria-label="Close modal"
            id="tutorialCloseBtn" data-micromodal-close></button>
        </header>
        <main class="modal__content" id="modal-1-content">
          <h2 class="modal__title" id="${this.stepTextId}"></h2>
        </main>
        <footer class="modal__footer">
          <button class="modal__btn modal__btn-primary" aria-label="Hide modal"
            id="${this.hideButtonId}">Hide modal</button>
          <button class="modal__btn modal__btn-primary" aria-label="Next step"
            id="${this.stepButtonId}">Next step</button>
        </footer>
      </div>
    </div>`;
  }
}

Tutorial.STEP_OBJECTS = [
  {
    text:
      `Hit enter to go to the workspace and hear
      a description of the first block.`,
    onStart: function(tutorial) {
      window.setTimeout(() => {
        tutorial.nextStep();
      }, 2000);
    },
  },
  {
    text:
      'Press the down arrow key to go to the first connection on the block.',
    onStart: function(tutorial) {
      const workspace = tutorial.workspace;
      const listener = function(event) {
        if (event.type === Blockly.Events.MARKER_MOVE) {
          const curNode = event.newNode;
          const correctLocation =
              workspace.getTopBlocks()[0].inputList[1].connection;
          if (curNode) {
            const location = curNode.getLocation();
            if (location === correctLocation) {
              workspace.removeChangeListener(wrapper);
              tutorial.nextStep();
            }
          }
        }
      };

      // Add a shortcut in place of the down arrow shortcut.
      const wrapper = workspace.addChangeListener(listener);
    },
  },
  {
    text: 'Last step',
    onStart: function(tutorial) {
    },
  },
];
