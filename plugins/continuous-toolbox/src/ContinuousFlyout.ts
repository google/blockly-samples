/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Flyout that supports always-open continuous scrolling.
 */

import * as Blockly from 'blockly/core';
import {ContinuousToolbox} from './ContinuousToolbox';
import {ContinuousFlyoutMetrics} from './ContinuousMetricsFlyout';
import {RecyclableBlockFlyoutInflater} from './recyclable_block_flyout_inflater';

/**
 * Class for continuous flyout.
 */
export class ContinuousFlyout extends Blockly.VerticalFlyout {
  /** @override */
  constructor(workspaceOptions) {
    super(workspaceOptions);

    /**
     * List of scroll positions for each category.
     * @type {!Array<{name: string, position: !Object}>}
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

    this.workspace_.setMetricsManager(
      new ContinuousFlyoutMetrics(this.workspace_, this),
    );

    this.workspace_.addChangeListener((e) => {
      if (e.type === Blockly.Events.VIEWPORT_CHANGE) {
        this.selectCategoryByScrollPosition_(-this.workspace_.scrollY);
      }
    });

    this.autoClose = false;
  }

  /**
   * Gets parent toolbox.
   * Since we registered the ContinuousToolbox, we know that's its type.
   * @returns {!ContinuousToolbox} Toolbox that owns this flyout.
   * @private
   */
  getParentToolbox_() {
    const toolbox = this.targetWorkspace.getToolbox();
    return /** @type {!ContinuousToolbox} */ (toolbox);
  }

  /**
   * Records scroll position for each category in the toolbox.
   * The scroll position is determined by the coordinates of each category's
   * label after the entire flyout has been rendered.
   * @package
   */
  recordScrollPositions() {
    this.scrollPositions = [];
    const categoryLabels = this.getContents()
      .filter(this.toolboxItemIsLabel.bind(this))
      .map((item) => item.element);
    for (const [index, label] of categoryLabels.entries()) {
      this.scrollPositions.push({
        name: label.getButtonText(),
        position: label.getPosition(),
      });
    }
  }

  toolboxItemIsLabel(item) {
    return (
      item.type === 'label' &&
      item.element.isLabel() &&
      this.getParentToolbox_().getCategoryByName(item.element.getButtonText())
    );
  }

  /**
   * Returns the scroll position for the given category name.
   * @param {string} name Category name.
   * @returns {?Object} Scroll position for given category, or null if not
   *     found.
   * @package
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
   * Selects an item in the toolbox based on the scroll position of the flyout.
   * @param {number} position Current scroll position of the workspace.
   * @private
   */
  selectCategoryByScrollPosition_(position) {
    // If we are currently auto-scrolling, due to selecting a category by
    // clicking on it, do not update the category selection.
    if (this.scrollTarget !== null) {
      return;
    }
    const scaledPosition = Math.round(position / this.workspace_.scale);
    // Traverse the array of scroll positions in reverse, so we can select the
    // furthest category that the scroll position is beyond.
    for (let i = this.scrollPositions.length - 1; i >= 0; i--) {
      const category = this.scrollPositions[i];
      if (scaledPosition >= category.position.y) {
        this.getParentToolbox_().selectCategoryByName(category.name);
        return;
      }
    }
  }

  /**
   * Scrolls flyout to given position.
   * @param {number} position The Y coordinate to scroll to.
   */
  scrollTo(position) {
    // Set the scroll target to either the scaled position or the lowest
    // possible scroll point, whichever is smaller.
    const metrics = this.workspace_.getMetrics();
    this.scrollTarget = Math.min(
      position * this.workspace_.scale,
      metrics.scrollHeight - metrics.viewHeight,
    );

    this.stepScrollAnimation_();
  }

  /**
   * Step the scrolling animation by scrolling a fraction of the way to
   * a scroll target, and request the next frame if necessary.
   * @private
   */
  stepScrollAnimation_() {
    if (this.scrollTarget === null) {
      return;
    }

    const currentScrollPos = -this.workspace_.scrollY;
    const diff = this.scrollTarget - currentScrollPos;
    if (Math.abs(diff) < 1) {
      this.workspace_.scrollbar.setY(this.scrollTarget);
      this.scrollTarget = null;
      return;
    }
    this.workspace_.scrollbar.setY(
      currentScrollPos + diff * this.scrollAnimationFraction,
    );

    requestAnimationFrame(this.stepScrollAnimation_.bind(this));
  }

  /**
   * Add additional padding to the bottom of the flyout if needed,
   * in order to make it possible to scroll to the top of the last category.
   * @param {!Blockly.MetricsManager.ContainerRegion} contentMetrics Content
   *    metrics for the flyout.
   * @param {!Blockly.MetricsManager.ContainerRegion} viewMetrics View metrics
   *    for the flyout.
   * @returns {number} Additional bottom padding.
   */
  calculateBottomPadding(contentMetrics, viewMetrics) {
    if (this.scrollPositions.length > 0) {
      const lastCategory =
        this.scrollPositions[this.scrollPositions.length - 1];
      const lastPosition = lastCategory.position.y * this.workspace_.scale;
      const lastCategoryHeight = contentMetrics.height - lastPosition;
      if (lastCategoryHeight < viewMetrics.height) {
        return viewMetrics.height - lastCategoryHeight;
      }
    }
    return 0;
  }

  /** @override */
  getX() {
    if (
      this.isVisible() &&
      this.targetWorkspace.toolboxPosition === this.toolboxPosition_ &&
      this.targetWorkspace.getToolbox() &&
      this.toolboxPosition_ !== Blockly.utils.toolbox.Position.LEFT
    ) {
      // This makes it so blocks cannot go under the flyout in RTL mode.
      return this.targetWorkspace.getMetricsManager().getViewMetrics().width;
    }

    return super.getX();
  }

  /**
   * @override
   */
  show(flyoutDef) {
    super.show(flyoutDef);
    this.recordScrollPositions();
    this.workspace_.resizeContents();
    if (!this.getParentToolbox_().getSelectedItem()) {
      this.selectCategoryByScrollPosition_(0);
    }
    const inflater = this.getInflaterForType('block');
    if (inflater instanceof RecyclableBlockFlyoutInflater) {
      inflater.emptyRecycledBlocks();
    }
  }

  /**
   * Sets the function used to determine whether a block is recyclable.
   * @param {function(!Blockly.BlockSvg):boolean} func The function used to
   *     determine if a block is recyclable.
   * @public
   */
  setBlockIsRecyclable(func) {
    this.blockIsRecyclable_ = func;
  }

  /**
   * Set whether the flyout can recycle blocks.
   * @param {boolean} isEnabled True to allow blocks to be recycled, false
   *     otherwise.
   * @public
   */
  setRecyclingEnabled(isEnabled) {
    const inflater = this.getInflaterForType('block');
    if (inflater instanceof RecyclableBlockFlyoutInflater) {
      inflater.setRecyclingEnabled(isEnabled);
    }
  }
}
