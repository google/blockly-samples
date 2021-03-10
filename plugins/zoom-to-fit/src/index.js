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

    /**
     * The SVG group containing the zoom controls.
     * @type {SVGElement}
     * @private
     */
    this.svgGroup_ = null;

    /**
     * Left coordinate of the zoom controls.
     * @type {number}
     * @private
     */
    this.left_ = 0;

    /**
     * Top coordinate of the zoom controls.
     * @type {number}
     * @private
     */
    this.top_ = 0;

    /**
     * Width of the zoom controls.
     * @type {number}
     * @const
     * @private
     */
    this.WIDTH_ = 32;

    /**
     * Height of the zoom controls.
     * @type {number}
     * @const
     * @private
     */
    this.HEIGHT_ = 32;

    /**
     * Distance between zoom controls and bottom edge of workspace.
     * @type {number}
     * @private
     */
    this.MARGIN_BOTTOM_ = 20;

    /**
     * Distance between zoom controls and right edge of workspace.
     * @type {number}
     * @const
     * @private
     */
    this.MARGIN_SIDE_ = 20;

    /**
     * The starting vertical distance between the workspace edge and the
     * control. The value is initialized during `init`.
     * @type {number}
     * @private
     */
    this.verticalSpacing_ = 0;

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
    this.createDom_();
    this.verticalSpacing_ =
        Blockly.Scrollbar.scrollbarThickness + this.MARGIN_BOTTOM_;
  }
  /**
   * Disposes of workspace search.
   * Unlink from all DOM elements and remove all event listeners
   * to prevent memory leaks.
   */
  dispose() {
    if (this.onZoomOutWrapper_) {
      Blockly.unbindEvent_(this.onZoomOutWrapper_);
    }
  }

  /**
   * Creates DOM for ui element.
   * @private
   */
  createDom_() {
    this.svgGroup_ = Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.RECT,
        {
          'class': 'zoomToFit',
          'width': this.WIDTH_,
          'height': this.HEIGHT_,
        },
        null);
    Blockly.utils.dom.insertAfter(
        this.svgGroup_, this.workspace_.getBubbleCanvas());

    // Attach listener.
    this.onZoomOutWrapper_ = Blockly.browserEvents.conditionalBind(
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
   * @return {!Blockly.utils.Rect} The plugin’s bounding box.
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
   * @param {!Array<Blockly.utils.Rect>} savedPositions List of rectangles that
   *     are already on the workspace.
   */
  position(metrics, savedPositions) {
    if (!this.initialized_) {
      return;
    }
    if (metrics.toolboxMetrics.position === Blockly.TOOLBOX_AT_LEFT ||
        (this.workspace_.horizontalLayout && !this.workspace_.RTL)) {
      // Right corner placement.
      this.left_ = metrics.viewMetrics.width + metrics.absoluteMetrics.left -
          this.WIDTH_ - this.MARGIN_SIDE_ -
          Blockly.Scrollbar.scrollbarThickness;
    } else {
      // Left corner placement.
      this.left_ = this.MARGIN_SIDE_ + Blockly.Scrollbar.scrollbarThickness;
    }

    // Upper corner placement
    const minTop = this.top_ =
        metrics.absoluteMetrics.top + this.verticalSpacing_;
    // Bottom corner placement
    const maxTop = metrics.absoluteMetrics.top + metrics.viewMetrics.height -
        this.HEIGHT_ - this.verticalSpacing_;
    const placeBottom =
        metrics.toolboxMetrics.position !== Blockly.TOOLBOX_AT_BOTTOM;
    this.top_ = placeBottom ? maxTop : minTop;

    // Check for collision and bump if needed.
    let boundingRect = this.getBoundingRectangle();
    for (let i = 0, otherEl; (otherEl = savedPositions[i]); i++) {
      if (boundingRect.intersects(otherEl)) {
        if (placeBottom) {
          // Bump up
          this.top_ = otherEl.top - this.HEIGHT_ - this.MARGIN_BOTTOM_;
        } else {
          this.top_ = otherEl.bottom + this.MARGIN_BOTTOM_;
        }
        // Recheck other savedPositions
        boundingRect = this.getBoundingRectangle();
        i = -1;
      }
    }
    // Clamp top value within valid range.
    this.top_ = Blockly.utils.math.clamp(minTop, this.top_, maxTop);

    this.svgGroup_.setAttribute('transform',
        'translate(' + this.left_ + ',' + this.top_ + ')');
  }
}

Blockly.Css.register([
  `.zoomToFit {
      position: absolute;
      border-radius: 100%;
      border: 1px solid;
      width: 1.25rem;
      height: 1.25rem;
    }`,
]);
