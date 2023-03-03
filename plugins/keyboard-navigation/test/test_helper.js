/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const {Constants} = require('../src/index');
const {Navigation} = require('../src/index');
const Blockly = require('blockly/node');

/**
 * Creates a workspace for testing keyboard navigation.
 * @param {Navigation} navigation Object holding navigation classes.
 * @param {boolean} enableKeyboardNav True to enable keyboard navigation, false
 *     otherwise.
 * @param {boolean} readOnly True for a read only workspace, false otherwise.
 * @returns {Blockly.WorkspaceSvg} The created workspace.
 */
export function createNavigationWorkspace(
    navigation, enableKeyboardNav, readOnly) {
  const workspace = Blockly.inject('blocklyDiv', {
    toolbox: `
      <xml xmlns="https://developers.google.com/blockly/xml"
          id="toolbox-categories" style="display: none">
        <category colour="#FFFFFF" name="First" css-container="something">
          <block type="basic_block">
            <field name="COLOURFIELD">#ff0000</field>
          </block>
          <block type="basic_block">
            <field name="COLOURFIELD">#00ff00</field>
          </block>
        </category>
        <category colour="#FFFFFF" name="Second">
          <block type="basic_block">
            <field name="COLOURFIELD">#0000ff</field>
          </block>
        </category>
      </xml>
  `,
    readOnly: readOnly,
  });
  if (enableKeyboardNav) {
    navigation.addWorkspace(workspace);
    navigation.enableKeyboardAccessibility(workspace);
    navigation.setState(workspace, Constants.STATE.WORKSPACE);
  }
  return workspace;
}

/**
 * Creates a key down event used for testing.
 * @param {number} keyCode The keycode for the event. Use Blockly.utils.KeyCodes
 *     enum.
 * @param {string} type The type of the target. This only matters for the
 *     Blockly.utils.isTargetInput method.
 * @param {?Array<number>} modifiers A list of modifiers. Use
 *     Blockly.utils.KeyCodes enum.
 * @returns {Object} The mocked keydown
 * event.
 */
export function createKeyDownEvent(keyCode, type, modifiers) {
  const event = {
    keyCode: keyCode,
    target: {type: type},
    getModifierState: function(name) {
      if (name == 'Shift' && this.shiftKey) {
        return true;
      } else if (name == 'Control' && this.ctrlKey) {
        return true;
      } else if (name == 'Meta' && this.metaKey) {
        return true;
      } else if (name == 'Alt' && this.altKey) {
        return true;
      }
      return false;
    },
    preventDefault: function() {},
  };
  if (modifiers && modifiers.length) {
    event.altKey = modifiers.includes(Blockly.utils.KeyCodes.ALT);
    event.ctrlKey = modifiers.includes(Blockly.utils.KeyCodes.CTRL);
    event.metaKey = modifiers.includes(Blockly.utils.KeyCodes.META);
    event.shiftKey = modifiers.includes(Blockly.utils.KeyCodes.SHIFT);
  }
  return event;
}
