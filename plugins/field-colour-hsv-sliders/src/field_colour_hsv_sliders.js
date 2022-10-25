/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Colour input field with HSV sliders.
 */

import * as Blockly from 'blockly/core';

/**
 * A structure with three properties r, g, and b, representing the amount of
 * red, green, and blue light in the sRGB colour space where 1 is the maximum
 * amount of light that can be displayed.
 */
class RgbColour {
  /**
   * The RgbColour constructor.
   * @param {number=} r The initial amount of red. Defaults to 0.
   * @param {number=} g The initial amount of green. Defaults to 0.
   * @param {number=} b The initial amount of blue. Defaults to 0.
   * @constructor
   */
  constructor(r = 0, g = 0, b = 0) {
    /**
     * The red component of the colour, ranging from 0 to 1.
     * @type {!number}
     */
    this.r = r;
    /**
     * The green component of the colour, ranging from 0 to 1.
     * @type {!number}
     */
    this.g = g;
    /**
     * The blue component of the colour, ranging from 0 to 1.
     * @type {!number}
     */
    this.b = b;
  }

  /**
   * Given a number from 0 to 1, returns a two-digit hexadecimal string from
   * '00' to 'ff'.
   * @param {number} x The amount of light in a component from 0 to 1.
   * @return {string} A hexadecimal representation from '00' to 'ff'.
   */
  static componentToHex(x) {
    if (x <= 0) return '00';
    if (x >= 1) return 'ff';
    return ('0' + ((x * 255 + 0.5) >>> 0).toString(16)).substr(-2);
  }

  /**
   * Returns a hexadecimal string in the format #rrggbb representing the colour.
   * @return {string} A hexadecimal representation of this colour.
   */
  toHex() {
    return '#' +
      RgbColour.componentToHex(this.r) +
      RgbColour.componentToHex(this.g) +
      RgbColour.componentToHex(this.b);
  }

  /**
   * Updates the properties of this instance to represent the same colour as the
   * provided string in the hexadecimal format #rrggbb.
   * @param {string} hex A hexadecimal string in the format '#rrggbb'.
   * @return {!RgbColour} This instance after updating it.
   */
  loadFromHex(hex) {
    this.r = parseInt(hex.slice(1, 3), 16) / 255;
    this.g = parseInt(hex.slice(3, 5), 16) / 255;
    this.b = parseInt(hex.slice(5, 7), 16) / 255;
    return this;
  }

  /**
   * Updates the properties of this instance to represent the same colour as the
   * provided HsvColour but in the sRGB colour space.
   * @param {!HsvColour} hsv An HSV representation of a colour to copy.
   * @return {!RgbColour} This instance after updating it.
   */
  loadFromHsv(hsv) {
    const hue = (hsv.h - Math.floor(hsv.h)) * 6;
    this.r = hsv.v * (1 - hsv.s * Math.max(0, Math.min(1,
        2 - Math.abs(hue - 3))));
    this.g = hsv.v * (1 - hsv.s * Math.max(0, Math.min(1,
        Math.abs(hue - 2) - 1)));
    this.b = hsv.v * (1 - hsv.s * Math.max(0, Math.min(1,
        Math.abs(hue - 4) - 1)));
    return this;
  }
}

/**
 * A structure with three properties h, s, and v, representing the hue,
 * saturation, and brightness in a colour. All three properties range from 0
 * to 1.
 */
class HsvColour {
  /**
   * The HsvColour constructor.
   * @param {number=} h The initial hue of the colour. Defaults to 0.
   * @param {number=} s The initial amount of saturation. Defaults to 0.
   * @param {number=} v The initial amount of brightness. Defaults to 0.
   * @constructor
   */
  constructor(h = 0, s = 0, v = 0) {
    /**
     * The hue of the colour, ranging from 0 to 1.
     * @type {!number}
     */
    this.h = h;
    /**
     * The saturation of the colour, ranging from 0 to 1.
     * @type {!number}
     */
    this.s = s;
    /**
     * The brightness of the colour, ranging from 0 to 1.
     * @type {!number}
     */
    this.v = v;
  }

  /**
   * Updates the properties of this instance to represent the same colour as the
   * provided RgbColour but in the HSV colour space.
   * @param {!RgbColour} rgb An RGB representation of a colour to copy.
   * @return {!HsvColour} This instance after updating it.
   */
  loadFromRgb(rgb) {
    const max = Math.max(Math.max(rgb.r, rgb.g), rgb.b);
    const min = Math.min(Math.min(rgb.r, rgb.g), rgb.b);
    this.v = max;
    if (min == max) {
      this.h = 0;
      this.s = 0;
      return this;
    }

    const delta = (max - min);
    this.s = delta / max;

    let hue;
    if (rgb.r == max) {
      hue = (rgb.g - rgb.b) / delta;
    } else if (rgb.g == max) {
      hue = 2 + ((rgb.b - rgb.r) / delta);
    } else {
      hue = 4 + ((rgb.r - rgb.g) / delta);
    }
    hue /= 6;
    this.h = hue - Math.floor(hue);
    return this;
  }

