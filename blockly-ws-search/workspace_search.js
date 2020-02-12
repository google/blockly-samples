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
   * Initializes the toolbox.
   */
  init() {
    var svg = this.workspace_.getParentSvg();

    /**
     * HTML container for the workspace search bar.
     * @type {Element}
     */
    this.HtmlDiv = document.createElement('div');
    var workspaceContainer = document.createElement('div');
    workspaceContainer.className = 'workspaceSearchContainer';
  
    var textInput = document.createElement('input');
    textInput.type = 'text';
  
    var searchBtn = document.createElement('button');
    searchBtn.className = 'workspaceButton';
    searchBtn.innerText = 'Search';
  
    workspaceContainer.append(textInput);
    workspaceContainer.append(searchBtn);
  
    this.HtmlDiv.className = 'workspaceSearchBar';
    this.HtmlDiv.append(workspaceContainer);
    svg.parentNode.insertBefore(this.HtmlDiv, svg);
  
    Blockly.bindEventWithChecks_(this.HtmlDiv,
        'keydown', this, this.onKeyDown_);
    Blockly.bindEventWithChecks_(searchBtn,
        'mousedown', this, this.onMouseDown_);
    this.setVisible(false);  
  }

  /**
   * Called when a user hits a key in the search bar.
   * @param {Event} e The key down event.
   */
  onKeyDown_(e) {
    if (e.keyCode == Blockly.utils.KeyCodes.ENTER) {
      console.log("Search all the things");
    } else if (e.keyCode == Blockly.utils.KeyCodes.ESC) {
      console.log("Clsoe search bar");
    }
  }

  /**
   * 
   */
  onMouseDown_() {
    console.log("Search all the things");
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
   * 
   * @param {boolean} show True to set the search bar as visible. False otherwise. 
   */
  setVisible(show) {
    this.HtmlDiv.style.display = show ? 'block' : 'none';
  }

  /**
   * Given a term search the workspace.
   */
  search() {

  }
}
