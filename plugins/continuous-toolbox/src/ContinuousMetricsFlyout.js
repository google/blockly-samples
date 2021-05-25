/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


import * as Blockly from 'blockly/core';

/** Adds additional padding to the bottom of the flyout if needed. */
export class ContinuousFlyoutMetrics extends Blockly.FlyoutMetricsManager {
  /** @override */
  constructor(workspace, flyout) {
    super(workspace, flyout);
  }
  /**
   * Adds additional padding to the bottom of the flyout if needed,
   * in order to make it possible to scroll to the top of the last category.
   * @override
   */
  getScrollMetrics(
      opt_getWorkspaceCoordinates, opt_viewMetrics, opt_contentMetrics) {
    const scrollMetrics = super.getScrollMetrics(
        opt_getWorkspaceCoordinates, opt_viewMetrics, opt_contentMetrics);
    const contentMetrics = opt_contentMetrics ||
        this.getContentMetrics(opt_getWorkspaceCoordinates);
    const viewMetrics = opt_viewMetrics ||
        this.getViewMetrics(opt_getWorkspaceCoordinates);

    if (scrollMetrics) {
      scrollMetrics.height +=
          this.flyout_.calculateBottomPadding(contentMetrics, viewMetrics);
    }
    return scrollMetrics;
  }
}
