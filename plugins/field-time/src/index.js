/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Time input field.
 * @author carl.shen1@uwaterloo.ca (Carl Shen)
 */

import * as Blockly from 'blockly/core';

/**
 * Ensures that the input value is a valid time.
 * @param {*=} newValue The input value.
 * @return {?string} A valid time, or null if invalid.
 */
function timeValidator(newValue) {
  if (!newValue) {
    return null;
  }
  if (!/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/.test(newValue)) {
    return null;
  }
  return newValue;
}

/**
 * Class for a time input field.
 * @extends {Blockly.FieldTextInput}
 */
export class FieldTime extends Blockly.FieldTextInput {
  /**
   * Class for a time input field. Built using <input type='time'/> time picker
   * @param {string=} value The initial value of the field. Should be in
   *    '24-hour HH:MM' format. Defaults to 12:00.
   * @param {Function=} validator A function that is called to validate
   *    changes to the field's value. Takes in a time string & returns a
   *    validated time string ('HH:MM' format), or null to abort the
   *    change.
   */
  constructor(value = '12:00', validator = undefined) {
    const initial = timeValidator(value) || '12:00';
    super(initial, validator);
    this.CURSOR = 'pointer';
    this.timeInput = null;
  }

  /**
   * Constructs a FieldTime from a JSON arg object.
   * @param {!Object} options A JSON object with options (time).
   * @return {!FieldTime} The new field instance.
   * @package
   * @nocollapse
   */
  static fromJson(options) {
    return new FieldTime(options['time'], undefined);
  }

  /**
   * Ensures that the input value is a valid time.
   * @param {*=} newValue The input value.
   * @return {?string} A valid time, or null if invalid.
   * @protected
   */
  doClassValidation_(newValue = undefined) {
    return timeValidator(newValue);
  }

  /**
   * Create the time input editor widget.
   * Override the default text input to be a time input
   *
   * @return {!HTMLElement }The newly created time input editor.
   * @protected
   * @override
   */
  widgetCreate_() {
    const div = Blockly.WidgetDiv.getDiv();
    this.picker = super.widgetCreate_();
    this.picker.style.cursor = 'pointer';
    this.picker.setAttribute('type', 'time');
    this.picker.style.opacity = '0';
    this.picker.className = 'timePicker';
    this.picker.addEventListener('click', (e)=>{
      this.picker.showPicker(e);
    });
    div.appendChild(this.picker);
    return this.picker;
  }

  /**
   * Show the time picker
   * @param {Event=} e Optional mouse event that triggered the field to
   *     open, or undefined if triggered programmatically.
   * @protected
   * @override
   */
  showEditor_(e = undefined) {
    super.showEditor_(e);
    if (this.picker) {
      this.picker.showPicker();
    }
  }
}

Blockly.fieldRegistry.register('field_time', FieldTime);

/**
 * CSS for time field.
 */
Blockly.Css.register(`
.timePicker {
  opacity: 0;
}
input::-webkit-calendar-picker-indicator {
  cursor: pointer;
}
`);
