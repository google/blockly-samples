/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Styling for workspace search.
 * @author aschmiedt@google.com (Abby Schmiedt)
 * @author kozbial@google.com (Monica Kozbial)
 */

import closeSvgDataUri from '../media/close.svg';
import arrowDownSvgDataUri from '../media/keyboard_arrow_down.svg';
import arrowUpSvgDataUri from '../media/keyboard_arrow_up.svg';


/**
 * CSS for workspace search.
 */
const cssContent =
  `path.blocklyPath.blockly-ws-search-highlight {
    fill: #000;
  }
  path.blocklyPath.blockly-ws-search-highlight.blockly-ws-search-current {
    fill: grey;
  }
  .blockly-ws-search-close-btn {
    background: url(${closeSvgDataUri}) no-repeat top left;
  }
  .blockly-ws-search-next-btn {
    background: url(${arrowDownSvgDataUri}) no-repeat top left;
  }
  .blockly-ws-search-previous-btn {
    background: url(${arrowUpSvgDataUri}) no-repeat top left;
  }
  .blockly-ws-search {
    background: #fff;
    border: solid lightgrey 0.5px;
    box-shadow: 0px 10px 20px grey;
    justify-content: center;
    padding: 0.25em;
    position: absolute;
    z-index: 70;
  }
  .blockly-ws-search-input input {
    border: none;
  }
  .blockly-ws-search button {
    border: none;
  }
  .blockly-ws-search-actions {
    display: flex;
  }
  .blockly-ws-search-container {
    display: flex;
  }
  .blockly-ws-search-content {
    display: flex;
  }`;

/**
 * Injects CSS for workspace search.
 */
export const injectSearchCss = (function() {
  let executed = false;
  return function() {
    // Only inject the CSS once.
    if (executed) {
      return;
    }
    executed = true;
    // Inject CSS tag at start of head.
    const cssNode = document.createElement('style');
    cssNode.id = 'blockly-ws-search-style';
    const cssTextNode = document.createTextNode(cssContent);
    cssNode.appendChild(cssTextNode);
    document.head.insertBefore(cssNode, document.head.firstChild);
  };
})();
