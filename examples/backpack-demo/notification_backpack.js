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
     * The backpack content added externally since the backpack was last opened,
     * stored as a list of XML (stored as strings) representing blocks.
     * Cleared on backpack open.
     * @type {!Array<string>}
     * @protected
     */
    this.cachedAddedContent_ = [];

    /**
     * The backpack content removed externally since the backpack was last
     * opened, stored as a list of XML (stored as strings) representing blocks.
     * Cleared on backpack open.
     * @type {!Array<string>}
     * @protected
     */
    this.cachedRemovedContent_ = [];

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
   * Sets backpack contents and updates the notification.
   * @param {!Array<string>} contents The new backpack contents.
   */
  setContentsAndNotify(contents) {
    if (this.isOpen()) {
      this.clearNotificationCount_();
    } else {
      this.updateNotificationCount_(contents);
    }
    this.setContents(contents);
    this.updateNotification_();
  }

  /**
   * Opens the backpack flyout.
   * @override
   */
  open() {
    super.open();
    this.clearNotificationCount_();
    this.updateNotification_();
  }

  /**
   * Empties the backpack's contents. If the contents-flyout is currently open
   * it will be closed.
   */
  empty() {
    super.empty();
    this.clearNotificationCount_();
    this.updateNotification_();
  }

  /**
   * Clears the notification count and cached content changes.
   * @private
   */
  clearNotificationCount_() {
    this.notificationCount_ = 0;
    this.cachedAddedContent_ = [];
    this.cachedRemovedContent_ = [];
  }

  /**
   * Updates the notification count based on the cached and new contents.
   * @param {!Array<string>} contents The new backpack contents.
   * @private
   */
  updateNotificationCount_(contents) {
    // Count removed items.
    const removed = this.contents_.filter((item) => {
      const isRemoved = contents.indexOf(item) === -1;
      if (isRemoved) {
        const addIdx = this.cachedAddedContent_.indexOf(item);
        if (addIdx !== -1) {
          // Ignore item removed after it was added.
          this.cachedAddedContent_.splice(addIdx, 1);
          return false;
        }
        return true;
      }
      return false;
    },);
    // Count added items.
    const added = contents.filter((item) => {
      const isAdded = this.contents_.indexOf(item) === -1;
      if (isAdded) {
        const rmIdx = this.cachedRemovedContent_.indexOf(item);
        if (rmIdx !== -1) {
          // Ignore item added after it was removed.
          this.cachedRemovedContent_.splice(rmIdx, 1);
          return false;
        }
        return true;
      }
      return false;
    });
    this.cachedRemovedContent_.push(...removed);
    this.cachedAddedContent_.push(...added);
    this.notificationCount_ =
        this.cachedRemovedContent_.length + this.cachedAddedContent_.length;
  }
}
