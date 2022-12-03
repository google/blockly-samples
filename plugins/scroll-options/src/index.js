/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import Blockly from 'blockly/core';
import {EdgeScrollOptions, ScrollBlockDragger} from './ScrollBlockDragger';
import {getTranslation} from './utils';

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
   * edgeScrollOptions: (!EdgeScrollOptions|undefined)}=} options The
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
  } = {
    enableWheelScroll: true,
    enableEdgeScroll: true,
    edgeScrollOptions: null,
  }) {
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
   * Enables scrolling with mousewheel during block drag.
   */
  enableWheelScroll() {
    if (this.wheelEvent_) {
      // Already enabled.
      return;
    }

    let element;
    const dragSurface = this.workspace_.getBlockDragSurface();
    if (dragSurface) {
      element = dragSurface.getSvgRoot();
    } else {
      element = this.workspace_.svgGroup_;
    }

    this.wheelEvent_ = Blockly.browserEvents.conditionalBind(
        element, 'wheel', this, this.onMouseWheel_);
  }

  /**
   * Disables scrolling with mousewheel during block drag.
   */
  disableWheelScroll() {
    if (!this.wheelEvent_) {
      // Already disabled.
      return;
    }
    Blockly.browserEvents.unbind(this.wheelEvent_);
    this.wheelEvent_ = null;
  }

  /**
   * Enables scrolling when block is dragged near edge.
   */
  enableEdgeScroll() {
    ScrollBlockDragger.edgeScrollEnabled = true;
  }

  /**
   * Disables scrolling when block is dragged near edge.
   */
  disableEdgeScroll() {
    ScrollBlockDragger.edgeScrollEnabled = false;
  }

  /**
   * Updates edge scroll options. See ScrollBlockDragger for specific settings.
   * Any values left unspecified will not be overwritten and will retain their
   * previous values.
   * @param {!EdgeScrollOptions} options Edge scroll options.
   */
  updateEdgeScrollOptions(options) {
    ScrollBlockDragger.updateOptions(options);
  }

  /**
   * Scrolls the workspace with the mousewheel while a block is being dragged.
   * Translates the currently dragged block as the user scrolls the workspace,
   * so that the block does not appear to move.
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
    const scrollDelta = Blockly.browserEvents.getScrollDeltaPixels(e);
    const x = this.workspace_.scrollX - scrollDelta.x;
    const y = this.workspace_.scrollY - scrollDelta.y;

    const oldLocation = getTranslation(this.workspace_);

    // Try to scroll to the desired location.
    this.workspace_.getMetricsManager().useCachedContentMetrics = true;
    this.workspace_.scroll(x, y);
    this.workspace_.getMetricsManager().useCachedContentMetrics = false;

    const newLocation = getTranslation(this.workspace_);

    // How much we actually ended up scrolling.
    const deltaX = newLocation.x - oldLocation.x;
    const deltaY = newLocation.y - oldLocation.y;

    if (deltaX || deltaY) {
      currentGesture.getCurrentDragger().moveBlockWhileDragging(deltaX, deltaY);
      e.preventDefault();
    }
  }
}

export * from './ScrollBlockDragger';
export * from './ScrollMetricsManager';
