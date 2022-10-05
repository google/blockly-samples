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
   * @param {Function=} validator A function that is called to validate
   *    changes to the field's value. Takes in a language-neutral dropdown
   *    option & returns a validated language-neutral dropdown option, or null
   *    to abort the change.
   * @param {Object=} config A map of options used to configure the field.
   *    See the [field creation documentation]{@link https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/dropdown#creation}
   *    for a list of properties this parameter supports.
   * @extends {Blockly.Field}
   * @constructor
   * @throws {TypeError} If `menuGenerator` options are incorrectly structured.
   */
  constructor(menuGenerator, validator = undefined, config = undefined) {
    super(menuGenerator, validator, config);

    /**
     * The number of columns in the dropdown grid. Must be an integer value
     * greater than 0. Defaults to 3.
     * @type {number}
     * @private
     */
    this.columns_ = 3;
    if (config && config['columns']) {
      this.setColumnsInternal_(config['columns']);
    }

    if (config && config['primaryColour']) {
      this.primaryColour = config['primaryColour'];
    }

    if (config && config['borderColour']) {
      this.borderColour = config['borderColour'];
    }
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
   * Sets the number of columns on the grid. Updates the styling to reflect.
   * @param {number} columns The number of columns. Is rounded to
   *    an integer value and must be greater than 0. Invalid
   *    values are ignored.
   * @private
   */
  setColumns(columns) {
    this.setColumnsInternal_(columns);
    this.updateColumnsStyling_();
  }

  /**
   * Sets the number of columns on the grid.
   * @param {?(string|number|undefined)} columns The number of columns. Is
   *    rounded to an integer value and must be greater than 0. Invalid
   *    values are ignored.
   * @private
   */
  setColumnsInternal_(columns) {
    columns = parseInt(columns);
    if (!isNaN(columns) && columns >= 1) {
      this.columns_ = columns;
    }
  }

  /**
   * Create a dropdown menu under the text.
   * @param {Event=} e Optional mouse event that triggered the field to
   *    open, or undefined if triggered programmatically.
   * @protected
   * @override
   */
  showEditor_(e = undefined) {
    super.showEditor_(e);

    // Dropdown should match block colour unless other colours are specified
    // in the config.
    const blockPrimaryColour = (this.sourceBlock_.isShadow()) ?
        this.sourceBlock_.getParent().getColour() :
        this.sourceBlock_.getColour();
    const blockBorderColour = (this.sourceBlock_.isShadow()) ?
        this.sourceBlock_.getParent().style.colourTertiary :
        this.sourceBlock_.style.colourTertiary;
    const primaryColour = this.primaryColour || blockPrimaryColour;
    const borderColour = this.borderColour || blockBorderColour;
    Blockly.DropDownDiv.setColour(primaryColour, borderColour);

    Blockly.utils.dom.addClass(
        this.menu_.getElement(), 'fieldGridDropDownContainer');
    this.updateColumnsStyling_();

    Blockly.DropDownDiv.showPositionedByField(
        this, this.dropdownDispose_.bind(this));
  }

  /**
   * Updates the styling for number of columns on the dropdown.
   * @private
   */
  updateColumnsStyling_() {
    const menuElement = this.menu_ ? this.menu_.getElement() : null;
    if (menuElement) {
      menuElement.style.gridTemplateColumns =
          `repeat(${this.columns_}, min-content)`;
    }
  }
}

Blockly.fieldRegistry.register('field_grid_dropdown', FieldGridDropdown);

/**
 * CSS for slider field.
 */
Blockly.Css.register(`
/** Setup grid layout of DropDown */
.fieldGridDropDownContainer.blocklyMenu {
    display: grid;
    grid-gap: 7px;
  }
/* Change look of cells (add border, sizing, padding, and text color) */
.fieldGridDropDownContainer.blocklyMenu .blocklyMenuItem {
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
.fieldGridDropDownContainer {
  margin: 7px; /* needed for highlight */
}
`);
