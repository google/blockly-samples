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
import {ContinuousFlyoutMetrics} from './ContinuousFlyoutMetrics';
import {RecyclableBlockFlyoutInflater} from './RecyclableBlockFlyoutInflater';

/**
 * Class for continuous flyout.
 */
export class ContinuousFlyout extends Blockly.VerticalFlyout {
  /**
   * Target scroll position, used to smoothly scroll to a given category
   * location when selected.
   */
  private scrollTarget?: number;

  /**
   * Map from category name to its position in the flyout.
   */
  private scrollPositions = new Map<string, number>();

  /**
   * The percentage of the distance to the scrollTarget that should be
   * scrolled at a time. Lower values will produce a smoother, slower scroll.
   */
  protected scrollAnimationFraction = 0.3;

  /**
   * Prevents the flyout from closing automatically when a block is dragged out.
   */
  override autoClose = false;

  /**
   * Creates a new ContinuousFlyout.
   *
   * @param workspaceOptions The injection options for the flyout's workspace.
   */
  constructor(workspaceOptions: Blockly.Options) {
    super(workspaceOptions);

    this.getWorkspace().setMetricsManager(
      new ContinuousFlyoutMetrics(this.getWorkspace(), this),
    );

    this.getWorkspace().addChangeListener((e: Blockly.Events.Abstract) => {
      if (e.type === Blockly.Events.VIEWPORT_CHANGE) {
        this.selectCategoryByScrollPosition(-this.getWorkspace().scrollY);
      }
    });

    this.setRecyclingEnabled(true);
  }

  /**
   * Gets parent toolbox.
   * Since we registered the ContinuousToolbox, we know that's its type.
   *
   * @returns Toolbox that owns this flyout.
   */
  private getParentToolbox(): ContinuousToolbox {
    return this.targetWorkspace.getToolbox() as ContinuousToolbox;
  }

  /**
   * Records scroll position for each category in the toolbox.
   * The scroll position is determined by the coordinates of each category's
   * label after the entire flyout has been rendered.
   */
  private recordScrollPositions() {
    this.scrollPositions.clear();
    this.getContents()
      .filter(this.toolboxItemIsLabel.bind(this))
      .map((item) => item.element)
      .forEach((label) => {
        this.scrollPositions.set(
          label.getButtonText(),
          label.getPosition().y - label.height,
        );
      });
  }

  /**
   * Validates and typechecks that the given toolbox item represents a label.
   *
   * @param item The toolbox item to check.
   * @returns True if the item represents a label in the flyout, and is a
   *     Blockly.FlyoutButton.
   */
  protected toolboxItemIsLabel(
    item: Blockly.FlyoutItem,
  ): item is {type: string; element: Blockly.FlyoutButton} {
    return !!(
      item.type === 'label' &&
      item.element instanceof Blockly.FlyoutButton &&
      item.element.isLabel() &&
      this.getParentToolbox().getCategoryByName(item.element.getButtonText())
    );
  }

  /**
   * Selects an item in the toolbox based on the scroll position of the flyout.
   *
   * @param position Current scroll position of the workspace.
   */
  private selectCategoryByScrollPosition(position: number) {
    // If we are currently auto-scrolling, due to selecting a category by
    // clicking on it, do not update the category selection.
    if (this.scrollTarget) {
      return;
    }
    const scaledPosition = Math.round(position / this.getWorkspace().scale);
    // Traverse the array of scroll positions in reverse, so we can select the
    // furthest category that the scroll position is beyond.
    for (const [name, position] of [
      ...this.scrollPositions.entries(),
    ].reverse()) {
      if (scaledPosition >= position) {
        this.getParentToolbox().selectCategoryByName(name);
        return;
      }
    }
  }

  /**
   * Scrolls the flyout to given position.
   *
   * @param position The Y coordinate to scroll to.
   */
  scrollTo(position: number) {
    // Set the scroll target to either the scaled position or the lowest
    // possible scroll point, whichever is smaller.
    const metrics = this.getWorkspace().getMetrics();
    this.scrollTarget = Math.min(
      position * this.getWorkspace().scale,
      metrics.scrollHeight - metrics.viewHeight,
    );

    this.stepScrollAnimation();
  }

