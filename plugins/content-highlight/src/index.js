/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A plugin that highlights the content on the workspace.
 */

/**
 * List of events that cause a change in content area size.
 * @const
 * @private
 */
const CONTENT_CHANGE_EVENTS_ = [
  Blockly.Events.VIEWPORT_CHANGE,
  Blockly.Events.BLOCK_MOVE,
  Blockly.Events.BLOCK_DELETE,
];

/**
 * The default padding to use for the content highlight.
 * @type {number}
 * @private
 */
const DEFAULT_PADDING_ = 10;

/**
 * Length of opacity change transition in seconds.
 * @type {number}
 * @const
 */
const ANIMATION_TIME = 0.25;

/**
 * A plugin that highlights the area where content exists on the workspace.
 */
export class ContentHighlight {
  /**
   * Constructor for the content highlight plugin.
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
   * Initializes the plugin.
   * @param {number=} padding The padding to use for the content area highlight
   *    rectangle.
   */
  init(padding) {
    padding = Number(padding);
    /**
     * The padding to use around the content area.
     * @const {number}
     */
    this.padding_ = isNaN(padding) ? DEFAULT_PADDING_ : padding;

    /** @type {SVGElement} */
    this.svgGroup_ = Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.G,
        {'class': 'contentAreaHighlightContainer'}, null);

    const rnd = String(Math.random()).substring(2);
    const mask = Blockly.utils.dom.createSvgElement(
        new Blockly.utils.Svg('mask'), {
          'id': 'contentAreaHighlightMask' + rnd,
        }, this.svgGroup_);
    Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.RECT, {
          'x': 0,
          'y': 0,
          'width': '100%',
          'height': '100%',
          'fill': 'white',
        }, mask);
    this.rect_ = Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.RECT, {
          'x': 0,
          'y': 0,
          'rx': Blockly.Bubble.BORDER_WIDTH,
          'ry': Blockly.Bubble.BORDER_WIDTH,
          'width': 160,
          'height': 80,
          'fill': 'black',
        }, mask);
    this.background_ = Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.RECT, {
          'class': 'contentAreaHighlight',
          'x': 0,
          'y': 0,
          'width': '100%',
          'height': '100%',
          'mask': 'url(#contentAreaHighlightMask' + rnd + ')',
        }, this.svgGroup_);

    // TODO(kozbial) I'm not sure about if this is safe.
    // TODO(kozbial) Insert on BlockDragSurface for performance improvement.
    const parentSvg = this.workspace_.getParentSvg();
    Blockly.utils.dom.insertAfter(
        this.svgGroup_,
        parentSvg.firstChild);
    this.applyColor_();

    // Apply transition animation for opacity changes.
    this.svgGroup_.style.transition = 'opacity ' + ANIMATION_TIME + 's';

    this.onChangeWrapper_ = this.onChange_.bind(this);
    this.workspace_.addChangeListener(this.onChangeWrapper_);
  }

  /**
   * Disposes of content highlight.
   * Unlinks from all DOM elements and remove all event listeners
   * to prevent memory leaks.
   */
  dispose() {
    if (this.svgGroup_) {
      Blockly.utils.dom.removeNode(this.svgGroup_);
    }
    if (this.onChangeWrapper_) {
      Blockly.unbindEvent_(this.onChangeWrapper_);
    }
  }

  /**
   * Handles events triggered on the workspace.
   * @param {!Blockly.Events.Abstract} event The event.
   * @private
   */
  onChange_(event) {
    if (event.type === Blockly.Events.THEME_CHANGE) {
      this.applyColor_();
    } else if (CONTENT_CHANGE_EVENTS_.indexOf(event.type) !== -1) {
      this.position_();
    } else if (event.type === Blockly.Events.BLOCK_DRAG) {
      this.handleBlockDrag_(/** @type {!Blockly.Events.BlockDrag} */ event);
    }
  }

  /**
   * Changes opacity of the highlight based on what kind of block drag event
   * is passed.
   * @param {!Blockly.Events.BlockDrag} event The BlockDrag event.
   * @private
   */
  handleBlockDrag_(event) {
    const opacity = event.isStart ? '0' : '1';
    this.svgGroup_.setAttribute('opacity', opacity);
  }

  /**
   * Applies the color fill for the highlight based on the current theme.
   * @private
   */
  applyColor_() {
    const theme = this.workspace_.getTheme();
    const bgColor =
        theme.getComponentStyle('workspaceBackgroundColour') || '#ffffff';

    const colorDarkened =
        Blockly.utils.colour.blend('#000', bgColor, 0.1);
    const colorLightened =
        Blockly.utils.colour.blend('#fff', bgColor, 0.1);
    const color = (bgColor === '#ffffff' || bgColor === '#fff') ?
        colorDarkened : colorLightened;
    this.background_.setAttribute('fill', color);
  }

  /**
   * Positions the highlight on the workspace based on the workspace metrics.
   * @private
   */
  position_() {
    const metricsManager = this.workspace_.getMetricsManager();
    const contentMetrics = metricsManager.getContentMetrics();
    const viewMetrics = metricsManager.getViewMetrics();
    const absoluteMetrics = metricsManager.getAbsoluteMetrics();

    const width = contentMetrics.width ? contentMetrics.width +
        2 * this.padding_ : 0;
    const height = contentMetrics.height ? contentMetrics.height +
        2 * this.padding_ : 0;
    this.rect_.setAttribute('width', width);
    this.rect_.setAttribute('height', height);

    const top = absoluteMetrics.top + contentMetrics.top - viewMetrics.top -
        this.padding_;
    const left = absoluteMetrics.left + contentMetrics.left - viewMetrics.left -
        this.padding_;
    this.rect_.setAttribute('x', left);
    this.rect_.setAttribute('y', top);
  }
}