  /**
   * Updates the properties of this instance to copy the provided HsvColour.
   * @param {!HsvColour} other An HSV representation of a colour to copy.
   * @return {!HsvColour} This instance after updating it.
   */
  copy(other) {
    this.h = other.h;
    this.s = other.s;
    this.v = other.v;
    return this;
  }
}

/**
 * Class for a colour input field that displays HSV slider widgets when clicked.
 * @extends {Blockly.FieldColour}
 * @alias Blockly.FieldColourHsvSliders
 */
export class FieldColourHsvSliders extends Blockly.FieldColour {
  /**
   * The maximum value of the hue slider range.
   * @const {!number}
   * @private
   */
  static HUE_SLIDER_MAX_ = 360;

  /**
   * The maximum value of the saturation slider range.
   * @const {!number}
   * @private
   */
  static SATURATION_SLIDER_MAX_ = 100;

  /**
   * The maximum value of the brightness slider range.
   * @const {!number}
   * @private
   */
  static BRIGHTNESS_SLIDER_MAX_ = 100;

  /**
   * The gradient control point positions should align with the center of the
   * slider thumb when the corresponding colour is selected. When the slider
   * is at the minimum or maximum value, the distance of center of the thumb
   * from the edge of the track will be the thumb's radius, so that's how far
   * the minimum and maximum control points should be.
   * @const {!number}
   */
  static THUMB_RADIUS = 12;

  /**
   * Helper colour structures to allow manipulation in the HSV colour space.
   * @const {!HsvColour}
   * @private
   */
  static helperHsv_ = new HsvColour();

  /**
   * Helper colour structures to support conversion to the RGB colour space.
   * @const {!RgbColour}
   * @private
   */
  static helperRgb_ = new RgbColour();

  /**
   * Class for an HSV colour sliders field.
   * @param {(string|!Blockly.Sentinel)=} value The initial value of the
   *     field. Should be in '#rrggbb' format.
   *     Also accepts Field.SKIP_SETUP if you wish to skip setup (only used by
   *     subclasses that want to handle configuration and setting the field
   *     value after their own constructors have run).
   * @param {Function=} validator A function that is called to validate
   *     changes to the field's value. Takes in a colour string & returns a
   *     validated colour string ('#rrggbb' format), or null to abort the
   *     change.
   * @param {Object=} config A map of options used to configure the field.
   *     See the [field creation documentation]{@link
   *     https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/colour}
   *     for a list of properties this parameter supports.
   * @constructor
   */
  constructor(
      value = undefined, validator = undefined, config = undefined) {
    super(value, validator, config);

    /**
     * Array holding info needed to unbind events. Used for disposing.
     * @type {!Array<?>}
     * @private
     */
    this.boundEvents_ = [];

    /**
     * HTML span element to display the current hue.
     * @type {?HTMLSpanElement}
     * @private
     */
    this.hueReadout_ = null;

    /**
     * HTML range input element for editing hue.
     * @type {?HTMLInputElement}
     * @private
     */
    this.hueSlider_ = null;

    /**
     * HTML span element to display the current saturation.
     * @type {?HTMLSpanElement}
     * @private
     */
    this.saturationReadout_ = null;

    /**
     * HTML range input element for editing saturation.
     * @type {?HTMLInputElement}
     * @private
     */
    this.saturationSlider_ = null;

    /**
     * HTML span element to display the current brightness.
     * @type {?HTMLSpanElement}
     * @private
     */
    this.brightnessReadout_ = null;

    /**
     * HTML range input element for editing brightness.
     * @type {?HTMLInputElement}
     * @private
     */
    this.brightnessSlider_ = null;

    /**
     * HTML div element containing all the labels and sliders.
     * @type {?HTMLDivElement}
     * @private
     */
    this.dropdownContainer_ = null;
  }

  /**
   * Create and show the colour field's editor.
   * @protected
   * @override
   */
  showEditor_() {
    this.createDropdownSliders_();
    Blockly.DropDownDiv.getContentDiv().appendChild(this.dropdownContainer_);

    Blockly.DropDownDiv.showPositionedByField(
        this, this.dropdownDisposeSliders_.bind(this));

    // Focus so we can start receiving keyboard events.
    this.hueSlider_.focus({preventScroll: true});
  }

