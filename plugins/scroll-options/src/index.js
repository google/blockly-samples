/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// TODO: Edit plugin overview.
/**
 * @fileoverview Plugin overview.
 */

// TODO: Rename plugin and edit plugin description.
/**
 * Plugin description.
 */
export class Plugin {
  /**
   * Constructor for ...
   * @param {!Blockly.WorkspaceSvg} workspace The workspace that the plugin will
   *     be added to.
   */
  constructor(workspace) {
    /**
     * The workspace.
     * @type {!Blockly.WorkspaceSvg}
     * @protected
     */
    this.workspace_ = workspace;
  }

  /**
   * Initialize.
   */
  init() {
    const dragSurface = this.workspace_.getBlockDragSurface();
    Blockly.browserEvents.conditionalBind(
        dragSurface.getSvgRoot(), 'wheel', this, this.onMouseWheel_);
  }

  /**
   * Moves the currently dragged block as the user scrolls the workspace.
   * @param {!Event} e Mouse wheel event.
   */
  onMouseWheel_(e) {
    // Don't scroll or zoom anything if drag is in progress.
    const canWheelMove = this.workspace_.options.moveOptions &&
        this.workspace_.options.moveOptions.wheel;
    const currentGesture = this.workspace_.getGesture(e);
    if (!canWheelMove || !currentGesture || !currentGesture.isDraggingBlock_) {
      return;
    }

    // Figure out the desired location to scroll to.
    const scrollDelta = Blockly.utils.getScrollDeltaPixels(e);
    const x = this.workspace_.scrollX - scrollDelta.x;
    const y = this.workspace_.scrollY - scrollDelta.y;

    const oldLocation = this.getDragSurfaceLocation_();

    this.workspace_.getMetricsManager().stopCalculating = true;
    // Try to scroll to the desired location.
    this.workspace_.scroll(x, y);
    this.workspace_.getMetricsManager().stopCalculating = false;

    const newLocation = this.getDragSurfaceLocation_();

    // Get the new location of the block dragger after scrolling the workspace.
    // How much we actually ended up scrolling.
    const deltaX = newLocation.x - oldLocation.x;
    const deltaY = newLocation.y - oldLocation.y;

    if (deltaX || deltaY) {
      // TODO: Can not access private blockDragger.
      // TODO: Update block dragger with better documentation.
      currentGesture.blockDragger_.moveBlockWhileDragging(deltaX, deltaY);
      // TODO: Is this preventDefault in the correct place?
      e.preventDefault();
    }
  }

  /**
   * Gets the current location of the drag surface.
   * @return {Blockly.utils.Coordinate} The current coordinate.
   * @private
   */
  getDragSurfaceLocation_() {
    const dragSurface = this.workspace_.getBlockDragSurface();
    // TODO: Double check that this can not fall out of
    return new Blockly.utils.Coordinate(
        Math.round(dragSurface.dragSurfaceXY_.x),
        Math.round(dragSurface.dragSurfaceXY_.y));
  }
}
