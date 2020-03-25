/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class responsible for creating a Blockly modal.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */


import * as Blockly from 'blockly/core';
import { injectCss } from "./css_inject";

/**
 * Class responsible for creating a Blockly modal.
 */
export class Modal {

  /**
   * Constructor for creating a Blockly modal.
   * @param {string} title The title for the modal.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace to display the modal
   *     over.
   */
  constructor(title, workspace) {
    /**
     * The title for the modal.
     * @type {string}
     * @protected
     */
    this.title = title;

    /**
     * The workspace to display the modal over.
     * @type {!Blockly.WorkspaceSvg}
     * @protected
     */
    this.workspace_ = workspace;

    /**
     * The list of focusable elements in the modal.
     * @type {Array<!HTMLElement>}
     * @private
     */
    this.focusableEls = [];

    /**
     * HTML container for the modal.
     * @type {HTMLDivElement}
     * @private
     */
    this.htmlDiv_ = null;

    /**
     * Array holding info needed to unbind events.
     * Used for disposing.
     * Ex: [[node, name, func], [node, name, func]].
     * @type {!Array.<Array<?>>}
     * @private
     */
    this.boundEvents_ = [];

    /**
     * If true close the modal when the user clicks outside the modal.
     * Otherwise, only close when user hits the 'X' button or escape.
     * @type {boolean}
     */
    this.closeOnClick = true;
  }

  /**
   * Initialize a Blockly modal.
   */
  init() {
    this.injectCss_();
    this.render();
    this.addEvent_(/** @type{!HTMLDivElement} */ this.htmlDiv_, 'keydown',
        this, this.handleKeyDown_);
  }

  /**
   * Inject the css for a Blockly modal.
   * @protected
   */
  injectCss_() {
    injectCss('blockly-modal-css', `
      .blockly-modal-container {
        background-color: white;
        border: 1px solid gray;
        max-width: 50%;
        font-family: Helvetica;
        font-weight: 300;
        padding: 1em;
        width: 400px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        box-shadow: 0px 10px 20px grey;
        z-index: 100;
        margin: 15% auto;
      }
      .blockly-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .blockly-modal-header-title {
        margin-top: 0;
        margin-bottom: 0;
        font-size: 1.2em;
        line-height: 1.25;
      }
      .blockly-modal-header .blockly-modal-btn {
        margin-left: auto;
        height: fit-content;
      }
      .blockly-modal-btn-close:before {
        content: "\\2715";
      }
      .blockly-modal-btn {
        margin-right: .5em;
        border: 1px solid gray;
        font-weight: 500;
        color: gray;
        border-radius: 25px;
      }
      .blockly-modal-btn-primary {
        background-color: gray;
        color: white;
      }`);
  }

  /**
   * Disposes of this modal.
   * Unlink from all DOM elements and remove all event listeners
   * to prevent memory leaks.
   */
  dispose() {
    for (let event of this.boundEvents_) {
      Blockly.unbindEvent_(event);
    }
    this.boundEvents_ = [];
    if (this.htmlDiv_) {
      this.htmlDiv_.remove();
      this.htmlDiv_ = null;
    }
  }

  /**
   * Shows the Blockly modal and focus on the first focusable element.
   */
  show() {
    this.focusableEls = this.htmlDiv_.querySelectorAll('a[href],' +
        'area[href], input:not([disabled]), select:not([disabled]),' +
        'textarea:not([disabled]), button:not([disabled]), [tabindex="0"]');
    Blockly.WidgetDiv.show(this, this.workspace_.RTL,
        () => this.widgetDispose_());
    this.widgetCreate_();
    if (this.focusableEls.length > 0) {
      this.focusableEls[0].focus();
    }
  }

  /**
   * Hide the Blockly modal.
   */
  hide() {
    Blockly.WidgetDiv.hide();
  }

  /**
   * The function to be called when the user hits the 'x' button.
   * @protected
   */
  onCancel_() {
    this.hide();
  }

  /**
   * Add the Blockly modal to the widget div and position it properly.
   * @protected
   */
  widgetCreate_() {
    const widgetDiv = Blockly.WidgetDiv.DIV;

    widgetDiv.style.width = '100%';
    widgetDiv.style.height = '100%';
    widgetDiv.style.left = '0px';
    widgetDiv.style.top = '0px';
    widgetDiv.style.position = 'fixed';
    if (this.closeOnClick) {
      this.hideEvent = this.addEvent_(widgetDiv, 'click', this, this.hide);
      this.modalEvent = this.addEvent_(this.htmlDiv_, 'click', this, (e) => {
        e.stopPropagation();
      });
    }
    Blockly.utils.dom.addClass(this.htmlDiv_, 'blockly-modal-open');
    widgetDiv.appendChild(this.htmlDiv_);
  }

