/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Backpack that lives on top of the workspace.
 * @author kozbial@google.com (Monica Kozbial)
 */

import * as Blockly from 'blockly/core';
import {cleanBlockXML, registerContextMenus} from './backpack_helpers';
import {BackpackChange, BackpackOpen} from './ui_events';
import {
  BackpackContextMenuOptions, BackpackOptions, parseOptions,
} from './options';
import './backpack_monkey_patch';

/**
 * Class for backpack that can be used save blocks from the workspace for
 * future use.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace to sit in.
 * @implements {Blockly.IPositionable}
 */
export class Backpack {
  /**
   * Constructor for a backpack.
   * @param {!Blockly.WorkspaceSvg} targetWorkspace The target workspace that
   *     the plugin will be added to.
   * @param {!BackpackOptions=} backpackOptions The backpack options to use.
   */
  constructor(targetWorkspace, backpackOptions) {
    /**
     * The workspace.
     * @type {!Blockly.WorkspaceSvg}
     * @protected
     */
    this.workspace_ = targetWorkspace;

    // This set is part of the monkeypatch, so that a reference to the backpack
    // can be accessed on a given workspace.
    this.workspace_.backpack = this;

    /**
     * The backpack options.
     * @type {!BackpackOptions}
     */
    this.options_ = parseOptions(backpackOptions);

    /**
     * The SVG group containing the backpack.
     * @type {?SVGElement}
     * @protected
     */
    this.svgGroup_ = null;

    /**
     * Left coordinate of the backpack.
     * @type {number}
     * @private
     */
    this.left_ = 0;

    /**
     * Top coordinate of the backpack.
     * @type {number}
     * @private
     */
    this.top_ = 0;

    /**
     * Extent of hotspot on all sides beyond the size of the image.
     * @const {number}
     * @private
     */
    this.HOTSPOT_MARGIN_ = 10;

    /**
     * Top offset for backpack in svg.
     * @type {number}
     * @private
     */
    this.SPRITE_TOP_ = 10;

    /**
     * Left offset for backpack in svg.
     * @type {number}
     * @private
     */
    this.SPRITE_LEFT_ = 20;

    /**
     * Width/Height of svg.
     * @type {number}
     * @const
     * @private
     */
    this.SPRITE_SIZE_ = 80;

    /**
     * Width of the backpack. Used for clip path.
     * @type {number}
     * @const
     * @private
     */
    this.WIDTH_ = 40;

    /**
     * Height of the backpack. Used for clip path.
     * @type {number}
     * @const
     * @private
     */
    this.HEIGHT_ = 60;

    /**
     * Distance between backpack and bottom or top edge of workspace.
     * @type {number}
     * @const
     * @private
     */
    this.MARGIN_VERTICAL_ = 20;

    /**
     * Distance between backpack and right or left edge of workspace.
     * @type {number}
     * @const
     * @private
     */
    this.MARGIN_HORIZONTAL_ = 20;
    /**
     * Array holding info needed to unbind events.
     * Used for disposing.
     * @type {!Array<!Blockly.browserEvents.Data>}
     * @protected
     */
    this.boundEvents_ = [];

    /**
     * Whether this has been initialized.
     * @type {boolean}
     * @protected
     */
    this.initialized_ = false;

    /**
     * A list of XML (stored as strings) representing blocks in the backpack.
     * @type {!Array<string>}
     * @protected
     */
    this.contents_ = [];

    /**
     * The backpack flyout. Initialized during init.
     * @type {?Blockly.IFlyout}
     * @protected
     */
    this.flyout_ = null;
  }

  /**
   * Initializes the backpack.
   */
  init() {
    this.workspace_.getPluginManager().addPlugin({
      id: 'backpack',
      plugin: this,
      weight: 2,
      types: [Blockly.PluginManager.Type.POSITIONABLE],
    });
    this.initFlyout_();
    this.createDom_();
    registerContextMenus(
        /** @type {!BackpackContextMenuOptions} */ this.options_.contextMenu,
        this.workspace_);
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
    for (const event of this.boundEvents_) {
      Blockly.unbindEvent_(event);
    }
    this.boundEvents_.length = 0;
  }

