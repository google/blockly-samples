/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Object responsible for workspace search.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */

import './css.js';

export default class WorkspaceSearch {
  /**
   * Class for workspace search.
   * @param {!Blockly.WorkspaceSvg} workspace
   */
  constructor(workspace) {
    /**
     * The workspace the trashcan sits in.
     * @type {!Blockly.WorkspaceSvg}
     * @private
     */
    this.workspace_ = workspace;

    /**
     * HTML container for the workspace search bar.
     * @type {?HTMLElement}
     * @private
     */
    this.HtmlDiv_ = null;

    /**
     * The input for the search text.
     * @type {?HTMLInputElement}
     * @private
     */
    this.textInput_ = null;

    /**
     * A list of blocks that came up in the search
     * @type {!Array.<Blockly.Block>}
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
  }

  /**
   * Initializes the workspace search bar.
   */
  init() {
    const workspaceSvg = this.workspace_.getParentSvg();
    workspaceSvg.parentNode.addEventListener('keydown',
        evt => this.onWorkspaceKeyDown_(evt));

    this.HtmlDiv_ = document.createElement('div');
    Blockly.utils.dom.addClass(this.HtmlDiv_, 'ws-search');
    this.positionSearchBar_();

    const searchContainer = document.createElement('div');
    Blockly.utils.dom.addClass(searchContainer, 'ws-search-container');

    const searchContent = document.createElement('div');
    Blockly.utils.dom.addClass(searchContent, 'ws-search-content');
    searchContainer.append(searchContent);

    const inputWrapper = this.getInputDiv();
    this.textInput_ = this.getTextInput();
    inputWrapper.append(this.textInput_);
    searchContent.append(inputWrapper);

    const actionDiv = this.getActionsDiv();
    searchContent.append(actionDiv);
    searchContainer.append(this.getCloseBtn());

    this.HtmlDiv_.append(searchContainer);

    workspaceSvg.parentNode.insertBefore(this.HtmlDiv_, workspaceSvg);
    this.setVisible(false);
  }

  /**
   * Gets the div that holds all of the search bar actions.
   */
  getActionsDiv() {
    const actions = document.createElement('div');
    Blockly.utils.dom.addClass(actions, 'ws-search-actions');
    // Add all the buttons for the search bar
    const upBtn = this.createBtn_('up-btn', 'Find previous',
        evt => this.previous_(evt));
    const downBtn = this.createBtn_('down-btn', 'Find next',
        evt => this.next_(evt));
    actions.append(upBtn);
    actions.append(downBtn);
    return actions;
  }

  /**
   * Gets the button used for closing the search bar.
   */
  getCloseBtn() {
    return this.createBtn_('close-btn', 'Close search bar',
        evt => this.close(evt));
  }

  /**
   * Gets the div responsible for holding inputs.
   */
  getInputDiv() {
    const inputWrapper = document.createElement('div');
    Blockly.utils.dom.addClass(inputWrapper, 'ws-search-input');
    return inputWrapper;
  }

  /**
   * Gets the text input for the search bar.
   */
  getTextInput() {
    let textInput = document.createElement('input');
    textInput.type = 'text';
    // TODO: Figure out how we are going to deal with translating.
    textInput.setAttribute('placeholder', 'Search');
    textInput.addEventListener('keydown', evt => this.onKeyDown_(evt));
    textInput.addEventListener('input', evt => this.onInput_(evt));
    textInput.addEventListener('click', evt => this.onInputClick_(evt));

    return textInput;
  }

  /**
   * Positions the search bar based on where the workspace's toolbox is
   * positioned.
   * @private
   */
  positionSearchBar_() {
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
    // this.
    btn.addEventListener('keydown', e => function(e) {
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
   * Handles input value change in search bar.
   * @param {Event} e The oninput event.
   */
  onInput_(e) {
    if (this.searchOnInput) {
      const inputValue = e.target.value;
      if (inputValue !== this.searchText_) {
        this.setSearchText_(inputValue);
        this.search();
      }
    }
  }

  /**
   * Handles clicking on the input value in search bar.
   * @param {Event} e The onclick event.
   */
  onInputClick_() {
    this.search(this.currentBlock_);
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
        this.next_();
      } else {
        this.setSearchText_(e.target.value);
        this.search();
      }
    }
  }

  /**
   * Opens the search bar when Control F or Command F are used on the workspace.
   * TODO: Look into handling keyboard shortcuts on workspace in Blockly.
   * @param {KeyboardEvent} e The key down event.
   * @private
   */
  onWorkspaceKeyDown_(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "f") {
      this.open();
      e.preventDefault();
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
   * Selects the previous block.`
   * @private
   */
  previous_() {
    if (!this.blocks_.length) {
      return;
    }
    this.setCurrentBlock_(this.currentBlockIndex_ - 1);
  }

  /**
   * Selects the next block.
   * @private
   */
  next_() {
    if (!this.blocks_.length) {
      return;
    }
    this.setCurrentBlock_(this.currentBlockIndex_ + 1);
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
    this.currentBlock_ = (
        /** @type {!Blockly.BlockSvg} */ this.blocks_[this.currentBlockIndex_]);
    if (this.workspace_.rendered) {
      const currPath = this.currentBlock_.pathObject.svgPath;
      Blockly.utils.dom.addClass(currPath, 'search-current');
      this.updateCursor_(this.currentBlock_);
      this.scrollToVisible_(this.currentBlock_);
    }
  }

  /**
   * Clears the currently "selected" block.
   * @protected
   */
  clearCurrentBlock_() {
    this.currentBlockIndex_ = -1;
    if (this.currentBlock_) {
      if (this.workspace_.rendered) {
        const path = this.currentBlock_.pathObject.svgPath;
        Blockly.utils.dom.removeClass(path, 'search-current');
      }
      this.currentBlock_ = null;
    }
  }

  /**
   * Updates the location of the cursor if the user is in keyboard naviation
   * mode.
   */
  updateCursor_(currBlock) {
    if (this.workspace_.keyboardAccessibilityMode) {
      const currAstNode = Blockly.navigation.getTopNode(currBlock);
      this.workspace_.getCursor().setCurNode(currAstNode);
    }
  }

  /**
   * Disposes of workspace search.
   * Unlink from all DOM elements to prevent memory leaks.
   * @suppress {checkTypes}
   */
  dispose() {
    if (this.HtmlDiv_) {
      Blockly.utils.dom.removeNode(this.HtmlDiv_);
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
    console.log("Open search bar");
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
    console.log("Close search bar");
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
   * @param {Blockly.Block=} opt_block Block to use as the current
   *     block if it is included in new search blocks.
   */
  search(opt_block) {
    this.clearBlocks();
    this.populateBlocks();
    this.highlightBlocks();
    let newBlockIdx = this.blocks_.indexOf(opt_block);
    newBlockIdx = newBlockIdx > -1 ? newBlockIdx : 0;
    this.setCurrentBlock_(newBlockIdx);
  }

  /**
   * Returns pool of blocks to search from.
   * @return {!Array.<!Blockly.Block>}
   * @private
  */
  getSearchPool_() {
    const blocks = (
        /** @type {!Array.<!Blockly.Block>} */
        this.workspace_.getAllBlocks(true));
    return blocks.filter(function(block) {
      // Filter out blocks contained inside of another collapsed block.
      const surroundParent = block.getSurroundParent();
      return !surroundParent || !surroundParent.isCollapsed();
    });
  }

  /**
   * Returns whether the given block matches the search text.
   * @param {!Blockly.Block} block The block to check.
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
   */
  populateBlocks() {
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
    if (!this.workspace_.rendered) {
      return;
    }
    this.blocks_.forEach(function(/** @type {!Blockly.BlockSvg} */ block) {
      const blockPath = block.pathObject.svgPath;
      Blockly.utils.dom.addClass(blockPath, 'search-highlight');
    });
  }

  /**
   * Removes highlight from blocks in block list.
   */
  unHighlightBlocks() {
    if (!this.workspace_.rendered) {
      return;
    }
    this.blocks_.forEach(function(/** @type {!Blockly.BlockSvg} */ block) {
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
      console.warn('Cannot scroll to block in a non-movable' +
          'workspace.');
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
        // TODO: review setFocused call in Blockly.WidgetDiv.hide.
        activeEl.focus();
      }
    }
  }
}
