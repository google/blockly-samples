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
 * Slider field.
 */
export class FieldSlider extends Blockly.FieldNumber {
  /**
   * Class for an number slider field.
   * @param {string|number=} value The initial value of the field. Should
   *    cast to a number. Defaults to 0.
   * @param {?(string|number)=} min Minimum value.
   * @param {?(string|number)=} max Maximum value.
   * @param {?(string|number)=} precision Precision for value.
   * @param {?Function=} validator A function that is called to validate
   *    changes to the field's value. Takes in a number & returns a validated
   *    number, or null to abort the change.
   * @param {Object=} config A map of options used to configure the field.
   *    See the [field creation documentation]{@link
   * https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/number#creation}
   *    for a list of properties this parameter supports.
   * @extends {Blockly.FieldNumber}
   * @constructor
   */
  constructor(
      value = undefined, min = undefined, max = undefined,
      precision = undefined, validator = undefined, config = undefined) {
    super(value, min, max, precision, validator, config);

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
  static fromJson(options) {
    return new FieldSlider(
        options['value'], undefined, undefined, undefined, undefined, options);
  }

  /**
   * Show the inline free-text editor on top of the text along with the slider
   *    editor.
   * @param {Event=} e Optional mouse event that triggered the field to
   *     open, or undefined if triggered programmatically.
   * @param {boolean=} _quietInput Quiet input.
   * @protected
   * @override
   */
  showEditor_(e = undefined, _quietInput = undefined) {
    // Mobile browsers have issues with in-line textareas (focus & keyboards).
    const noFocus = Blockly.utils.userAgent.MOBILE ||
        Blockly.utils.userAgent.ANDROID || Blockly.utils.userAgent.IPAD;
    super.showEditor_(e, noFocus);
    // Build the DOM.
    const editor = this.dropdownCreate_();

    Blockly.DropDownDiv.getContentDiv().appendChild(editor);

    Blockly.DropDownDiv.setColour(
        this.sourceBlock_.style.colourPrimary,
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
    const wrapper = document.createElement('div');
    wrapper.className = 'fieldSliderContainer';
    const sliderInput = document.createElement('input');
    sliderInput.setAttribute('type', 'range');
    sliderInput.setAttribute('min', this.min_);
    sliderInput.setAttribute('max', this.max_);
    sliderInput.setAttribute('step', this.precision_);
    sliderInput.setAttribute('value', this.getValue());
    sliderInput.className = 'fieldSlider';
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
    for (const event of this.boundEvents_) {
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
      height: 32px;
      justify-content: center;
      width: 150px;
    }
    .fieldSlider {
      -webkit-appearance: none;
      background: transparent; /* override white in chrome */
      margin: 4px;
      padding: 0;
      width: 100%;
    }
    .fieldSlider:focus {
      outline: none;
    }
    /* Webkit */
    .fieldSlider::-webkit-slider-runnable-track {
      background: #ddd;
      border-radius: 5px;
      height: 10px;
    }
    .fieldSlider::-webkit-slider-thumb {
      -webkit-appearance: none;
      background: #fff;
      border-radius: 50%;
      box-shadow: 0 0 0 4px rgba(255,255,255,.15);
      cursor: pointer;
      height: 24px;
      margin-top: -7px;
      width: 24px;
    }
    /* Firefox */
    .fieldSlider::-moz-range-track {
      background: #ddd;
      border-radius: 5px;
      height: 10px;
    }
    .fieldSlider::-moz-range-thumb {
      background: #fff;
      border: none;
      border-radius: 50%;
      box-shadow: 0 0 0 4px rgba(255,255,255,.15);
      cursor: pointer;
      height: 24px;
      width: 24px;
    }
    .fieldSlider::-moz-focus-outer {
      /* override the focus border style */
      border: 0;
    }
    /* IE */
    .fieldSlider::-ms-track {
      /* IE wont let the thumb overflow the track, so fake it */
      background: transparent;
      border-color: transparent;
      border-width: 15px 0;
      /* remove default tick marks */
      color: transparent;
      height: 10px;
      width: 100%;
      margin: -4px 0;
    }
    .fieldSlider::-ms-fill-lower  {
      background: #ddd;
      border-radius: 5px;
    }
    .fieldSlider::-ms-fill-upper  {
      background: #ddd;
      border-radius: 5px;
    }
    .fieldSlider::-ms-thumb {
      background: #fff;
      border: none;
      border-radius: 50%;
      box-shadow: 0 0 0 4px rgba(255,255,255,.15);
      cursor: pointer;
      height: 24px;
      width: 24px;
    }`,
  /* eslint-enable indent */
]);