  /**
   * Creates a row with a slider label and a readout to display the slider
   * value, appends it to the provided container, and returns the readout.
   * @param {string} name The display name of the slider.
   * @param {!HTMLElement} container Where the row will be inserted.
   * @return {!HTMLSpanElement} The readout, so that it can be updated.
   * @private
   */
  static createLabelInContainer_(name, container) {
    const label = document.createElement('div');
    const labelText = document.createElement('span');
    const readout = document.createElement('span');
    label.classList.add('fieldColourSliderLabel');
    labelText.textContent = name;
    label.appendChild(labelText);
    label.appendChild(readout);
    container.appendChild(label);
    return readout;
  }

  /**
   * Creates a slider, appends it to the provided container, and returns it.
   * @param {number} max The maximum value of the slider.
   * @param {number} step The minimum step size of the slider.
   * @param {!HTMLElement} container Where the row slider be inserted.
   * @return {!HTMLInputElement} The slider.
   * @private
   */
  static createSliderInContainer_(max, step, container) {
    const slider = document.createElement('input');
    slider.classList.add('fieldColourSlider');
    slider.type = 'range';
    slider.min = String(0);
    slider.max = String(max);
    slider.step = String(step);
    container.appendChild(slider);
    return slider;
  }

  /**
   * Creates the colour picker slider editor and adds event listeners.
   * @private
   */
  createDropdownSliders_() {
    const container = document.createElement('div');
    container.classList.add('fieldColourSliderContainer');

    this.hueReadout_ = FieldColourHsvSliders.createLabelInContainer_(
        'Hue', container);
    this.hueSlider_ = FieldColourHsvSliders.createSliderInContainer_(
        FieldColourHsvSliders.HUE_SLIDER_MAX_, 2, container);
    this.saturationReadout_ = FieldColourHsvSliders.createLabelInContainer_(
        'Saturation', container);
    this.saturationSlider_ = FieldColourHsvSliders.createSliderInContainer_(
        FieldColourHsvSliders.SATURATION_SLIDER_MAX_, 1, container);
    this.brightnessReadout_ = FieldColourHsvSliders.createLabelInContainer_(
        'Brightness', container);
    this.brightnessSlider_ = FieldColourHsvSliders.createSliderInContainer_(
        FieldColourHsvSliders.BRIGHTNESS_SLIDER_MAX_, 1, container);

    this.boundEvents_.push(
        Blockly.browserEvents.conditionalBind(
            this.hueSlider_, 'input', this, this.onSliderChange_));
    this.boundEvents_.push(
        Blockly.browserEvents.conditionalBind(
            this.saturationSlider_, 'input', this, this.onSliderChange_));
    this.boundEvents_.push(
        Blockly.browserEvents.conditionalBind(
            this.brightnessSlider_, 'input', this, this.onSliderChange_));

    if (window.EyeDropper) {
      // If the browser supports the eyedropper API, create a button for it.
      const button = document.createElement('button');
      button.classList.add('fieldColourEyedropper');
      container.appendChild(document.createElement('hr'));
      container.appendChild(button);
      this.boundEvents_.push(
          Blockly.browserEvents.conditionalBind(
              button, 'click', this, this.onEyedropperEvent_));
    }

    this.dropdownContainer_ = container;

    this.updateSliderValues_();
  }

  /**
   * Disposes of events and DOM-references belonging to the colour editor.
   * @private
   */
  dropdownDisposeSliders_() {
    for (const event of this.boundEvents_) {
      Blockly.browserEvents.unbind(event);
    }
    this.boundEvents_.length = 0;
    this.hueReadout_ = null;
    this.hueSlider_ = null;
    this.saturationReadout_ = null;
    this.saturationSlider_ = null;
    this.brightnessReadout_ = null;
    this.brightnessSlider_ = null;
    this.dropdownContainer_ = null;
  }

  /**
   * A helper function that converts a colour, specified by the provided hue,
   * saturation, and brightness parameters, into a hexadecimal string in the
   * format "#rrggbb".
   * @param {number} hue The hue of the colour.
   * @param {number} saturation The saturation of the colour.
   * @param {number} brightness The brightness of the colour.
   * @return {!string} A hexadecimal representation of the colour in the format
   *   "#rrggbb"
   * @private
   */
  static hsvToHex_(hue, saturation, brightness) {
    FieldColourHsvSliders.helperHsv_.h = hue;
    FieldColourHsvSliders.helperHsv_.s = saturation;
    FieldColourHsvSliders.helperHsv_.v = brightness;
    return FieldColourHsvSliders.helperRgb_.loadFromHsv(
        FieldColourHsvSliders.helperHsv_).toHex();
  }

