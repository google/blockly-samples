/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A backpack that lives on top of the workspace.
 * @author kozbial@google.com (Monica Kozbial)
 */

import * as Blockly from 'blockly/core';
import {registerContextMenus} from './backpack_helpers';
import {BackpackChange, BackpackOpen} from './ui_events';
import {parseOptions} from './options';
// import {BackpackOptions} from './options';

/**
 * Class for backpack that can be used save blocks from the workspace for
 * future use.
 * @implements {Blockly.IAutoHideable}
 * @implements {Blockly.IPositionable}
 * @extends {Blockly.DragTarget}
 */
export class Backpack extends Blockly.DragTarget {
  /**
   * Constructor for a backpack.
   * @param {!Blockly.WorkspaceSvg} targetWorkspace The target workspace that
   *     the backpack will be added to.
   * @param backpackOptions The backpack options to use.
   */
  constructor(targetWorkspace, backpackOptions) {
    super();

    /**
     * The workspace.
     * @type {!Blockly.WorkspaceSvg}
     * @protected
     */
    this.workspace_ = targetWorkspace;

    /**
     * The unique id for this component.
     * @type {string}
     */
    this.id = 'backpack';

    /**
     * The backpack options.
     */
    this.options_ = parseOptions(backpackOptions);

    /**
     * The backpack flyout. Initialized during init.
     * @type {?Blockly.IFlyout}
     * @protected
     */
    this.flyout_ = null;

    /**
     * A list of JSON (stored as strings) representing blocks in the backpack.
     * @type {!Array<string>}
     * @protected
     */
    this.contents_ = [];

    /**
     * Array holding info needed to unbind events.
     * Used for disposing.
     * @type {!Array<!Blockly.browserEvents.Data>}
     * @private
     */
    this.boundEvents_ = [];

    /**
     * Left coordinate of the backpack.
     * @type {number}
     * @protected
     */
    this.left_ = 0;

    /**
     * Top coordinate of the backpack.
     * @type {number}
     * @protected
     */
    this.top_ = 0;

    /**
     * Width of the backpack. Used for clip path.
     * @type {number}
     * @const
     * @protected
     */
    this.WIDTH_ = 40;

    /**
     * Height of the backpack. Used for clip path.
     * @type {number}
     * @const
     * @protected
     */
    this.HEIGHT_ = 60;

    /**
     * Distance between backpack and bottom or top edge of workspace.
     * @type {number}
     * @const
     * @protected
     */
    this.MARGIN_VERTICAL_ = 20;

    /**
     * Distance between backpack and right or left edge of workspace.
     * @type {number}
     * @const
     * @protected
     */
    this.MARGIN_HORIZONTAL_ = 20;

    /**
     * Extent of hotspot on all sides beyond the size of the image.
     * @const {number}
     * @protected
     */
    this.HOTSPOT_MARGIN_ = 10;

    /**
     * The SVG group containing the backpack.
     * @type {?SVGElement}
     * @protected
     */
    this.svgGroup_ = null;

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
  }

  /**
   * Initializes the backpack.
   */
  init() {
    this.workspace_.getComponentManager().addComponent({
      component: this,
      weight: 2,
      capabilities: [
        Blockly.ComponentManager.Capability.AUTOHIDEABLE,
        Blockly.ComponentManager.Capability.DRAG_TARGET,
        Blockly.ComponentManager.Capability.POSITIONABLE,
      ],
    });
    this.initFlyout_();
    this.createDom_();
    this.attachListeners_();
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
      Blockly.browserEvents.unbind(event);
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
   * Creates DOM for UI element.
   * @protected
   */
  createDom_() {
    this.svgGroup_ = Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.G, {}, null);
    const rnd = Blockly.utils.idGenerator.genUid();
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
  }

  /**
   * Attaches event listeners.
   * @protected
   */
  attachListeners_() {
    this.addEvent_(
        this.svgGroup_, 'mousedown', this, this.blockMouseDownWhenOpenable_);
    this.addEvent_(
        this.svgGroup_, 'mouseup', this, this.onClick_);
    this.addEvent_(
        this.svgGroup_, 'mouseover', this, this.onMouseOver_);
    this.addEvent_(
        this.svgGroup_, 'mouseout', this, this.onMouseOut_);
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
    const event = Blockly.browserEvents.bind(node, name, thisObject, func);
    this.boundEvents_.push(event);
  }

  /**
   * Returns the backpack flyout.
   * @returns {?Blockly.IFlyout} The backpack flyout.
   * @public
   */
  getFlyout() {
    return this.flyout_;
  }

