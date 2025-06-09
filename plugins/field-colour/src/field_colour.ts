/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Colour input field.
 */

import * as Blockly from 'blockly/core';
import {
  FieldGridDropdown,
  FieldGridDropdownConfig,
  FieldGridDropdownFromJsonConfig,
} from '@blockly/field-grid-dropdown';

/**
 * An array of colour strings for the palette.
 * Copied from goog.ui.ColorPicker.SIMPLE_GRID_COLORS
 */
const DEFAULT_COLOURS = [
  // grays
  '#ffffff',
  '#cccccc',
  '#c0c0c0',
  '#999999',
  '#666666',
  '#333333',
  '#000000',
  // reds
  '#ffcccc',
  '#ff6666',
  '#ff0000',
  '#cc0000',
  '#990000',
  '#660000',
  '#330000',
  // oranges
  '#ffcc99',
  '#ff9966',
  '#ff9900',
  '#ff6600',
  '#cc6600',
  '#993300',
  '#663300',
  // yellows
  '#ffff99',
  '#ffff66',
  '#ffcc66',
  '#ffcc33',
  '#cc9933',
  '#996633',
  '#663333',
  // olives
  '#ffffcc',
  '#ffff33',
  '#ffff00',
  '#ffcc00',
  '#999900',
  '#666600',
  '#333300',
  // greens
  '#99ff99',
  '#66ff99',
  '#33ff33',
  '#33cc00',
  '#009900',
  '#006600',
  '#003300',
  // turquoises
  '#99ffff',
  '#33ffff',
  '#66cccc',
  '#00cccc',
  '#339999',
  '#336666',
  '#003333',
  // blues
  '#ccffff',
  '#66ffff',
  '#33ccff',
  '#3366ff',
  '#3333ff',
  '#000099',
  '#000066',
  // purples
  '#ccccff',
  '#9999ff',
  '#6666cc',
  '#6633ff',
  '#6600cc',
  '#333399',
  '#330099',
  // violets
  '#ffccff',
  '#ff99ff',
  '#cc66cc',
  '#cc33cc',
  '#993399',
  '#663366',
  '#330033',
];

/**
 * Class for a colour input field.
 */
export class FieldColour extends FieldGridDropdown {
  /**
   * Used to tell if the field needs to be rendered the next time the block is
   * rendered.  Colour fields are statically sized, and only need to be
   * rendered at initialization.
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  protected override isDirty_ = false;

  /**
   * @param value The initial value of the field.  Should be in '#rrggbb'
   *     format.  Defaults to the first value in the default colour array.  Also
   *     accepts Field.SKIP_SETUP if you wish to skip setup (only used by
   *     subclasses that want to handle configuration and setting the field
   *     value after their own constructors have run).
   * @param validator A function that is called to validate changes to the
   *     field's value.  Takes in a colour string & returns a validated colour
   *     string ('#rrggbb' format), or null to abort the change.
   * @param config A map of options used to configure the field.
   *     See the [field creation documentation]{@link
   * https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/colour}
   * for a list of properties this parameter supports.
   */
  constructor(
    value?: string | typeof Blockly.Field.SKIP_SETUP,
    validator?: FieldColourValidator,
    config?: FieldColourConfig,
  ) {
    const swatches = makeSwatches(config?.colourOptions ?? DEFAULT_COLOURS);
    super(swatches, validator, {...config, columns: config?.columns ?? 7});

    if (value === Blockly.Field.SKIP_SETUP) return;
    this.setValue(value);
  }

  /**
   * FieldDropdown has complex behaviors for normalizing options that aren't
   * applicable here. Instead, just return the options as-is.
   *
   * @param options The options (colour swatches) to normalize.
   * @returns The colour swatches as-is.
   */
  protected override trimOptions(options: Blockly.MenuOption[]) {
    return {options};
  }

  /**
   * Configure the field based on the given map of options.
   *
   * @param config A map of options to configure the field based on.
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  protected override configure_(config: FieldColourConfig) {
    super.configure_(config);
    if (config.colourOptions) {
      this.setColours(config.colourOptions, config.colourTitles);
    }
  }

  /**
   * Create the block UI for this colour field.
   *
   * @internal
   */
  override initView() {
    const constants = this.getConstants();
    // This can't happen, but TypeScript thinks it can and lint forbids `!.`.
    if (!constants) throw Error('Constants not found');
    this.size_ = new Blockly.utils.Size(
      constants.FIELD_COLOUR_DEFAULT_WIDTH,
      constants.FIELD_COLOUR_DEFAULT_HEIGHT,
    );
    this.createBorderRect_();
    this.getBorderRect().style['fillOpacity'] = '1';
    this.getBorderRect().setAttribute('stroke', '#fff');
    if (this.isFullBlockField()) {
      this.clickTarget_ = (this.sourceBlock_ as Blockly.BlockSvg).getSvgRoot();
    }
  }

