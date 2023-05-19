/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// TODO: Edit plugin overview.
// TODO: Mark this as a breaking change!
/**
 * @fileoverview Plugin overview.
 */
import * as Blockly from 'blockly/core';

/**
 * Class for a date input field.
 */
export class FieldDate extends Blockly.FieldTextInput {
  /**
   * Serializable fields are saved by the XML renderer, non-serializable fields
   * are not. Editable fields should also be serializable.
   */
  SERIALIZABLE = true;

  /**
   * Mouse cursor style when over the hotspot that initiates the editor.
   */
  CURSOR = 'text';

  /**
   * Class for a date input field. Derived from the Closure library date
   * picker.
   * @param value The initial value of the field. Should be in
   *    'YYYY-MM-DD' format. Defaults to the current date.
   * @param validator A function that is called to validate
   *    changes to the field's value. Takes in a date string & returns a
   *    validated date string ('YYYY-MM-DD' format), or null to abort the
   *    change.
   */
  constructor(value?: string, validator?: FieldDateValidator) {
    super(value, validator);
  }

  /**
   * Constructs a FieldDate from a JSON arg object.
   * @param options A JSON object with options (date).
   * @returns The new field instance.
   * @package
   * @nocollapse
   */
  static fromJson(options: FieldDateFromJsonConfig): FieldDate {
    // `this` might be a subclass of FieldDate if that class doesn't
    // override the static fromJson method.
    return new this(options.date, undefined);
  }

  /* eslint-disable @typescript-eslint/naming-convention */
  /**
   * Ensures that the input value is a valid date.
   * @param newValue The input value. Ex: '2023-04-28'
   * @returns A valid date ISO string, or null if invalid.
   */
  protected override doClassValidation_(newValue?: string): string | null {
    const newDate = typeof newValue === 'string' ? new Date(newValue) : null;
    if (!newDate || isNaN(newDate.getTime())) return null;

    // NOTE: Although `newValue` is already in the correct format for
    // `FieldDate` here (yyyy-mm-dd), convert `newDate` anyway to allow
    // subclasses to try and save any date-compatible strings and correct back
    // to yyyy-mm-dd format.
    return getHTMLInputDateValue(newDate);
  }

  /**
   * Get the text to display on the block when the input hasn't spawned in.
   *
   * @returns The text to display on the block.
   */
  protected override getText_(): string | null {
    const value = this.getValue();
    if (!value) return null;
    // NOTE: There may be discrepancies between the text and the input based on 
    // browser. For example, 'en-US' would display the text '2/14/2020', then 
    // clicking in Safari on iOS would display 'Feb 14, 2020'.

    // TODO: Should we handle these distinctions? Anytime browser format 
    // updated, we would need to update here.
    return getLocaleDateString(value);
  }

  /**
   * Renders the field. If the picker is shown make sure it has the current
   * date selected.
   */
  protected render_() {
    super.render_();
  }

  /**
   * Shows the inline free-text editor on top of the text along with the date
   * editor.
   * @param e Optional mouse event that triggered the field to
   *     open, or undefined if triggered programmatically.
   * @param _quietInput Quiet input.
   * @override
   */
  protected showEditor_(e?: Event, _quietInput?: boolean) {
    if (this.sourceBlock_) {
      // NOTE: Disable modal inputs to use default browser inputs on mobile.
      this.sourceBlock_.workspace.options.modalInputs = false;
    }

    super.showEditor_(e, _quietInput);
    this.showDropdown();
  }

  /**
   * Updates the size of the field based on the text.
   *
   * @param margin margin to use when positioning the text element.
   */
  protected override updateSize_(margin?: number) {
    // Add margin so that the date input's datepicker icon doesn't clip with 
    // the text when sized for the date.
    super.updateSize_((margin ?? 0) + 20);
  }

  /**
   * Shows the datepicker.
   */
  private showDropdown(): void {
    if (!this.htmlInput_) return;
    Blockly.utils.dom.addClass(this.htmlInput_!, 'blocklyDateInput');

    // NOTE: HTMLInputElement.showPicker() is not available in earlier
    // TypeScript versions (like 4.7.4), so casting to `any` to be compatible
    // with dev scripts. Additionally, it's not available for date inputs for 
    // Safari. For browser compatibility of showPicker, see:
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/showPicker
    /* eslint-disable @typescript-eslint/no-explicit-any */
    (this.htmlInput_ as any).showPicker();
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }

