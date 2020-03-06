/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object responsible for workspace search.
 * @author aschmiedt@google.com (Abby Schmiedt)
 * @author kozbial@google.com (Monica Kozbial)
 */


import { injectSearchCss } from './css.js';
import * as Blockly from 'blockly/core';

export class WorkspaceSearch {
  /**
   * Class for workspace search.
   * @param {!Blockly.WorkspaceSvg} workspace
   */
  constructor(workspace) {
    /**
     * The workspace the search bar sits in.
     * @type {!Blockly.WorkspaceSvg}
     * @private
     */
    this.workspace_ = workspace;

    /**
     * HTML container for the search bar.
     * @type {?HTMLElement}
     * @private
     */
    this.HtmlDiv_ = null;

    /**
     * The text input for the search bar.
     * @type {?HTMLInputElement}
     * @private
     */
    this.textInput_ = null;

    /**
     * The placeholder text for the search bar input.
     * @type {string}
     * @private
     */
    this.textInputPlaceholder_ = 'Search';

    /**
     * A list of blocks that came up in the search
     * @type {!Array.<Blockly.BlockSvg>}
     * @protected
     */
    this.blocks_ = [];

    /**
     * Index of the currently "selected" block in the blocks array.
     * @type {number}
     * @protected
     */
    this.currentBlockIndex_ = -1;

    /**
     * Currently "selected" block.
     * @type {Blockly.BlockSvg}
     * @protected
     */
    this.currentBlock_ = null;

    /**
     * The search text.
     * @type {string}
     * @protected
     */
    this.searchText_ = '';

    /**
     * Whether to search as input changes as opposed to on enter.
     * @type {boolean}
     */
    this.searchOnInput = true;

    /**
     * Whether search should be case sensitive.
     * @type {boolean}
     */
    this.caseSensitive = false;

    /**
     * Whether search should preserve the currently selected block by default.
     * @type {boolean}
     */
    this.preserveSelected = true;
  }

  /**
   * Initializes the workspace search bar.
   */
  init() {
    injectSearchCss();
    this.createDom_();
    this.setVisible(false);
  }

  /**
   * Creates and injects the search bar's DOM.
   * @protected
   */
  createDom_() {
    /*
     * Creates the search bar. The generated search bar looks like:
     * <div class="ws-search'>
     *   <div class="ws-search-container'>
     *     <div class="ws-search-content'>
     *       <div class="ws-search-input'>
     *         [... text input goes here ...]
     *       </div>
     *       [... actions div goes here ...]
     *     </div>
     *     [... close button goes here ...]
     *   </div>
     * </div>
     */
    const parentSvg = this.workspace_.getParentSvg();
    parentSvg.parentNode.addEventListener('keydown',
        evt => this.onWorkspaceKeyDown_(/** @type {KeyboardEvent} */ evt));

    this.HtmlDiv_ = document.createElement('div');
    Blockly.utils.dom.addClass(this.HtmlDiv_, 'ws-search');
    this.positionSearchBar();

    const searchContainer = document.createElement('div');
    Blockly.utils.dom.addClass(searchContainer, 'ws-search-container');

    const searchContent = document.createElement('div');
    Blockly.utils.dom.addClass(searchContent, 'ws-search-content');
    searchContainer.append(searchContent);

    const inputWrapper = document.createElement('div');
    Blockly.utils.dom.addClass(inputWrapper, 'ws-search-input');
    this.textInput_ = this.createTextInput_();
    inputWrapper.append(this.textInput_);
    searchContent.append(inputWrapper);

    const actionDiv = this.createActionsDiv_();
    searchContent.append(actionDiv);
    searchContainer.append(this.createCloseBtn_());

    this.HtmlDiv_.append(searchContainer);

    parentSvg.parentNode.insertBefore(this.HtmlDiv_, parentSvg);
  }

  /**
   * Creates the text input for the search bar.
   * @return {!HTMLInputElement} A text input for the search bar.
   * @protected
   */
  createTextInput_() {
    let textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.setAttribute('placeholder', this.textInputPlaceholder_);
    textInput.addEventListener('keydown',
        evt => this.onKeyDown_(/** @type {KeyboardEvent} */ evt));
    textInput.addEventListener('input', () => this.onInput_());
    textInput.addEventListener('click',
        () => this.search(this.preserveSelected));
    return textInput;
  }

