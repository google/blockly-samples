/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview UI control for zoom-to-fit.
 */

import Blockly from 'blockly/core';

/**
 * Class for zoom to fit control.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace to sit in.
 * @implements {Blockly.IPositionable}
 * @constructor
 */
export class ZoomToFitControl {
  /**
   * Constructor for zoom-to-fit control.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace that the zoom-to-fit
   *     control will be added to.
   */
  constructor(workspace) {
    /**
     * The workspace.
     * @type {!Blockly.WorkspaceSvg}
     * @protected
     */
    this.workspace_ = workspace;

    /**
     * The unique id for this component.
     * @type {string}
     */
    this.id = 'zoomToFit';

    /**
     * The SVG group containing the zoom-to-fit control.
     * @type {SVGElement}
     * @private
     */
    this.svgGroup_ = null;

    /**
     * Left coordinate of the zoom-to-fit control.
     * @type {number}
     * @private
     */
    this.left_ = 0;

    /**
     * Top coordinate of the zoom-to-fit control.
     * @type {number}
     * @private
     */
    this.top_ = 0;

    /**
     * Width of the zoom-to-fit control.
     * @type {number}
     * @const
     * @private
     */
    this.WIDTH_ = 32;

    /**
     * Height of the zoom-to-fit control.
     * @type {number}
     * @const
     * @private
     */
    this.HEIGHT_ = 32;

    /**
     * Distance between zoom-to-fit control and bottom or top edge of workspace.
     * @type {number}
     * @const
     * @private
     */
    this.MARGIN_VERTICAL_ = 20;

    /**
     * Distance between zoom-to-fit control and right or left edge of workspace.
     * @type {number}
     * @const
     * @private
     */
    this.MARGIN_HORIZONTAL_ = 20;

    /**
     * Whether this has been initialized.
     * @type {boolean}
     * @private
     */
    this.initialized_ = false;
  }

  /**
   * Initializes the zoom reset control.
   */
  init() {
    this.workspace_.getComponentManager().addComponent({
      component: this,
      weight: 2,
      capabilities: [Blockly.ComponentManager.Capability.POSITIONABLE],
    });
    this.createDom_();
    this.initialized_ = true;
    this.workspace_.resize();
  }
  /**
   * Disposes of workspace search.
   * Unlink from all DOM elements and remove all event listeners
   * to prevent memory leaks.
   */
  dispose() {
    if (this.svgGroup_) {
      Blockly.utils.dom.removeNode(this.svgGroup_);
    }
    if (this.onZoomToFitWrapper_) {
      Blockly.unbindEvent_(this.onZoomToFitWrapper_);
    }
  }

