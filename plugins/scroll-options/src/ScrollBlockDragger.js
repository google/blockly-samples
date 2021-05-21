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
  }
}