  /**
   * Creates the div that holds all of the search bar actions.
   * @return {!HTMLDivElement} A div holding search bar actions.
   * @protected
   */
  createActionsDiv_() {
    const actions = document.createElement('div');
    Blockly.utils.dom.addClass(actions, 'ws-search-actions');
    // Add all the buttons for the search bar
    const upBtn = this.createBtn_('up-btn', 'Find previous',
        () => this.previous());
    const downBtn = this.createBtn_('down-btn', 'Find next',
        () => this.next());
    actions.append(upBtn);
    actions.append(downBtn);
    return actions;
  }

  /**
   * Creates the button used for closing the search bar.
   * @return {!HTMLElement} A button for closing the search bar.
   * @protected
   */
  createCloseBtn_() {
    return this.createBtn_('close-btn', 'Close search bar',
        () => this.close());
  }

  /**
   * Creates a button for the workspace search bar.
   * @param {string} className The class name for the button.
   * @param {string} text The text to display to the screen reader.
   * @param {!Function} onClickFn The function to call when the user clicks on
   *    the button.
   * @return {HTMLButtonElement} The created button.
   * @private
   */
  createBtn_(className, text, onClickFn) {
    // Create a span holding text to be used for accessibility purposes.
    const textSpan = document.createElement('span');
    textSpan.innerText = text;
    Blockly.utils.dom.addClass(textSpan, 'btn-text');

    // Create the button
    const btn = document.createElement('button');
    Blockly.utils.dom.addClass(btn, className);
    btn.addEventListener('click', onClickFn);
    // TODO: Review Blockly's key handling to see if there is a way to avoid
    //  needing to call stopPropogation().
    btn.addEventListener('keydown', e => {
      if (e.key === "Enter") {
        onClickFn(e);
        e.preventDefault();  
      } else if (e.key === "Escape") {
        this.close();
      }
      e.stopPropagation();
    });
    btn.append(textSpan);
    return btn;
  }

  /**
   * Positions the search bar based on where the workspace's toolbox is.
   */
  positionSearchBar() {
    // TODO: Handle positioning search bar when window is resized.
    const metrics = this.workspace_.getMetrics();
    if (this.workspace_.RTL) {
      this.HtmlDiv_.style.left = metrics.absoluteLeft + 'px';
    } else {
      if (metrics.toolboxPosition == Blockly.TOOLBOX_AT_RIGHT) {
        this.HtmlDiv_.style.right = metrics.toolboxWidth + 'px';
      } else {
        this.HtmlDiv_.style.right = '0';
      }
    }
    this.HtmlDiv_.style.top = metrics.absoluteTop + 'px';
  }

  /**
   * Handles input value change in search bar.
   * @private
   */
  onInput_() {
    if (this.searchOnInput) {
      const inputValue = this.textInput_.value;
      if (inputValue !== this.searchText_) {
        this.setSearchText_(inputValue);
        this.search(this.preserveSelected);
      }
    }
  }

  /**
   * Handles a key down for the search bar.
   * @param {KeyboardEvent} e The key down event.
   * @private
   */
  onKeyDown_(e) {
    if (e.key === 'Escape') {
      this.close();
    } else if (e.key === 'Enter') {
      if (this.searchOnInput) {
        this.next();
      } else {
        this.setSearchText_(this.textInput_.value);
        this.search(this.preserveSelected);
      }
    }
  }

  /**
   * Opens the search bar when Control F or Command F are used on the workspace.
   * @param {KeyboardEvent} e The key down event.
   * @private
   */
  onWorkspaceKeyDown_(e) {
    // TODO: Look into handling keyboard shortcuts on workspace in Blockly.
    if ((e.ctrlKey || e.metaKey) && e.key === "f") {
      this.open();
      e.preventDefault();
    }
  }

  /**
   * Selects the previous block.
   */
  previous() {
    if (!this.blocks_.length) {
      return;
    }
    this.setCurrentBlock_(this.currentBlockIndex_ - 1);
  }

  /**
   * Selects the next block.
   */
  next() {
    if (!this.blocks_.length) {
      return;
    }
    this.setCurrentBlock_(this.currentBlockIndex_ + 1);
  }