  /**
   * Updates the value of this field based on the editor sliders.
   * @param {?Event} event Unused.
   * @private
   */
  onSliderChange_(event) {
    const hue = parseFloat(this.hueSlider_.value) /
        FieldColourHsvSliders.HUE_SLIDER_MAX_;
    const saturation = parseFloat(this.saturationSlider_.value) /
        FieldColourHsvSliders.SATURATION_SLIDER_MAX_;
    const brightness = parseFloat(this.brightnessSlider_.value) /
        FieldColourHsvSliders.BRIGHTNESS_SLIDER_MAX_;
    this.doValueUpdate_(FieldColourHsvSliders.hsvToHex_(
        hue, saturation, brightness));
    this.renderSliders_();
  }

  /**
   * Updates the value of this field and editor sliders using an eyedropper.
   * @param {?Event} event Unused.
   * @private
   */
  onEyedropperEvent_(event) {
    const eyeDropper = new window.EyeDropper();
    eyeDropper.open().then((result) => {
      this.doValueUpdate_(result.sRGBHex);
      this.updateSliderValues_();
    });
  }

  /**
   * Updates the gradient backgrounds of the slider tracks and readouts based
   * on the slider values.
   * @private
   */
  renderSliders_() {
    this.hueReadout_.textContent = this.hueSlider_.value;
    this.saturationReadout_.textContent = this.saturationSlider_.value;
    this.brightnessReadout_.textContent = this.brightnessSlider_.value;

    const h = parseFloat(this.hueSlider_.value) /
        FieldColourHsvSliders.HUE_SLIDER_MAX_;
    const s = parseFloat(this.saturationSlider_.value) /
        FieldColourHsvSliders.SATURATION_SLIDER_MAX_;
    const v = parseFloat(this.brightnessSlider_.value) /
        FieldColourHsvSliders.BRIGHTNESS_SLIDER_MAX_;

    // The hue slider needs intermediate gradient control points to include all
    // colours of the rainbow.
    let hueGradient = 'linear-gradient(to right, ';
    hueGradient += FieldColourHsvSliders.hsvToHex_(0/6, s, v) +
        ` ${FieldColourHsvSliders.THUMB_RADIUS}px, `;
    hueGradient += FieldColourHsvSliders.hsvToHex_(1/6, s, v) + ', ';
    hueGradient += FieldColourHsvSliders.hsvToHex_(2/6, s, v) + ', ';
    hueGradient += FieldColourHsvSliders.hsvToHex_(3/6, s, v) + ', ';
    hueGradient += FieldColourHsvSliders.hsvToHex_(4/6, s, v) + ', ';
    hueGradient += FieldColourHsvSliders.hsvToHex_(5/6, s, v) + ', ';
    hueGradient += FieldColourHsvSliders.hsvToHex_(6/6, s, v) +
        ` calc(100% - ${FieldColourHsvSliders.THUMB_RADIUS}px))`;
    this.hueSlider_.style.setProperty('--slider-track-background', hueGradient);

    // The saturation slider only needs gradient control points at each end.
    let saturationGradient = 'linear-gradient(to right, ';
    saturationGradient += FieldColourHsvSliders.hsvToHex_(h, 0, v) +
        ` ${FieldColourHsvSliders.THUMB_RADIUS}px, `;
    saturationGradient += FieldColourHsvSliders.hsvToHex_(h, 1, v) +
        ` calc(100% - ${FieldColourHsvSliders.THUMB_RADIUS}px))`;
    this.saturationSlider_.style.setProperty(
        '--slider-track-background', saturationGradient);

    // The brightness slider only needs gradient control points at each end.
    let brightnessGradient = 'linear-gradient(to right, ';
    brightnessGradient += FieldColourHsvSliders.hsvToHex_(h, s, 0) +
        ` ${FieldColourHsvSliders.THUMB_RADIUS}px, `;
    brightnessGradient += FieldColourHsvSliders.hsvToHex_(h, s, 1) +
        ` calc(100% - ${FieldColourHsvSliders.THUMB_RADIUS}px))`;
    this.brightnessSlider_.style.setProperty(
        '--slider-track-background', brightnessGradient);
  }