  /**
   * Returns the bounding rectangle of the drag target area in pixel units
   * relative to viewport.
   * @returns {?Blockly.utils.Rect} The component's bounding box. Null if drag
   *   target area should be ignored.
   */
  getClientRect() {
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
   * @returns {!Blockly.utils.Rect} The component’s bounding box.
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
   * @returns {number} The count of items.
   */
  getCount() {
    return this.contents_.length;
  }

  /**
   * Returns backpack contents.
   * @returns {!Array<string>} The backpack contents.
   */
  getContents() {
    // Return a shallow copy of the contents array.
    return [...this.contents_];
  }

  /**
   * Handles when a block or bubble is dropped on this component.
   * Should not handle delete here.
   * @param {!Blockly.IDraggable} dragElement The block or bubble currently
   *   being dragged.
   */
  onDrop(dragElement) {
    if (dragElement instanceof Blockly.BlockSvg) {
      this.addBlock(/** @type {!Blockly.BlockSvg} */ (dragElement));
    }
  }

  /**
   * Converts the provided block into a JSON string and
   * cleans the JSON of any unnecessary attributes
   * @param {!Blockly.Block} block The block to convert.
   * @returns {string} The JSON object as a string.
   * @private
   */
  blockToJsonString(block) {
    const json = Blockly.serialization.blocks.save(block);

    // Add a 'kind' key so the flyout can recognize it as a block.
    json.kind = 'BLOCK';

    // The keys to remove.
    const keys = ['id', 'height', 'width', 'pinned', 'enabled'];

    // Traverse the JSON recursively.
    const traverseJson = function(json, keys) {
      for (const key in json) {
        if (key) {
          if (keys.includes(key)) {
            delete json[key];
          }
          if (json[key] && typeof json[key] === 'object') {
            traverseJson(json[key], keys);
          }
        }
      }
    };

    traverseJson(json, keys);
    return JSON.stringify(json);
  }

  /**
   * Returns whether the backpack contains a duplicate of the provided Block.
   * @param {!Blockly.Block} block The block to check.
   * @returns {boolean} Whether the backpack contains a duplicate of the
   *     provided block.
   */
  containsBlock(block) {
    return this.contents_.indexOf(this.blockToJsonString(block)) !== -1;
  }

  /**
   * Adds the specified block to backpack.
   * @param {!Blockly.Block} block The block to be added to the backpack.
   */
  addBlock(block) {
    this.addItem(this.blockToJsonString(block));
  }


  /**
   * Adds the provided blocks to backpack.
   * @param {!Array<!Blockly.Block>} blocks The blocks to be added to the
   *     backpack.
   */
  addBlocks(blocks) {
    this.addItems(blocks.map(this.blockToJsonString));
  }


  /**
   * Removes the specified block from the backpack.
   * @param {!Blockly.Block} block The block to be removed from the backpack.
   */
  removeBlock(block) {
    this.removeItem(this.blockToJsonString(block));
  }

  /**
   * Adds item to backpack.
   * @param {string} item Text representing the JSON of a block to add,
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
    const addedItems = this.filterDuplicates_(items);
    if (addedItems.length) {
      this.contents_.unshift(...addedItems);
      this.onContentChange_();
    }
  }

  /**
   * Removes item from the backpack.
   * @param {string} item Text representing the JSON of a block to remove,
   * cleaned of all unnecessary attributes.
   */
  removeItem(item) {
    const itemIndex = this.contents_.indexOf(item);
    if (itemIndex !== -1) {
      this.contents_.splice(itemIndex, 1);
      this.onContentChange_();
    }
  }

  /**
   * Sets backpack contents.
   * @param {!Array<string>} contents The new backpack contents.
   */
  setContents(contents) {
    this.contents_ = [];
    this.contents_ = this.filterDuplicates_(contents);
    this.onContentChange_();
  }

  /**
   * Empties the backpack's contents. If the contents-flyout is currently open
   * it will be closed.
   */
  empty() {
    if (!this.getCount()) {
      return;
    }
    if (this.contents_.length) {
      this.contents_ = [];
      this.onContentChange_();
    }
    this.close();
  }

  /**
   * Handles content change.
   * @protected
   */
  onContentChange_() {
    this.maybeRefreshFlyoutContents_();
    Blockly.Events.fire(new BackpackChange(this.workspace_.id));

    if (!this.options_.useFilledBackpackImage) return;
    if (this.contents_.length > 0) {
      this.svgImg_.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
          BACKPACK_FILLED_SVG_DATAURI);
    } else {
      this.svgImg_.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
          BACKPACK_SVG_DATAURI);
    }
  }

  /**
   * Returns a filtered list without duplicates within itself and without any
   * shared elements with this.contents_.
   * @param {!Array<string>} array The array of items to filter.
   * @returns {!Array<string>} The filtered list.
   * @private
   */
  filterDuplicates_(array) {
    return array.filter((item, idx) => {
      return array.indexOf(item) === idx && this.contents_.indexOf(item) === -1;
    });
  }

  /**
   * Returns whether the backpack is open-able.
   * @returns {boolean} Whether the backpack is open-able.
   * @protected
   */
  isOpenable_() {
    return !this.isOpen() &&
    this.options_.allowEmptyBackpackOpen ? true : this.getCount() > 0;
  }

  /**
   * Returns whether the backpack is open.
   * @returns {boolean} Whether the backpack is open.
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
    const jsons = this.contents_.map((text) => JSON.parse(text));
    this.flyout_.show(jsons);
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
    const json = this.contents_.map((text) => JSON.parse(text));
    this.flyout_.show(json);
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
   * Hides the component. Called in Blockly.hideChaff.
   * @param {boolean} onlyClosePopups Whether only popups should be closed.
   *     Flyouts should not be closed if this is true.
   */
  autoHide(onlyClosePopups) {
    // The backpack flyout always autocloses because it overlays the backpack UI
    // (no backpack to click to close it).
    if (!onlyClosePopups) {
      this.close();
    }
  }

  /**
   * Handle click event.
   * @param {!MouseEvent} e Mouse event.
   * @protected
   */
  onClick_(e) {
    if (Blockly.browserEvents.isRightButton(e)) {
      return;
    }
    this.open();
    const uiEvent = new (Blockly.Events.get(Blockly.Events.CLICK))(
        null, this.workspace_.id, 'backpack');
    Blockly.Events.fire(uiEvent);
  }

  /**
   * Handles when a cursor with a block or bubble enters this drag target.
   * @param {!Blockly.IDraggable} dragElement The block or bubble currently
   *   being dragged.
   */
  onDragEnter(dragElement) {
    if (dragElement instanceof Blockly.BlockSvg) {
      this.updateHoverStying_(true);
    }
  }

  /**
   * Handles when a cursor with a block or bubble exits this drag target.
   * @param {!Blockly.IDraggable} _dragElement The block or bubble currently
   *   being dragged.
   */
  onDragExit(_dragElement) {
    this.updateHoverStying_(false);
  }

  /**
   * Handles a mouseover event.
   * @private
   */
  onMouseOver_() {
    if (this.isOpenable_()) {
      this.updateHoverStying_(true);
    }
  }

  /**
   * Handles a mouseout event.
   * @private
   */
  onMouseOut_() {
    this.updateHoverStying_(false);
  }

  /**
   * Adds or removes styling to darken the backpack to show it is interactable.
   * @param {boolean} addClass True to add styling, false to remove.
   * @protected
   */
  updateHoverStying_(addClass) {
    const backpackDarken = 'blocklyBackpackDarken';
    if (addClass) {
      Blockly.utils.dom.addClass(
          /** @type {!SVGElement} */ (this.svgImg_), backpackDarken);
    } else {
      Blockly.utils.dom.removeClass(
          /** @type {!SVGElement} */ (this.svgImg_), backpackDarken);
    }
  }

  /**
   * Returns whether the provided block or bubble should not be moved after
   * being dropped on this component. If true, the element will return to where
   * it was when the drag started.
   * @param {!Blockly.IDraggable} dragElement The block or bubble currently
   *   being dragged.
   * @returns {boolean} Whether the block or bubble provided should be returned
   *   to drag start.
   */
  shouldPreventMove(dragElement) {
    return dragElement instanceof Blockly.BlockSvg;
  }

  /**
   * Prevents a workspace scroll and click event if the backpack is openable.
   * @param {!Event} e A mouse down event.
   * @protected
   */
  blockMouseDownWhenOpenable_(e) {
    if (!Blockly.browserEvents.isRightButton(e) && this.isOpenable_()) {
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

/**
 * Base64 encoded data uri for backpack  icon when filled.
 * @type {string}
 */
const BACKPACK_FILLED_SVG_DATAURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2' +
    'lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYX' +
    'RlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgoKPHN2Zw' +
    'ogICB3aWR0aD0iMjQiCiAgIGhlaWdodD0iMjQiCiAgIHZpZXdCb3g9IjAgMCAyNCAyNCIKIC' +
    'AgdmVyc2lvbj0iMS4xIgogICBpZD0ic3ZnNSIKICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3' +
    'JnLzIwMDAvc3ZnIgogICB4bWxuczpzdmc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj' +
    '4KICA8ZGVmcwogICAgIGlkPSJkZWZzMiIgLz4KICA8ZwogICAgIGlkPSJsYXllcjEiPgogIC' +
    'AgPGcKICAgICAgIHN0eWxlPSJmaWxsOiM0NTVhNjQiCiAgICAgICBpZD0iZzg0OCIKICAgIC' +
    'AgIHRyYW5zZm9ybT0ibWF0cml4KDAuMjY0NTgzMzMsMCwwLDAuMjY0NTgzMzMsOC44MjQ5OT' +
    'k3LDguODI0OTk5NykiPgogICAgICA8ZwogICAgICAgICBpZD0iZzgyNiI+CiAgICAgICAgPH' +
    'JlY3QKICAgICAgICAgICBmaWxsPSJub25lIgogICAgICAgICAgIGhlaWdodD0iMjQiCiAgIC' +
    'AgICAgICAgd2lkdGg9IjI0IgogICAgICAgICAgIGlkPSJyZWN0ODI0IgogICAgICAgICAgIH' +
    'g9IjAiCiAgICAgICAgICAgeT0iMCIgLz4KICAgICAgPC9nPgogICAgICA8ZwogICAgICAgIC' +
    'BpZD0iZzgzNCI+CiAgICAgICAgPGcKICAgICAgICAgICBpZD0iZzgyOCIgLz4KICAgICAgIC' +
    'A8ZwogICAgICAgICAgIGlkPSJnMjIyMyI+CiAgICAgICAgICA8ZwogICAgICAgICAgICAgaW' +
    'Q9ImcyMTAxNiI+CiAgICAgICAgICAgIDxnCiAgICAgICAgICAgICAgIHN0eWxlPSJmaWxsOi' +
    'M0NTVhNjQiCiAgICAgICAgICAgICAgIGlkPSJnMTQ5MyIKICAgICAgICAgICAgICAgdHJhbn' +
    'Nmb3JtPSJtYXRyaXgoMy43Nzk1Mjc2LDAsMCwzLjc3OTUyNzYsLTMzLjM1NDMzLC0zMy4zNT' +
    'QzMykiPgogICAgICAgICAgICAgIDxnCiAgICAgICAgICAgICAgICAgaWQ9ImcxNDcxIj4KIC' +
    'AgICAgICAgICAgICAgIDxwYXRoCiAgICAgICAgICAgICAgICAgICBpZD0icmVjdDE0NjkiCi' +
    'AgICAgICAgICAgICAgICAgICBzdHlsZT0iZmlsbDpub25lIgogICAgICAgICAgICAgICAgIC' +
    'AgZD0iTSAwLDAgSCAyNCBWIDI0IEggMCBaIiAvPgogICAgICAgICAgICAgIDwvZz4KICAgIC' +
    'AgICAgICAgICA8ZwogICAgICAgICAgICAgICAgIGlkPSJnMTQ3OSI+CiAgICAgICAgICAgIC' +
    'AgICA8ZwogICAgICAgICAgICAgICAgICAgaWQ9ImcxNDczIiAvPgogICAgICAgICAgICAgIC' +
    'AgPGcKICAgICAgICAgICAgICAgICAgIGlkPSJnMTQ3NyI+CiAgICAgICAgICAgICAgICAgID' +
    'xwYXRoCiAgICAgICAgICAgICAgICAgICAgIGlkPSJwYXRoMTQ3NSIKICAgICAgICAgICAgIC' +
    'AgICAgICAgZD0ibSAxMiwzIGMgLTEuMSwwIC0yLDAuOSAtMiwyIDAsMC4xMiAwLjAxOTMsMC' +
    '4yMjk4NDM4IDAuMDI5MywwLjMzOTg0MzggQyA3LjY4OTI5NjUsNi4xNDk4NDMzIDYsOC4zOC' +
    'A2LDExIHYgOCBjIDAsMS4xIDAuOSwyIDIsMiBoIDggYyAxLjEsMCAyLC0wLjkgMiwtMiBWID' +
    'ExIEMgMTgsOC4zOCAxNi4zMTA3MDMsNi4xNDk4NDMzIDEzLjk3MDcwMyw1LjMzOTg0MzggMT' +
    'MuOTgwNzAzLDUuMjI5ODQzOCAxNCw1LjEyIDE0LDUgMTQsMy45IDEzLjEsMyAxMiwzIFogbS' +
    'AwLDEgYyAwLjU1LDAgMSwwLjQ1IDEsMSAwLDAuMDMgLTAuMDA5NSwwLjA1OTg0NCAtMC4wMT' +
    'k1MywwLjA4OTg0NCBDIDEyLjY2MDQ2OSw1LjAyOTg0MzggMTIuMzQsNSAxMiw1IDExLjY2LD' +
    'UgMTEuMzM5NTMxLDUuMDI5ODQzOCAxMS4wMTk1MzEsNS4wODk4NDM4IDExLjAwOTUzMSw1Lj' +
    'A1OTg0MzggMTEsNS4wMyAxMSw1IDExLDQuNDUgMTEuNDUsNCAxMiw0IFogbSAtMy40NzI2NT' +
    'YyLDYuMzk4NDM4IGggMS4xNTYyNSB2IDIuNjQwNjI0IGggMC4zMDkzMzU0IGwgLTIuMzdlLT' +
    'UsLTEuMTcxMTQ2IDEuMDgyNzEwNSwtMTBlLTcgMC4wMTEsMS4xNzExNDYgaCAwLjMzMzMwNC' +
    'BsIC0wLjAzNTA0LC0yLjU4NzMxNSBoIDAuNTc4MTI1IDAuNTc4MTI1IGwgMC4wMTEwNSwyLj' +
    'U4NzMxNSBoIDAuMzU2MDI0IFYgMTIuMDYwNTQ3IEggMTQuMDYyNSB2IDAuOTc4NTE1IGggMC' +
    '4zMzAwNzggdiAtMi41NTI3MzQgaCAxLjE1NjI1IHYgMi41NTI3MzQgaCAwLjk2Njc5NyB2ID' +
    'AuMzU3NDIyIEggOS42ODM1OTM4IDguNTI3MzQzOCA3LjYwMzUxNTYgdiAtMC4zNTc0MjIgaC' +
    'AwLjkyMzgyODIgeiIKICAgICAgICAgICAgICAgICAgICAgLz4KICAgICAgICAgICAgICAgID' +
    'wvZz4KICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgIDwvZz4KICAgICAgICAgIDwvZz' +
    '4KICAgICAgICA8L2c+CiAgICAgIDwvZz4KICAgIDwvZz4KICA8L2c+Cjwvc3ZnPgo=';

Blockly.Css.register(`
.blocklyBackpack {
  opacity: 0.4;
}
.blocklyBackpackDarken {
  opacity: 0.6;
}
.blocklyBackpack:active {
  opacity: 0.8;
}
`);


/**
 * Custom serializer so that the backpack can save and later recall which
 * blocks have been saved in a workspace.
 */
class BackpackSerializer {
  /** Constructs the backpack serializer */
  constructor() {
    /**
     * The priority for deserializing block suggestion data.
     * Should be after blocks, procedures, and variables.
     * @type {number}
     */
    this.priority = Blockly.serialization.priorities.BLOCKS - 10;
  }

  /**
   * Saves a target workspace's state to serialized JSON.
   * @param {Blockly.Workspace} workspace the workspace to save
   * @returns {object|undefined} the serialized JSON if present
   */
  save(workspace) {
    const componentManager = workspace.getComponentManager();
    const backpack = componentManager.getComponent('backpack');
    return backpack.getContents().map((text) => JSON.parse(text));
  }

  /**
   * Loads a serialized state into the target workspace.
   * @param {object} state the serialized state JSON
   * @param {Blockly.Workspace} workspace the workspace to load into
   */
  load(state, workspace) {
    const jsonStrings = state.map((j) => JSON.stringify(j));
    const componentManager = workspace.getComponentManager();
    const backpack = componentManager.getComponent('backpack');
    backpack.setContents(jsonStrings);
  }

  /**
   * Resets the state of a workspace.
   * @param {Blockly.Workspace} workspace the workspace to reset
   */
  clear(workspace) {
    const componentManager = workspace.getComponentManager();
    const backpack = componentManager.getComponent('backpack');
    backpack.empty();
  }
}

Blockly.serialization.registry.register(
    'backpack',
    new BackpackSerializer());
