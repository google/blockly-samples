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
  /**
   * Updates the location of the block that is being dragged.
   * @param {number} deltaX Horizontal offset in pixel units.
   * @param {number} deltaY Vertical offset in pixel units.
   */
  moveBlockWhileDragging(deltaX, deltaY) {
    // Moves the parent block drag surface in the opposite direction of the
    // child drag surface. This makes the block stay under the cursor.
    this.workspace_.getBlockDragSurface().translateBy(-deltaX, -deltaY);

    const deltaXWs = deltaX / this.workspace_.scale;
    const deltaYWs = deltaY / this.workspace_.scale;

    // Update the start location of the block, so that when we drag the block
    // it starts in the correct location. startXY is in workspace coordinates.
    this.startXY_.x -= deltaXWs;
    this.startXY_.y -= deltaYWs;

    // Move the connections on the block. Workspace coordinates.
    this.draggingBlock_.moveConnections(-deltaXWs, -deltaYWs);

    // As we scroll, show the insertion markers.
    // TODO: This is broken. So completely broken.
    this.draggedConnectionManager_.update(
        new Blockly.utils.Coordinate(deltaXWs, deltaYWs), null);
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
    // I just made this up, pick a better one
    const SCROLL_SPEED = 0.2;

    const candidateScrolls = [];
    let overallScrollVector = new Blockly.utils.Coordinate(0, 0);

    this.workspace_.metricsManager_.stopCalculating = true;
    const metrics = this.workspace_.getMetrics();

    // TODO(maribethb): Add fancier logic based on how far out of bounds the
    // block is held.
    // TODO(maribethb): This probably does not work if you change the zoom level

    // See Blockly.MetricsManager for more information on the metrics used.
    // In particular, it uses pixel coordinates where the top and left
    // of the workspace are negative.
    // More than one scroll vector may apply, for example if the block is
    // dragged to a corner.
    if (newLoc.y < metrics.viewTop) {
      const scrollVector = SCROLL_DIRECTION_VECTORS['top'].scale(SCROLL_SPEED);
      candidateScrolls.push(scrollVector);
    }
    if (newLoc.y > metrics.viewTop + metrics.viewHeight) {
      const scrollVector =
          SCROLL_DIRECTION_VECTORS['bottom'].scale(SCROLL_SPEED);
      candidateScrolls.push(scrollVector);
    }
    if (newLoc.x < metrics.viewLeft) {
      const scrollVector = SCROLL_DIRECTION_VECTORS['left'].scale(SCROLL_SPEED);
      candidateScrolls.push(scrollVector);
    }
    if (newLoc.x > metrics.viewLeft + metrics.viewWidth) {
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
    this.activeAutoScroll_.update(overallScrollVector);

    this.workspace_.metricsManager_.stopCalculating = false;
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