  /**
   * Creates and initializes the flyout and inserts it into the dom.
   * @protected
   */
  initFlyout_() {
    // Create flyout options.
    const flyoutWorkspaceOptions = new Blockly.Options(
        /** @type {!Blockly.BlocklyOptions} */
        ({
          'scrollbars': true,
          'parentWorkspace': this.workspace_,
          'rtl': this.workspace_.RTL,
          'oneBasedIndex': this.workspace_.options.oneBasedIndex,
          'renderer': this.workspace_.options.renderer,
          'rendererOverrides': this.workspace_.options.rendererOverrides,
          'move': {
            'scrollbars': true,
          },
        }));
    // Create vertical or horizontal flyout.
    if (this.workspace_.horizontalLayout) {
      flyoutWorkspaceOptions.toolboxPosition =
          (this.workspace_.toolboxPosition ===
              Blockly.utils.toolbox.Position.TOP) ?
              Blockly.utils.toolbox.Position.BOTTOM :
              Blockly.utils.toolbox.Position.TOP;
      const HorizontalFlyout = Blockly.registry.getClassFromOptions(
          Blockly.registry.Type.FLYOUTS_HORIZONTAL_TOOLBOX,
          this.workspace_.options, true);
      this.flyout_ = new HorizontalFlyout(flyoutWorkspaceOptions);
    } else {
      flyoutWorkspaceOptions.toolboxPosition =
          (this.workspace_.toolboxPosition ===
              Blockly.utils.toolbox.Position.RIGHT) ?
              Blockly.utils.toolbox.Position.LEFT :
              Blockly.utils.toolbox.Position.RIGHT;
      const VerticalFlyout = Blockly.registry.getClassFromOptions(
          Blockly.registry.Type.FLYOUTS_VERTICAL_TOOLBOX,
          this.workspace_.options, true);
      this.flyout_ = new VerticalFlyout(flyoutWorkspaceOptions);
    }
    // Add flyout to DOM.
    const parentNode = this.workspace_.getParentSvg().parentNode;
    parentNode.appendChild(this.flyout_.createDom(Blockly.utils.Svg.SVG));
    this.flyout_.init(this.workspace_);
  }