  /**
   * Sets the placeholder text for the search bar text input.
   * @param {string} placeholderText The placeholder text.
   */
  setSearchPlaceholder(placeholderText) {
    this.textInputPlaceholder_ = placeholderText;
    if (this.textInput_) {
      this.textInput_.setAttribute('placeholder', this.textInputPlaceholder_);
    }
  }

  /**
   * Sets search text.
   * @param {string} text
   * @protected
   */
  setSearchText_(text) {
    this.searchText_ = text.trim();
    if (!this.caseSensitive) {
      this.searchText_ =  this.searchText_.toLowerCase();
    }
  }

  /**
   * Changes the currently "selected" block and adds extra highlight.
   * @param {number} index Index of block to set as current. Number is wrapped.
   * @protected
   */
  setCurrentBlock_(index) {
    if (!this.blocks_.length) {
      return;
    }
    this.clearCurrentBlock_();
    this.currentBlockIndex_ =
        (index % this.blocks_.length + this.blocks_.length) %
        this.blocks_.length;
    this.currentBlock_ = this.blocks_[this.currentBlockIndex_];
    const path = this.currentBlock_.pathObject.svgPath;
    Blockly.utils.dom.addClass(path, 'search-current');
    this.updateCursor_(this.currentBlock_);
    this.scrollToVisible_(this.currentBlock_);
  }

  /**
   * Clears the currently "selected" block.
   * @protected
   */
  clearCurrentBlock_() {
    this.currentBlockIndex_ = -1;
    if (this.currentBlock_) {
      const path = this.currentBlock_.pathObject.svgPath;
      Blockly.utils.dom.removeClass(path, 'search-current');
      this.currentBlock_ = null;
    }
  }

  /**
   * Updates the location of the cursor if the user is in keyboard accessibility
   * mode.
   * @protected
   */
  updateCursor_(currBlock) {
    if (this.workspace_.keyboardAccessibilityMode) {
      const currAstNode = Blockly.navigation.getTopNode(currBlock);
      this.workspace_.getCursor().setCurNode(currAstNode);
    }
  }

  /**
   * Opens the search bar.
   */
  open() {
    this.setVisible(true);
    this.updateMarker_();
    this.textInput_.focus();
    if (this.searchText_) {
      this.search();
    }
  }

  /**
   * Marks the user's current position when opening the search bar.
   */
  updateMarker_() {
    const marker = this.workspace_.getMarker(Blockly.navigation.MARKER_NAME);
    if (this.workspace_.keyboardAccessibilityMode && marker &&
        !marker.getCurNode()) {
      const curNode = this.workspace_.getCursor().getCurNode();
      marker.setCurNode(curNode);
    }
  }

  /**
   * Closes the search bar.
   */
  close() {
    this.setVisible(false);
    this.workspace_.markFocused();
    this.clearBlocks();
  }

  /**
   * Shows or hides the workspace search bar.
   * @param {boolean} show Whether to set the search bar as visible.
   */
  setVisible(show) {
    this.HtmlDiv_.style.display = show ? 'flex' : 'none';
  }

  /**
   * Searches the workspace for the current search term.
   * @param {boolean=} preserveCurrent Whether to preserve the current block
   *    if it is included in the new search block.
   */
  search(preserveCurrent) {
    let oldCurrentBlock = this.currentBlock_;
    this.clearBlocks();
    this.populateBlocks_();
    this.highlightBlocks();
    let currentIdx = 0;
    if (preserveCurrent) {
      currentIdx = this.blocks_.indexOf(oldCurrentBlock);
      currentIdx = currentIdx > -1 ? currentIdx : 0;
    }
    this.setCurrentBlock_(currentIdx);
  }

  /**
   * Returns pool of blocks to search from.
   * @return {!Array.<!Blockly.BlockSvg>} The search pool of blocks to use.
   * @private
  */
  getSearchPool_() {
    const blocks = (
        /** @type {!Array.<!Blockly.BlockSvg>} */
        this.workspace_.getAllBlocks(true));
    return blocks.filter(function(block) {
      // Filter out blocks contained inside of another collapsed block.
      const surroundParent = block.getSurroundParent();
      return !surroundParent || !surroundParent.isCollapsed();
    });
  }

