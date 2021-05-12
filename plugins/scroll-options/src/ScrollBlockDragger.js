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
  constructor(block, workspace) {
    super(block, workspace);

    this.scrollDelta = new Blockly.utils.Coordinate(0, 0);
  }
  /**
   * Updates the location of the block that is being dragged.
   * @param {number} deltaX Horizontal offset in pixel units.
   * @param {number} deltaY Vertical offset in pixel units.
   */
  moveBlockWhileDragging(deltaX, deltaY, currentGesture) {
    this.scrollDelta.x -= deltaX;
    this.scrollDelta.y -= deltaY;

    const totalChange =
        Blockly.utils.Coordinate.sum(this.scrollDelta, this.dragDelta);
    console.log(totalChange);
    // Moves the parent block drag surface in the opposite direction of the
    // child drag surface. This makes the block stay under the cursor.
    this.workspace_.getBlockDragSurface().translateBy(-deltaX, -deltaY);

    const deltaXWs = deltaX / this.workspace_.scale;
    const deltaYWs = deltaY / this.workspace_.scale;

    // Update the start location of the block, so that when we drag the block
    // it starts in the correct location. startXY is in workspace coordinates.
    // this.startXY_.x -= deltaXWs;
    // this.startXY_.y -= deltaYWs;

    // Move the connections on the block. Workspace coordinates.
    // this.draggingBlock_.moveConnections(-deltaXWs, -deltaYWs);

    // As we scroll, show the insertion markers.
    // TODO: This is broken. So completely broken.
    this.draggedConnectionManager_.update(
        new Blockly.utils.Coordinate(
            totalChange.x / this.workspace_.scale,
            totalChange.y / this.workspace_.scale),
        null);
  }


  /** @override */
  dragBlock(e, currentDragDeltaXY) {
    const totalChange =
        Blockly.utils.Coordinate.sum(this.scrollDelta, currentDragDeltaXY);
    super.dragBlock(e, totalChange);
    this.dragDelta = currentDragDeltaXY;
    // const delta = this.pixelsToWorkspaceUnits_(totalChange);

    // const newLoc = Blockly.utils.Coordinate.sum(this.startXY_, delta);

    // this.draggingBlock_.moveDuringDrag(newLoc);
    // this.dragIcons_(delta);

    // this.deleteArea_ = this.workspace_.isDeleteArea(e);
    // this.draggedConnectionManager_.update(delta, this.deleteArea_);

    // this.updateCursorDuringBlockDrag_();
    // this.dragDelta = currentDragDeltaXY;
  }

  endBlockDrag(e, currentDragDeltaXY) {
    // Make sure internal state is fresh.
    // TODO: Figure out a way to call super here.
    this.dragBlock(e, currentDragDeltaXY);
    this.dragIconData_ = [];
    this.fireDragEndEvent_();
    Blockly.utils.dom.stopTextWidthCache();

    Blockly.blockAnimations.disconnectUiStop();
    const totalChange =
        Blockly.utils.Coordinate.sum(this.scrollDelta, currentDragDeltaXY);
    const delta = this.pixelsToWorkspaceUnits_(totalChange);
    const newLoc = Blockly.utils.Coordinate.sum(this.startXY_, delta);
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
