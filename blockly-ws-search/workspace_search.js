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
     * A list of blocks that came up in the search
     * @type {!Array.<Blockly.Block>}
     * @private
     */
    this.blocks_ = [];

    /**
     * Current position in the list of blocks.
     * @type {number}
     * @private
     */
    this.currentPosition_ = 0;

    /**
     * The svg group
     * @type {Element}
     */
    this.svgGroup_ = null;
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
    Blockly.bindEventWithChecks_(textInput,
      'keydown', this, this.onKeyDown_);

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
        this.HtmlDiv.style.right = '0px';
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
   * Create a button for the workspace search bar.
   * @param {*} name The class name for the button.
   * @param {*} text The text to display to the screen reader.
   * @param {*} onClickFn The function to call when the user clicks on the button.
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
    Blockly.bindEventWithChecks_(btn,
        'click', this, onClickFn);
    btn.append(textSpan);
    return btn;
  }

  /**
   * Handle a key down for the search bar.
   * @param {Event} e The key down event.
   * @private
   */
  onKeyDown_(e) {
    if (e.keyCode == Blockly.utils.KeyCodes.ESC) {
      console.log("Close search bar");
    } else if (e.keyCode == Blockly.utils.KeyCodes.TAB) {
      return;
    }else {
      // Should check that the text value has changed before running search.
      console.log("Search all the things");
    }
  }

  /**
   * Go to the previous block.
   * @param {Event} e The key down event.
   * @private
   */
  previous_(e) {
    console.log("Get previous value");
  }

  /**
   * Go to the next block.
   * @param {Event} e The key down event.
   * @private
   */
  next_() {
    console.log("Get next values");
  }

  /**
   * Dispose of workspace search.
   * Unlink from all DOM elements to prevent memory leaks.
   * @suppress {checkTypes}
   */
  dispose() {
    if (this.HtmlDiv) {
      Blockly.utils.dom.removeNode(this.HtmlDiv);
    }  
  }

  /**
   * Flip the lid open or shut.
   * @param {boolean} state True if open.
   * @package
   */
  open() {

  }

  /**
   * Close the search bar.
   */
  close() {
    this.setVisible(false);
  }

  /**
   * Shows or hides the workspace search bar.
   * @param {boolean} show True to set the search bar as visible. False otherwise. 
   */
  setVisible(show) {
    this.HtmlDiv.style.display = show ? 'flex' : 'none';
  }

  /**
   * Given a term search the workspace.
   */
  search() {

  }
}
