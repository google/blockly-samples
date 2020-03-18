/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class responsible for creating a Blockly modal.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */

/**
 * Class responsible for creating a modal.
 */
export class Modal {

  /**
   * Constructor for creating a modal.
   * @param {string} title The content for the modal.
   * @param {Function} onConfirm The content for the modal.
   * @param {Function} onCancel The function to be called on cancel.
   */
  constructor(title, onConfirm, onCancel) {
    this.title = title;
    this.onConfirm_ = onConfirm;
    this.onCancel_ = onCancel;
    this.focusableEls = [];
    this.modalContent_ = null;
    this.htmlDiv_ = this.createDom();
    Blockly.bindEventWithChecks_(this.htmlDiv_, 'keydown', this,
        this.handleKeyDown_);
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
    Blockly.WidgetDiv.show(this, workspace.RTL, this.widgetDispose_);
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
   * Add the typed modal html to the widget div.
   * @private
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
   * @private
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
    // Create the header
    const modalHeader = document.createElement('header');
    Blockly.utils.dom.addClass(modalHeader, 'modal-header');

    const modalTitle = document.createElement('H2');
    Blockly.utils.dom.addClass(modalTitle, 'modal-header-title');
    modalTitle.appendChild(document.createTextNode(this.title));
    modalHeader.appendChild(modalTitle);

    const exitButton = document.createElement('button');
    Blockly.utils.dom.addClass(exitButton, 'modal-btn');
    // TODO: Fix exit button
    exitButton.innerText = "X";
    modalHeader.appendChild(exitButton);

    // Create the content
    const modalContent = document.createElement('div');
    Blockly.utils.dom.addClass(modalContent, 'modal-content');
    this.modalContent_ = modalContent;

    // Create the footer
    const modalFooter = document.createElement('div');
    Blockly.utils.dom.addClass(modalFooter, 'modal-footer');

    const createBtn = document.createElement('button');
    Blockly.utils.dom.addClass(createBtn, 'modal-btn');
    Blockly.utils.dom.addClass(createBtn, 'modal-btn-primary');
    createBtn.innerText = Blockly.Msg['IOS_OK'];
    Blockly.bindEventWithChecks_(createBtn, 'click', this, this.onConfirm_);

    const cancelBtn = document.createElement('button');
    Blockly.utils.dom.addClass(cancelBtn, 'modal-btn');
    cancelBtn.innerText = Blockly.Msg['IOS_CANCEL'];
    Blockly.bindEventWithChecks_(cancelBtn, 'click', this, this.onCancel_);

    modalFooter.appendChild(createBtn);
    modalFooter.appendChild(cancelBtn);

    // Create Container
    const dialogContainer = document.createElement('div');
    Blockly.utils.dom.addClass(dialogContainer, 'modal-container');
    dialogContainer.setAttribute('role', 'dialog');
    // TODO: These should be translated.
    dialogContainer.setAttribute('aria-labelledby',
        'Typed Variable Dialog');
    dialogContainer.setAttribute('aria-describedby',
        'Dialog for creating a types variable.');

    dialogContainer.appendChild(modalHeader);
    dialogContainer.appendChild(modalContent);
    dialogContainer.appendChild(modalFooter);
    return dialogContainer;
  }

  getContentDiv() {
    return this.modalContent_;
  }
}
