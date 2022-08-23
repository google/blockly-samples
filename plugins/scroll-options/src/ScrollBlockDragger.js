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
 * @typedef {!Object<string, !Array<!Blockly.utils.Coordinate>>}
 */
let CandidateScrolls;

/**
 * Configuration for edge scrolling behavior.
 * @typedef {object} EdgeScrollOptions
 * @property {number=} slowBlockSpeed Pixels per ms to scroll when the block is
 * near the edge of the workspace.
 * @property {number=}fastBlockSpeed Pixels per ms to scroll when the block is
 * far past the edge of the workspace.
 * @property {number=} slowBlockStartDistance Distance in workspace units that
 * the edge of the block is from the edge of the viewport before the
 * corresponding scroll speed will be used. Can be negative to start scrolling
 * before the block extends over the edge.
 * @property {number=} fastBlockStartDistance Same as above, for fast speed.
 * Must be larger than `slowBlockStartDistance`.
 * @property {number=} oversizeBlockThreshold If a block takes up this
 * percentage of the viewport or more, it will be considered oversized. Rather
 * than using the block edge, we use the mouse cursor plus the given margin size
 * to activate block-based scrolling.
 * @property {number=} oversizeBlockMargin Cursor margin to use for oversized
 * blocks. A bigger value will cause the workspace to scroll sooner, i.e., the
 * mouse can be further inward from the edge when scrolling begins.
 * @property {number=} slowMouseSpeed Pixels per ms to
 * scroll when the mouse is near the edge of the workspace.
 * @property {number=} fastMouseSpeed Pixels per ms to
 * scroll when the mouse is far past the edge of the workspace.
 * @property {number=} slowMouseStartDistance Distance in workspace units that
 * the mouse is from the edge of the viewport before the corresponding scroll
 * speed will be used. Can be negative to start scrolling before the mouse
 * extends over the edge.
 * @property {number=} fastMouseStartDistance Same as above, for fast speed.
 * Must be larger than `slowMouseStartDistance`.
 */
export let EdgeScrollOptions;

