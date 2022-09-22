/**
 * @license
 * Copyright 2015 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';

/**
 * @fileoverview Date input field.
 * @author pkendall64@gmail.com (Paul Kendall)
 */

goog.provide('Blockly.FieldDate');

goog.require('Blockly.Css');
goog.require('Blockly.Events');
goog.require('Blockly.Field');
goog.require('Blockly.FieldTextInput');
goog.require('Blockly.fieldRegistry');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.string');

goog.require('goog.date');
goog.require('goog.date.DateTime');
goog.require('goog.events');
goog.require('goog.i18n.DateTimeSymbols');
goog.require('goog.i18n.DateTimeSymbols_he');
goog.require('goog.ui.DatePicker');

/**
 * Class for a date input field.
 * @extends {Blockly.FieldTextInput}
 */
class FieldDate extends Blockly.FieldTextInput {
  /**
   * Class for a date input field. Derived from the Closure library date
   * picker.
   * @param {string=} value The initial value of the field. Should be in
   *    'YYYY-MM-DD' format. Defaults to the current date.
   * @param {Function=} validator A function that is called to validate
   *    changes to the field's value. Takes in a date string & returns a
   *    validated date string ('YYYY-MM-DD' format), or null to abort the
   *    change.
   * @param {?(boolean|string)=} textEdit Whether to enable text editor.
   */
  constructor(value = undefined, validator = undefined, textEdit = false) {
    super(value, validator);

    /**
     * Whether text editing is enabled on this field.
     * @type {boolean}
     * @private
     */
    this.textEditEnabled_ = textEdit == true || textEdit == 'true';
  }

  /**
   * Constructs a FieldDate from a JSON arg object.
   * @param {!Object} options A JSON object with options (date).
   * @return {!FieldDate} The new field instance.
   * @package
   * @nocollapse
   */
  static fromJson(options) {
    return new FieldDate(options['date'], undefined, options['textEdit']);
  }

  /**
   * Loads the best language pack by scanning the Blockly.Msg object for a
   * language that matches the available languages in Closure.
   * @private
   */
  static loadLanguage_() {
    for (const prop in goog.i18n) {
      if (prop.startsWith('DateTimeSymbols_')) {
        const lang = prop.substr(16).toLowerCase().replace('_', '.');
        // E.g. 'DateTimeSymbols_pt_BR' -> 'pt.br'
        if (goog.getObjectByName(lang, Blockly.Msg)) {
          goog.i18n.DateTimeSymbols = goog.i18n[prop];
          break;
        }
      }
    }
  }

  /**
   * Ensures that the input value is a valid date.
   * @param {*=} newValue The input value.
   * @return {?string} A valid date, or null if invalid.
   * @protected
   */
  doClassValidation_(newValue = undefined) {
    if (!newValue) {
      return null;
    }
    // Check if the new value is parsable or not.
    const date = goog.date.Date.fromIsoString(newValue);
    if (!date || date.toIsoString(true) != newValue) {
      return null;
    }
    return newValue;
  }

  /**
   * Renders the field. If the picker is shown make sure it has the current
   * date selected.
   * @protected
   */
  render_() {
    super.render_();
    if (this.picker_ && this.isTextValid_) {
      this.picker_.setDate(goog.date.Date.fromIsoString(this.getValue()));
      this.updateEditor_();
    }
  }

  /**
   * Updates the field's colours to match those of the block.
   * @package
   */
  applyColour() {
    this.todayColour_ = this.sourceBlock_.style.colourPrimary;
    this.selectedColour_ = this.sourceBlock_.style.colourSecondary;
    this.updateEditor_();
  }

