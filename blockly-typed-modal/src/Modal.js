/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class responsible for creating a Blockly modal.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */

import { injectModalCss } from './modalCss.js';
import * as Blockly from 'blockly/core';
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
     * The selected type for the modal.
     * @type {?string}
     * @private
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
     * @type {Array<HTMLElement>}
     * @private
     */
    this.focusableEls = [];

    /**
     * The selected type for the modal.
     * @type {HTMLDivElement}
     * @private
     */
    this.contentDiv_ = null;

    /**
     * The div for the footer of the modal.
     * @type {HTMLDivElement}
     * @private
     */
    this.footerDiv_ = null;

    /**
     * The div for the header of the modal.
     * @type {HTMLElement}
     * @private
     */
    this.headerDiv_ = null;

    /**
     * The selected type for the modal.
     * @type {?HTMLDivElement}
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
  }

  /**
   * Initialize a basic accessible modal.
   */
  init() {
    injectModalCss();
    this.createDom();
    this.addEvent_(this.htmlDiv_, 'keydown', this, this.handleKeyDown_)
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
   * Shows the typed modal.
   * @param {!Blockly.WorkspaceSvg} workspace The button's target workspace.
   */
  show(workspace) {
    this.focusableEls = this.htmlDiv_.querySelectorAll('a[href],' +
        'area[href], input:not([disabled]), select:not([disabled]),' +
        'textarea:not([disabled]), button:not([disabled]), [tabindex="0"]');
    // TODO: Fix the dispose method
    Blockly.WidgetDiv.show(this, workspace.RTL, () => this.widgetDispose_());
    this.widgetCreate_();
    this.focusableEls[0].focus();
  }

  /**
   * Hide the typed modal.
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
   * @private
   */
  addEvent_(node, name, thisObject, func) {
    const event = Blockly.bindEventWithChecks_(node, name, thisObject, func);
    this.boundEvents_.push(event);
  }

  /**
   * Get the action to be used when the user hits the confirm button.
   * @return {Function} Function called when the user hits the confirm button.
   */
  getConfirmAction() {
    return null;
  }

  /**
   * Get the header div for the modal.
   * @return {HTMLDivElement} The div holding the header of the modal.
   */
  getHeaderDiv() {
    return this.headerDiv_;
  }

  /**
   * Get the div that holds the content for the modal.
   * @return {HTMLDivElement} The div holding the content of the modal.
   */
  getContentDiv() {
    return this.contentDiv_;
  }

  /**
   * Get the footer div for the modal.
   * @return {HTMLDivElement} The div holding the footer of hte modal.
   * TODO: Could just make this.footerDiv_ protected?
   */
  getFooterDiv() {
    return this.footerDiv_;
  }

  /**
   * Get the action to be used when the user hits the cancel button.
   * @return {Function} Function called when user hits the cancel button.
   */
  getCancelAction() {
    return this.hide;
  }

  /**
   * Add the typed modal html to the widget div.
   * @protected
   */
  widgetCreate_() {
    const widgetDiv = Blockly.WidgetDiv.DIV;
    widgetDiv.style.width = '100%';
    widgetDiv.style.height = '100%';
    const htmlInput_ = this.htmlDiv_;
    widgetDiv.appendChild(htmlInput_);
  }

  /**
   * Disposes of any events or dom-references belonging to the editor.
   * @protected
   */
  widgetDispose_() {
    const widgetDiv = Blockly.WidgetDiv.DIV;
    widgetDiv.style.width = 'auto';
    widgetDiv.style.height = 'auto';
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
   * Handles keydown event for the typed modal.
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
    // TODO: Fix exit button
    exitButton.innerText = "X";
    this.addEvent_(exitButton, 'click', this, this.getCancelAction());
    modalHeader.appendChild(exitButton);
    this.headerDiv_ = modalHeader;

    // Create the content
    const modalContent = document.createElement('div');
    Blockly.utils.dom.addClass(modalContent, 'blockly-modal-content');
    this.contentDiv_ = modalContent;

    // Create the footer
    const modalFooter = document.createElement('div');
    Blockly.utils.dom.addClass(modalFooter, 'blockly-modal-footer');

    const createBtn = document.createElement('button');
    Blockly.utils.dom.addClass(createBtn, 'blockly-modal-btn');
    Blockly.utils.dom.addClass(createBtn, 'blockly-modal-btn-primary');
    createBtn.innerText = Blockly.Msg['IOS_OK'];
    this.addEvent_(createBtn, 'click', this, this.getConfirmAction());

    const cancelBtn = document.createElement('button');
    Blockly.utils.dom.addClass(cancelBtn, 'blockly-modal-btn');
    cancelBtn.innerText = Blockly.Msg['IOS_CANCEL'];
    this.addEvent_(cancelBtn, 'click', this, this.getCancelAction());

    modalFooter.appendChild(createBtn);
    modalFooter.appendChild(cancelBtn);
    this.footerDiv_ = modalFooter;

    // Create Container
    const dialogContainer = document.createElement('div');
    Blockly.utils.dom.addClass(dialogContainer, 'blockly-modal-container');
    dialogContainer.setAttribute('role', 'dialog');
    // TODO: These should be translated.
    dialogContainer.setAttribute('aria-labelledby',
        'Typed Variable Dialog');
    dialogContainer.setAttribute('aria-describedby',
        'Dialog for creating a types variable.');

    dialogContainer.appendChild(modalHeader);
    dialogContainer.appendChild(modalContent);
    dialogContainer.appendChild(modalFooter);
    this.htmlDiv_ = dialogContainer;
  }
}
