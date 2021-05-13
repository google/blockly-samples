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
     * TODO: Do we still do underscore in Blockly samples?
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

    // As we scroll, show the insertion markers.
    this.draggedConnectionManager_.update(
        new Blockly.utils.Coordinate(
            totalDelta.x / this.workspace_.scale,
            totalDelta.y / this.workspace_.scale),
        null);
  }

  /** @override */
  startBlockDrag(currentDragDeltaXY, healStack) {
    super.startBlockDrag(currentDragDeltaXY, healStack);
    this.dragDelta_ = currentDragDeltaXY;
  }

  /**
   * Passes the total amount the block has moved (both from dragging and from
   * scrolling) since it was picked up.
   * @override
   */
  dragBlock(e, currentDragDeltaXY) {
    const totalDelta =
        Blockly.utils.Coordinate.sum(this.scrollDelta_, currentDragDeltaXY);
    super.dragBlock(e, totalDelta);
    this.dragDelta_ = currentDragDeltaXY;
  }

  /** @override */
  endBlockDrag(e, currentDragDeltaXY) {
    // Make sure internal state is fresh.
    // TODO: Figure out a way to call super here.
    this.dragBlock(e, currentDragDeltaXY);
    this.dragIconData_ = [];
    this.fireDragEndEvent_();

    Blockly.utils.dom.stopTextWidthCache();

    Blockly.blockAnimations.disconnectUiStop();

    // START CHANGE
    const totalChange =
        Blockly.utils.Coordinate.sum(this.scrollDelta_, currentDragDeltaXY);
    const delta = this.pixelsToWorkspaceUnits_(totalChange);
    const newLoc = Blockly.utils.Coordinate.sum(this.startXY_, delta);
    // END CHANGE
    this.draggingBlock_.moveOffDragSurface(newLoc);

    const deleted = this.maybeDeleteBlock_();
    if (!deleted) {
      // These are expensive and don't need to be done if we're deleting.
      this.draggingBlock_.moveConnections(delta.x, delta.y);
      this.draggingBlock_.setDragging(false);
      this.fireMoveEvent_();
      if (this.draggedConnectionManager_.wouldConnectBlock()) {
        // Applying connections also rerenders the relevant blocks.
        this.draggedConnectionManager_.applyConnections();
      } else {
        this.draggingBlock_.render();
      }
      this.draggingBlock_.scheduleSnapAndBump();
    }
    this.workspace_.setResizesEnabled(true);

    const toolbox = this.workspace_.getToolbox();
    if (toolbox && typeof toolbox.removeStyle == 'function') {
      const style = this.draggingBlock_.isDeletable() ? 'blocklyToolboxDelete' :
                                                        'blocklyToolboxGrab';
      toolbox.removeStyle(style);
    }
    Blockly.Events.setGroup(false);
  }
}
