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
'use strict';


class WorkspaceSearch {
  constructor(workspace) {
    /**
     * The workspace the trashcan sits in.
     * @type {!Blockly.WorkspaceSvg}
     * @private
     */
    this.workspace_ = workspace;

    /**
     * The svg group
     * @type {Element}
     * @private
     */
    this.svgGroup_ = null;

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
     * HTML container for the workspace search bar.
     * @type {?HTMLElement}
     * @private
     */
    this.HtmlDiv_ = null;

    /**
     * The input for the search text.
     * @type {?HTMLTextInput}
     * @private
     */
    this.textInput_ = null;
  }

  /**
   * Initializes the workspace search bar.
   */
  init() {
    var svg = this.workspace_.getParentSvg();
    var metrics = this.workspace_.getMetrics();

    // Create the text input for search.
    var textInput = document.createElement('input');
    Blockly.utils.dom.addClass(textInput, 'searchInput');
    textInput.type = 'text';

    // TODO: Figure out how we are going to deal with translating.
    textInput.setAttribute('placeholder', 'Search');
    this.textInput_ = textInput;
    Blockly.bindEventWithChecks_(textInput, 'keydown', this, this.onKeyDown_);
    Blockly.bindEventWithChecks_(textInput, 'input', this, this.onInput_);
    Blockly.bindEventWithChecks_(svg.parentNode, 'keydown', this,
        this.onWorkspaceKeyDown_);

    // Add all the buttons for the search bar
    var upBtn = this.createBtn_('upBtn', 'Find previous', this.previous_);
    var downBtn = this.createBtn_('downBtn', 'Find next', this.next_);
    var closeBtn = this.createBtn_('closeBtn', 'Close search bar', this.close);

    this.HtmlDiv = document.createElement('div');
    Blockly.utils.dom.addClass(this.HtmlDiv, 'workspaceSearchBar');

    if (this.workspace_.RTL) {
      this.HtmlDiv.style.left = metrics.absoluteLeft + 'px';
    } else {
      if (metrics.toolboxPosition == Blockly.TOOLBOX_AT_RIGHT) {
        this.HtmlDiv.style.right = metrics.toolboxWidth + 'px';
      } else {
        this.HtmlDiv.style.right = '0';
      }
    }
    this.HtmlDiv.style.top = metrics.absoluteTop + 'px';

    this.HtmlDiv.append(textInput);
    this.HtmlDiv.append(upBtn);
    this.HtmlDiv.append(downBtn);
    this.HtmlDiv.append(closeBtn);

    svg.parentNode.insertBefore(this.HtmlDiv, svg);
    this.setVisible(false);
  }

  /**
   * Creates a button for the workspace search bar.
   * @param {string} name The class name for the button.
   * @param {string} text The text to display to the screen reader.
   * @param {!Function} onClickFn The function to call when the user clicks on
   *    the button.
   * @return {HTMLButtonElement} The created button.
   * @private
   */
  createBtn_(className, text, onClickFn) {
    // Create a span holding text to be used for accessibility purposes.
    var textSpan = document.createElement('span');
    textSpan.innerText = text;
    Blockly.utils.dom.addClass(textSpan, 'btnText');

    // Create the button
    var btn = document.createElement('button');
    Blockly.utils.dom.addClass(btn, className);
    Blockly.bindEventWithChecks_(btn, 'click', this, onClickFn);
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
   * Add listener on the workspace to open the search bar when Control F or
   * Command F are used.
   * TODO: We might want Blockly to be able to deal with setting shortcuts on
   * workspaces.
   * @param {KeyboardEvent} e The key down event.
   * @private
   */
  onWorkspaceKeyDown_ = function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key == "f") {
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
    this.searchText_ = text.trim()
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
    // Blockly.WidgetDiv.hide called in scroll is taking away focus.
    // TODO: review setFocused call in Blockly.WidgetDiv.hide.
    this.textInput_.focus();
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
    // Blockly.WidgetDiv.hide called in scroll is taking away focus.
    // TODO: review setFocused call in Blockly.WidgetDiv.hide.
    this.textInput_.focus();
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
      Blockly.utils.dom.addClass(currPath, 'searchCurrent');
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
        Blockly.utils.dom.removeClass(path, 'searchCurrent');
      }
      this.currentBlock_ = null;
    }
  }

  /**
   * Disposes of workspace search.
   * Unlink from all DOM elements to prevent memory leaks.
   * @suppress {checkTypes}
   */
  dispose() {
    if (this.HtmlDiv) {
      Blockly.utils.dom.removeNode(this.HtmlDiv);
    }  
  }

  /**
   * Opens the search bar.
   */
  open() {
    this.setVisible(true);
    this.textInput_.focus();
    if (this.searchText_) {
      this.search();
    }
    console.log("Open search bar");
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
    this.HtmlDiv.style.display = show ? 'flex' : 'none';
  }

  /**
   * Searches the workspace for the current search term.
   */
  search() {
    this.clearBlocks();
    this.populateBlocks();
    this.highlightBlocks();
    this.next_();
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
   * Returns whether the given block matches the provided text.
   * @param {!Blockly.Block} block The block to check.
   * @param {string} text The text to search the block for.
   * @private
   */
  isBlockMatch_(block, text) {
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
    return blockText.includes(text);
  }

  /**
   * Populates block list with blocks that match the search text.
   */
  populateBlocks() {
    if (!this.searchText_) {
      return;
    }
    const searchGroup = this.getSearchPool_();
    const isBlockMatch = this.isBlockMatch_;
    const text = this.searchText_;
    this.blocks_ = searchGroup.filter(
        function(block) {
          return isBlockMatch(block, text);
    });
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
      Blockly.utils.dom.addClass(blockPath, 'searchHighlight');
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
      Blockly.utils.dom.removeClass(blockPath, 'searchHighlight');
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
      this.workspace_.scroll(-targetLeft, -targetTop);
    }
  }
}
