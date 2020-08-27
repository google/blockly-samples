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

    /**
     * List of scroll positions for each category.
     * @type {!Array<{name: string, position: Object}>}
     */
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
     * @type {number}
     */
    this.scrollAnimationFraction = 0.3;

    this.autoClose = false;
  }

  /**
   * Records scroll position for each category in the toolbox.
   * The scroll position is determined by the coordinates of each category's
   * label after the entire flyout has been rendered.
   */
  recordScrollPositions() {
    for (const button of this.buttons_) {
      if (button.isLabel()) {
        this.scrollPositions.push({
          name: button.getButtonText(),
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
   * Scrolls flyout to given position.
   * @param {number} position The x coordinate to scroll to.
   */
  scrollTo(position) {
    // Set the scroll target to either the scaled position or the lowest
    // possible scroll point, whichever is smaller
    const metrics = this.workspace_.getMetrics();
    this.scrollTarget = Math.min(position * this.workspace_.scale,
        metrics.contentHeight - metrics.viewHeight);

    this.stepScrollAnimation();
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
