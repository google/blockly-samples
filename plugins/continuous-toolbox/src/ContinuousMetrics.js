/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Toolbox category with styling for continuous toolbox.
 */

import * as Blockly from 'blockly/core';

/** Computes metrics for a toolbox with an always open flyout. */
export class ContinuousMetrics extends Blockly.MetricsManager {

  /** @override */
  constructor(workspace) {
    super(workspace);
  }
  /**
   * Excludes the dimensions of the flyout from the dimensions of the viewport.
   * @override
   */
  getViewMetrics(opt_getWorkspaceCoordinates) {
    var scale = opt_getWorkspaceCoordinates ? this.workspace_.scale : 1;
    var svgMetrics = this.getSvgMetrics();
    var toolboxMetrics = this.getToolboxMetrics();
    var flyoutMetrics = this.getFlyoutMetrics(false);
    var toolboxPosition = toolboxMetrics.position;

    if (this.workspace_.getToolbox()) {
      // Note: Not actually supported at this time due to ContinunousToolbox
      // only supporting a vertical flyout. But included for completeness.
      if (toolboxPosition == Blockly.TOOLBOX_AT_TOP ||
          toolboxPosition == Blockly.TOOLBOX_AT_BOTTOM) {
        svgMetrics.height -= (toolboxMetrics.height + flyoutMetrics.height);
      } else if (
          toolboxPosition == Blockly.TOOLBOX_AT_LEFT ||
          toolboxPosition == Blockly.TOOLBOX_AT_RIGHT) {
        svgMetrics.width -= (toolboxMetrics.width + flyoutMetrics.width);
      }
    }
    return {
      height: svgMetrics.height / scale,
      width: svgMetrics.width / scale,
      top: -this.workspace_.scrollY / scale,
      left: -this.workspace_.scrollX / scale,
    };
  }

  /**
   * Moves the absoluteLeft and absoluteTop so they no longer include the
   * flyout.
   * @override
   */
  getAbsoluteMetrics() {
    var toolboxMetrics = this.getToolboxMetrics();
    var flyoutMetrics = this.getFlyoutMetrics(false);
    var toolboxPosition = toolboxMetrics.position;
    let absoluteLeft = 0;

    if (this.workspace_.getToolbox() &&
        toolboxPosition == Blockly.TOOLBOX_AT_LEFT) {
      absoluteLeft = toolboxMetrics.width + flyoutMetrics.width;
    }
    let absoluteTop = 0;
    if (this.workspace_.getToolbox() &&
        toolboxPosition == Blockly.TOOLBOX_AT_TOP) {
      absoluteTop = toolboxMetrics.height + flyoutMetrics.height;
    }
    return {
      top: absoluteTop,
      left: absoluteLeft,
    };
  }
}

Blockly.registry.register(Blockly.registry.Type.METRICS_MANAGER,
    'CustomMetricsManager', ContinuousMetrics);
