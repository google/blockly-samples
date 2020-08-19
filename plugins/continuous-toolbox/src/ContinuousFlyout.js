/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Flyout that supports always-open continuous scrolling.
 */

import * as Blockly from 'blockly/core';

/**
 * Class for continuous flyout.
 */
export class ContinuousFlyout extends Blockly.VerticalFlyout {
  /** @override */
  constructor(workspaceOptions) {
    super(workspaceOptions);

    /** @type {!Array<{name: string, position: Object}>} */
    this.scrollPositions = [];

    /**
     * Target scroll position, used to smoothly scroll to a given category
     * location when selected.
     * @type {?number}
     */
    this.scrollTarget = null;

    /**
     * The percentage of the distance to the scrollTarget that should be
     * scrolled at a time. Lower values will produce a smoother, slower scroll.
     */
    this.scrollAnimationFraction = 0.3;
  }

  /**
   * Records scroll position for each category in the toolbox.
   * The scroll position is determined by the coordinates of each category's
   * label after the entire flyout has been rendered.
   */
  recordScrollPositions() {
    for (const button of this.buttons_) {
      // TODO: Need to add a getter for these properties or change visibility.
      if (button.isLabel_) {
        this.scrollPositions.push({
          name: button.text_,
          position: button.getPosition(),
        });
      }
    }
  }

  /**
   * Returns the scroll position for the given category name.
   * @param {string} name Category name.
   * @return {?Object} Scroll position for given category, or null if not found.
   */
  getCategoryScrollPosition(name) {
    for (const scrollInfo of this.scrollPositions) {
      if (scrollInfo.name === name) {
        return scrollInfo.position;
      }
    }
    console.warn(`Scroll position not recorded for category ${name}`);
    return null;
  }

  /**
   * Step the scrolling animation by scrolling a fraction of the way to
   * a scroll target, and request the next frame if necessary.
   * @package
   */
  stepScrollAnimation() {
    if (!this.scrollTarget) {
      return;
    }

    const currentScrollPos = -this.workspace_.scrollY;
    const diff = this.scrollTarget - currentScrollPos;
    if (Math.abs(diff) < 1) {
      this.scrollbar.set(this.scrollTarget);
      this.scrollTarget = null;
      return;
    }
    this.scrollbar.set(currentScrollPos + diff * this.scrollAnimationFraction);

    requestAnimationFrame(this.stepScrollAnimation.bind(this));
  }
}
