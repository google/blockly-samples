/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview This adds a method to the block dragger to allow a block
 * to be moved when it is being dragged.
 */

import * as Blockly from 'blockly/core';
import {AutoScroll} from './AutoScroll';

/**
 * A block dragger that adds the functionality for a block to be moved while
 * someone is dragging it.
 */
export class ScrollBlockDragger extends Blockly.BlockDragger {
  /** @override */
  constructor(block, workspace) {
    super(block, workspace);

    /**
     * How much the block has been moved due to scrolling.
     * @type {!Blockly.utils.Coordinate}
     * @protected
     */
    this.scrollDelta_ = new Blockly.utils.Coordinate(0, 0);

    /**
     * How much the block has been moved due to dragging.
     * @type {!Blockly.utils.Coordinate}
     * @protected
     */
    this.dragDelta_ = new Blockly.utils.Coordinate(0, 0);
  }
  /**
   * Updates the location of the block that is being dragged.
   * @param {number} deltaX Horizontal offset in pixel units.
   * @param {number} deltaY Vertical offset in pixel units.
   */
  moveBlockWhileDragging(deltaX, deltaY) {
    this.scrollDelta_.x -= deltaX;
    this.scrollDelta_.y -= deltaY;

    // Moves the parent block drag surface in the opposite direction of the
    // child drag surface. This makes the block stay under the cursor.
    this.workspace_.getBlockDragSurface().translateBy(-deltaX, -deltaY);


    // The total amount the block has moved since being picked up.
    const totalDelta =
        Blockly.utils.Coordinate.sum(this.scrollDelta_, this.dragDelta_);

    this.dragIcons_(totalDelta);

    // As we scroll, show the insertion markers.
    this.draggedConnectionManager_.update(
        new Blockly.utils.Coordinate(
            totalDelta.x / this.workspace_.scale,
            totalDelta.y / this.workspace_.scale),
        null);
  }

  /**
   * Passes the total amount the block has moved (both from dragging and from
   * scrolling) since it was picked up.
   * @override
   */
  startDrag(currentDragDeltaXY, healStack) {
    const totalDelta =
        Blockly.utils.Coordinate.sum(this.scrollDelta_, currentDragDeltaXY);
    super.startDrag(totalDelta, healStack);
    this.dragDelta_ = currentDragDeltaXY;
  }

  /**
   * Passes the total amount the block has moved (both from dragging and from
   * scrolling) since it was picked up.
   * @override
   */
  drag(e, currentDragDeltaXY) {
    const totalDelta =
        Blockly.utils.Coordinate.sum(this.scrollDelta_, currentDragDeltaXY);
    super.drag(e, totalDelta);
    this.dragDelta_ = currentDragDeltaXY;

    // Calculate the location the block is being dragged to, in ws units.
    // This same calculation is done in super.drag().
    const deltaPx = this.pixelsToWorkspaceUnits_(totalDelta);
    const newLoc = Blockly.utils.Coordinate.sum(this.startXY_, deltaPx);
    this.scrollWorkspaceWhileDragging(newLoc);
  }

  /**
   * Passes the total amount the block has moved (both from dragging and from
   * scrolling) since it was picked up.
   * @override
   */
  endDrag(e, currentDragDeltaXY) {
    // We can not override this method similar to the others because we call
    // drag here with the passed in value.
    // Make sure internal state is fresh.
    this.drag(e, currentDragDeltaXY);
    this.dragIconData_ = [];
    this.fireDragEndEvent_();

    Blockly.utils.dom.stopTextWidthCache();

    Blockly.blockAnimations.disconnectUiStop();
    // Start Change
    const totalDelta =
        Blockly.utils.Coordinate.sum(this.scrollDelta_, currentDragDeltaXY);
    const delta = this.pixelsToWorkspaceUnits_(totalDelta);
    // End Change
    const newLoc = Blockly.utils.Coordinate.sum(this.startXY_, delta);
    this.draggingBlock_.moveOffDragSurface(newLoc);

    const deleted = this.maybeDeleteBlock_();
    if (!deleted) {
      // Moving the block is expensive, so only do it if the block is not
      // deleted.
      this.updateBlockAfterMove_(delta);
    }
    this.workspace_.setResizesEnabled(true);

    this.updateToolboxStyle_(true);

    this.dragDelta_ = currentDragDeltaXY;

    // Added
    this.stopAutoScrolling();
  }

