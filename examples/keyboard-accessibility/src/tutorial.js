/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Multi-step tutorial using modals.
 */
'use strict';

import Blockly from 'blockly/core';
import {Music} from './music';
import {TutorialStep} from './tutorial_step';
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
   * @param {Music} music A reference to the music logic object.
   * @param {function(string)} goalUpdateCb The callback function for goal
   *    change.
   * @param {function} endTutorialCb The function to call at the end of the
   *     tutorial.
   * @constructor
   */
  constructor(workspace, music, goalUpdateCb, endTutorialCb) {
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
        (obj) => new TutorialStep(obj.text, this.stepTextId, this.nextStep, obj.goalText)
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
     * The Music logic object.
     * @type {Music}
     */
    this.music = music;

    /**
     * The node that was selected on the workspace when the modal
     * opened.
     * @type {Blockly.ASTNode}
     */
    this.curNode = null;

    /**
     * Callback function for goal update, which accepts a string
     *     with the text to set the goal to.
     * @type {function(string)}
     */
    this.goalUpdateCb = goalUpdateCb;

    /**
     * Callback function for the end of the tutorial.
     * @type {function}
     */
    this.endTutorialCb = endTutorialCb;
  }

  /**
   * Initialize DOM and show.
   */
  init() {
    this.createDom();
    this.addCallbacks();
    MicroModal.show(this.modalId, {
      onClose: () => this.onModalClose(),
    });
    this.curStep.show();
    this.registerPlayHelpText();
    this.loadWorkspace();
    this.music.setOnFinishPlayCallback(null);
  }

  /**
   * Load the workspace for the tutorial.
   */
  loadWorkspace() {
    const toolboxJson = {
      'kind': 'flyoutToolbox',
      'contents': [
        {
          'kind': 'block',
          'blockxml': `<block type="music_note">
                        <field name="DURATION">0.25</field>
                        <value name="PITCH">
                          <shadow type="music_pitch">
                            <field name="PITCH">C4</field>
                          </shadow>
                        </value>
                      </block>`,
        },
        {
          'kind': 'block',
          'type': 'music_rest',
        },
      ],
    };
    this.workspace.updateToolbox(toolboxJson);
    const starterXml =
        `<xml>
            <block type="music_start" deletable="false" x="180"
            y="50"></block>
          </xml>`;
    this.workspace.clear();
    Blockly.Xml.domToWorkspace(
        Blockly.Xml.textToDom(starterXml), this.workspace);
  }

  /**
   * Registers shortcut to replay the current tutorial step.
   */
  registerPlayHelpText() {
    /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
    const playHelpText = {
      name: 'playHelpText',
      preconditionFn: function(workspace) {
        return !workspace.options.readOnly;
      },
      callback: () => {
        speaker.speak('Goal: ' + this.curStep.goalText, true);
      },
    };

    Blockly.ShortcutRegistry.registry.register(playHelpText);
    Blockly.ShortcutRegistry.registry.addKeyMapping(
        Blockly.utils.KeyCodes.H, playHelpText.name);
  }

  onModalClose() {
    speaker.cancel();
    this.startStep();
  }

  startStep() {
    // MicroModal.close(this.modalId);
    this.popCursor();
    Tutorial.STEP_OBJECTS[this.curStepIndex].onStart(this);
  }

  /**
   * Display the next step, or end the tutorial if there are no more steps.
   */
  nextStep() {
    this.curStepIndex++;
    if (this.curStepIndex < this.steps.length) {
      this.curStep = this.steps[this.curStepIndex];
      MicroModal.show(this.modalId, {
        onClose: () => this.onModalClose(),
      });
      this.curStep.show();
      this.goalUpdateCb(Tutorial.STEP_OBJECTS[this.curStepIndex].goalText);
      this.stashCursor();
    } else {
      this.done();
    }
  }

  /**
   * End the tutorial.
   */
  done() {
    MicroModal.close(this.modalId, {
      onClose: () => speaker.cancel(),
    });
    Blockly.navigation.disableKeyboardAccessibility();
    Blockly.ShortcutRegistry.registry.unregister('playHelpText');
    this.endTutorialCb();
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
      // this.workspace.getCursor().setCurNode(this.curNode);
      // speaker.cancel();
    }
  }

  /**
   * Add necessary handlers for any buttons on the modal.
   */
  addCallbacks() {
    document.getElementById(this.hideButtonId).addEventListener('click',
        () => {
          // Closing the modal should trigger start step.
          MicroModal.close(this.modalId);
        });
    document.getElementById(this.stepButtonId).addEventListener('click',
        () => {
          this.nextStep();
        });
  }

  /**
   * Create the dom for the modal.
   */
  createDom() {
    document.getElementById(this.modalId).innerHTML = `
     <div class="modal__overlay" tabindex="-1">
      <div class="modal__container" role="dialog" aria-modal="true"
        aria-labelledby="modal-1-title">
        <header class="modal__header">
        </header>
        <main class="modal__content" id="modal-1-content">
          <h2 class="modal__title" id="${this.stepTextId}"></h2>
        </main>
        <footer class="modal__footer">
          <button class="modal__btn modal__btn-primary" aria-label="Start step"
            id="${this.hideButtonId}">Start step</button>
          <button class="modal__btn modal__btn-secondary" aria-label="Skip step"
            id="${this.stepButtonId}">Skip step</button>
        </footer>
      </div>
    </div>`;
  }

  /**
   * Get the current location, based on the event.
   * @param {Blockly.Event} event An event to inspect for a cursor location.
   * @return {Blockly.ASTNode} The current cursor location, or null if the event
   *     didn't have one.
   */
  getCurrentLocation(event) {
    const curNode = event.newNode;
    if (curNode) {
      return curNode.getLocation();
    }
    return null;
  }
}

