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
 * @fileoverview Styling for workspace search.
 * @author kozbial@google.com (Monica Kozbial)
 */

/**
 * CSS for highlighting blocks.
 */
Blockly.Css.register([
  'path.blocklyPath.search-highlight {',
    'fill: black;',
  '}',
  'path.blocklyPath.search-highlight.search-current {',
    'fill: grey;',
  '}'
]);

/**
 * CSS for search bar.
 */
Blockly.Css.register([
  '.btn-text {',
    'height: 1px;',
    'overflow: hidden;',
    'position: absolute;',
    'width: 1px;',
  '}',
  '.close-btn {',
    'background: url(../media/close.svg) no-repeat top left;',
  '}',
  '.down-btn {',
    'background: url(../media/keyboard_arrow_down.svg) no-repeat top left;',
  '}',
  '.up-btn {',
    'background: url(../media/keyboard_arrow_up.svg) no-repeat top left;',
  '}',
  '.ws-search {',
    'background: white;',
    'border: solid lightgrey .5px;',
    'box-shadow: 0px 10px 20px grey;',
    'justify-content: center;',
    'padding: .25em;',
    'position: absolute;',
    'z-index: 70;',
  '}',
  '.ws-search-input input {',
    'border: none;',
  '}',
  '.ws-search button {',
    'border: none;',
  '}',
  '.ws-search-actions {',
    'display: flex;',
  '}',
  '.ws-search-container {',
    'display: flex;',
  '}',
  '.ws-search-content {',
    'display: flex;',
  '}',
]);
