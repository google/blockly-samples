/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview
 * @author samelh@google.com (Sam El-Husseini)
 */


import {Modal} from '@blockly/plugin-modal';
import * as Blockly from 'blockly/core';

/**
 * Class for displaying a modal used for displaying the current keyboard
 * shortcuts.
 */
export class KeyboardShortcutsModal extends Modal {
  /**
   * Constructor for creating a keyboard shortcuts modal.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace that the modal will
   *     be registered on.
   */
  constructor(workspace) {
    super('Keyboard Shortcuts', workspace);
  }

  /**
   * Render content for the modal content div.
   * @param {HTMLDivElement} contentContainer The modal's content div.
   * @override
   */
  renderContent_(contentContainer) {
    contentContainer.appendChild(document.createTextNode('List shortcuts'));
  }
}

Blockly.Css.register([`
    .typedModalTitle {
      font-weight: bold;
      font-size: 1em;
    }
    .typedModalVariableInputContainer {
      margin: 1em 0 1em 0;
    }
    .typedModalVariableLabel{
      margin-right: .5em;
    }
    .typedModalTypes ul{
      display: flex;
      flex-wrap: wrap;
      list-style-type: none;
      padding: 0;
    }
    .typedModalTypes li {
      margin-right: 1em;
      display: flex;
    }`]);