  /**
   * May scroll the workspace as a block is dragged.
   * If a block is dragged near the edge of the workspace, this method will
   * cause the workspace to scroll in the direction the block is being dragged.
   * The workspace will not resize as the block is dragged. The workspace should
   * appear to move out from under the block, i.e., the block should stay under
   * the user's mouse.
   * @param {!Blockly.utils.Coordinate} newLoc New coordinate the block is being
   *     dragged to.
   */
  scrollWorkspaceWhileDragging(newLoc) {
    const SCROLL_DIRECTION_VECTORS = {
      top: new Blockly.utils.Coordinate(0, 1),
      bottom: new Blockly.utils.Coordinate(0, -1),
      left: new Blockly.utils.Coordinate(1, 0),
      right: new Blockly.utils.Coordinate(-1, 0),
    };
    // TODO(maribethb): I just made this up, pick a better one
    // and make this configurable.
    const SCROLL_SPEED = 0.4;

    const candidateScrolls = [];
    let overallScrollVector = new Blockly.utils.Coordinate(0, 0);

    // Get ViewMetrics in workspace coordinates.
    const metrics = this.workspace_.getMetricsManager().getViewMetrics(true);

    // TODO(maribethb): Add fancier logic based on how far out of bounds the
    // block is held.

    // See Blockly.MetricsManager for more information on the metrics used.
    // In particular, it uses workspace coordinates where the top and left
    // of the workspace are negative.
    // More than one scroll vector may apply, for example if the block is
    // dragged to a corner.
    if (newLoc.y < metrics.top) {
      const scrollVector = SCROLL_DIRECTION_VECTORS['top'].scale(SCROLL_SPEED);
      candidateScrolls.push(scrollVector);
    }
    if (newLoc.y > metrics.top + metrics.height) {
      const scrollVector =
          SCROLL_DIRECTION_VECTORS['bottom'].scale(SCROLL_SPEED);
      candidateScrolls.push(scrollVector);
    }
    if (newLoc.x < metrics.left) {
      const scrollVector = SCROLL_DIRECTION_VECTORS['left'].scale(SCROLL_SPEED);
      candidateScrolls.push(scrollVector);
    }
    if (newLoc.x > metrics.left + metrics.width) {
      const scrollVector =
          SCROLL_DIRECTION_VECTORS['right'].scale(SCROLL_SPEED);
      candidateScrolls.push(scrollVector);
    }

    // Get the overall scroll direction vector (could scroll diagonally).
    // CDO reduces down to just one vector per direction from all the possible
    // ones they generate. Currently we just have one per direction so we don't
    // need to do anything else.
    candidateScrolls.forEach(function(scroll) {
      overallScrollVector =
          Blockly.utils.Coordinate.sum(overallScrollVector, scroll);
    });

    // If the workspace should not be scrolled any longer, cancel the
    // autoscroll.
    if (Blockly.utils.Coordinate.equals(
        overallScrollVector, new Blockly.utils.Coordinate(0, 0))) {
      this.stopAutoScrolling();
      return;
    }

    this.activeAutoScroll_ =
        this.activeAutoScroll_ || new AutoScroll(this.workspace_);
    this.activeAutoScroll_.updateProperties(overallScrollVector);
  }

  /**
   * Cancel any AutoScroll. This must be called when there is no need to scroll
   * further, e.g., when no longer dragging near the edge of the workspace, or
   * when no longer dragging at all.
   */
  stopAutoScrolling() {
    if (this.activeAutoScroll_) {
      this.activeAutoScroll_.stopAndDestroy();
    }
    this.activeAutoScroll_ = null;
  }
}