  /**
   * Scrolls the flyout to display the given category at the top.
   *
   * @param category The toolbox category to scroll to in the flyout.
   */
  scrollToCategory(category: Blockly.ISelectableToolboxItem) {
    const position = this.scrollPositions.get(category.getName());
    if (!position) {
      console.warn(`Scroll position not recorded for category ${name}`);
      return;
    }
    this.scrollTo(position);
  }

  /**
   * Step the scrolling animation by scrolling a fraction of the way to
   * a scroll target, and request the next frame if necessary.
   */
  private stepScrollAnimation() {
    if (!this.scrollTarget) return;

    const currentScrollPos = -this.getWorkspace().scrollY;
    const diff = this.scrollTarget - currentScrollPos;
    if (Math.abs(diff) < 1) {
      this.getWorkspace().scrollbar?.setY(this.scrollTarget);
      this.scrollTarget = undefined;
      return;
    }
    this.getWorkspace().scrollbar?.setY(
      currentScrollPos + diff * this.scrollAnimationFraction,
    );

    requestAnimationFrame(this.stepScrollAnimation.bind(this));
  }

  /**
   * Handles mouse wheel events.
   *
   * @param e The mouse wheel event to handle.
   */
  protected override wheel_(e: WheelEvent) {
    // Don't scroll in response to mouse wheel events if we're currently
    // animating scrolling to a category.
    if (!this.scrollTarget) {
      super.wheel_(e);
    }
  }

  /**
   * Calculates the additional padding needed at the bottom of the flyout in
   * order to make it possible to scroll to the top of the last category.
   *
   * @param contentMetrics Content metrics for the flyout.
   * @param viewMetrics View metrics for the flyout.
   * @returns The additional bottom padding needed.
   */
  calculateBottomPadding(
    contentMetrics: Blockly.MetricsManager.ContainerRegion,
    viewMetrics: Blockly.MetricsManager.ContainerRegion,
  ): number {
    if (this.scrollPositions.size > 0) {
      const lastPosition =
        ([...this.scrollPositions.values()].pop() ?? 0) *
        this.getWorkspace().scale;
      const lastCategoryHeight = contentMetrics.height - lastPosition;
      if (lastCategoryHeight < viewMetrics.height) {
        return viewMetrics.height - lastCategoryHeight;
      }
    }
    return 0;
  }

  /**
   * Returns the X coordinate for the flyout's position.
   */
  override getX(): number {
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
   * Displays the given contents in the flyout.
   *
   * @param flyoutDef A string or JSON object specifying the contents of the
   *     flyout.
   */
  override show(flyoutDef: Blockly.utils.toolbox.FlyoutDefinition | string) {
    super.show(flyoutDef);
    this.recordScrollPositions();
    this.getWorkspace().resizeContents();
    if (!this.getParentToolbox().getSelectedItem()) {
      this.selectCategoryByScrollPosition(0);
    }
    this.getRecyclableInflater().emptyRecycledBlocks();
  }

  /**
   * Sets the function used to determine whether a block is recyclable.
   *
   * @param func The function used to determine if a block is recyclable.
   */
  setBlockIsRecyclable(func: (block: Blockly.Block) => boolean) {
    this.getRecyclableInflater().setRecyclingEligibilityChecker(func);
  }

  /**
   * Set whether the flyout can recycle blocks.
   *
   * @param isEnabled True to allow blocks to be recycled, false otherwise.
   */
  setRecyclingEnabled(isEnabled: boolean) {
    this.getRecyclableInflater().setRecyclingEnabled(isEnabled);
  }

  /**
   * Returns the recyclable block flyout inflater.
   *
   * @returns The recyclable inflater.
   */
  protected getRecyclableInflater(): RecyclableBlockFlyoutInflater {
    const inflater = this.getInflaterForType('block');
    if (!(inflater instanceof RecyclableBlockFlyoutInflater)) {
      throw new Error('The RecyclableBlockFlyoutInflater is not registered.');
    }

    return inflater;
  }
}
