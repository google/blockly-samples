/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Number slider input field.
 * @author kozbial@google.com (Monica Kozbial)
 */

import * as Blockly from 'blockly/core';

/**
 * Class for an slider number field.
 * @param {string|number=} opt_value The initial value of the field. Should cast
 *    to a number. Defaults to 0.
 * @param {?(string|number)=} opt_min Minimum value.
 * @param {?(string|number)=} opt_max Maximum value.
 * @param {?(string|number)=} opt_precision Precision for value.
 * @param {?Function=} opt_validator A function that is called to validate
 *    changes to the field's value. Takes in a number & returns a validated
 *    number, or null to abort the change.
 * @param {Object=} opt_config A map of options used to configure the field.
 *    See the [field creation documentation]{@link https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/number#creation}
 *    for a list of properties this parameter supports.
 * @extends {Blockly.FieldNumber}
 * @constructor
 */
export const FieldSlider = function(opt_value, opt_min, opt_max, opt_precision,
    opt_validator, opt_config) {
  FieldSlider.superClass_.constructor.call(this, opt_value, opt_min,
      opt_max, opt_precision, opt_validator, opt_config);
};
Blockly.utils.object.inherits(FieldSlider, Blockly.FieldNumber);

/**
 * Constructs a FieldSlider from a JSON arg object.
 * @param {!Object} options A JSON object with options (value, min, max, and
 *                          precision).
 * @return {!FieldSlider} The new field instance.
 * @package
 * @nocollapse
 */
FieldSlider.fromJson = function(options) {
  return new FieldSlider(options['value'],
      undefined, undefined, undefined, undefined, options);
};

/**
 * Creates and shows the slider field's editor.
 * @protected
 * @override
 */
FieldSlider.prototype.showEditor_ = function() {
  // Build the DOM.
  var editor = this.dropdownCreate_();

  Blockly.DropDownDiv.getContentDiv().appendChild(editor);

  Blockly.DropDownDiv.setColour(this.sourceBlock_.style.colourPrimary,
      this.sourceBlock_.style.colourTertiary);

  Blockly.DropDownDiv.showPositionedByField(
      this, this.dropdownDispose_.bind(this));
};

/**
 * Creates the slider editor and add event listeners.
 * @return {!Element} The newly created slider.
 * @private
 */
FieldSlider.prototype.dropdownCreate_ = function() {
  var wrapper = document.createElement('div');
  var sliderInput = document.createElement('input');
  sliderInput.setAttribute('type', 'range');
  sliderInput.setAttribute('min', this.min_);
  sliderInput.setAttribute('max', this.max_);
  sliderInput.setAttribute('value', this.getValue());
  sliderInput.className ='fieldSlider';
  wrapper.appendChild(sliderInput);
  this.sliderInput_ = sliderInput;

  this.sliderListener_ = Blockly.bindEventWithChecks_(
      sliderInput, 'input', this, this.onSliderChange_);
  return wrapper;
};

/**
 * Disposes of events belonging to the slider editor.
 * @private
 */
FieldSlider.prototype.dropdownDispose_ = function() {
  this.sliderInput_ = null;
  Blockly.unbindEvent_(this.sliderListener_);
};

/**
 * Updates the slider when the field rerenders.
 * @private
 * @override
 */
FieldSlider.prototype.render_ = function() {
  FieldSlider.superClass_.render_.call(this);
  this.updateSlider_();
};

/**
 * Sets the text to match the slider's position.
 * @param {!Event} e Mouse move event.
 * @protected
 */
FieldSlider.prototype.onSliderChange_ = function(e) {
  this.setEditorValue_(this.sliderInput_.value);
};

/**
 * Updates the slider when the field rerenders.
 * @private
 * @override
 */
FieldSlider.prototype.updateSlider_ = function() {
  if (!this.sliderInput_) {
    return;
  }
  this.sliderInput_.setAttribute('value', this.getValue());
};

Blockly.fieldRegistry.register('field_slider', FieldSlider);

/**
 * CSS for slider field.
 */
Blockly.Css.register([
  /* eslint-disable indent */
  '.fieldSlider {',
  'appearance: none;',
  '-webkit-appearance: none;',
  'background: #ddd;',
  'border-radius: 5px;',
  'height: 5px;',
  'opacity: 1;',
  'outline: none;',
  '}',
  /* Webkit */
  '.fieldSlider::-webkit-slider-thumb {',
  '-webkit-appearance: none;',
  'background: #fff;',
  'border-color: #fff;',
  'border-radius: 50%;',
  'cursor: pointer;',
  'height: 10px;',
  'opacity: 1;',
  'width: 10px;',
  '}',
  /* Firefox */
  '.fieldSlider::-moz-range-thumb {',
  'border-color: #fff;',
  'border-radius: 50%;',
  'background: #fff;',
  'cursor: pointer;',
  'height: 10px;',
  'width: 10px;',
  '}',
  '.fieldSlider::-moz-focus-outer {',
  /* override the focus border style */
  'border: 0',
  '}',
  /* IE */
  '.fieldSlider::-ms-track {',
  /* IE wont let the thumb overflow the track, so fake it */
  'background: transparent;',
  'border-color: transparent;',
  'border-width: 3px 0;',
  /* remove default tick marks */
  'color: transparent;',
  '}',
  '.fieldSlider::-ms-fill-lower  {',
  'border-radius: 5px;',
  'background: #ddd;',
  '}',
  '.fieldSlider::-ms-fill-upper  {',
  'border-radius: 5px;',
  'background: #ddd;',
  '}',
  '.fieldSlider::-ms-thumb {',
  'border-color: #fff;',
  'border-radius: 50%;',
  'background: #fff;',
  'cursor: pointer;',
  'height: 10px;',
  'width: 10px;',
  '}',
  /* eslint-enable indent */
]);

