/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class responsible for workspace search.
 * @author aschmiedt@google.com (Abby Schmiedt)
 * @author kozbial@google.com (Monica Kozbial)
 */


import {injectSearchCss} from './css.js';
import * as Blockly from 'blockly/core';

/**
 * Class for workspace search.
 * @implements {Blockly.IPositionable}
 */
export class WorkspaceSearch {
  /**
   * Class for workspace search.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace the search bar sits
   *     in.
   */
  constructor(workspace) {
    /**
     * The workspace the search bar sits in.
     * @type {!Blockly.WorkspaceSvg}
     * @private
     */
    this.workspace_ = workspace;

    /**
     * The unique id for this component.
     * @type {string}
     */
    this.id = 'workspaceSearch';

    /**
     * HTML container for the search bar.
     * @type {?HTMLElement}
     * @private
     */
    this.htmlDiv_ = null;

    /**
     * The div that holds the search bar actions.
     * @type {?HTMLElement}
     * @protected
     */
    this.actionDiv_ = null;

    /**
     * The text input for the search bar.
     * @type {?HTMLInputElement}
     * @private
     */
    this.inputElement_ = null;

    /**
     * The placeholder text for the search bar input.
     * @type {string}
     * @private
     */
    this.textInputPlaceholder_ = 'Search';

    /**
     * A list of blocks that came up in the search.
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
   * Initializes the workspace search bar.
   */
  init() {
    this.workspace_.getComponentManager().addComponent({
      component: this,
      weight: 0,
      capabilities: [Blockly.ComponentManager.Capability.POSITIONABLE],
    });
    injectSearchCss();
    this.createDom_();
    this.setVisible_(false);

    this.workspace_.resize();
  }

  /**
   * Disposes of workspace search.
   * Unlink from all DOM elements and remove all event listeners
   * to prevent memory leaks.
   */
  dispose() {
    for (const event of this.boundEvents_) {
      Blockly.unbindEvent_(event);
    }
    this.boundEvents_ = null;
    if (this.htmlDiv_) {
      this.htmlDiv_.remove();
      this.htmlDiv_ = null;
    }
    this.actionDiv_ = null;
    this.inputElement_ = null;
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
    const injectionDiv = this.workspace_.getInjectionDiv();
    this.addEvent_(injectionDiv, 'keydown', this, (evt) => this
        .onWorkspaceKeyDown_(/** @type {KeyboardEvent} */ evt));

    this.htmlDiv_ = document.createElement('div');
    Blockly.utils.dom.addClass(this.htmlDiv_, 'blockly-ws-search');

    const searchContainer = document.createElement('div');
    Blockly.utils.dom.addClass(searchContainer, 'blockly-ws-search-container');

    const searchContent = document.createElement('div');
    Blockly.utils.dom.addClass(searchContent, 'blockly-ws-search-content');
    searchContainer.appendChild(searchContent);

    const inputWrapper = document.createElement('div');
    Blockly.utils.dom.addClass(inputWrapper, 'blockly-ws-search-input');
    this.inputElement_ = this.createTextInput_();
    this.addEvent_(this.inputElement_, 'keydown', this, (evt) => this
        .onKeyDown_(/** @type {KeyboardEvent} */ evt));
    this.addEvent_(this.inputElement_, 'input', this, () =>this
        .onInput_());
    this.addEvent_(this.inputElement_, 'click', this, () => {
      this.searchAndHighlight(this.searchText_, this.preserveSelected);
      this.inputElement_.select();
    });

    inputWrapper.appendChild(this.inputElement_);
    searchContent.appendChild(inputWrapper);

    this.actionDiv_ = document.createElement('div');
    Blockly.utils.dom.addClass(this.actionDiv_, 'blockly-ws-search-actions');
    searchContent.appendChild(this.actionDiv_);

    const nextBtn = this.createNextBtn_();
    if (nextBtn) {
      this.addActionBtn(nextBtn, () => this.next());
    }

    const previousBtn = this.createPreviousBtn_();
    if (previousBtn) {
      this.addActionBtn(previousBtn, () => this.previous());
    }

    const closeBtn = this.createCloseBtn_();
    if (closeBtn) {
      this.addBtnListener_(closeBtn, () => this.close());
      searchContainer.appendChild(closeBtn);
    }

    this.htmlDiv_.appendChild(searchContainer);

    injectionDiv.insertBefore(this.htmlDiv_, this.workspace_.getParentSvg());
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
    const event =
        Blockly.browserEvents.conditionalBind(node, name, thisObject, func);
    this.boundEvents_.push(event);
  }

  /**
   * Add a button to the action div. This must be called after the init function
   * has been called.
   * @param {!HTMLButtonElement} btn The button to add the event listener to.
   * @param {!Function} onClickFn The function to call when the user clicks on
   *     or hits enter on the button.
   */
  addActionBtn(btn, onClickFn) {
    this.addBtnListener_(btn, onClickFn);
    this.actionDiv_.appendChild(btn);
  }

  /**
   * Creates the text input for the search bar.
   * @return {!HTMLInputElement} A text input for the search bar.
   * @protected
   */
  createTextInput_() {
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.setAttribute('placeholder', this.textInputPlaceholder_);
    return textInput;
  }

  /**
   * Creates the button used to get the next block in the list.
   * @return {!HTMLButtonElement} The next button.
   * @protected
   */
  createNextBtn_() {
    return this.createBtn_('blockly-ws-search-next-btn', 'Find next');
  }

  /**
   * Creates the button used to get the previous block in the list.
   * @return {!HTMLButtonElement} The previous button.
   * @protected
   */
  createPreviousBtn_() {
    return this.createBtn_('blockly-ws-search-previous-btn', 'Find previous');
  }

  /**
   * Creates the button used for closing the search bar.
   * @return {!HTMLButtonElement} A button for closing the search bar.
   * @protected
   */
  createCloseBtn_() {
    return this.createBtn_('blockly-ws-search-close-btn', 'Close search bar');
  }

  /**
   * Creates a button for the workspace search bar.
   * @param {string} className The class name for the button.
   * @param {string} text The text to display to the screen reader.
   * @return {!HTMLButtonElement} The created button.
   * @private
   */
  createBtn_(className, text) {
    // Create the button
    const btn = document.createElement('button');
    Blockly.utils.dom.addClass(btn, className);
    btn.setAttribute('aria-label', text);
    return btn;
  }

  /**
   * Add event listener for clicking and keydown on the given button.
   * @param {!HTMLButtonElement} btn The button to add the event listener to.
   * @param {!Function} onClickFn The function to call when the user clicks on
   *      or hits enter on the button.
   * @private
   */
  addBtnListener_(btn, onClickFn) {
    this.addEvent_(btn, 'click', this, onClickFn);
    // TODO: Review Blockly's key handling to see if there is a way to avoid
    //  needing to call stopPropogation().
    this.addEvent_(btn, 'keydown', this, (e) => {
      if (e.keyCode === Blockly.utils.KeyCodes.ENTER) {
        onClickFn(e);
        e.preventDefault();
      } else if (e.keyCode === Blockly.utils.KeyCodes.ESC) {
        this.close();
      }
      e.stopPropagation();
    });
  }

  /**
   * Returns the bounding rectangle of the UI element in pixel units relative to
   * the Blockly injection div.
   * @return {?Blockly.utils.Rect} The component’s bounding box. Null in this
   *     case since we don't need other elements to avoid the workspace search
   *     field.
   */
  getBoundingRectangle() {
    return null;
  }

  /**
   * Positions the zoom-to-fit control.
   * It is positioned in the opposite corner to the corner the
   * categories/toolbox starts at.
   * @param {!Blockly.MetricsManager.UiMetrics} metrics The workspace metrics.
   * @param {!Array<!Blockly.utils.Rect>} savedPositions List of rectangles that
   *     are already on the workspace.
   */
  position(metrics, savedPositions) {
    if (this.workspace_.RTL) {
      this.htmlDiv_.style.left = metrics.absoluteMetrics.left + 'px';
    } else {
      if (metrics.toolboxMetrics.position === Blockly.TOOLBOX_AT_RIGHT) {
        this.htmlDiv_.style.right = metrics.toolboxMetrics.width + 'px';
      } else {
        this.htmlDiv_.style.right = '0';
      }
    }
    this.htmlDiv_.style.top = metrics.absoluteMetrics.top + 'px';
  }

  /**
   * Handles input value change in search bar.
   * @private
   */
  onInput_() {
    if (this.searchOnInput) {
      const inputValue = this.inputElement_.value.trim();
      if (inputValue !== this.searchText_) {
        this.searchAndHighlight(inputValue, this.preserveSelected);
      }
    }
  }

  /**
   * Handles a key down for the search bar.
   * @param {KeyboardEvent} e The key down event.
   * @private
   */
  onKeyDown_(e) {
    if (e.keyCode === Blockly.utils.KeyCodes.ESC) {
      this.close();
    } else if (e.keyCode === Blockly.utils.KeyCodes.ENTER) {
      if (this.searchOnInput) {
        this.next();
      } else {
        const inputValue = this.inputElement_.value.trim();
        if (inputValue !== this.searchText_) {
          this.searchAndHighlight(inputValue, this.preserveSelected);
        }
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
    if ((e.ctrlKey || e.metaKey) && e.keyCode === Blockly.utils.KeyCodes.F) {
      this.open();
      e.preventDefault();
      e.stopPropagation();
    }
  }

  /**
   * Selects the previous block.
   */
  previous() {
    this.setCurrentBlock_(this.currentBlockIndex_ - 1);
  }

  /**
   * Selects the next block.
   */
  next() {
    this.setCurrentBlock_(this.currentBlockIndex_ + 1);
  }

  /**
   * Sets the placeholder text for the search bar text input.
   * @param {string} placeholderText The placeholder text.
   */
  setSearchPlaceholder(placeholderText) {
    this.textInputPlaceholder_ = placeholderText;
    if (this.inputElement_) {
      this.inputElement_.setAttribute('placeholder',
          this.textInputPlaceholder_);
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
    let currentBlock = this.blocks_[this.currentBlockIndex_];
    if (currentBlock) {
      this.unhighlightCurrentSelection_(currentBlock);
    }
    this.currentBlockIndex_ =
        (index % this.blocks_.length + this.blocks_.length) %
        this.blocks_.length;
    currentBlock = this.blocks_[this.currentBlockIndex_];

    this.highlightCurrentSelection_(currentBlock);
    this.scrollToVisible_(currentBlock);
  }

  /**
   * Opens the search bar.
   */
  open() {
    this.setVisible_(true);
    this.inputElement_.focus();
    if (this.searchText_) {
      this.searchAndHighlight(this.searchText_);
    }
  }

  /**
   * Closes the search bar.
   */
  close() {
    this.setVisible_(false);
    this.workspace_.markFocused();
    this.clearBlocks();
  }

  /**
   * Shows or hides the workspace search bar.
   * @param {boolean} show Whether to set the search bar as visible.
   * @private
   */
  setVisible_(show) {
    this.htmlDiv_.style.display = show ? 'flex' : 'none';
  }

  /**
   * Searches the workspace for the current search term and highlights matching
   * blocks.
   * @param {string} searchText The search text.
   * @param {boolean=} preserveCurrent Whether to preserve the current block
   *    if it is included in the new matching blocks.
   */
  searchAndHighlight(searchText, preserveCurrent) {
    const oldCurrentBlock = this.blocks_[this.currentBlockIndex_];
    this.searchText_ = searchText.trim();
    this.clearBlocks();
    this.blocks_ = this.getMatchingBlocks_(
        this.workspace_, this.searchText_, this.caseSensitive);
    this.highlightSearchGroup_(this.blocks_);
    let currentIdx = 0;
    if (preserveCurrent) {
      currentIdx = this.blocks_.indexOf(oldCurrentBlock);
      currentIdx = currentIdx > -1 ? currentIdx : 0;
    }
    this.setCurrentBlock_(currentIdx);
  }

  /**
   * Returns pool of blocks to search from.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace to get blocks from.
   * @return {!Array.<!Blockly.BlockSvg>} The search pool of blocks to use.
   * @private
   */
  getSearchPool_(workspace) {
    const blocks = (
      /** @type {!Array.<!Blockly.BlockSvg>} */
      workspace.getAllBlocks(true));
    return blocks.filter((block) => {
      // Filter out blocks contained inside of another collapsed block.
      const surroundParent = block.getSurroundParent();
      return !surroundParent || !surroundParent.isCollapsed();
    });
  }

  /**
   * Returns whether the given block matches the search text.
   * @param {!Blockly.BlockSvg} block The block to check.
   * @param {string} searchText The search text. Note if the search is case
   *    insensitive, this will be passed already converted to lowercase letters.
   * @param {boolean} caseSensitive Whether the search is caseSensitive.
   * @return {boolean} True if the block is a match, false otherwise.
   * @protected
   */
  isBlockMatch_(block, searchText, caseSensitive) {
    let blockText = '';
    if (block.isCollapsed()) {
      // Search the whole string for collapsed blocks.
      blockText = block.toString();
    } else {
      const topBlockText = [];
      block.inputList.forEach((input) => {
        input.fieldRow.forEach((field) => {
          topBlockText.push(field.getText());
        });
      });
      blockText = topBlockText.join(' ').trim();
    }
    if (!caseSensitive) {
      blockText = blockText.toLowerCase();
    }
    return blockText.indexOf(searchText) > -1;
  }

  /**
   * Returns blocks that match the given search text.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace to search.
   * @param {string} searchText The search text.
   * @param {boolean} caseSensitive Whether the search should be case sensitive.
   * @return {!Array.<Blockly.BlockSvg>} The blocks that match the search
   *    text.
   * @protected
   */
  getMatchingBlocks_(workspace, searchText, caseSensitive) {
    if (!searchText) {
      return [];
    }
    if (!this.caseSensitive) {
      searchText = searchText.toLowerCase();
    }
    const searchGroup = this.getSearchPool_(workspace);
    return searchGroup.filter(
        (block) => this.isBlockMatch_(block, searchText, caseSensitive));
  }

  /**
   * Clears the selection group and current block.
   */
  clearBlocks() {
    this.unhighlightSearchGroup_(this.blocks_);
    const currentBlock = this.blocks_[this.currentBlockIndex_];
    if (currentBlock) {
      this.unhighlightCurrentSelection_(currentBlock);
    }
    this.currentBlockIndex_ = -1;
    this.blocks_ = [];
  }

  /**
   * Adds "current selection" highlight to the provided block.
   * Highlights the provided block as the "current selection".
   * @param {!Blockly.BlockSvg} currentBlock The block to highlight.
   * @protected
   */
  highlightCurrentSelection_(currentBlock) {
    const path = currentBlock.pathObject.svgPath;
    Blockly.utils.dom.addClass(path, 'blockly-ws-search-current');
  }

  /**
   * Removes "current selection" highlight from provided block.
   * @param {Blockly.BlockSvg} currentBlock The block to unhighlight.
   * @protected
   */
  unhighlightCurrentSelection_(currentBlock) {
    const path = currentBlock.pathObject.svgPath;
    Blockly.utils.dom.removeClass(path, 'blockly-ws-search-current');
  }

  /**
   * Adds highlight to the provided blocks.
   * @param {!Array.<Blockly.BlockSvg>} blocks The blocks to highlight.
   * @protected
   */
  highlightSearchGroup_(blocks) {
    blocks.forEach((block) => {
      const blockPath = block.pathObject.svgPath;
      Blockly.utils.dom.addClass(blockPath, 'blockly-ws-search-highlight');
    });
  }

  /**
   * Removes highlight from the provided blocks.
   * @param {!Array.<Blockly.BlockSvg>} blocks The blocks to unhighlight.
   * @protected
   */
  unhighlightSearchGroup_(blocks) {
    blocks.forEach((block) => {
      const blockPath = block.pathObject.svgPath;
      Blockly.utils.dom.removeClass(blockPath, 'blockly-ws-search-highlight');
    });
  }

  /**
   * Scrolls workspace to bring given block into view.
   * @param {!Blockly.BlockSvg} block The block to bring into view.
   * @protected
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
    const left = this.workspace_.RTL ? xy.x * scale - width : xy.x * scale;
    const right = this.workspace_.RTL ? xy.x * scale : xy.x * scale + width;

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
