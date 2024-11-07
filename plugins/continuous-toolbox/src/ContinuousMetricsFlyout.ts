/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';
import type {ContinuousFlyout} from './ContinuousFlyout';

/** Adds additional padding to the bottom of the flyout if needed. */
export class ContinuousFlyoutMetrics extends Blockly.FlyoutMetricsManager {
  /**
   * Adds additional padding to the bottom of the flyout if needed,
   * in order to make it possible to scroll to the top of the last category.
   */
  override getScrollMetrics(
    getWorkspaceCoordinates?: boolean,
    cachedViewMetrics?: Blockly.MetricsManager.ContainerRegion,
    cachedContentMetrics?: Blockly.MetricsManager.ContainerRegion,
  ) {
    const scrollMetrics = super.getScrollMetrics(
      getWorkspaceCoordinates,
      cachedViewMetrics,
      cachedContentMetrics,
    );
    const contentMetrics =
      cachedContentMetrics || this.getContentMetrics(getWorkspaceCoordinates);
    const viewMetrics =
      cachedViewMetrics || this.getViewMetrics(getWorkspaceCoordinates);

    if (scrollMetrics) {
      scrollMetrics.height += (
        this.flyout_ as ContinuousFlyout
      ).calculateBottomPadding(contentMetrics, viewMetrics);
    }
    return scrollMetrics;
  }
}