  /**
   * Create the html input and set it to type date.
   *
   * @returns The newly created date input editor.
   */
  protected widgetCreate_(): HTMLInputElement {
    // NOTE: field_input should return HTMLInputElement for this.
    const htmlInput = super.widgetCreate_() as HTMLInputElement;
    htmlInput.type = 'date';

    return htmlInput;
  }
  /* eslint-enable @typescript-eslint/naming-convention */
}

/**
 * Get the date in yyyy-mm-dd format to supply to the `value` attribute for an
 * HTML Input.
 *
 * @see {@link https://www.w3.org/TR/2011/WD-html-markup-20110405/input.date.html}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Date_and_time_formats#date_strings}
 * @param date The date to return the correctly formatted string for.
 * @returns The yyyy-mm-dd formatted date string or and empty string for an
 * invalid date.
 */
function getHTMLInputDateValue(date: Date): string {
  const year = date.getUTCFullYear();
  if (isNaN(year)) return '';
  const month = date.getUTCMonth() + 1;
  const dayOfTheMonth = date.getUTCDate();
  return `${year}-${getTwoDigits(month)}-${getTwoDigits(dayOfTheMonth)}`;
}

/**
 * Get the two digit string for a single or two digit number.
 *
 * @param num A one or two digit number.
 * @returns The two digit string for a number.
 */
function getTwoDigits(num: number): string {
  const numStr = `${num}`;
  return numStr.length === 1 ? `0${numStr}` : numStr;
}

/**
 * Get the string formatted locally to the user.
 * @param dateString A string in the format 'yyyy-mm-dd'
 * @returns the locale date string for the date.
 */
function getLocaleDateString(dateString: string): string {
  // NOTE: `date.toLocaleDateString()` will be the day before for western dates
  // due to an unspecified time & timezone assuming midnight at GMT+0.
  const date = new Date(dateString);

  // NOTE: This format varies per region.
  // Ex: "5/12/2023", "12/05/2023", "12.5.2023", "2023/5/12", "१२/५/२०२३"
  const language = navigator.language ?? 'en-US';
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat#using_options
  return Intl.DateTimeFormat(language, {
    // NOTE: Print the date for GMT+0 since the date object assumes midnight at 
    // GMT+0.
    timeZone: 'UTC',
  }).format(date);
}

/**
 * NOTE: There are a few minor ways to tweak the datepicker CSS, though they're 
 * not consistent across browsers.
 * @see{@link https://developer.mozilla.org/en-US/docs/Learn/Forms/Property_compatibility_table_for_form_controls#date_pickers}
 * 
 * Below are a few ways this can be tweaked on *some* browsers:
 * Blockly.Css.register(`
 * ::-webkit-datetime-edit { }
 * ::-webkit-datetime-edit-fields-wrapper { }
 * ::-webkit-datetime-edit-text { }
 * ::-webkit-datetime-edit-month-field { }
 * ::-webkit-datetime-edit-day-field { }
 * ::-webkit-datetime-edit-year-field { }
 * ::-webkit-inner-spin-button { }
 * ::-webkit-calendar-picker-indicator { }
 * `);
 */
if (Blockly.utils.userAgent.MAC) {
  // NOTE: By default, 4 px padding total are added within the User Agent 
  // Shadow Content on Safari on MAC. Remove the padding so the inner input 
  // matches the outer input's height and, by extension, the height of the text 
  // node.
  Blockly.Css.register(`
input.blocklyDateInput::-webkit-datetime-edit,
input.blocklyDateInput::-webkit-datetime-edit-month-field,
input.blocklyDateInput::-webkit-datetime-edit-day-field,
input.blocklyDateInput::-webkit-datetime-edit-year-field {
  padding: 0;
}
`);
}

Blockly.fieldRegistry.register('field_date', FieldDate);

/**
 * A config object for defining a field date.
 */
export type FieldDateConfig = Blockly.FieldTextInputConfig;

/**
 * Options used to define a field date from JSON.
 */
export interface FieldDateFromJsonConfig extends FieldDateConfig {
  date?: string;
  // NOTE: spellcheck is defined for FieldInput though irrelevant for FieldDate.
  // TODO: Confirm 'never' options. Should these be allowed with FieldDate? If
  // so, how would they be used?
  spellcheck?: never;
  tooltip?: never;
}

export type FieldDateValidator = Blockly.FieldTextInputValidator;

// NOTE: Set default here instead of in class so it's available at Field.
FieldDate.prototype.DEFAULT_VALUE = getHTMLInputDateValue(new Date());
