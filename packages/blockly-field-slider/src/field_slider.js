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

export class FieldSlider extends Blockly.FieldNumber {
  /**
   * Class for an number slider field.
   * @param {string|number=} opt_value The initial value of the field. Should
   *    cast to a number. Defaults to 0.
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
  constructor(opt_value, opt_min, opt_max, opt_precision,
      opt_validator, opt_config) {
    super(opt_value, opt_min, opt_max, opt_precision, opt_validator, opt_config);

    /**
     * Array holding info needed to unbind events.
     * Used for disposing.
     * Ex: [[node, name, func], [node, name, func]].
     * @type {!Array.<Array<?>>}
     * @private
     */
    this.boundEvents_ = [];

    /**
     * The HTML range input element.
     * @type {?HTMLInputElement}
     * @private
     */
    this.sliderInput_ = null;
  }

  /**
   * Constructs a FieldSlider from a JSON arg object.
   * @param {!Object} options A JSON object with options (value, min, max, and
   *                          precision).
   * @return {!FieldSlider} The new field instance.
   * @package
   * @nocollapse
   */
  static fromJson (options) {
    return new FieldSlider(options['value'],
        undefined, undefined, undefined, undefined, options);
  }

  /**
   * Show the inline free-text editor on top of the text along with the slider
   *    editor.
   * @param {Event=} _opt_e Optional mouse event that triggered the field to open,
   *     or undefined if triggered programmatically.
   * @param {boolean=} opt_quietInput True if editor should be created without
   *     focus.  Defaults to false.
   * @protected
   * @override
   */
  showEditor_(_opt_e, opt_quietInput) {
    super.showEditor_(_opt_e, opt_quietInput);
    // Build the DOM.
    var editor = this.dropdownCreate_();

    Blockly.DropDownDiv.getContentDiv().appendChild(editor);

    Blockly.DropDownDiv.setColour(this.sourceBlock_.style.colourPrimary,
        this.sourceBlock_.style.colourTertiary);

    Blockly.DropDownDiv.showPositionedByField(
        this, this.dropdownDispose_.bind(this));
  }

  /**
   * Updates the slider when the field rerenders.
   * @protected
   * @override
   */
  render_() {
    super.render_();
    this.updateSlider_();
  }

  /**
   * Creates the slider editor and add event listeners.
   * @return {!Element} The newly created slider.
   * @private
   */
  dropdownCreate_() {
    var wrapper = document.createElement('div');
    wrapper.className = 'fieldSliderContainer';
    var sliderInput = document.createElement('input');
    sliderInput.setAttribute('type', 'range');
    sliderInput.setAttribute('min', this.min_);
    sliderInput.setAttribute('max', this.max_);
    sliderInput.setAttribute('value', this.getValue());
    sliderInput.className ='fieldSlider';
    wrapper.appendChild(sliderInput);
    this.sliderInput_ = sliderInput;

    this.boundEvents_.push(Blockly.bindEventWithChecks_(
        sliderInput, 'input', this, this.onSliderChange_));

    return wrapper;
  }

  /**
   * Disposes of events belonging to the slider editor.
   * @private
   */
  dropdownDispose_() {
    for (let event of this.boundEvents_) {
      Blockly.unbindEvent_(event);
    }
    this.sliderInput_ = null;
  }

  /**
   * Sets the text to match the slider's position.
   * @private
   */
  onSliderChange_() {
    this.setEditorValue_(this.sliderInput_.value);
  }

  /**
   * Updates the slider when the field rerenders.
   * @private
   */
  updateSlider_() {
    if (!this.sliderInput_) {
      return;
    }
    this.sliderInput_.setAttribute('value', this.getValue());
  }
}

Blockly.fieldRegistry.register('field_slider', FieldSlider);

/**
 * CSS for slider field.
 */
Blockly.Css.register([
    /* eslint-disable indent */
    `.fieldSliderContainer {
      align-items: center;
      display: flex;
      height: 25px;
      justify-content: center;
    }
    .fieldSlider {
      appearance: none;
      -webkit-appearance: none;
      background: #ddd;
      border-radius: 5px;
      height: 5px;
      opacity: 1;
      outline: none;
    }
    /* Webkit */
    .fieldSlider::-webkit-slider-thumb {
      -webkit-appearance: none;
      background: #fff;
      border-color: #fff;
      border-radius: 50%;
      cursor: pointer;
      height: 20px;
      opacity: 1;
      width: 20px;
    }
    /* Firefox */
    .fieldSlider::-moz-range-thumb {
      border-color: #fff;
      border-radius: 50%;
      background: #fff;
      cursor: pointer;
      height: 20px;
      width: 20px;
    }
    .fieldSlider::-moz-focus-outer {
      /* override the focus border style */
      border: 0;
    }`
    /* eslint-enable indent */
]);