  /**
   * Disposes of any events or dom-references belonging to the editor.
   * @protected
   */
  widgetDispose_() {
    const widgetDiv = Blockly.WidgetDiv.DIV;
    widgetDiv.style.width = 'auto';
    widgetDiv.style.height = 'auto';
    if (this.closeOnClick) {
      Blockly.unbindEvent_(this.hideEvent);
      Blockly.unbindEvent_(this.modalEvent);
    }
    Blockly.utils.dom.removeClass(this.htmlDiv_, 'blockly-modal-open');
  }

  /**
   * Handle when the user goes to the previous focusable element.
   * @param {KeyboardEvent} e The keydown event.
   * @private
   */
  handleBackwardTab_(e) {
    if (document.activeElement === this.focusableEls[0]) {
      e.preventDefault();
      this.focusableEls[this.focusableEls.length - 1].focus();
    }
  }

  /**
   * Handle when the user goes to the next focusable element.
   * @param {KeyboardEvent} e The keydown event.
   * @private
   */
  handleForwardTab_(e) {
    const focusedElements = this.focusableEls;
    if (document.activeElement === focusedElements[focusedElements.length - 1]) {
      e.preventDefault();
      this.focusableEls[0].focus();
    }
  }

  /**
   * Handles keydown event for a Blockly modal. Handles forward tab, backward
   * tab, and escape button.
   * @param {KeyboardEvent} e The keydown event.
   * @private
   */
  handleKeyDown_(e) {
    if (e.keyCode === Blockly.utils.KeyCodes.TAB) {
      if (this.focusableEls.length <= 1) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (e.shiftKey) {
        this.handleBackwardTab_(e);
      } else {
        this.handleForwardTab_(e);
      }
    } else if (e.keyCode === Blockly.utils.KeyCodes.ESC) {
      this.hide();
    }
    e.stopPropagation();
  }

  /**
   * Helper method for adding an event.
   * @param {!Element} node Node upon which to listen.
   * @param {string} name Event name to listen to (e.g. 'mousedown').
   * @param {Object} thisObject The value of 'this' in the function.
   * @param {!Function} func Function to call when event is triggered.
   * @protected
   */
  addEvent_(node, name, thisObject, func) {
    const event = Blockly.bindEventWithChecks_(node, name, thisObject, func);
    this.boundEvents_.push(event);
  }

  /**
   * Create all the dom elements for the modal.
   */
  render() {
    /*
     * Creates the Modal. The generated modal looks like:
     * <div class="blockly-modal-container" role="dialog">
     *   <header class="blockly-moddal-header">
     *     <h2 class="blockly-modal-header-title">Modal Name</h2>
     *     <button class="blockly-modal-btn">X</button>
     *   </header>
     *   <div class="blockly-modal-content">
     *   </div>
     *   <div class="blockly-modal-footer">
     *     <button class="blockly-modal-btn blockly-modal-btn-primary">OK</button>
     *     <button class="blockly-modal-btn">Cancel</button>
     *   </div>
     * </div>
     */

    // Create Container
    this.htmlDiv_ = document.createElement('div');
    Blockly.utils.dom.addClass(this.htmlDiv_, 'blockly-modal-container');
    this.htmlDiv_.setAttribute('role', 'dialog');
    this.htmlDiv_.setAttribute('aria-labelledby', this.title);
    // End creating the container

    // Create the header
    const modalHeader = document.createElement('header');
    Blockly.utils.dom.addClass(modalHeader, 'blockly-modal-header');

    this.renderHeader_(modalHeader);

    const exitButton = document.createElement('button');
    Blockly.utils.dom.addClass(exitButton, 'blockly-modal-btn');
    Blockly.utils.dom.addClass(exitButton, 'blockly-modal-btn-close');
    this.addEvent_(exitButton, 'click', this, this.onCancel_);
    modalHeader.appendChild(exitButton);
    // End create header

    // Create content
    const modalContent = document.createElement('div');
    Blockly.utils.dom.addClass(modalContent, 'blockly-modal-content');
    this.renderContent_(modalContent);
    // End creating content

    // Create Footer
    const modalFooter = document.createElement('footer');
    Blockly.utils.dom.addClass(modalFooter, 'blockly-modal-footer');
    this.renderFooter_(modalFooter);
    // End creating footer

    this.htmlDiv_.appendChild(modalHeader);
    this.htmlDiv_.appendChild(modalContent);
    this.htmlDiv_.appendChild(modalFooter);
  }

  /**
   * Render content for the header.
   * @param {HTMLElement} headerContainer The modal's header div.
   * @protected
   */
  renderHeader_(headerContainer) {
    const modalTitle = document.createElement('H2');
    Blockly.utils.dom.addClass(modalTitle, 'blockly-modal-header-title');
    modalTitle.appendChild(document.createTextNode(this.title));
    headerContainer.appendChild(modalTitle);
  }

  /**
   * Render content for the content div.
   * @param {HTMLDivElement} _contentContainer The modal's content div.
   * @protected
   */
  renderContent_(_contentContainer) {
    // No-op on the base class.
  }

  /**
   * Render content for the modal footer.
   * @param {HTMLElement} _footerContainer The modal's footer div.
   * @protected
   */
  renderFooter_(_footerContainer) {
    // No-op on the base class.
  }
}