  /**
   * Shows the colour picker dropdown attached to the field.
   *
   * @param e The event that triggered display of the colour picker dropdown.
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  protected override showEditor_(e?: MouseEvent) {
    super.showEditor_(e);
    Blockly.DropDownDiv.getContentDiv().classList.add('blocklyFieldColour');
    Blockly.DropDownDiv.repositionForWindowResize();
  }

  /**
   * Defines whether this field should take up the full block or not.
   *
   * @returns True if this field should take up the full block. False otherwise.
   */
  override isFullBlockField(): boolean {
    const block = this.getSourceBlock();
    if (!block) throw new Blockly.UnattachedFieldError();

    const constants = this.getConstants();
    return (
      this.blockIsSimpleReporter() &&
      Boolean(constants?.FIELD_COLOUR_FULL_BLOCK)
    );
  }

  /**
   * @returns True if the source block is a value block with a single editable
   *     field.
   * @internal
   */
  blockIsSimpleReporter(): boolean {
    const block = this.getSourceBlock();
    if (!block) throw new Blockly.UnattachedFieldError();

    if (!block.outputConnection) return false;

    for (const input of block.inputList) {
      if (input.connection || input.fieldRow.length > 1) return false;
    }
    return true;
  }

  /**
   * Updates text field to match the colour/style of the block.
   *
   * @internal
   */
  override applyColour() {
    const block = this.getSourceBlock() as Blockly.BlockSvg | null;
    if (!block) throw new Blockly.UnattachedFieldError();

    if (!this.fieldGroup_) return;

    const borderRect = this.borderRect_;
    if (!borderRect) {
      throw new Error('The border rect has not been initialized');
    }

    if (!this.isFullBlockField()) {
      borderRect.style.display = 'block';
      borderRect.style.fill = this.getValue() as string;
    } else {
      borderRect.style.display = 'none';
      // In general, do *not* let fields control the color of blocks. Having the
      // field control the color is unexpected, and could have performance
      // impacts.
      block.pathObject.svgPath.setAttribute('fill', this.getValue() as string);
      block.pathObject.svgPath.setAttribute('stroke', '#fff');
    }
  }

  /**
   * Returns the height and width of the field.
   *
   * This should *in general* be the only place render_ gets called from.
   *
   * @returns Height and width.
   */
  override getSize(): Blockly.utils.Size {
    if (this.getConstants()?.FIELD_COLOUR_FULL_BLOCK) {
      // In general, do *not* let fields control the color of blocks. Having the
      // field control the color is unexpected, and could have performance
      // impacts.
      // Full block fields have more control of the block than they should
      // (i.e. updating fill colour) so they always need to be rerendered.
      this.render_();
      this.isDirty_ = false;
    }
    return super.getSize();
  }

  /**
   * Updates the colour of the block to reflect whether this is a full
   * block field or not.
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  protected override render_() {
    this.updateSize_();

    const block = this.getSourceBlock() as Blockly.BlockSvg | null;
    if (!block) throw new Blockly.UnattachedFieldError();
    // Calling applyColour updates the UI (full-block vs non-full-block) for the
    // colour field, and the colour of the field/block.
    block.applyColour();
  }

  /**
   * Updates the size of the field based on whether it is a full block field
   * or not.
   *
   * @param margin margin to use when positioning the field.
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  protected updateSize_(margin?: number) {
    const constants = this.getConstants();
    if (!constants) return;
    let totalWidth;
    let totalHeight;
    if (this.isFullBlockField()) {
      const xOffset = margin ?? 0;
      totalWidth = xOffset * 2;
      totalHeight = constants.FIELD_TEXT_HEIGHT;
    } else {
      totalWidth = constants.FIELD_COLOUR_DEFAULT_WIDTH;
      totalHeight = constants.FIELD_COLOUR_DEFAULT_HEIGHT;
    }

    this.size_.height = totalHeight;
    this.size_.width = totalWidth;

    this.positionBorderRect_();
  }

  /**
   * Ensure that the input value is a valid colour.
   *
   * @param newValue The input value.
   * @returns A valid colour, or null if invalid.
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  protected override doClassValidation_(
    newValue: string,
  ): string | null | undefined;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  protected override doClassValidation_(newValue?: string): string | null;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  protected override doClassValidation_(
    newValue?: string,
  ): string | null | undefined {
    if (typeof newValue !== 'string') {
      return null;
    }
    return Blockly.utils.colour.parse(newValue);
  }

  /**
   * Get the text for this field.  Used when the block is collapsed.
   *
   * @returns Text representing the value of this field.
   */
  override getText(): string {
    let colour = this.value_ as string;
    // Try to use #rgb format if possible, rather than #rrggbb.
    if (/^#(.)\1(.)\2(.)\3$/.test(colour)) {
      colour = '#' + colour[1] + colour[3] + colour[5];
    }
    return colour;
  }

