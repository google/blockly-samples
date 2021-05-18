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
 * ones, set `useCachedContentMetrics` to true before calling `getMetrics`
 * false when the metrics can be recalculated again.
 */
export class ScrollMetricsManager extends Blockly.MetricsManager {
  /** @override */
  constructor(workspace) {
    super(workspace);

    /**
     * Whether to stop recalculating content metrics and used the cached value
     * instead. Note that if there are no cached metrics, they will be
     * recalculated even if this value is true.
     * @type {boolean}
     */
    this.useCachedContentMetrics = false;

    /**
     * Cached content metrics, if available.
     * @type {?Blockly.MetricsManager.ContainerRegion}
     */
    this.contentMetrics = null;
  }

  /** @override */
  getContentMetrics() {
    if (this.useCachedContentMetrics && this.contentMetrics) {
      return this.contentMetrics;
    }

    this.contentMetrics = super.getContentMetrics();
    return this.contentMetrics;
  }
}
