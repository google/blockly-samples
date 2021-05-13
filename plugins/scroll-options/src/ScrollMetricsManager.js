/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// TODO: Edit plugin overview.
/**
 * @fileoverview This adds a method to the block dragger to allow a block
 * to be moved on scroll.
 */

import * as Blockly from 'blockly/core';

/**
 * A block dragger that adds the functionality for a block to be moved while
 * someone is dragging it.
 */
export class ScrollMetricsManager extends Blockly.MetricsManager {
  constructor(workspace) {
    super(workspace);
    this.stopCalculating = false;
  }
  getMetrics() {
    const toolboxMetrics = this.getToolboxMetrics();
    const flyoutMetrics = this.getFlyoutMetrics(true);
    const svgMetrics = this.getSvgMetrics();
    const absoluteMetrics = this.getAbsoluteMetrics();
    const viewMetrics = this.getViewMetrics();
    if (!this.stopCalculating || !this.contentMetrics) {
      console.log("CALCULATING");
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
      flyoutHeight: flyoutMetrics.height,
    };
  }
}
