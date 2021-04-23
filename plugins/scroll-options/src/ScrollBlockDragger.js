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
}
