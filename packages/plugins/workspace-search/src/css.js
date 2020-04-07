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

/**
 * Base64 encoded data uri for close icon.
 * @type {string}
 */
const CLOSE_SVG_DATAURI =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC' +
    '9zdmciIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjE0Ij48cGF0aC' +
    'BkPSJNMTkgNi40MUwxNy41OSA1IDEyIDEwLjU5IDYuNDEgNSA1IDYuNDEgMTAuNTkgMTIgNS' +
    'AxNy41OSA2LjQxIDE5IDEyIDEzLjQxIDE3LjU5IDE5IDE5IDE3LjU5IDEzLjQxIDEyeiIvPj' +
    'xwYXRoIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9Im5vbmUiLz48L3N2Zz4=';

/**
 * Base64 encoded data uri for keyboard arrow down icon.
 * @type {string}
 */
const ARROW_DOWN_SVG_DATAURI =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC' +
    '9zdmciIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjE0Ij48cGF0aC' +
    'BkPSJNNy40MSA4LjU5TDEyIDEzLjE3bDQuNTktNC41OEwxOCAxMGwtNiA2LTYtNiAxLjQxLT' +
    'EuNDF6Ii8+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PC9zdmc+';

/**
 * Base64 encoded data uri for keyboard arrow up icon.
 * @type {string}
 */
const ARROW_UP_ARROW_SVG_DATAURI =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC' +
    '9zdmciIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjE0Ij48cGF0aC' +
    'BkPSJNNy40MSAxNS40MUwxMiAxMC44M2w0LjU5IDQuNThMMTggMTRsLTYtNi02IDZ6Ii8+PH' +
    'BhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==';

/**
 * CSS for workspace search.
 * @type {Array.<string>}
 */
const CSS_CONTENT = [
  /* eslint-disable indent */
  'path.blocklyPath.blockly-ws-search-highlight {',
    'fill: black;',
  '}',
  'path.blocklyPath.blockly-ws-search-highlight.blockly-ws-search-current {',
    'fill: grey;',
  '}',
  '.blockly-ws-search-close-btn {',
    'background: url(' + CLOSE_SVG_DATAURI + ') no-repeat top left;',
  '}',
  '.blockly-ws-search-next-btn {',
    'background: url(' + ARROW_DOWN_SVG_DATAURI + ') no-repeat top left;',
  '}',
  '.blockly-ws-search-previous-btn {',
    'background: url(' +ARROW_UP_ARROW_SVG_DATAURI + ') no-repeat top left;',
  '}',
  '.blockly-ws-search {',
    'background: white;',
    'border: solid lightgrey .5px;',
    'box-shadow: 0px 10px 20px grey;',
    'justify-content: center;',
    'padding: .25em;',
    'position: absolute;',
    'z-index: 70;',
  '}',
  '.blockly-ws-search-input input {',
    'border: none;',
  '}',
  '.blockly-ws-search button {',
    'border: none;',
  '}',
  '.blockly-ws-search-actions {',
    'display: flex;',
  '}',
  '.blockly-ws-search-container {',
    'display: flex;',
  '}',
  '.blockly-ws-search-content {',
    'display: flex;',
  '}',
  /* eslint-enable indent */
];

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
    const text = CSS_CONTENT.join('\n');
    // Inject CSS tag at start of head.
    const cssNode = document.createElement('style');
    cssNode.id = 'blockly-ws-search-style';
    const cssTextNode = document.createTextNode(text);
    cssNode.appendChild(cssTextNode);
    document.head.insertBefore(cssNode, document.head.firstChild);
  };
})();
