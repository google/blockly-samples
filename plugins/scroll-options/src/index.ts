/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';
import {EdgeScrollOptions, ScrollBlockDragger} from './ScrollBlockDragger';
import {getTranslation} from './utils';
import {isCacheable} from './ScrollMetricsManager';

/* eslint-disable @typescript-eslint/naming-convention */

/**
 * A Blockly plugin that adds additional features related to scrolling and
 * dragging on workspaces. This plugin adds the ability to: a) use the
 * mousewheel to scroll the workspace while a block is being dragged, and b)
 * scroll the workspace automatically when a block is dragged near the edge.
 *
 * All behavior is customizable. See the README for more information.
 */
export class ScrollOptions {
  protected workspace_: Blockly.WorkspaceSvg;

  /** Bound event listener for the scroll wheel event. */
  protected wheelEvent_: Blockly.browserEvents.Data | null = null;

  /**
   * Constructor for ScrollOptions plugin.
   *
   * @param workspace The workspace that the plugin will
   *     be added to.
   */
  constructor(workspace: Blockly.WorkspaceSvg) {
    this.workspace_ = workspace;
  }

  /**
   * Initialize plugin with optional options. If no options are provided, both
   * plugin features are enabled with default settings. The plugin is configured
   * here as a convenience. See the README for more information on configuring
   * the plugin after initialization.
   *
   * @param root0
   * @param root0.enableWheelScroll
   * @param root0.enableEdgeScroll
   * @param root0.edgeScrollOptions
   *
   *  options The
   * configuration options for the plugin. `enableWheelScroll` and
   * `enableEdgeScroll` are both true by default and control whether the
   * behavior to scroll with the mouse wheel while dragging and scroll when a
   * block is near the edge of the workspace are enabled, respectively.
   * `edgeScrollOptions` is an optional configuration for the edge scrolling
   * behavior. See `ScrollBlockDrager.updateOptions` for more details.
   */
  init(
    {
      enableWheelScroll = true,
      enableEdgeScroll = true,
      edgeScrollOptions = undefined,
    }:
      | {
          enableWheelScroll?: boolean;
          enableEdgeScroll?: boolean;
          edgeScrollOptions?: Partial<EdgeScrollOptions>;
        }
      | undefined = {
      enableWheelScroll: true,
      enableEdgeScroll: true,
      edgeScrollOptions: undefined,
    },
  ) {
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

    // TODO(blockly/#7157): We should maybe add an accessor for the svgGroup_?
    this.wheelEvent_ = Blockly.browserEvents.conditionalBind(
      this.workspace_.svgGroup_,
      'wheel',
      this,
      this.onMouseWheel_,
    );
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
   *
   * @param options Edge scroll options.
   */
  updateEdgeScrollOptions(options: Partial<EdgeScrollOptions>) {
    ScrollBlockDragger.updateOptions(options);
  }

  /**
   * Scrolls the workspace with the mousewheel while a block is being dragged.
   * Translates the currently dragged block as the user scrolls the workspace,
   * so that the block does not appear to move.
   *
   * @param e Mouse wheel event.
   */
  onMouseWheel_(e: WheelEvent) {
    const canWheelMove =
      this.workspace_.options.moveOptions &&
      this.workspace_.options.moveOptions.wheel;
    // TODO: Remove cast
    const currentGesture = this.workspace_.getGesture(e as any);

    const metricsManager = this.workspace_.getMetricsManager();
    if (!isCacheable(metricsManager)) {
      console.warn(
        'MetricsManager must be able to cache metrics in order to use AutoScroll',
      );
      return;
    }

    const dragger = currentGesture?.getCurrentDragger();

    // Do not try to scroll if we are not dragging a block, or the workspace
    // does not allow moving by wheel.
    if (
      !canWheelMove ||
      !currentGesture ||
      !(dragger instanceof ScrollBlockDragger)
    ) {
      return;
    }

    // Figure out the desired location to scroll to.
    const scrollDelta = Blockly.browserEvents.getScrollDeltaPixels(e);
    if (e.shiftKey) {
      // Scroll horizontally (based on vertical scroll delta).
      const temp = scrollDelta.x;
      scrollDelta.x = scrollDelta.y;
      scrollDelta.y = temp;
    }
    const x = this.workspace_.scrollX - scrollDelta.x;
    const y = this.workspace_.scrollY - scrollDelta.y;

    const oldLocation = getTranslation(this.workspace_);

    // Try to scroll to the desired location.
    metricsManager.useCachedContentMetrics = true;
    this.workspace_.scroll(x, y);
    metricsManager.useCachedContentMetrics = false;

    const newLocation = getTranslation(this.workspace_);

    // How much we actually ended up scrolling.
    const deltaX = newLocation.x - oldLocation.x;
    const deltaY = newLocation.y - oldLocation.y;

    if (deltaX || deltaY) {
      dragger.moveBlockWhileDragging(deltaX, deltaY);
      e.preventDefault();
    }
  }
}

export * from './ScrollBlockDragger';
export * from './ScrollMetricsManager';