/** @type {!EdgeScrollOptions} */
const defaultOptions = {
  slowBlockSpeed: 0.28,
  fastBlockSpeed: 1.4,
  slowBlockStartDistance: 0,
  fastBlockStartDistance: 50,
  oversizeBlockThreshold: 0.85,
  oversizeBlockMargin: 15,
  slowMouseSpeed: 0.5,
  fastMouseSpeed: 1.6,
  slowMouseStartDistance: 0,
  fastMouseStartDistance: 35,
};

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

    // TODO(maribethb): Use `isMoveable` etc. to get this list
    /**
     * Possible directions the workspace could be scrolled.
     * @type {!Array<string>}
     * @protected
     */
    this.scrollDirections_ = ['top', 'bottom', 'left', 'right'];
  }

  /**
   * Updates the location of the block that is being dragged.
   * @param {number} deltaX Horizontal offset in pixel units.
   * @param {number} deltaY Vertical offset in pixel units.
   */
  moveBlockWhileDragging(deltaX, deltaY) {
    this.scrollDelta_.x -= deltaX;
    this.scrollDelta_.y -= deltaY;

    // The total amount the block has moved since being picked up.
    const totalDelta =
        Blockly.utils.Coordinate.sum(this.scrollDelta_, this.dragDelta_);

    const delta = this.pixelsToWorkspaceUnits_(totalDelta);
    const newLoc = Blockly.utils.Coordinate.sum(this.startXY_, delta);

    // Make the block stay under the cursor.
    this.draggingBlock_.moveDuringDrag(newLoc);

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

    if (ScrollBlockDragger.edgeScrollEnabled) {
      this.scrollWorkspaceWhileDragging_(e);
    }
  }

  /**
   * @override
   */
  endDrag(e, currentDragDeltaXY) {
    super.endDrag(e, currentDragDeltaXY);

    this.stopAutoScrolling();
  }

  /**
   * Passes the total amount the block has moved (both from dragging and from
   * scrolling) since it was picked up.
   * @override
   */
  getNewLocationAfterDrag_(currentDragDeltaXY) {
    const newValues = {};
    const totalDelta =
        Blockly.utils.Coordinate.sum(this.scrollDelta_, currentDragDeltaXY);
    newValues.delta = this.pixelsToWorkspaceUnits_(totalDelta);
    newValues.newLocation =
        Blockly.utils.Coordinate.sum(this.startXY_, newValues.delta);

    return newValues;
  }

  /**
   * May scroll the workspace as a block is dragged.
   * If a block is dragged near the edge of the workspace, this method will
   * cause the workspace to scroll in the direction the block is being
   * dragged. The workspace will not resize as the block is dragged. The
   * workspace should appear to move out from under the block, i.e., the block
   * should stay under the user's mouse.
   * @param {!Event} e The mouse/touch event for the drag.
   * @protected
   */
  scrollWorkspaceWhileDragging_(e) {
    /**
     * Unit vector for each direction that could be scrolled. This vector will
     * be scaled to get the calculated velocity in each direction. Must be a
     * dict because the properties are accessed based on the members of
     * `this.scrollDirections_`.
     * @dict
     * @private
     */
    this.SCROLL_DIRECTION_VECTORS_ = {
      top: new Blockly.utils.Coordinate(0, 1),
      bottom: new Blockly.utils.Coordinate(0, -1),
      left: new Blockly.utils.Coordinate(1, 0),
      right: new Blockly.utils.Coordinate(-1, 0),
    };
    const mouse = Blockly.utils.svgMath.screenToWsCoordinates(
        this.workspace_, new Blockly.utils.Coordinate(e.clientX, e.clientY));

    /**
     * List of possible scrolls in each direction. This will be modified in
     * place. Must be a dict because the properties are accessed based on the
     * members of `this.scrollDirections_`.
     * @dict
     * @type {!CandidateScrolls}
     */
    const candidateScrolls = {
      top: [],
      bottom: [],
      left: [],
      right: [],
    };

    // Get ViewMetrics in workspace coordinates.
    const viewMetrics =
        this.workspace_.getMetricsManager().getViewMetrics(true);

    // Get possible scroll velocities based on the location of both the block
    // and the mouse.

    this.computeBlockCandidateScrolls_(candidateScrolls, viewMetrics, mouse);
    this.computeMouseCandidateScrolls_(candidateScrolls, viewMetrics, mouse);
    // Calculate the final scroll vector we should actually use.
    const overallScrollVector = this.getOverallScrollVector_(candidateScrolls);

    // If the workspace should not be scrolled any longer, cancel the
    // autoscroll.
    if (Blockly.utils.Coordinate.equals(
        overallScrollVector, new Blockly.utils.Coordinate(0, 0))) {
      this.stopAutoScrolling();
      return;
    }

    // Update the autoscroll or start a new one.
    this.activeAutoScroll_ =
        this.activeAutoScroll_ || new AutoScroll(this.workspace_);
    this.activeAutoScroll_.updateProperties(overallScrollVector);
  }

  /**
   * There could be multiple candidate scrolls for each direction, such as one
   * for block position and one for mouse position. We should first find the
   * fastest scroll in each direction. Then, we sum those to find the overall
   * scroll vector.
   *
   * For example, we may have a fast block scroll and a slow
   * mouse scroll candidate in both the top and left directions. First, we
   * reduce to only the fast block scroll. Then, we sum the vectors in each
   * direction to get a resulting fast scroll in a diagonal direction to the
   * top left.
   * @param {!CandidateScrolls} candidateScrolls Existing lists of candidate
   *     scrolls. Will be modified in place.
   * @return {!Blockly.utils.Coordinate} Overall scroll vector.
   * @protected
   */
  getOverallScrollVector_(candidateScrolls) {
    let overallScrollVector = new Blockly.utils.Coordinate(0, 0);
    for (const direction of this.scrollDirections_) {
      const fastestScroll =
          candidateScrolls[direction].reduce((fastest, current) => {
            if (!fastest) {
              return current;
            }
            return Blockly.utils.Coordinate.magnitude(fastest) >
                    Blockly.utils.Coordinate.magnitude(current) ?
                fastest :
                current;
          }, new Blockly.utils.Coordinate(0, 0)); // Initial value
      overallScrollVector =
          Blockly.utils.Coordinate.sum(overallScrollVector, fastestScroll);
    }
    return overallScrollVector;
  }

  /**
   * Gets the candidate scrolls based on the position of the block on the
   * workspace. If the block is near/over the edge, a candidate scroll will be
   * added based on the options provided.
   *
   * This method can be overridden to further customize behavior, e.g. To add
   * a third speed option.
   * @param {!CandidateScrolls} candidateScrolls Existing list of candidate
   *     scrolls. Will be modified in place.
   * @param {!Blockly.MetricsManager.ContainerRegion} viewMetrics View metrics
   *     for the workspace.
   * @param {!Blockly.utils.Coordinate} mouse Mouse coordinates.
   * @protected
   */
  computeBlockCandidateScrolls_(candidateScrolls, viewMetrics, mouse) {
    const blockOverflows = this.getBlockBoundsOverflows_(viewMetrics, mouse);
    for (const direction of this.scrollDirections_) {
      const overflow = blockOverflows[direction];
      if (overflow > ScrollBlockDragger.options.slowBlockStartDistance) {
        const speed =
            overflow > ScrollBlockDragger.options.fastBlockStartDistance ?
            ScrollBlockDragger.options.fastBlockSpeed :
            ScrollBlockDragger.options.slowBlockSpeed;
        const scrollVector =
            this.SCROLL_DIRECTION_VECTORS_[direction].clone().scale(speed);
        candidateScrolls[direction].push(scrollVector);
      }
    }
  }

  /**
   * Gets the candidate scrolls based on the position of the mouse cursor
   * relative to the workspace. If the mouse is near/over the edge, a
   * candidate scroll will be added based on the options provided.
   *
   * This method can be overridden to further customize behavior, e.g. To add
   * a third speed option.
   * @param {!CandidateScrolls} candidateScrolls Existing list of candidate
   *     scrolls. Will be modified in place.
   * @param {!Blockly.MetricsManager.ContainerRegion} viewMetrics View metrics
   *     for the workspace.
   * @param {!Blockly.utils.Coordinate} mouse Mouse coordinates.
   * @protected
   */
  computeMouseCandidateScrolls_(candidateScrolls, viewMetrics, mouse) {
    const mouseOverflows = this.getMouseOverflows_(viewMetrics, mouse);
    for (const direction of this.scrollDirections_) {
      const overflow = mouseOverflows[direction];
      if (overflow > ScrollBlockDragger.options.slowMouseStartDistance) {
        const speed =
            overflow > ScrollBlockDragger.options.fastMouseStartDistance ?
            ScrollBlockDragger.options.fastMouseSpeed :
            ScrollBlockDragger.options.slowMouseSpeed;
        const scrollVector =
            this.SCROLL_DIRECTION_VECTORS_[direction].clone().scale(speed);
        candidateScrolls[direction].push(scrollVector);
      }
    }
  }

  /**
   * Gets the amount of overflow of a box relative to the workspace viewport.
   *
   * The value for each direction will be how far the given block edge is from
   * the given edge of the viewport. If the block edge is outside the
   * viewport, the value will be positive. If the block edge is inside the
   * viewport, the value will be negative.
   *
   * This method also checks for oversized blocks. If the block is very large
   * relative to the viewport size, then we will actually use a small zone
   * around the cursor, rather than the edge of the block, to calculate the
   * overflow values. This calculation is done independently in both the
   * horizontal and vertical directions. These values can be configured in the
   * options for the plugin.
   *
   * @param {!Blockly.MetricsManager.ContainerRegion} viewMetrics View metrics
   *     for the workspace.
   * @param {!Blockly.utils.Coordinate} mouse Mouse coordinates.
   * @return {!Object<string, number>} An object describing the amount of
   *     overflow in each direction.
   * @protected
   */
  getBlockBoundsOverflows_(viewMetrics, mouse) {
    const blockBounds = this.draggingBlock_.getBoundingRectangle();

    // Handle large blocks. If the block is nearly as tall as the viewport,
    // use a margin around the cursor rather than the height of the block.
    const blockHeight = blockBounds.bottom - blockBounds.top;
    if (blockHeight > viewMetrics.height *
            ScrollBlockDragger.options.oversizeBlockThreshold) {
      blockBounds.top = Math.max(
          blockBounds.top,
          mouse.y - ScrollBlockDragger.options.oversizeBlockMargin);
      blockBounds.bottom = Math.min(
          blockBounds.bottom,
          mouse.y + ScrollBlockDragger.options.oversizeBlockMargin);
    }

    // Same logic, but for block width.
    const blockWidth = blockBounds.right - blockBounds.left;
    if (blockWidth > viewMetrics.width *
            ScrollBlockDragger.options.oversizeBlockThreshold) {
      blockBounds.left = Math.max(
          blockBounds.left,
          mouse.x - ScrollBlockDragger.options.oversizeBlockMargin);
      blockBounds.right = Math.min(
          blockBounds.right,
          mouse.x + ScrollBlockDragger.options.oversizeBlockMargin);
    }

    // The coordinate system is negative in the top and left directions, and
    // positive in the bottom and right directions. Therefore, the direction
    // of the comparison must be switched for bottom and right.
    return {
      top: viewMetrics.top - blockBounds.top,
      bottom: -(viewMetrics.top + viewMetrics.height - blockBounds.bottom),
      left: viewMetrics.left - blockBounds.left,
      right: -(viewMetrics.left + viewMetrics.width - blockBounds.right),
    };
  }

  /**
   * Gets the amount of overflow of the mouse coordinates relative to the
   * viewport.
   *
   * The value for each direction will be how far the pointer is from
   * the given edge of the viewport. If the pointer is outside the viewport,
   * the value will be positive. If the pointer is inside the viewport, the
   * value will be negative.
   *
   * @param {!Blockly.MetricsManager.ContainerRegion} viewMetrics View metrics
   *     for the workspace.
   * @param {!Blockly.utils.Coordinate} mouse Mouse coordinates.
   * @return {!Object<string, number>} An object describing the amount of
   *     overflow in each direction.
   * @protected
   */
  getMouseOverflows_(viewMetrics, mouse) {
    // The coordinate system is negative in the top and left directions, and
    // positive in the bottom and right directions. Therefore, the direction
    // of the comparison must be switched for bottom and right.
    return {
      top: viewMetrics.top - mouse.y,
      bottom: -(viewMetrics.top + viewMetrics.height - mouse.y),
      left: viewMetrics.left - mouse.x,
      right: -(viewMetrics.left + viewMetrics.width - mouse.x),
    };
  }

  /**
   * Cancel any AutoScroll. This must be called when there is no need to
   * scroll further, e.g., when no longer dragging near the edge of the
   * workspace, or when no longer dragging at all.
   */
  stopAutoScrolling() {
    if (this.activeAutoScroll_) {
      this.activeAutoScroll_.stopAndDestroy();
    }
    this.activeAutoScroll_ = null;
  }
}