  /**
   * Creates DOM for ui element and attaches event listeners.
   * @protected
   */
  createDom_() {
    this.svgGroup_ = Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.G, {}, null);
    const rnd = Blockly.utils.genUid();
    const clip = Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.CLIPPATH,
        {'id': 'blocklyBackpackClipPath' + rnd},
        this.svgGroup_);
    Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.RECT,
        {
          'width': this.WIDTH_,
          'height': this.HEIGHT_,
        },
        clip);
    this.svgImg_ = Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.IMAGE,
        {
          'class': 'blocklyBackpack',
          'clip-path': 'url(#blocklyBackpackClipPath' + rnd + ')',
          'width': this.SPRITE_SIZE_ + 'px',
          'x': -this.SPRITE_LEFT_,
          'height': this.SPRITE_SIZE_ + 'px',
          'y': -this.SPRITE_TOP_,
        },
        this.svgGroup_);
    this.svgImg_.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
        BACKPACK_SVG_DATAURI);

    Blockly.utils.dom.insertAfter(
        this.svgGroup_, this.workspace_.getBubbleCanvas());

    // Attach listeners.
    this.addEvent_(
        this.svgGroup_, 'mousedown', this, this.blockMouseDownWhenOpenable_);
    this.addEvent_(
        this.svgGroup_, 'mouseup', this, this.onClick_);
    this.addEvent_(
        this.svgGroup_, 'mouseover', this, this.onDragEnter);
    this.addEvent_(
        this.svgGroup_, 'mouseout', this, this.onDragExit);
  }

  /**
   * Helper method for adding an event.
   * @param {!Element} node Node upon which to listen.
   * @param {string} name Event name to listen to (e.g. 'mousedown').
   * @param {Object} thisObject The value of 'this' in the function.
   * @param {!Function} func Function to call when event is triggered.
   * @private
   */
  addEvent_(node, name, thisObject, func) {
    // bindEventWithChecks_ quashes events too aggressively. See:
    // https://groups.google.com/forum/#!topic/blockly/QF4yB9Wx00s
    // Using bindEventWithChecks_ for blocking mousedown causes issue in mobile.
    // See #4303
    const event = Blockly.bindEvent_(node, name, thisObject, func);
    this.boundEvents_.push(event);
  }

  /**
   * Returns the backpack flyout.
   * @return {?Blockly.IFlyout} The backpack flyout.
   * @public
   */
  getFlyout() {
    return this.flyout_;
  }

  /**
   * Returns the bounding rectangle of the drag target area in pixel units
   * relative to the Blockly injection div.
   * @return {!Blockly.utils.Rect} The plugin’s bounding box.
   */
  getTargetArea() {
    if (!this.svgGroup_) {
      return null;
    }

    const clientRect = this.svgGroup_.getBoundingClientRect();
    const top = clientRect.top + this.SPRITE_TOP_ - this.HOTSPOT_MARGIN_;
    const bottom = top + this.HEIGHT_ + 2 * this.HOTSPOT_MARGIN_;
    const left = clientRect.left + this.SPRITE_LEFT_ - this.HOTSPOT_MARGIN_;
    const right = left + this.WIDTH_ + 2 * this.HOTSPOT_MARGIN_;
    return new Blockly.utils.Rect(top, bottom, left, right);
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
   * Positions the backpack.
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
        metrics.toolboxMetrics.position === Blockly.TOOLBOX_AT_BOTTOM;
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

  /**
   * Returns the count of items in the backpack.
   * @return {number} The count of items.
   */
  getCount() {
    return this.contents_.length;
  }

  /**
   * Returns backpack contents.
   * @return {!Array<string>} The backpack contents.
   */
  getContents() {
    // Return a shallow copy of the contents array.
    return [...this.contents_];
  }

  /**
   * Empties the backpack's contents. If the contents-flyout is currently open
   * it will be closed.
   */
  empty() {
    if (!this.getCount()) {
      return;
    }
    this.contents_ = [];
    Blockly.Events.fire(new BackpackChange(this.workspace_.id));
    this.close();
  }

  /**
   * Handles a block drop on this backpack.
   * @param {!Blockly.BlockSvg} block The block being dropped on the backpack.
   */
  handleBlockDrop(block) {
    this.addBlock(block);
  }

  /**
   * Converts the provided block into a cleaned XML string.
   * @param {!Blockly.Block} block Block to convert.
   * @return {string} The cleaned XML string.
   * @private
   */
  blockToCleanXmlString_(block) {
    return cleanBlockXML(Blockly.Xml.blockToDom(block));
  }

  /**
   * Returns whether the backpack contains a duplicate of the provided Block.
   * @param {!Blockly.Block} block Block to check.
   * @return {boolean} Whether the backpack contains a duplicate of the provided
   *     Block.
   */
  containsBlock(block) {
    const cleanedBlockXml = this.blockToCleanXmlString_(block);
    return this.contents_.indexOf(cleanedBlockXml) !== -1;
  }

  /**
   * Adds Block to backpack.
   * @param {!Blockly.Block} block Block to be added to the backpack.
   */
  addBlock(block) {
    this.addItem(this.blockToCleanXmlString_(block));
  }


  /**
   * Adds Blocks to backpack.
   * @param {!Array<!Blockly.Block>} blocks Blocks to be added to the backpack.
   */
  addBlocks(blocks) {
    const cleanedBlocks = blocks.map(this.blockToCleanXmlString_);
    this.addItems(cleanedBlocks);
  }


  /**
   * Removes Block from the backpack.
   * @param {!Blockly.Block} block Block to be removed from the backpack.
   */
  removeBlock(block) {
    this.removeItem(this.blockToCleanXmlString_(block));
  }

  /**
   * Adds item to backpack.
   * @param {string} item Text representing the XML tree of a block to add,
   *     cleaned of all unnecessary attributes.
   */
  addItem(item) {
    this.addItems([item]);
  }

  /**
   * Adds multiple items to the backpack.
   * @param {!Array<string>} items The backpack contents to add.
   */
  addItems(items) {
    this.contents_.unshift(...this.filterDuplicates_(items));
    Blockly.Events.fire(new BackpackChange(this.workspace_.id));
  }

  /**
   * Removes item from the backpack.
   * @param {string} item Text representing the XML tree of a block to remove,
   * cleaned of all unnecessary attributes.
   */
  removeItem(item) {
    const itemIndex = this.contents_.indexOf(item);
    if (itemIndex !== -1) {
      this.contents_.splice(itemIndex, 1);
      this.maybeRefreshFlyoutContents_();
      Blockly.Events.fire(new BackpackChange(this.workspace_.id));
    }
  }

  /**
   * Sets backpack contents.
   * @param {!Array<string>} contents The new backpack contents.
   */
  setContents(contents) {
    this.contents_ = [];
    this.contents_ = this.filterDuplicates_(contents);
    this.maybeRefreshFlyoutContents_();
    Blockly.Events.fire(new BackpackChange(this.workspace_.id));
  }

  /**
   * Returns a filtered list without duplicates within itself and without any
   * shared elements with this.contents_.
   * @param {!Array<string>} array The array of items to filter.
   * @return {!Array<string>} The filtered list.
   * @private
   */
  filterDuplicates_(array) {
    return array.filter((item, idx) => {
      return array.indexOf(item) === idx && this.contents_.indexOf(item) === -1;
    });
  }

  /**
   * Returns whether the backpack is open-able.
   * @return {boolean} Whether the backpack is open-able.
   * @protected
   */
  isOpenable_() {
    return !this.isOpen();
  }

  /**
   * Returns whether the backpack is open.
   * @return {boolean} Whether the backpack is open.
   */
  isOpen() {
    return this.flyout_.isVisible();
  }

  /**
   * Opens the backpack flyout.
   */
  open() {
    if (!this.isOpenable_()) {
      return;
    }
    const xml = this.contents_.map((text) => Blockly.Xml.textToDom(text));
    this.flyout_.show(xml);
    Blockly.Events.fire(new BackpackOpen(true, this.workspace_.id));
  }

  /**
   * Refreshes backpack flyout contents if the flyout is open.
   * @protected
   */
  maybeRefreshFlyoutContents_() {
    if (!this.isOpen()) {
      return;
    }
    const xml = this.contents_.map((text) => Blockly.Xml.textToDom(text));
    this.flyout_.show(xml);
  }

  /**
   * Closes the backpack flyout.
   */
  close() {
    if (!this.isOpen()) {
      return;
    }
    this.flyout_.hide();
    Blockly.Events.fire(new BackpackOpen(false, this.workspace_.id));
  }

  /**
   * Handle click event.
   * @param {!MouseEvent} e Mouse event.
   * @protected
   */
  onClick_(e) {
    if (Blockly.utils.isRightButton(e)) {
      return;
    }
    this.open();
    const uiEvent = new (Blockly.Events.get(Blockly.Events.CLICK))(
        null, this.workspace_.id, 'backpack');
    Blockly.Events.fire(uiEvent);
  }

  /**
   * Handle mouse over.
   */
  onDragEnter() {
    Blockly.utils.dom.addClass(
        /** @type {!SVGElement} */ (this.svgImg_), 'blocklyBackpackDarken');
  }

  /**
   * Handle mouse exit.
   */
  onDragExit() {
    Blockly.utils.dom.removeClass(
        /** @type {!SVGElement} */ (this.svgImg_), 'blocklyBackpackDarken');
  }

  /**
   * Prevents a workspace scroll and click event if the backpack is openable.
   * @param {!Event} e A mouse down event.
   * @protected
   */
  blockMouseDownWhenOpenable_(e) {
    if (!Blockly.utils.isRightButton(e) && this.isOpenable_()) {
      e.stopPropagation(); // Don't start a workspace scroll.
    }
  }
}

