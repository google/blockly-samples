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
import { injectCss } from "./css";
import './modal_messages';

/**
 * Class responsible for creating a modal.
 */
export class Modal {

  /**
   * Constructor for creating a modal.
   * @param {string} title The content for the modal.
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
     * The workspace that the modal will be created on.
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
     * The header div for the Blockly modal.
     * @type {HTMLElement}
     * @protected
     */
    this.headerDiv_ = null;

    /**
     * The content div for the Blockly modal.
     * @type {HTMLDivElement}
     * @protected
     */
    this.contentDiv_ = null;

    /**
     * The footer div for the Blockly modal.
     * @type {HTMLDivElement}
     * @protected
     */
    this.footerDiv_ = null;

    /**
     * The selected type for the modal.
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
     * If true center on the workspace. Otherwise, center on the entire page.
     * @type {boolean}
     */
    this.centerOnWorkspace = true;
  }

  /**
   * Initialize a basic accessible modal.
   */
  init() {
    this.injectCss_();
    this.createDom();
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
        font-size: 1.25em;
        line-height: 1.25;
      }
      .blockly-modal-header .blockly-modal-btn {
        margin-left: auto;
        height: fit-content;
      }
      .blockly-modal-btn-close:before {
        content: "\\2715";
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
    this.contentDiv_ = null;
    this.headerDiv_ = null;
    this.footerDiv_ = null;
  }

  /**
   * Shows the Blockly modal.
   * @param {!Blockly.WorkspaceSvg} workspace The button's target workspace.
   */
  show(workspace) {
    this.focusableEls = this.htmlDiv_.querySelectorAll('a[href],' +
        'area[href], input:not([disabled]), select:not([disabled]),' +
        'textarea:not([disabled]), button:not([disabled]), [tabindex="0"]');
    Blockly.WidgetDiv.show(this, workspace.RTL, () => this.onClose_());
    this.onShow_();
    this.focusableEls[0].focus();
  }

  /**
   * Hide the blockly modal.
   */
  hide() {
    Blockly.WidgetDiv.hide();
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
   * The function to be called when the user hits the confirm button.
   * @protected
   */
  onConfirm_() {
    this.hide();
  }

  /**
   * The function to be called when the user hits the cancel button.
   * @protected
   */
  onCancel_() {
    this.hide();
  }

  /**
   * Add the Blockly modal to the widget div.
   * @protected
   */
  onShow_() {
    const widgetDiv = Blockly.WidgetDiv.DIV;
    const metrics = this.workspace_.getMetrics();

    widgetDiv.style.width = this.centerOnWorkspace ? metrics.svgWidth + 'px' : '100%';
    widgetDiv.style.height = this.centerOnWorkspace ? metrics.svgHeight + 'px' : '100%';

    widgetDiv.style.left = this.centerOnWorkspace ? metrics.viewLeft + 'px' : '0px';
    widgetDiv.style.top = this.centerOnWorkspace ? metrics.viewTop + 'px' : '0px';
    const htmlInput_ = this.htmlDiv_;
    Blockly.utils.dom.addClass(htmlInput_, 'blockly-modal-is-open');
    widgetDiv.appendChild(htmlInput_);
  }

  /**
   * Disposes of any events or dom-references belonging to the editor.
   * @protected
   */
  onClose_() {
    const widgetDiv = Blockly.WidgetDiv.DIV;
    widgetDiv.style.width = 'auto';
    widgetDiv.style.height = 'auto';
    Blockly.utils.dom.removeClass(this.htmlDiv_, 'blockly-modal-is-open');
    Blockly.WidgetDiv.DIV.textContent = '';
  }

  /**
   * Handle when the user does a backwards tab.
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
   * Handle when the user does a forward tab.
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
   * Handles keydown event for a Blockly modal.
   * @param {KeyboardEvent} e The keydown event.
   * @private
   */
  handleKeyDown_(e) {
    if (e.keyCode === Blockly.utils.KeyCodes.TAB) {
      if (this.focusableEls.length === 1) {
        e.preventDefault();
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
  }

  /**
   * Create the dom for the modal.
   */
  createDom() {
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

    // Create the header
    const modalHeader = document.createElement('header');
    Blockly.utils.dom.addClass(modalHeader, 'blockly-modal-header');

    const modalTitle = document.createElement('H2');
    Blockly.utils.dom.addClass(modalTitle, 'blockly-modal-header-title');
    modalTitle.appendChild(document.createTextNode(this.title));
    modalHeader.appendChild(modalTitle);

    const exitButton = document.createElement('button');
    Blockly.utils.dom.addClass(exitButton, 'blockly-modal-btn');
    Blockly.utils.dom.addClass(exitButton, 'blockly-modal-btn-close');
    this.addEvent_(exitButton, 'click', this, this.onCancel_);
    modalHeader.appendChild(exitButton);
    this.headerDiv_ = modalHeader;
    // End creating the header

    // Create the content
    const modalContent = document.createElement('div');
    Blockly.utils.dom.addClass(modalContent, 'blockly-modal-content');
    this.contentDiv_ = modalContent;
    // End creating the content

    // Create the footer
    const modalFooter = document.createElement('div');
    Blockly.utils.dom.addClass(modalFooter, 'blockly-modal-footer');

    const createBtn = document.createElement('button');
    Blockly.utils.dom.addClass(createBtn, 'blockly-modal-btn');
    Blockly.utils.dom.addClass(createBtn, 'blockly-modal-btn-primary');
    createBtn.innerText = Blockly.Msg['MODAL_CONFIRM_BUTTON'];
    this.addEvent_(createBtn, 'click', this, this.onConfirm_);

    const cancelBtn = document.createElement('button');
    Blockly.utils.dom.addClass(cancelBtn, 'blockly-modal-btn');
    cancelBtn.innerText = Blockly.Msg['MODAL_CANCEL_BUTTON'];
    this.addEvent_(cancelBtn, 'click', this, this.onCancel_);

    modalFooter.appendChild(createBtn);
    modalFooter.appendChild(cancelBtn);
    this.footerDiv_ = modalFooter;
    // End creating the footer

    // Create Container
    this.htmlDiv_ = document.createElement('div');
    Blockly.utils.dom.addClass(this.htmlDiv_, 'blockly-modal-container');
    this.htmlDiv_.setAttribute('role', 'dialog');
    // TODO: These should be translated.
    this.htmlDiv_.setAttribute('aria-labelledby', this.title);
    // End creating the container

    this.htmlDiv_.appendChild(modalHeader);
    this.htmlDiv_.appendChild(modalContent);
    this.htmlDiv_.appendChild(modalFooter);
  }
}