  /**
   * Updates slider values based on the current value of the field.
   * @private
   */
  updateSliderValues_() {
    if (!this.hueSlider_) {
      return;
    }

    const hsv = FieldColourHsvSliders.helperHsv_.loadFromRgb(
        FieldColourHsvSliders.helperRgb_.loadFromHex(this.getValue()));

    this.hueSlider_.value =
        String(hsv.h * FieldColourHsvSliders.HUE_SLIDER_MAX_);
    this.saturationSlider_.value =
        String(hsv.s * FieldColourHsvSliders.SATURATION_SLIDER_MAX_);
    this.brightnessSlider_.value =
        String(hsv.v * FieldColourHsvSliders.BRIGHTNESS_SLIDER_MAX_);

    this.renderSliders_();
  }
}

Blockly.fieldRegistry.register(
    'field_colour_hsv_sliders', FieldColourHsvSliders);

// CSS for colour slider fields.
Blockly.Css.register(`
.fieldColourSliderContainer {
  padding: 4px;
}
.fieldColourSliderContainer hr {
  border: none;
  border-top: 1px solid #bbb;
}
.fieldColourSliderLabel {
  display: flex;
  justify-content: space-between;
}
.fieldColourEyedropper {
  appearance: none;
  position: relative;
  border: none;
  border-radius: 4px;
  background: transparent;
  font: inherit;
  color: inherit;
  cursor: pointer;
  width: 100%;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
.fieldColourEyedropper:hover {
  background: rgba(0,0,0,0.1)
}
.fieldColourEyedropper input {
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.fieldColourEyedropper::before {
  content: "Eyedropper";
}
.fieldColourEyedropper::after {
  content: "";
  margin-left: 8px;
  width: 24px;
  height: 24px;
  background: currentColor;
  pointer-events: none;
  -webkit-mask-image: var(--customize-dial-symbol);
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-image: var(--customize-dial-symbol);
  mask-repeat: no-repeat;
  mask-position: center;
  --customize-dial-symbol: url('data:image/svg+xml,\
    <svg xmlns="http://www.w3.org/2000/svg" \
         width="24px" height="24px" \
         viewBox="0 0 24 24"> \
      <path stroke="black" strokewidth="1.414" fill="none" \
            d="m 13 8 L 6 15 Q 3 18 2 21 Q 0 23 .5 23.5 Q 1 24 3 22 \
                Q 6 21 9 18 L 16 11"/> \
      <path fill="black" \
            d="m 12 7 Q 11 6 12 5 Q 13 4 14 5 Q 15 6 16 5 Q 20 -1 22.5 1.5 \
                Q 25 4 19 8 Q 18 9 19 10 Q 20 11 19 12 Q 18 13 17 12"/> \
    </svg>');
}
.fieldColourSlider {
  -webkit-appearance: none;
  width: 150px;
  height: 24px;
  margin: 4px 8px 24px 8px;
  padding: 0;
}
.fieldColourSlider:last-child {
  margin-bottom: 4px;
}
.fieldColourSlider:focus {
  outline: none;
}
/* Webkit */
.fieldColourSlider::-webkit-slider-runnable-track {
  background: var(--slider-track-background);
  border-radius: 8px;
  height: 16px;
}
.fieldColourSlider::-webkit-slider-thumb {
  -webkit-appearance: none;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(0,0,0,.15);
  cursor: pointer;
  width: ${FieldColourHsvSliders.THUMB_RADIUS * 2}px;
  height: ${FieldColourHsvSliders.THUMB_RADIUS * 2}px;
  margin-top: -4px;
}
/* Firefox */
.fieldColourSlider::-moz-range-track {
  background: var(--slider-track-background);
  border-radius: 8px;
  height: 16px;
}
.fieldColourSlider::-moz-range-thumb {
  background: #fff;
  border: none;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(0,0,0,.15);
  cursor: pointer;
  width: ${FieldColourHsvSliders.THUMB_RADIUS * 2}px;
  height: ${FieldColourHsvSliders.THUMB_RADIUS * 2}px;
}
.fieldColourSlider::-moz-focus-outer {
  /* override the focus border style */
  border: 0;
}
/* IE */
.fieldColourSlider::-ms-track {
  background: var(--slider-track-background);
  border-radius: 12px;
  width: 100%;
  height: 24px;
  /* remove default tick marks */
  color: transparent;
}
.fieldColourSlider::-ms-fill-lower  {
  background: transparent;
}
.fieldColourSlider::-ms-fill-upper  {
  background: transparent;
}
.fieldColourSlider::-ms-thumb {
  background: #fff;
  border: none;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(0,0,0,.15);
  cursor: pointer;
  width: ${FieldColourHsvSliders.THUMB_RADIUS * 2}px;
  height: ${FieldColourHsvSliders.THUMB_RADIUS * 2}px;
}
`);