Tutorial.STEP_OBJECTS = [
  {
    text: `In this tutorial you will write code that plays musical notes. Press
    H to replay the goal for the current step. Press Enter to go to the next
    step.`,
    goalText: `Press Enter to go to the next step.`,
    onStart: function(tutorial) {
      setTimeout(()=> tutorial.nextStep(), 10);
    },
  },
  {
    text: `You can move around the blocks of code with the up and down arrows.
    You will hear descriptions as you move around the blocks. .
    All blocks have connection points, which are places where you can add more
    code. . Your goal: Use the down arrow to move to a connection point.
    Hit enter to begin. `,
    goalText: `Use the down arrow to move to a connection point.`,
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
              setTimeout(()=>{
                workspace.removeChangeListener(wrapper);
                tutorial.nextStep();
              }, 4300);
            }
          }
        }
      };

      // Add a shortcut in place of the down arrow shortcut.
      const wrapper = workspace.addChangeListener(listener);
    },
  },
  {
    text:
      `Great! You moved to a connection point. .
      To add more code, you first mark a location and then select the block you
      want to add. .
      Your goal: Navigate to the connection point, then press enter to mark it.
      Hit enter to begin. `,
    goalText: `Navigate to the connection point, then press enter to mark it.`,
    onStart: function(tutorial) {
      const workspace = tutorial.workspace;
      const listener = function(event) {
        if (event.type === Blockly.Events.MARKER_MOVE) {
          const currentLocation = tutorial.getCurrentLocation(event);
          if (currentLocation && !event.isCursor) {
            const correctLocation =
                workspace.getTopBlocks()[0].inputList[1].connection;
            if (currentLocation === correctLocation) {
              setTimeout(()=>{
                workspace.removeChangeListener(wrapper);
                tutorial.nextStep();
              }, 2000);
            }
          }
        }
      };

      // Add a shortcut in place of the down arrow shortcut.
      const wrapper = workspace.addChangeListener(listener);
    },
  },
  {
    text: `Great! You marked a connection point. Now you can add more code
    blocks. .
    The toolbox is a list of code blocks that you can add to the workspace.
    You can always open the toolbox by pressing T. .
    Your goal: Press T to open the toolbox, then use the up and down arrows to
    explore it. . Press F when you are finished exploring.`,
    goalText: `Press T to open the toolbox, then use the up and down arrows to
      explore it. . Press F when you are finished exploring.`,
    onStart: function(tutorial) {
      /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
      const finishStep = {
        name: 'finishStep',
        preconditionFn: function(workspace) {
          return workspace.keyboardAccessibilityMode &&
              !workspace.options.readOnly;
        },
        callback: () => {
          tutorial.nextStep();
          Blockly.ShortcutRegistry.registry.unregister('finishStep');
        },
      };

      Blockly.ShortcutRegistry.registry.register(finishStep);
      const shiftF = Blockly.ShortcutRegistry.registry.createSerializedKey(
          Blockly.utils.KeyCodes.F);
      Blockly.ShortcutRegistry.registry.addKeyMapping(
          shiftF, finishStep.name);
    },
  },
  {
    text: `Great! Now it’s time to put it all together.
    Your goal: Navigate to the connection and mark it, then press T to open the
    toolbox. Find the block that says “play whole note c4” and press
    enter to add it at the marked location.`,
    goalText: `Navigate to the connection and mark it, then press T to open the
    toolbox. Find the block that says “play whole note c4” and press
    enter to add it at the marked location.`,
    onStart: function(tutorial) {
      const workspace = tutorial.workspace;
      const listener = function(event) {
        if (event.type === Blockly.Events.MARKER_MOVE) {
          const currentLocation = tutorial.getCurrentLocation(event);
          if (currentLocation && event.isCursor &&
              workspace.getAllBlocks().length > 1) {
            const correctLocation =
                workspace.getAllBlocks()[1].previousConnection;
            if (currentLocation === correctLocation) {
              setTimeout(()=>{
                workspace.removeChangeListener(wrapper);
                tutorial.nextStep();
              }, 5400);
            }
          }
        }
      };

      // Add a shortcut in place of the down arrow shortcut.
      const wrapper = workspace.addChangeListener(listener);
    },
  },
  {
    text: `Great! Your goal: Press Shift and P at the same time to run your
    code. You should hear a note play!`,
    goalText: `Press Shift and P at the same time to run your code.`,
    onStart: function(tutorial) {
      const workspace = tutorial.workspace;
      const starterXml =
        `<xml>
            <block type="music_note">
                    <field name="DURATION">0.25</field>
                    <value name="PITCH">
                      <shadow type="music_pitch">
                        <field name="PITCH">C4</field>
                      </shadow>
                    </value>
                  </block>
          </xml>`;
      Blockly.Xml.domToWorkspace(
          Blockly.Xml.textToDom(starterXml), workspace);
      const musicNote = workspace.getBlocksByType('music_note')[0];
      const musicStart = workspace.getBlocksByType('music_start')[0];
      musicStart.inputList[1].connection.connect(musicNote.previousConnection);

      tutorial.music.setOnFinishPlayCallback(()=>{
        tutorial.nextStep();
      });
    },
  },
  {
    text: `Congratulations! You have finished the tutorial! In the game use
    H to give you tips and Shift and P to play your solution. !
    Hit enter to start the game.`,
    goalText: `Start the game.`,
    onStart: function(tutorial) {
      setTimeout(() => tutorial.nextStep(), 100);
    },
  },
];