  /**
   * Updates the picker to show the current date and currently selected date.
   * @private
   */
  updateEditor_() {
    if (!this.picker_) {
      // Nothing to update.
      return;
    }

    // Updating today should come before updating selected, so that if the
    // current day is selected, it will appear so.
    if (this.oldTodayElement_) {
      this.oldTodayElement_.style.backgroundColor = null;
      this.oldTodayElement_.style.color = null;
    }
    const today = this.picker_.getElementByClass('goog-date-picker-today');
    this.oldTodayElement_ = today;
    if (today) {
      today.style.backgroundColor = this.todayColour_;
      today.style.color = 'white';
    }

    if (this.oldSelectedElement_ && this.oldSelectedElement_ != today) {
      this.oldSelectedElement_.style.backgroundColor = null;
      this.oldSelectedElement_.style.color = null;
    }
    const selected =
        this.picker_.getElementByClass('goog-date-picker-selected');
    this.oldSelectedElement_ = selected;
    if (selected) {
      selected.style.backgroundColor = this.selectedColour_;
      selected.style.color = this.todayColour_;
    }
  }

  /**
   * Shows the inline free-text editor on top of the text along with the date
   * editor.
   * @param {Event=} e Optional mouse event that triggered the field to
   *     open, or undefined if triggered programmatically.
   * @param {boolean=} _quietInput Quiet input.
   * @protected
   * @override
   */
  showEditor_(e = undefined, _quietInput = undefined) {
    if (this.textEditEnabled_) {
      // Mobile browsers have issues with in-line textareas (focus & keyboards).
      const noFocus = Blockly.utils.userAgent.MOBILE ||
        Blockly.utils.userAgent.ANDROID ||
        Blockly.utils.userAgent.IPAD;
      super.showEditor_(e, noFocus);
    }
    // Build the DOM.
    this.showDropdown_();
  }

  /**
   * Shows the date dropdown editor.
   * @private
   */
  showDropdown_() {
    if (this.picker_) {
      // Already visible.
      return;
    }

    this.picker_ = this.dropdownCreate_();
    this.picker_.render(Blockly.DropDownDiv.getContentDiv());
    Blockly.utils.dom.addClass(this.picker_.getElement(), 'blocklyDatePicker');
    Blockly.DropDownDiv.setColour(
        this.DROPDOWN_BACKGROUND_COLOUR, this.DROPDOWN_BORDER_COLOUR);
    Blockly.DropDownDiv.showPositionedByField(
        this, this.dropdownDispose_.bind(this));

    this.updateEditor_();
  }

  /**
   * Creates the date dropdown editor.
   * @return {!goog.ui.DatePicker} The newly created date picker.
   * @private
   */
  dropdownCreate_() {
    // Create the date picker using Closure.
    FieldDate.loadLanguage_();
    const picker = new goog.ui.DatePicker();
    picker.setAllowNone(false);
    picker.setShowWeekNum(false);
    picker.setUseNarrowWeekdayNames(true);
    picker.setUseSimpleNavigationMenu(true);
    picker.setDate(goog.date.DateTime.fromIsoString(this.getValue()));

    this.changeEventKey_ = goog.events.listen(
        picker,
        goog.ui.DatePicker.Events.CHANGE,
        this.onDateSelected_,
        null,
        this);
    this.activeMonthEventKey_ = goog.events.listen(
        picker,
        goog.ui.DatePicker.Events.CHANGE_ACTIVE_MONTH,
        this.updateEditor_,
        null,
        this);

    return picker;
  }

  /**
   * Handles a click on the text input.
   * @param {!MouseEvent} e Mouse event.
   * @private
   */
  onClick_(e) {
    if (this.isTextValid_) {
      this.showDropdown_();
    }
  }

  /**
   * Binds handlers for user input on the text input field's editor.
   * @param {!HTMLElement} htmlInput The htmlInput to which event
   *    handlers will be bound.
   * @protected
   * @override
   */
  bindInputEvents_(htmlInput) {
    super.bindInputEvents_(htmlInput);

    this.onClickWrapper_ = Blockly.browserEvents.conditionalBind(htmlInput,
        'click', this, this.onClick_, true);
  }

  /**
   * Unbinds handlers for user input and workspace size changes.
   * @private
   * @override
   */
  unbindInputEvents_() {
    super.unbindInputEvents_();
    if (this.onClickWrapper_) {
      Blockly.browserEvents.unbind(this.onClickWrapper_);
      this.onClickWrapper_ = null;
    }
  }

