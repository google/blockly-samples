/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Backpack with a notification.
 */

class NotificationBackpack extends Backpack {
  /**
   * Constructor for a backpack.
   * @param {!Blockly.WorkspaceSvg} targetWorkspace The target workspace that
   *     the plugin will be added to.
   */
  constructor(targetWorkspace) {
    super(targetWorkspace);

    /**
     * The SVG group containing notification circle that shows either the
     * total count of tiems or the number of items added since the backapck
     * flyout was last opened.
     * @type {?SVGElement}
     * @private
     */
    this.countSvg_ = null;

    /**
     * The SVG text for the notification circle.
     * @type {SVGTextElement}
     * @private
     */
    this.countSvgText_ = null;

    /**
     * The CSS color to use on the count svg circle fill.
     * @type {string}
     * @private
     */
    this.countSvgColour_ = 'blue';

    /**
     * The CSS color to use on the count svg text.
     * @type {string}
     * @private
     */
    this.countSvgTextColour_ = 'white';

    /**
     * The backpack content since the backpack was last opened, stored as a list
     * of XML (stored as strings) representing blocks in the backpack.
     * @type {!Array<string>}
     * @protected
     */
    this.cachedContents_ = [];

    /**
     * Whether to disable caching contents.
     * @type {boolean}
     * @private
     */
    this.disableCaching_ = false;

    /**
     * The notification count to display. Cleared on backpack open.
     * @type {number}
     * @private
     */
    this.notificationCount_ = 0;
  }

  /**
   * Creates DOM for ui element and attaches event listeners.
   * @protected
   * @override
   */
  createDom_() {
    super.createDom_();
    this.createNotificationSvg_();
  }

  /**
   * Creates notification circle.
   * @private
   */
  createNotificationSvg_() {
    this.countSvg_ = Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.G, {'opacity': 0}, this.svgGroup_);
    const circleRadius = this.WIDTH_ / 4;
    Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.CIRCLE,
        {
          'cx': this.WIDTH_ * 4 / 5,
          'cy': this.HEIGHT_ / 4,
          'fill': this.countSvgColour_,
          'r': circleRadius,
          'stroke': '#888',
          'stroke-width': 1,
        },
        this.countSvg_);
    this.countSvgText_ = Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.TEXT,
        {
          'dominant-baseline': 'central',
          'fill': this.countSvgTextColour_,
          'font-family': 'sans-serif',
          'font-size': '0.75em',
          'font-weight': '600',
          'height': circleRadius * 2,
          'text-anchor': 'middle',
          'width': circleRadius * 2,
          'x': this.WIDTH_ * 4 / 5,
          'y': this.HEIGHT_ / 4,
        },
        this.countSvg_);
  }

  /**
   * Updates the notification circle icon.
   * @private
   */
  updateNotification_() {
    if (this.notificationCount_) {
      if (this.getCount() === 0) {
        this.countSvgText_.textContent = '!';
        this.countSvg_.setAttribute('opacity', '1');
      } else {
        this.countSvgText_.textContent = this.notificationCount_ > 99 ?
            '99+' : this.notificationCount_.toString();
      }
      this.countSvg_.setAttribute('opacity', '1');
    } else {
      this.countSvg_.setAttribute('opacity', '0');
    }
  }

  /**
   * Adds multiple items to the backpack.
   * @param {!Array<string>} items The backpack contents to add.
   * @override
   */
  addItems(items) {
    super.addItems(items);
    if (!this.disableCaching_) {
      this.cachedContents_ = this.contents_;
    }
  }

  /**
   * Removes item from the backpack.
   * @param {string} item Text representing the XML tree of a block to remove,
   * cleaned of all unnecessary attributes.
   * @override
   */
  removeItem(item) {
    super.item(item);
    if (!this.disableCaching_) {
      this.cachedContents_ = this.contents_;
    }
  }

  /**
   * Sets backpack contents.
   * @param {!Array<string>} contents The new backpack contents.
   * @override
   */
  setContents(contents) {
    super.setContents(contents);
    if (!this.disableCaching_) {
      this.cachedContents_ = this.contents_;
    }
  }

  /**
   * Empties the backpack's contents. If the contents-flyout is currently open
   * it will be closed.
   * @override
   */
  empty() {
    super.empty();
    if (!this.disableCaching_) {
      this.cachedContents_ = this.contents_;
    }
  }

  /**
   * Opens the backpack flyout.
   * @override
   */
  open() {
    super.open();
    this.cachedContents_ = this.contents_;
    this.notificationCount_ = 0;
    this.updateNotification_();
  }

  /**
   * Updates the notification count based on the cached and new contents.
   * @param {!Array<string>} contents The new backpack contents.
   */
  updateNotificationCount_(contents) {
    // Count removed items.
    let changeCount = this.cachedContents_.reduce((accumulator, currentItem
    ) => {
      if (contents.indexOf(currentItem) !== -1) {
        return accumulator;
      }
      return accumulator + 1;
    }, 0);
    // Count added items.
    changeCount = contents.reduce((accumulator, currentItem) => {
      if (this.cachedContents_.indexOf(currentItem) !== -1) {
        return accumulator;
      }
      return accumulator + 1;
    }, changeCount);
    this.notificationCount_ = changeCount;
  }

  /**
   * Sets backpack contents and updates the notification.
   * @param {!Array<string>} contents The new backpack contents.
   */
  setContentsAndNotify(contents) {
    if (this.isOpen()) {
      this.notificationCount_ = 0;
    } else {
      this.updateNotificationCount_(contents);
    }
    this.disableCaching_ = true;
    this.setContents(contents);
    this.disableCaching_ = false;
    this.updateNotification_();
  }
}
