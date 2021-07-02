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

  /**
   * Moves the currently dragged block as the user scrolls the workspace.
   * @param {!Event} e Mouse wheel event.
   */
  onMouseWheel_(e) {
    const canWheelMove = this.workspace_.options.moveOptions &&
        this.workspace_.options.moveOptions.wheel;
    const currentGesture = this.workspace_.getGesture(e);

    // Do not try to scroll if we are not dragging a block, or the workspace
    // does not allow moving by wheel.
    if (!canWheelMove || !currentGesture ||
        !(currentGesture.getCurrentDragger() instanceof Blockly.BlockDragger)) {
      return;
    }

    // Figure out the desired location to scroll to.
    const scrollDelta = Blockly.utils.getScrollDeltaPixels(e);
    const x = this.workspace_.scrollX - scrollDelta.x;
    const y = this.workspace_.scrollY - scrollDelta.y;

    const oldLocation = this.getDragSurfaceLocation_();

    // Try to scroll to the desired location.
    this.workspace_.getMetricsManager().useCachedContentMetrics = true;
    this.workspace_.scroll(x, y);
    this.workspace_.getMetricsManager().useCachedContentMetrics = false;

    const newLocation = this.getDragSurfaceLocation_();

    // How much we actually ended up scrolling.
    const deltaX = newLocation.x - oldLocation.x;
    const deltaY = newLocation.y - oldLocation.y;

    if (deltaX || deltaY) {
      currentGesture.getCurrentDragger().moveBlockWhileDragging(deltaX, deltaY);
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
    const workspaceOffset = dragSurface.getWsTranslation();
    return new Blockly.utils.Coordinate(workspaceOffset.x, workspaceOffset.y);
  }
}
