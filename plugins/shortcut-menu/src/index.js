/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class responsible for creating a Blockly modal.
 * @author dnaidapp@uwaterloo.ca (Dulhan Waduge)
 * @author rickson.yang@uwaterloo.ca (Rickson Yang)
 */

import * as Blockly from 'blockly/core';
import {Modal} from '@blockly/plugin-modal';

/**
 * Class responsible for creating a shortcut modal.
 */
export class ShortcutMenu extends Modal {
  /**
   * Constructor for creating a Blockly modal.
   * @param {string} title The title for the modal.
   * @param {!Blockly.WorkspaceSvg} workspace The workspace to display the modal
   *     over.
   */
  constructor(title, workspace) {
    super(title, workspace);

    /**
     * The div holding the shortcut menu
     * @type {HTMLElement}
     * @private
     */
    this.shortcutTable_ = document.createElement('div');

    /** Test code */
    // Sample edit shortcut code
    Blockly.ShortcutRegistry.registry.removeAllKeyMappings('copy');
    Blockly.ShortcutRegistry.registry.addKeyMapping('Control+70', 'copy', true);


    console.log('SHORTCUTS: ', Blockly.ShortcutRegistry.registry);
    console.log('Shortcut Registry Shortcuts',
        Blockly.ShortcutRegistry.registry.shortcuts);
    console.log('Shortcut Registry Shortcut items',
        Blockly.ShortcutRegistry.registry.shortcuts.keys());
    console.log('Shortcut Current Key map',
        Blockly.ShortcutRegistry.registry.getKeyMap());
    // Map shortcut name -> [list of key codes]
    // TODO: maybe consider caching and listening to update cache on registry up
    for (const [key, value] of Blockly.ShortcutRegistry.registry.shortcuts) {
      console.log(`${key} -> ${value.keyCodes}`);
    }
    /** End Test Code */
  }

  /**
   * Format keycodes into human friendly format
   * @param keyCodes keycodes to format
   * @protected
   * @return readable keybindings given keycodes
   */
  getKeybindings(keyCodes) {
    const specialCodes = {
      '27': 'Escape',
      '46': '.',
      '8': 'Backspace',
      'Control': 'Ctrl', // or Cmd for MAC
      'Meta': 'Meta',
      'Shift': 'Shift',
      'Alt': 'Alt',
    };

    return keyCodes.map((codes) => String(codes).split('+').map((code) => {
      if (code in specialCodes) {
        return specialCodes[code];
      }
      // printable ASCII chars
      if (code >= '!' && code <= '~') {
        return String.fromCharCode(Number(code));
      }
      return code;
    }).map((code) => `${code}`).join(' + ')).join(' , ');
  }

  // split by , then split by +, then map to <code>{text}</code>
  /**
   * Format keybindings html for table output
   * @param {!String} keybindings to format with code tags
   * @protected
   * @return formatted keybindings
   */
  formatKeybindings(keybindings) {
    return keybindings.split(' , ').map((keybinding) => {
      return keybinding.split(' + ').map((code) => `<code>${code}</code>`)
          .join(' + ');
    }).join(' , ');
  }

  /**
   * Handle search bar filtering
   * @protected
   */
  onSearchEvent_() {
    this.filter_ = this.inputElement_.value.trim();
    console.log(this.filter_);
    this.createShortcutTable_();
  }

  /**
   * Creates the text input for the search bar.
   * @return {!HTMLInputElement} A text input for the search bar.
   * @protected
   */
  createTextInput_() {
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.setAttribute('placeholder', 'Type to search in keybindings');
    return textInput;
  }

  /**
   * Creates the shortcut table for the shortcut menu modal
   * @protected
   */
  createShortcutTable_() {
    let table = '';

    table +=
      `<table>
      <tr>
        <th>Command</th>
        <th>Keybinding</th>
      </tr>`;
    for (const [key, value] of Blockly.ShortcutRegistry.registry.shortcuts) {
      const keyBindings = this.getKeybindings(value.keyCodes);
      if (!this.filter_ || key.includes(this.filter_) ||
          keyBindings.includes(this.filter_)) {
        table +=
        `<tr>
         <td>${key}</td>
         <td>${this.formatKeybindings(keyBindings)}</td>
       </tr>`;
      }
    }
    table += `</table>`;
    console.log(table);
    this.shortcutTable_.innerHTML = table;
  }

  /**
   * Render content for the modal content div.
   * @param {HTMLDivElement} contentContainer The modal's content div.
   * @param contentContainer
   * @protected
   */
  renderContent_(contentContainer) {
    const inputWrapper = document.createElement('div');
    Blockly.utils.dom.addClass(inputWrapper, 'searchBar');
    this.inputElement_ = this.createTextInput_();

    this.addEvent_(this.inputElement_, 'keyup', this, (e) => this
        .onSearchEvent_());

    inputWrapper.appendChild(this.inputElement_);
    contentContainer.appendChild(inputWrapper);
    this.createShortcutTable_();
    contentContainer.appendChild(this.shortcutTable_);
  }
}

Blockly.Css.register(`
table {
  border-collapse: collapse;
  border-spacing: 0;
  width: 100%;
  border: 1px solid #ddd;
}
th, td {
  text-align: left;
  padding: 16px;
}
td + td, th + th { border-left:2px solid #ddd; }
tr:nth-child(even) {
  background-color: #f2f2f2;
}
.blocklyModalContainer {
  background-color: white;
  border: 1px solid gray;
  font-family: Helvetica;
  font-weight: 300;
  padding: 1em;
  width: 75vw;
  height: 75vh;
  display: block;
  flex-direction: column;
  box-shadow: 0px 10px 20px grey;
  z-index: 100;
  margin: 5% auto;
  overflow: scroll;
}
code {
  background-color: lightGray;
  padding: 4px;
  border-radius: 5px;
}
.searchBar input[type=text] {
  font-size: 17px;
  border-style: solid;
  border-width: 1px;
  border-radius: 5px;
  width: 100%;
  padding: 6px;
  margin-top: 8px;
  margin-right: 16px;
  margin-bottom: 8px;
  box-sizing: border-box;
}
`);
