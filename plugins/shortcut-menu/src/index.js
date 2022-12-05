/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class responsible for creating a Blockly Shortcut modal.
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
   * @param {!Blockly.WorkspaceSvg} workspace The workspace to display the modal
   *     over.
   */
  constructor(workspace) {
    super('Shortcut Menu', workspace);

    /**
     * The div holding the shortcut menu
     * @type {HTMLElement}
     * @private
     */
    this.shortcutTableContainer_ = document.createElement('div');

    /**
     * The shortcut name of the keybinding row that is currently being edited.
     * Empty string if no row is being edited.
     * @type {string}
     * @private
     */
    this.editRow_ = '';

    /**
     * The current keycode input for command overriding.
     * @type {string}
     * @private
     */
    this.keyCode_ = '';
  }

  /**
   * Return a map of command names to keybindings by parsing keymap.
   * @protected
   * @return {any} map of command to keybindings
   */
  getBindingsByNames_() {
    const bindings = {};
    for (const [key, values] of
      Object.entries(Blockly.ShortcutRegistry.registry.getKeyMap()).sort()) {
      for (const value of values) {
        if (!(value in bindings)) {
          bindings[value] = [];
        }
        bindings[value].push(key);
      }
    }
    return bindings;
  }

  /**
   * Format keycodes into human friendly format
   * @param {!Array.<String>} keyCodes keycodes to format
   * @protected
   * @return {!String} readable keybindings given keycodes
   */
  getKeyCodesDisplay_(keyCodes) {
    const specialCodes = {
      '8': 'Backspace',
      '20': 'CapsLock',
      '27': 'Escape',
      '46': 'Delete',
      '186': ';',
      '187': '=',
      '188': ',',
      '189': '-',
      '190': '.',
      '191': '/',
      '192': '~',
      '219': '[',
      '220': '\\',
      '221': ']',
      '222': '\'',
      'Alt': 'Alt',
      'Control': 'Ctrl',
      'Meta': 'Meta',
      'Shift': 'Shift',
    };

    return keyCodes.map((codes) => String(codes).split('+').map((code) => {
      if (code in specialCodes) {
        return specialCodes[code];
      }
      // NOTE: this is unreliable for key codes
      return String.fromCharCode(Number(code));
    }).map((code) => `${code}`).join(' + ')).join(' , ');
  }

  /**
   * Format keybindings html for table output
   * @param {!String} keybindings to format with code tags
   * @protected
   * @return {!String} formatted keybindings
   */
  formatKeybindings(keybindings) {
    return keybindings.split(' , ').map((keybinding) => {
      return keybinding.split(' + ').map((code) => `<code>${code}</code>`)
          .join(' + ');
    }).join(' , ');
  }

  /**
   * Handle search bar filtering and rerender table to include filtered results
   * @protected
   */
  onSearchEvent_() {
    this.filter_ = this.inputElement_.value.trim();
    this.saveShortcutTable_();
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
   * Handle edit command by rendering input on selected row
   * @param {!String} command name of the command to edit
   * @protected
   */
  onEditCommand_(command) {
    this.editRow_ = command;
    this.saveShortcutTable_();
  }

  /**
   * Override command with new keybinding
   * @param {!String} command command to override
   * @param {!String} keycode new keybinding for command
   * @protected
   */
  onChangeCommand_(command, keycode) {
    if (keycode.length > 0) {
      Blockly.ShortcutRegistry.registry.removeAllKeyMappings(command);
      Blockly.ShortcutRegistry.registry.addKeyMapping(keycode, command, true);
    }
    this.editRow_ = '';
    this.saveShortcutTable_();
  }

  /**
   * Cancel edit command input
   * @protected
   */
  onCancelEditCommand_() {
    this.editRow_ = '';
    this.saveShortcutTable_();
  }

  /**
   * Create a serialized keycode from keyboard event keycode and modifiers
   * @param {KeyboardEvent} event keyboard event
   * @return {!String} serialized key to register into keymap
   */
  getSerializedKeycode_(event) {
    const code = event.keyCode;
    const mods = [];

    if (event.altKey) {
      mods.push(Blockly.utils.KeyCodes.ALT);
    }
    if (event.ctrlKey) {
      mods.push(Blockly.utils.KeyCodes.CTRL);
    }
    if (event.shiftKey) {
      mods.push(Blockly.utils.KeyCodes.SHIFT);
    }
    if (event.metaKey) {
      mods.push(Blockly.utils.KeyCodes.META);
    }
    return Blockly.ShortcutRegistry.registry.createSerializedKey(code, mods);
  }

  /**
   * Creates a tooltip used when hovering over a keybinding row
   * @return {HTMLDivElement} the tooltip div
   * @protected
   */
  createKeybindingRowTooltip_() {
    const tooltip = document.createElement('div');
    tooltip.setAttribute('class', 'tooltip');
    const tooltipText = document.createElement('span');
    tooltipText.setAttribute('class', 'tooltiptext');
    tooltipText.textContent = 'Click row to edit';
    tooltip.appendChild(tooltipText);
    return tooltip;
  }

  /**
   * Creates the shortcut table for the shortcut menu modal
   * @protected
   */
  saveShortcutTable_() {
    const tbl = document.createElement('table');
    const tblBody = document.createElement('tbody');

    const headerRow = document.createElement('tr');
    const commandHeader = document.createElement('th');
    const keybindHeader = document.createElement('th');
    const keybindInput = document.createElement('input');

    commandHeader.appendChild(document.createTextNode('Command'));
    keybindHeader.appendChild(document.createTextNode('Keybinding'));
    headerRow.appendChild(commandHeader);
    headerRow.appendChild(keybindHeader);

    // add the header row to the table body
    tblBody.appendChild(headerRow);

    for (const [key, values] of
      Object.entries(this.getBindingsByNames_()).sort()) {
      const row = document.createElement('tr');
      const keyBindings = this.getKeyCodesDisplay_(values);

      if (!this.filter_ ||
          key.toLowerCase().includes(this.filter_.toLowerCase()) ||
          keyBindings.toLowerCase().includes(this.filter_.toLowerCase())
      ) {
        const commandCell = document.createElement('td');
        const commandCellText = document.createTextNode(key);
        commandCell.appendChild(commandCellText);

        const keybindCell = document.createElement('td');
        keybindCell.setAttribute('class', 'keybindCell');

        if (this.editRow_ == key) {
          keybindInput.setAttribute('class', 'editKeyBinding');
          keybindInput.readOnly = true;

          this.addEvent_(keybindInput, 'keydown', this,
              (e) => {
                if (e.key == 'Enter') {
                  this.onChangeCommand_(key, this.keyCode_);
                } else if (e.key == 'Escape') {
                  e.stopPropagation();
                  this.onCancelEditCommand_();
                } else {
                  // Only support keybindings with some non-modifier key
                  if (!(['Shift', 'Control', 'Alt', 'Meta'].includes(e.key))) {
                    this.keyCode_ = this.getSerializedKeycode_(e);
                    keybindInput.value = this.getKeyCodesDisplay_(
                        [this.keyCode_]);
                  } else {
                    keybindInput.value = '';
                  }
                }
              });
          keybindCell.appendChild(keybindInput);
        } else {
          keybindCell.innerHTML = this.formatKeybindings(keyBindings);
        }

        row.appendChild(commandCell);
        row.appendChild(keybindCell);

        if (this.editRow_ != key) {
          row.appendChild(this.createKeybindingRowTooltip_());
          this.addEvent_(row, 'click', this, () => this.onEditCommand_(key));
        }

        tblBody.appendChild(row);
      }
    }
    tbl.appendChild(tblBody);

    this.shortcutTableContainer_.innerHTML = '';
    this.shortcutTableContainer_.appendChild(tbl);
    keybindInput.focus();
  }

  /**
   * Render content for the modal content div.
   * @param {HTMLDivElement} contentContainer The modal's content div.
   * @protected
   */
  renderContent_(contentContainer) {
    const inputWrapper = document.createElement('div');
    Blockly.utils.dom.addClass(inputWrapper, 'searchBar');
    this.inputElement_ = this.createTextInput_();

    this.addEvent_(this.inputElement_, 'keyup', this, this.onSearchEvent_);

    inputWrapper.appendChild(this.inputElement_);
    contentContainer.appendChild(inputWrapper);
    this.saveShortcutTable_();
    contentContainer.appendChild(this.shortcutTableContainer_);
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
tr {
  line-height: 175%;
}
td + td, th + th { border-left:2px solid #ddd; }
tr:nth-child(even) {
  background-color: #f2f2f2;
}
tr:hover:not(:first-child) {
  opacity: 0.75;
  cursor: pointer;
}
tr:hover .tooltip .tooltiptext {
  visibility: visible;
}
tr .keybindCell {
  width: 85%;
}

.tooltip {
  position: relative;
  display: inline-block;
  border-bottom: 1px dotted black;
  opacity: 75%;
}
.tooltip .tooltiptext {
  visibility: hidden;
  width: 200px;
  background-color: black;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;
  
  /* Position the tooltip */
  position: absolute;
  z-index: 1;
  right: 10px;
  top: -10px;
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
  overflow: auto;
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
.editKeyBinding {
  font-size: 17px;
  border-style: solid;
  border-width: 1px;
  border-radius: 5px;
  width: 100%;
  padding: 2px 6px;
  margin-right: 16px;
  box-sizing: border-box;
}
`);