  /**
   * Set a custom colour grid for this field.
   *
   * @param colours Array of colours for this block, or null to use default
   *     (FieldColour.COLOURS).
   * @param titles Optional array of colour tooltips, or null to use default
   *     (FieldColour.TITLES).
   * @returns Returns itself (for method chaining).
   */
  setColours(colours: string[], titles?: string[]): FieldColour {
    const swatches = makeSwatches(colours, titles);
    this.setOptions(swatches);
    return this;
  }

  /**
   * Construct a FieldColour from a JSON arg object.
   *
   * @param options A JSON object with options (colour).
   * @returns The new field instance.
   * @nocollapse
   * @internal
   */
  static fromJson(options: FieldColourFromJsonConfig): FieldColour {
    // `this` might be a subclass of FieldColour if that class doesn't override
    // the static fromJson method.
    return new this(options.colour, undefined, options);
  }
}

/**
 * Creates a set of divs representing colour swatches for use in the picker.
 *
 * @param colours An array of colours to create swatches for. The colours must
 *     be any legal CSS colour specifier.
 * @param titles A corresponding array of titles to be displayed as tooltips on
 *     the colour swatches.
 * @returns An array of pairs of DOM elements representing colour swatches and
 *     their corresponding colour.
 */
function makeSwatches(
  colours: string[],
  titles?: string[],
): Blockly.MenuOption[] {
  return colours.map((colour, index) => {
    const swatch = document.createElement('div');
    swatch.className = 'blocklyColourSwatch';
    swatch.style.backgroundColor = colour;

    if (titles && index < titles.length) {
      swatch.title = titles[index];
    }

    return [swatch, colour];
  });
}

/** The default value for this field. */
FieldColour.prototype.DEFAULT_VALUE = '#ffffff';

/**
 * Register the field and any dependencies.
 */
export function registerFieldColour() {
  Blockly.fieldRegistry.register('field_colour', FieldColour);
}

/**
 * CSS for colour picker.
 */
Blockly.Css.register(`
.blocklyFieldColour .blocklyFieldGridItemSelected,
.blocklyFieldGridItemSelected:hover {
  border-color: #eee !important;
  outline: 1px solid #333;
  position: relative;
}

.blocklyColourSwatch {
  width: 20px;
  height: 20px;
}

.blocklyGridContainer {
  padding: 0px;
}

.blocklyFieldColour .blocklyFieldGrid {
  grid-gap: 0px;
  row-gap: 4px;
}

.blocklyFieldColour .blocklyFieldGrid .blocklyGridItem {
  border-radius: 0;
  padding: 0;
  border: 0.5px solid #888;
  cursor: pointer;
}

.blocklyFieldColour .blocklyFieldGrid .blocklyFieldGridItem {
  border: 0.5px solid #888;
  padding: 0;
  margin: 0;
  border-radius: 0;
}

.blocklyFieldColour .blocklyFieldGrid .blocklyFieldGridItem:focus {
  border-color: #eee;
  box-shadow: 2px 2px 7px 2px rgba(0, 0, 0, 0.3);
  position: relative;
  border-radius: 0;
  outline: none;
}
`);

/**
 * Config options for the colour field.
 */
export interface FieldColourConfig extends FieldGridDropdownConfig {
  colourOptions?: string[];
  colourTitles?: string[];
}

/**
 * fromJson config options for the colour field.
 */
export interface FieldColourFromJsonConfig
  extends FieldGridDropdownFromJsonConfig {
  colour?: string;
}

/**
 * A function that is called to validate changes to the field's value before
 * they are set.
 *
 * @see {@link https://developers.google.com/blockly/guides/create-custom-blocks/fields/validators#return_values}
 * @param newValue The value to be validated.
 * @returns One of three instructions for setting the new value: `T`, `null`,
 * or `undefined`.
 *
 * - `T` to set this function's returned value instead of `newValue`.
 *
 * - `null` to invoke `doValueInvalid_` and not set a value.
 *
 * - `undefined` to set `newValue` as is.
 */
export type FieldColourValidator = Blockly.FieldValidator<string>;
