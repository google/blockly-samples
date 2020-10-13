/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Grid dropdown field.
 * @author kozbial@google.com (Monica Kozbial)
 */

import Blockly from 'blockly/core';

/**
 * Grid dropdown field.
 */
export class FieldGridDropdown extends Blockly.FieldDropdown {
  /**
   * Class for an grid dropdown field.
   * @param {(!Array.<!Array>|!Function)} menuGenerator A non-empty array of
   *     options for a dropdown list, or a function which generates these
   *     options.
   * @param {Function=} opt_validator A function that is called to validate
   *    changes to the field's value. Takes in a language-neutral dropdown
   *    option & returns a validated language-neutral dropdown option, or null
   *    to abort the change.
   * @param {Object=} opt_config A map of options used to configure the field.
   *    See the [field creation documentation]{@link https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/dropdown#creation}
   *    for a list of properties this parameter supports.
   * @extends {Blockly.Field}
   * @constructor
   * @throws {TypeError} If `menuGenerator` options are incorrectly structured.
   */
  constructor(menuGenerator, opt_validator, opt_config) {
    super(menuGenerator, opt_validator, opt_config);

    // TODO(373): Set columns from constructor and use in CSS.
    this.NUM_COLUMNS = 3;
  }

  /**
   * Constructs a FieldGridDropdown from a JSON arg object.
   * @param {!Object} options A JSON object with options.
   * @return {!FieldGridDropdown} The new field instance.
   * @package
   * @nocollapse
   */
  static fromJson(options) {
    return new FieldGridDropdown(options['options'], undefined, options);
  }

  /**
   * Create a dropdown menu under the text.
   * @param {Event=} opt_e Optional mouse event that triggered the field to
   *    open, or undefined if triggered programmatically.
   * @protected
   * @override
   */
  showEditor_(opt_e) {
    super.showEditor_(opt_e);

    // Grid dropdown is always colored.
    const primaryColour = (this.sourceBlock_.isShadow()) ?
        this.sourceBlock_.getParent().getColour() :
        this.sourceBlock_.getColour();
    const borderColour = (this.sourceBlock_.isShadow()) ?
        this.sourceBlock_.getParent().style.colourTertiary :
        this.sourceBlock_.style.colourTertiary;
    Blockly.DropDownDiv.setColour(primaryColour, borderColour);

    Blockly.utils.dom.addClass(
        Blockly.DropDownDiv.getContentDiv(), 'fieldGridDropDownContainer');
  }
}

Blockly.fieldRegistry.register('field_grid_dropdown', FieldGridDropdown);

/**
 * CSS for slider field.
 */
Blockly.Css.register([
  /* eslint-disable indent */
  `/** Setup grid layout of DropDown */
  .fieldGridDropDownContainer .blocklyMenu {
      display: grid;
      grid-gap: 7px;
      /* TODO(373): set number of columns using property on field */
      grid-template-columns: repeat(3, min-content);
    }
  /* Change look of cells (add border, sizing, padding, and text color) */
  .fieldGridDropDownContainer .blocklyMenu .blocklyMenuItem {
    border: 1px solid rgba(1, 1, 1, 0.5);
    border-radius: 4px;
    color: white;
    min-width: auto;
    padding-left: 15px; /* override padding-left now that checkmark is hidden */
  }
  /* Change look of selected cell */
  .fieldGridDropDownContainer .blocklyMenuItem .blocklyMenuItemCheckbox {
    display: none; /* Hide checkmark */
  }
  .fieldGridDropDownContainer .blocklyMenuItem.blocklyMenuItemSelected {
    background-color: rgba(1, 1, 1, 0.25);
  }
  /* Change look of focus/highlighted cell */
  .fieldGridDropDownContainer .blocklyMenuItem.blocklyMenuItemHighlight {
    box-shadow: 0 0 0 4px hsla(0, 0%, 100%, .2);
  }
  .fieldGridDropDownContainer .blocklyMenuItemHighlight {
    /* Uses less selectors so as to not affect blocklyMenuItemSelected */
    background-color: inherit;
  }
  .fieldGridDropDownContainer.blocklyDropDownContent {
    padding: 7px; /* needed for highlight */
  }`,
  /* eslint-enable indent */
]);
