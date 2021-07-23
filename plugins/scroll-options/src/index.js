/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import Blockly from 'blockly/blockly';

import {EdgeScrollOptions, ScrollBlockDragger} from './ScrollBlockDragger';

/**
 * A Blockly plugin that adds additional features related to scrolling and
 * dragging on workspaces. This plugin adds the ability to: a) use the
 * mousewheel to scroll the workspace while a block is being dragged, and b)
 * scroll the workspace automatically when a block is dragged near the edge.
 *
 * All behavior is customizable. See the README for more information.
 */
export class ScrollOptions {
  /**
   * Constructor for ScrollOptions plugin.
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
   * Initialize plugin with optional options. If no options are provided, both
   * plugin features are enabled with default settings. The plugin is configured
   * here as a convenience. See the README for more information on configuring
   * the plugin after initialization.
   * @param {{enableWheelScroll: (boolean|undefined),
   * enableEdgeScroll: (boolean|undefined),
   * edgeScrollOptions: (!EdgeScrollOptions|undefined)}} options The
   * configuration options for the plugin. `enableWheelScroll` and
   * `enableEdgeScroll` are both true by default and control whether the
   * behavior to scroll with the mouse wheel while dragging and scroll when a
   * block is near the edge of the workspace are enabled, respectively.
   * `edgeScrollOptions` is an optional configuration for the edge scrolling
   * behavior. See `ScrollBlockDrager.updateOptions` for more details.
   */
  init({
    enableWheelScroll = true,
    enableEdgeScroll = true,
    edgeScrollOptions = null,
  } = {}) {
    if (enableWheelScroll) {
      this.enableWheelScroll();
    } else {
      this.disableWheelScroll();
    }

    ScrollBlockDragger.edgeScrollEnabled = enableEdgeScroll;

    if (edgeScrollOptions) {
      ScrollBlockDragger.updateOptions(edgeScrollOptions);
    }
  }

  /**
   *
   */
  enableWheelScroll() {
    if (this.wheelEvent_) {
      // Already enabled.
      return;
    }
    const dragSurface = this.workspace_.getBlockDragSurface();
    this.wheelEvent_ = Blockly.browserEvents.conditionalBind(
        dragSurface.getSvgRoot(), 'wheel', this, this.onMouseWheel_);
  }

  /**
   *
   */
  disableWheelScroll() {
    if (!this.wheelEvent_) {
      // Already disabled.
      return;
    }
    Blockly.browserEvents.unbind(this.wheelEvent_);
  }

  /** */
  enableEdgeScroll() {
    ScrollBlockDragger.edgeScrollEnabled = true;
  }

  /**
   *
   */
  disableEdgeScroll() {
    ScrollBlockDragger.edgeScrollEnabled = false;
  }

  /**
   *
   * @param {!EdgeScrollOptions} options
   */
  updateEdgeScrollOptions(options) {
    ScrollBlockDragger.updateOptions(options);
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
   * @return {!Blockly.utils.Coordinate} The current coordinate.
   * @private
   */
  getDragSurfaceLocation_() {
    const dragSurface = this.workspace_.getBlockDragSurface();
    return dragSurface.getWsTranslation();
  }
}