/**
 * Whether the behavior to scroll the workspace when a block is dragged near
 * the edge is enabled.
 * @type {boolean}
 */
ScrollBlockDragger.edgeScrollEnabled = true;

/**
 * Configuration options for the scroll-options settings.
 * @type {!EdgeScrollOptions}
 */
ScrollBlockDragger.options = defaultOptions;

/**
 * Update the scroll options. Only the properties actually included in the
 * `options` parameter will be set. Any unspecified options will use the
 * previously set value (where the initial value is from `defaultOptions`).
 * Therefore, do not pass in any options with explicit `undefined` or `null`
 * values. The plugin will break. Just leave them out of the object if you
 * don't want to change the default value.
 *
 * This method is safe to call multiple times. Subsequent calls will add onto
 * previous calls, not completely overwrite them. That is, if you call this
 * with:
 *
 *     `updateOptions({fastMouseSpeed: 5});
 *     updateOptions({slowMouseSpeed: 2});`.
 *
 * Then the final options used will include both `fastMouseSpeed: 5` and
 * `slowMouseSpeed: 2` with all other options being the default values.
 * @param {!EdgeScrollOptions} options Object containing any or all of
 *     the available options. Any properties not present will use the existing
 *     value.
 */
ScrollBlockDragger.updateOptions = function(options) {
  ScrollBlockDragger.options = {...ScrollBlockDragger.options, ...options};
};

/**
 * Resets the options object to the default options.
 */
ScrollBlockDragger.resetOptions = function() {
  ScrollBlockDragger.options = defaultOptions;
};

Blockly.registry.register(Blockly.registry.Type.BLOCK_DRAGGER,
    'ScrollBlockDragger', ScrollBlockDragger);