/**
 * Base64 encoded data uri for backpack  icon.
 * @type {string}
 */
const BACKPACK_SVG_DATAURI =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC' +
    '9zdmciIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDI0IDI0IiBoZWlnaHQ9IjI0cHgiIH' +
    'ZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0cHgiIGZpbGw9IiM0NTVBNjQiPjxnPjxyZW' +
    'N0IGZpbGw9Im5vbmUiIGhlaWdodD0iMjQiIHdpZHRoPSIyNCIvPjwvZz48Zz48Zy8+PGc+PH' +
    'BhdGggZD0iTTEzLjk3LDUuMzRDMTMuOTgsNS4yMywxNCw1LjEyLDE0LDVjMC0xLjEtMC45LT' +
    'ItMi0ycy0yLDAuOS0yLDJjMCwwLjEyLDAuMDIsMC4yMywwLjAzLDAuMzRDNy42OSw2LjE1LD' +
    'YsOC4zOCw2LDExdjggYzAsMS4xLDAuOSwyLDIsMmg4YzEuMSwwLDItMC45LDItMnYtOEMxOC' +
    'w4LjM4LDE2LjMxLDYuMTUsMTMuOTcsNS4zNHogTTExLDVjMC0wLjU1LDAuNDUtMSwxLTFzMS' +
    'wwLjQ1LDEsMSBjMCwwLjAzLTAuMDEsMC4wNi0wLjAyLDAuMDlDMTIuNjYsNS4wMywxMi4zNC' +
    'w1LDEyLDVzLTAuNjYsMC4wMy0wLjk4LDAuMDlDMTEuMDEsNS4wNiwxMSw1LjAzLDExLDV6IE' +
    '0xNiwxM3YxdjAuNSBjMCwwLjI4LTAuMjIsMC41LTAuNSwwLjVTMTUsMTQuNzgsMTUsMTQuNV' +
    'YxNHYtMUg4di0xaDdoMVYxM3oiLz48L2c+PC9nPjwvc3ZnPg==';

Blockly.Css.register([
  `.blocklyBackpack {
    opacity: .4;
  }
  .blocklyBackpack:hover, .blocklyBackpackDarken {
    opacity: .6;
  }
  .blocklyBackpack:active {
    opacity: .8;
  }`,
]);