  /**
   * Returns whether the given block matches the search text.
   * @param {!Blockly.BlockSvg} block The block to check.
   * @return {boolean} Whether the block matches the search text.
   * @private
   */
  isBlockMatch_(block) {
    let blockText = '';
    if (block.isCollapsed()) {
      // Search the whole string for collapsed blocks.
      blockText = block.toString();
    } else {
      const topBlockText = [];
      block.inputList.forEach(function(input) {
        input.fieldRow.forEach(function(field) {
          topBlockText.push(field.getText());
        });
      });
      blockText = topBlockText.join(' ').trim();
    }
    if (!this.caseSensitive) {
      blockText = blockText.toLowerCase();
    }
    return blockText.includes(this.searchText_);
  }

  /**
   * Populates block list with blocks that match the search text.
   * @protected
   */
  populateBlocks_() {
    if (!this.searchText_) {
      return;
    }
    const searchGroup = this.getSearchPool_();
    this.blocks_ = searchGroup.filter(
        block => this.isBlockMatch_(block));
  }

  /**
   * Clears the block list.
   */
  clearBlocks() {
    this.unHighlightBlocks();
    this.clearCurrentBlock_();
    this.blocks_ = [];
  }

  /**
   * Adds highlight to blocks in block list.
   */
  highlightBlocks() {
    this.blocks_.forEach(function(block) {
      const blockPath = block.pathObject.svgPath;
      Blockly.utils.dom.addClass(blockPath, 'search-highlight');
    });
  }

  /**
   * Removes highlight from blocks in block list.
   */
  unHighlightBlocks() {
    this.blocks_.forEach(function(block) {
      const blockPath = block.pathObject.svgPath;
      Blockly.utils.dom.removeClass(blockPath, 'search-highlight');
    });
  }

  /**
   * Scrolls workspace to bring given block into view.
   * @param {Blockly.BlockSvg} block Block to bring into view.
   * @private
   */
  scrollToVisible_(block) {
    if (!this.workspace_.isMovable()) {
      // Cannot scroll to block in a non-movable workspace.
      return;
    }
    // XY is in workspace coordinates.
    const xy = block.getRelativeToSurfaceXY();
    const scale = this.workspace_.scale;

    // Block bounds in pixels relative to the workspace origin (0,0 is centre).
    const width = block.width * scale;
    const height = block.height * scale;
    const top = xy.y * scale;
    const bottom = (xy.y + block.height) * scale;
    // In RTL the block's position is the top right of the block, not top left.
    const left = this.workspace_.RTL ? xy.x * scale - width: xy.x * scale;
    const right = this.workspace_.RTL ? xy.x * scale : xy.x * scale +  width;

    const metrics = this.workspace_.getMetrics();

    let targetLeft = metrics.viewLeft;
    const overflowLeft = left < metrics.viewLeft;
    const overflowRight = right > metrics.viewLeft + metrics.viewWidth;
    const wideBlock = width > metrics.viewWidth;

    if ((!wideBlock && overflowLeft) || (wideBlock && !this.workspace_.RTL)) {
      // Scroll to show left side of block
      targetLeft = left;
    } else if ((!wideBlock && overflowRight) ||
        (wideBlock && this.workspace_.RTL)) {
      // Scroll to show right side of block
      targetLeft = right - metrics.viewWidth;
    }

    let targetTop = metrics.viewTop;
    const overflowTop = top < metrics.viewTop;
    const overflowBottom = bottom > metrics.viewTop + metrics.viewHeight;
    const tallBlock = height > metrics.viewHeight;

    if (overflowTop || (tallBlock && overflowBottom)) {
      // Scroll to show top of block
      targetTop = top;
    } else if (overflowBottom) {
      // Scroll to show bottom of block
      targetTop = bottom - metrics.viewHeight;
    }
    if (targetLeft !== metrics.viewLeft || targetTop !== metrics.viewTop) {
      const activeEl = document.activeElement;
      this.workspace_.scroll(-targetLeft, -targetTop);
      if (activeEl) {
        // Blockly.WidgetDiv.hide called in scroll is taking away focus.
        // TODO: Review setFocused call in Blockly.WidgetDiv.hide.
        activeEl.focus();
      }
    }
  }
}