  /**
   * Disposes of references to DOM elements and events belonging
   * to the date editor.
   * @private
   */
  dropdownDispose_() {
    this.picker_ = null;
    goog.events.unlistenByKey(this.changeEventKey_);
    goog.events.unlistenByKey(this.activeMonthEventKey_);
  }

  /**
   * Handles a CHANGE event in the date picker.
   * @param {!Event} event The CHANGE event.
   * @private
   */
  onDateSelected_(event) {
    if (this.isDirty_) {
      // Ignores date changes triggered during text edit.
      return;
    }
    const date = event.date ? event.date.toIsoString(true) : '';
    this.setEditorValue_(date);
    Blockly.WidgetDiv.hide();
    Blockly.DropDownDiv.hideIfOwner(this);
  }
}

/**
 * Serializable fields are saved by the XML renderer, non-serializable fields
 * are not. Editable fields should also be serializable.
 * @type {boolean}
 */
FieldDate.prototype.SERIALIZABLE = true;

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
FieldDate.prototype.CURSOR = 'text';

/**
 * Border colour for the dropdown div showing the date picker. Must be a CSS
 * string.
 * @type {string}
 * @private
 */
FieldDate.prototype.DROPDOWN_BORDER_COLOUR = 'silver';

/**
 * Background colour for the dropdown div showing the date picker. Must be a
 * CSS string.
 * @type {string}
 * @private
 */
FieldDate.prototype.DROPDOWN_BACKGROUND_COLOUR = 'white';

/**
 * The default value for this field (current date).
 * @type {*}
 * @protected
 */
FieldDate.prototype.DEFAULT_VALUE = (new goog.date.Date()).toIsoString(true);

/**
 * CSS for date picker.  See css.js for use.
 */
Blockly.Css.register(`
.blocklyDatePicker,
.blocklyDatePicker th,
.blocklyDatePicker td {
  font: 13px Arial, sans-serif;
  color: #3c4043;
}

.blocklyDatePicker th,
.blocklyDatePicker td {
  text-align: center;
  vertical-align: middle;
}

.blocklyDatePicker .goog-date-picker-wday,
.blocklyDatePicker .goog-date-picker-date {
  padding: 6px 6px;
}

.blocklyDatePicker button {
  cursor: pointer;
  padding: 6px 6px;
  margin: 1px 0;
  border: 0;
  color: #3c4043;
  font-weight: bold;
  background: transparent;
}

.blocklyDatePicker .goog-date-picker-previousMonth,
.blocklyDatePicker .goog-date-picker-nextMonth {
  height: 24px;
  width: 24px;
}

.blocklyDatePicker .goog-date-picker-monthyear {
  font-weight: bold;
}

.blocklyDatePicker .goog-date-picker-wday, 
.blocklyDatePicker .goog-date-picker-other-month {
  color: #70757a;
  border-radius: 12px;
}

.blocklyDatePicker button,
.blocklyDatePicker .goog-date-picker-date {
  cursor: pointer;
  background-color: rgb(218, 220, 224, 0);
  border-radius: 12px;
  transition: background-color,opacity 100ms linear;
}

.blocklyDatePicker button:hover,
.blocklyDatePicker .goog-date-picker-date:hover {
  background-color: rgb(218, 220, 224, .5);
}
`);

Blockly.fieldRegistry.register('field_date', FieldDate);

/**
 * Back up original getMsg function.
 * @type {!Function}
 */
goog.getMsgOrig = goog.getMsg;

/**
 * Gets a localized message.
 * Overrides the default Closure function to check for a Blockly.Msg first.
 * Used infrequently, only known case is TODAY button in date picker.
 * @param {string} str Translatable string, places holders in the form {$foo}.
 * @param {Object.<string, string>=} values Maps place holder name to value.
 * @return {string} Message with placeholders filled.
 */
goog.getMsg = function(str, values = undefined) {
  const key = goog.getMsg.blocklyMsgMap[str];
  if (key) {
    str = Blockly.Msg[key];
  }
  return goog.getMsgOrig(str, values);
};

/**
 * Mapping of Closure messages to Blockly.Msg names.
 */
goog.getMsg.blocklyMsgMap = {
  'Today': 'TODAY',
};
