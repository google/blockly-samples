/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Music game controller.
 */


import MicroModal from 'micromodal';
import {Music} from './music';
import {HelpModal} from './help_modal';
import {KeyPressModal} from './key_press_modal';
import {WelcomeModal} from './welcome_modal';
import {speaker} from './speaker';

/**
 * Class for a controller for the music game, which handles
 * creation of the game and coordination of related modals, tutorials,
 * etc.
 */
export class MusicGameController {
  /**
   * The constructor for the music game controller.
   */
  constructor() {
    MicroModal.init({
      onClose: () => speaker.cancel(),
    });

    /**
     * The actual game object.
     * @type {Music}
     */
    this.game = new Music();
    this.game.loadLevel(1);

    const helpModal = new HelpModal('modal-1', 'modalButton');
    helpModal.init();

    // Start by showing the key press modal.
    new KeyPressModal(this.showWelcomeModal).init();
  }

  /**
   * Get the current game object.
   * @return {Music} The current game object.
   */
  getGame() {
    return this.game;
  }

  /**
   * Show the welcome modal.
   */
  showWelcomeModal() {
    new WelcomeModal().init();
  }
}
