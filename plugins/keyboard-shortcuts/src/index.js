/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Keyboard shortcuts plugin.
 * @author samelh@google.com (Sam El-Husseini)
 */

import * as Blockly from 'blockly/core';
import {KeyboardShortcutsModal} from './KeyboardShortcutsModal';

/**
 * Class responsible for creating a Keyboard Shortcuts plugin.
 */
export class KeyboardShortcuts {
  /**
   * Constructor for creating a keyboard shortcuts plugin.
   * @param {!Blockly.WorkspaceSvg} workspace The Blockly workspace.
   */
  constructor(workspace) {
    /**
     * The workspace to attach the keyboard bindings to.
     * @type {!Blockly.WorkspaceSvg}
     * @protected
     */
    this.workspace_ = workspace;

    /**
     *
     */
    this.keyboardShortcuts_ = null;

    this.onKeydown_ = this.onKeydown_.bind(this);

    /**
     *
     */
    this.keyMap_ = {};

    this.scrollingAnimation_ = null;
  }

  /**
   * @param e
   * @private
   */
  onKeydown_(e) {
    const keyCode = e.keyCode;
    this.keyMap_[keyCode] = e.type === 'keydown';

    if (!this.scrollingAnimation_ &&
        (this.keyMap_[Blockly.utils.KeyCodes.UP] ||
         this.keyMap_[Blockly.utils.KeyCodes.DOWN] ||
         this.keyMap_[Blockly.utils.KeyCodes.LEFT] ||
         this.keyMap_[Blockly.utils.KeyCodes.RIGHT])) {
      this.scrollAnimation_();
    }

    if (this.keyMap_[Blockly.utils.KeyCodes.EQUALS]) {
      // Zoom in.
      this.workspace_.zoomCenter(1);
    } else if (this.keyMap_[Blockly.utils.KeyCodes.DASH]) {
      // Zoom out.
      this.workspace_.zoomCenter(-1);
    } else if (
        this.keyMap_[Blockly.utils.KeyCodes.SHIFT] &&
        this.keyMap_[Blockly.utils.KeyCodes.SLASH]) {
      // Show Keyboard shortcuts.
      this.keyboardShortcuts_.show();
      this.keyMap_ = {};
    } else if (this.keyMap_[Blockly.utils.KeyCodes.ESC]) {
      this.keyboardShortcuts_.hide();
    }
  }

  /**
   *
   */
  scrollAnimation_() {
    let currentTime = 0;
    const increment = 10;
    const duration = 500;  // 500 ms.
    const easeInOutQuad = (t, b, c, d) => {
      t /= d / 2;
      if (t < 1) {
        return c / 2 * t * t + b;
      }
      t--;
      return -c / 2 * (t * (t - 2) - 1) + b;
    };
    const animateScroll = () => {
      // increment the time
      if (currentTime < duration) {
        currentTime += increment;
      }

      const xOffset = this.keyMap_[Blockly.utils.KeyCodes.LEFT] ?
          10 :
          (this.keyMap_[Blockly.utils.KeyCodes.RIGHT] ? -10 : 0);
      const yOffset = this.keyMap_[Blockly.utils.KeyCodes.UP] ?
          10 :
          (this.keyMap_[Blockly.utils.KeyCodes.DOWN] ? -10 : 0);

      if (xOffset === 0 && yOffset === 0) {
        // Transition is over.
        cancelAnimationFrame(this.scrollingAnimation_);
        this.scrollingAnimation_ = null;
        return;
      }

      const newXOffset = easeInOutQuad(currentTime, 0, xOffset, duration);
      const newYOffset = easeInOutQuad(currentTime, 0, yOffset, duration);

      const offsetCoordinates =
          new Blockly.utils.Coordinate(newXOffset, newYOffset);
      const scrollCoordinates = new Blockly.utils.Coordinate(
          this.workspace_.scrollX, this.workspace_.scrollY);
      const newXY =
          Blockly.utils.Coordinate.sum(scrollCoordinates, offsetCoordinates);

      // Scroll the workspace.
      this.workspace_.scroll(newXY.x, newXY.y);

      this.scrollingAnimation_ = window.requestAnimationFrame(animateScroll);
    };
    animateScroll();
  }

  /**
   * Initialize.
   */
  init() {
    // Add keyboard handler.
    const injectionDiv = this.workspace_.getInjectionDiv();
    injectionDiv.addEventListener('keydown', this.onKeydown_);
    injectionDiv.addEventListener('keyup', this.onKeydown_);

    this.keyboardShortcuts_ = new KeyboardShortcutsModal(this.workspace_);
    this.keyboardShortcuts_.init();
  }

  /**
   *
   */
  dispose() {
    const injectionDiv = this.workspace_.getInjectionDiv();
    injectionDiv.removeEventListener('keydown', this.onKeydown_);
    injectionDiv.removeEventListener('keyup', this.onKeydown_);
  }
}
