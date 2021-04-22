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
    Blockly.bindEventWithChecks_(
        dragSurface.getSvgRoot(), 'wheel', this, this.onMouseWheel_);
  }

  onMouseWheel_(e) {
    // Don't scroll or zoom anything if drag is in progress.
    const canWheelMove = this.workspace_.options.moveOptions &&
        this.workspace_.options.moveOptions.wheel;
    if (!canWheelMove) {
      return;
    }

    const dragSurface = this.workspace_.getBlockDragSurface();

    // The location of the block dragger before we scroll the workspace.
    // TODO: Should this just be stored on the block drag surface?
    const oldLocation = this.getCurrentScrollLocation(dragSurface);

    // Figure out the desired location to scroll to.
    const scrollDelta = Blockly.utils.getScrollDeltaPixels(e);
    const x = this.workspace_.scrollX - scrollDelta.x;
    const y = this.workspace_.scrollY - scrollDelta.y;

    // Try to scroll to the desired location.
    this.workspace_.getMetricsManager().stopCalculating = true;
    this.workspace_.scroll(x, y);
    this.workspace_.getMetricsManager().stopCalculating = false;

    // Get the new location of the block dragger after scrolling the workspace.
    // TODO: is this more expensive than just calculating ourselves?
    const newLocation = this.getCurrentScrollLocation(dragSurface);

    // How much we actually ended up scrolling.
    const deltaX = newLocation.x - oldLocation.x;
    const deltaY = newLocation.y - oldLocation.y;

    const currentGesture = this.workspace_.getGesture(e);
    if (currentGesture &&
      currentGesture.isDraggingBlock_) {
      currentGesture.blockDragger_.moveBlockWhileDragging(deltaX, deltaY);
      e.preventDefault();
    }
  }

  /**
   * Gets the current scroll location.
   * TODO: Update all docs.
   * @param {!Blockly.BlockDragSurface} dragSurface The block drag surface.
   * @return {Blockly.utils.Coordinate} The current coordinate.
   */
  getCurrentScrollLocation(dragSurface) {
    return new Blockly.utils.Coordinate(
        dragSurface.getGroup().transform.baseVal.consolidate().matrix.e,
        dragSurface.getGroup().transform.baseVal.consolidate().matrix.f);
  }
}
