/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Grid dropdown field.
 * @author kozbial@google.com (Monica Kozbial)
 */

import * as Blockly from 'blockly/core';

/**
 * A config object for defining a field grid dropdown.
 */
export interface FieldGridDropdownConfig extends Blockly.FieldDropdownConfig {
  columns?: string | number;
  primaryColour?: string;
  borderColour?: string;
}

/**
 * Construct a FieldGridDropdown from a JSON arg object.
 */
export interface FieldGridDropdownFromJsonConfig extends
  FieldGridDropdownConfig {
  options?: Blockly.MenuGenerator;
}

type FieldGridDropdownValidator = Blockly.FieldDropdownValidator;

/**
 * Grid dropdown field.
 */
export class FieldGridDropdown extends Blockly.FieldDropdown {
  /**
   * The number of columns in the dropdown grid. Must be an integer value
   * greater than 0. Defaults to 3.
   */
  private columns = 3;

  private primaryColour?: string;

  private borderColour?: string;

  /**
   * Class for an grid dropdown field.
   *
   * @param menuGenerator A non-empty array of options for a dropdown list,
   *   or a function which generates these options.
   * @param validator A function that is called to validate
   *  changes to the field's value. Takes in a language-neutral dropdown
   *  option & returns a validated language-neutral dropdown option, or null
   *  to abort the change.
   * @param config A map of options used to configure the field.
   *  See the [field creation documentation]{@link
   * https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/dropdown#creation}
   *  for a list of properties this parameter supports.
   * @extends {Blockly.Field}
   * @constructor
   * @throws {TypeError} If `menuGenerator` options are incorrectly structured.
   */
  constructor(menuGenerator: Blockly.MenuGenerator,
      validator?: FieldGridDropdownValidator,
      config?: FieldGridDropdownConfig) {
    super(menuGenerator, validator, config);

    if (config?.columns) {
      this.setColumnsInternal(config.columns);
    }

    if (config && config.primaryColour) {
      this.primaryColour = config.primaryColour;
    }

    if (config && config.borderColour) {
      this.borderColour = config.borderColour;
    }
  }

  /**
   * Constructs a FieldGridDropdown from a JSON arg object.
   *
   * @param config A JSON object with options.
   * @returns The new field instance.
   * @package
   * @nocollapse
   */
  static fromJson(config: FieldGridDropdownFromJsonConfig) {
    if (!config.options) {
      throw new Error(
          'options are required for the dropdown field. The ' +
          'options property must be assigned an array of ' +
          '[humanReadableValue, languageNeutralValue] tuples.');
    }
    // `this` might be a subclass of FieldDropdown if that class doesn't
    // override the static fromJson method.
    return new this(config.options, undefined, config);
  }

  /**
   * Sets the number of columns on the grid. Updates the styling to reflect.
   * @param columns The number of columns. Is rounded to
   *    an integer value and must be greater than 0. Invalid
   *    values are ignored.
   */
  setColumns(columns: number) {
    this.setColumnsInternal(columns);
    this.updateColumnsStyling_();
  }

  /**
   * Sets the number of columns on the grid.
   *
   * @param columns The number of columns. Is rounded to an integer value and
   *  must be greater than 0. Invalid values are ignored.
   */
  private setColumnsInternal(columns: string | number) {
    const cols = typeof columns === 'string' ? parseInt(columns) : columns;
    if (!isNaN(cols) && cols >= 1) {
      this.columns = cols;
    }
  }

  /* eslint-disable @typescript-eslint/naming-convention */
  /**
   * Create a dropdown menu under the text.
   *
   * @param e Optional mouse event that triggered the field to open, or
   *  undefined if triggered programmatically.
   */
  protected showEditor_(e?: MouseEvent) {
    super.showEditor_(e);

    const colours = this.getColours();
    if (colours && colours.border) {
      Blockly.DropDownDiv.setColour(colours.primary, colours.border);
    }

    const menuElement = this.menu_?.getElement() ?? null;
    if (menuElement) {
      Blockly.utils.dom.addClass(menuElement,
          'fieldGridDropDownContainer');
    }
    this.updateColumnsStyling_();

    Blockly.DropDownDiv.showPositionedByField(
        this, this.dropdownDispose_.bind(this));
  }

  /**
   * Updates the styling for number of columns on the dropdown.
   */
  private updateColumnsStyling_() {
    const menuElement = this.menu_ ? this.menu_.getElement() : null;
    if (menuElement) {
      menuElement.style.gridTemplateColumns =
        `repeat(${this.columns}, min-content)`;
    }
  }

  /**
   * Determine the colours for the dropdowndiv. The dropdown should match block
   * colour unless other colours are specified in the config.
   *
   * @returns The colours to set for the dropdowndiv.
   */
  private getColours() {
    if (this.primaryColour && this.borderColour) {
      return {
        primary: this.primaryColour,
        border: this.borderColour,
      };
    }

    const sourceBlock = this.getSourceBlock();
    if (!(sourceBlock instanceof Blockly.BlockSvg)) return;

    const colourSource = sourceBlock.isShadow() ? sourceBlock.getParent() :
        sourceBlock;
    if (!colourSource) return;

    return {
      primary: this.primaryColour ?? colourSource.getColour(),
      border: this.borderColour ?? colourSource.getColourTertiary(),
    };
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
