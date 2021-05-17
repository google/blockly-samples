/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';

/**
 * The MetricsManager reports various metrics about the workspace. This version
 * of the MetricsManager adds optional cacheing of the workspace content
 * metrics. Cached content metrics are useful if, for example, you are in the
 * middle of dragging a block, but want to get the bounds of the content area as
 * if you hadn't yet picked up the block.
 *
 * To use the cached value of the content metrics instead of calculating new
 * ones, set `stopCalculating` to true before calling `getMetrics` and false
 * when the metrics can be recalculated again.
 */
export class ScrollMetricsManager extends Blockly.MetricsManager {
  /** @override */
  constructor(workspace) {
    super(workspace);

    /**
     * Whether to stop recalculating content metrics and used the cached value
     * instead. Note that if there are no cached metrics, they will be
     * recalculated even if `stopCalculating` is true.
     * @type {boolean}
     */
    this.stopCalculating = false;
  }

  /** @override */
  getMetrics() {
    const toolboxMetrics = this.getToolboxMetrics();
    const flyoutMetrics = this.getFlyoutMetrics(true);
    const svgMetrics = this.getSvgMetrics();
    const absoluteMetrics = this.getAbsoluteMetrics();
    const viewMetrics = this.getViewMetrics();

    if (!this.stopCalculating || !this.contentMetrics) {
      this.contentMetrics = this.getContentMetrics();
    }
    const scrollMetrics =
        this.getScrollMetrics(false, viewMetrics, this.contentMetrics);
    return {
      contentHeight: this.contentMetrics.height,
      contentWidth: this.contentMetrics.width,
      contentTop: this.contentMetrics.top,
      contentLeft: this.contentMetrics.left,

      scrollHeight: scrollMetrics.height,
      scrollWidth: scrollMetrics.width,
      scrollTop: scrollMetrics.top,
      scrollLeft: scrollMetrics.left,

      viewHeight: viewMetrics.height,
      viewWidth: viewMetrics.width,
      viewTop: viewMetrics.top,
      viewLeft: viewMetrics.left,

      absoluteTop: absoluteMetrics.top,
      absoluteLeft: absoluteMetrics.left,

      svgHeight: svgMetrics.height,
      svgWidth: svgMetrics.width,

      toolboxWidth: toolboxMetrics.width,
      toolboxHeight: toolboxMetrics.height,
      toolboxPosition: toolboxMetrics.position,

      flyoutWidth: flyoutMetrics.width,
      flyoutHeight: flyoutMetrics.height
    };
  }
};