  /**
   * Creates DOM for ui element.
   * @private
   */
  createDom_() {
    this.svgGroup_ = Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.IMAGE, {
          'height': this.HEIGHT_ + 'px',
          'width': this.WIDTH_ + 'px',
          'class': 'zoomToFit',
        });
    this.svgGroup_.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
        ZOOM_TO_FIT_SVG_DATAURI);

    Blockly.utils.dom.insertAfter(
        this.svgGroup_, this.workspace_.getBubbleCanvas());

    // Attach listener.
    this.onZoomToFitWrapper_ = Blockly.browserEvents.conditionalBind(
        this.svgGroup_, 'mousedown', null, this.onClick_.bind(this));
  }

  /**
   * Handle click event.
   * @private
   */
  onClick_() {
    this.workspace_.zoomToFit();
    const uiEvent = new (Blockly.Events.get(Blockly.Events.CLICK))(
        null, this.workspace_.id, 'zoom_reset_control');
    Blockly.Events.fire(uiEvent);
  }


  /**
   * Returns the bounding rectangle of the UI element in pixel units relative to
   * the Blockly injection div.
   * @return {!Blockly.utils.Rect} The component’s bounding box.
   */
  getBoundingRectangle() {
    return new Blockly.utils.Rect(
        this.top_, this.top_ + this.HEIGHT_,
        this.left_, this.left_ + this.WIDTH_);
  }

  /**
   * Positions the zoom-to-fit control.
   * It is positioned in the opposite corner to the corner the
   * categories/toolbox starts at.
   * @param {!Blockly.MetricsManager.UiMetrics} metrics The workspace metrics.
   * @param {!Array<!Blockly.utils.Rect>} savedPositions List of rectangles that
   *     are already on the workspace.
   */
  position(metrics, savedPositions) {
    if (!this.initialized_) {
      return;
    }
    const hasVerticalScrollbars = this.workspace_.scrollbar &&
        this.workspace_.scrollbar.canScrollHorizontally();
    const hasHorizontalScrollbars = this.workspace_.scrollbar &&
        this.workspace_.scrollbar.canScrollVertically();

    if (metrics.toolboxMetrics.position === Blockly.TOOLBOX_AT_LEFT ||
        (this.workspace_.horizontalLayout && !this.workspace_.RTL)) {
      // Right corner placement.
      this.left_ = metrics.absoluteMetrics.left + metrics.viewMetrics.width -
          this.WIDTH_ - this.MARGIN_HORIZONTAL_;
      if (hasVerticalScrollbars && !this.workspace_.RTL) {
        this.left_ -= Blockly.Scrollbar.scrollbarThickness;
      }
    } else {
      // Left corner placement.
      this.left_ = this.MARGIN_HORIZONTAL_;
      if (hasVerticalScrollbars && this.workspace_.RTL) {
        this.left_ += Blockly.Scrollbar.scrollbarThickness;
      }
    }

    const startAtBottom =
        metrics.toolboxMetrics.position !== Blockly.TOOLBOX_AT_BOTTOM;
    if (startAtBottom) {
      // Bottom corner placement
      this.top_ = metrics.absoluteMetrics.top + metrics.viewMetrics.height -
          this.HEIGHT_ - this.MARGIN_VERTICAL_;
      if (hasHorizontalScrollbars) {
        // The horizontal scrollbars are always positioned on the bottom.
        this.top_ -= Blockly.Scrollbar.scrollbarThickness;
      }
    } else {
      // Upper corner placement
      this.top_ = metrics.absoluteMetrics.top + this.MARGIN_VERTICAL_;
    }

    // Check for collision and bump if needed.
    let boundingRect = this.getBoundingRectangle();
    for (let i = 0, otherEl; (otherEl = savedPositions[i]); i++) {
      if (boundingRect.intersects(otherEl)) {
        if (startAtBottom) { // Bump up.
          this.top_ = otherEl.top - this.HEIGHT_ - this.MARGIN_VERTICAL_;
        } else { // Bump down.
          this.top_ = otherEl.bottom + this.MARGIN_VERTICAL_;
        }
        // Recheck other savedPositions
        boundingRect = this.getBoundingRectangle();
        i = -1;
      }
    }

    this.svgGroup_.setAttribute('transform',
        'translate(' + this.left_ + ',' + this.top_ + ')');
  }
}

/**
 * Base64 encoded data uri for zoom to fit  icon.
 * @type {string}
 */
const ZOOM_TO_FIT_SVG_DATAURI =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC' +
    '9zdmciIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjRweCIgZm' +
    'lsbD0iIzU0NkU3QSI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PH' +
    'BhdGggZD0iTTUgNi40Mkw4LjA5IDkuNSA5LjUgOC4wOSA2LjQxIDVIOVYzSDN2Nmgyem0xMC' +
    '0zLjQxdjJoMi41N0wxNC41IDguMDlsMS40MSAxLjQxTDE5IDYuNDFWOWgyVjMuMDF6bTQgMT' +
    'QuNTdsLTMuMDktMy4wOC0xLjQxIDEuNDFMMTcuNTkgMTlIMTV2Mmg2di02aC0yek04LjA5ID' +
    'E0LjVMNSAxNy41OVYxNUgzdjZoNnYtMkg2LjQybDMuMDgtMy4wOXoiLz48L3N2Zz4=';

Blockly.Css.register(`
.zoomToFit {
  opacity: .4;
}
.zoomToFit:hover {
  opacity: .6;
}
.zoomToFit:active {
  opacity: .8;
}
`);
