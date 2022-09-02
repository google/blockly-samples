/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Colour input field with HSV sliders.
 * @author nesky@google.com (John Nesky)
 */

import * as Blockly from 'blockly/core';

/**
 * A structure with three properties r, g, and b, representing the amount of
 * red, green, and blue light in the sRGB colour space where 1.0 is the maximum
 * amount of light that can be displayed.
 */
class RgbColour {
  /**
   * The RgbColour constructor.
   * @param {number=} r The initial amount of red. Defaults to 0.0.
   * @param {number=} g The initial amount of green. Defaults to 0.0.
   * @param {number=} b The initial amount of blue. Defaults to 0.0.
   * @constructor
   */
  constructor(r = undefined, g = undefined, b = undefined) {
    this.r = r || 0.0;
    this.g = g || 0.0;
    this.b = b || 0.0;
  }

  /**
   * Given a number from 0.0 to 1.0, returns a two-digit hexadecimal string from
   * '00' to 'ff'.
   * @param {number} x The amount of light in a component from 0.0 to 1.0.
   * @return {string} A hexadecimal representation from '00' to 'ff'.
   */
  static componentToHex(x) {
    if (x <= 0.0) return '00';
    if (x >= 1.0) return 'ff';
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
    this.r = parseInt(hex.slice(1, 3), 16) / 255.0;
    this.g = parseInt(hex.slice(3, 5), 16) / 255.0;
    this.b = parseInt(hex.slice(5, 7), 16) / 255.0;
    return this;
  }

  /**
   * Updates the properties of this instance to represent the same colour as the
   * provided HsvColour but in the sRGB colour space.
   * @param {!HsvColour} hsv An HSV representation of a colour to copy.
   * @return {!RgbColour} This instance after updating it.
   */
  loadFromHsv(hsv) {
    const hue = (hsv.h - Math.floor(hsv.h)) * 6.0;
    this.r = hsv.v * (1.0 - hsv.s * Math.max(0.0, Math.min(1.0,
        2.0 - Math.abs(hue - 3.0))));
    this.g = hsv.v * (1.0 - hsv.s * Math.max(0.0, Math.min(1.0,
        Math.abs(hue - 2.0) - 1.0)));
    this.b = hsv.v * (1.0 - hsv.s * Math.max(0.0, Math.min(1.0,
        Math.abs(hue - 4.0) - 1.0)));
    return this;
  }
}

/**
 * A structure with three properties h, s, and v, representing the hue,
 * saturation, and brightness in a colour. All three properties range from 0.0
 * to 1.0.
 */
class HsvColour {
  /**
   * The HsvColour constructor.
   * @param {number=} h The initial hue of the colour. Defaults to 0.0.
   * @param {number=} s The initial amount of saturation. Defaults to 0.0.
   * @param {number=} v The initial amount of brightness. Defaults to 0.0.
   * @constructor
   */
  constructor(h = undefined, s = undefined, v = undefined) {
    this.h = h || 0.0;
    this.s = s || 0.0;
    this.v = v || 0.0;
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
    hue /= 6.0;
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

  /**
   * Sets the hue to the provided value.
   * @param {number} h The hue of the colour.
   * @return {!HsvColour} This instance after updating it.
   */
  setHue(h) {
    this.h = h;
    return this;
  }

  /**
   * Sets the saturation to the provided value.
   * @param {number} s The amount of saturation.
   * @return {!HsvColour} This instance after updating it.
   */
  setSaturation(s) {
    this.s = s;
    return this;
  }

  /**
   * Sets the brightness to the provided value.
   * @param {number} v The amount of brightness.
   * @return {!HsvColour} This instance after updating it.
   */
  setBrightness(v) {
    this.v = v;
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
   * Class for an number slider field.
   * @param {(string|!Sentinel)=} value The initial value of the
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
   * Creates the colour picker slider editor and adds event listeners.
   * @private
   */
  createDropdownSliders_() {
    const container = document.createElement('div');
    container.classList.add('fieldColourSliderContainer');

    function addLabel(name) {
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

    function addSlider(max, step) {
      const slider = document.createElement('input');
      slider.classList.add('fieldColourSlider');
      slider.type = 'range';
      slider.min = String(0);
      slider.max = String(max);
      slider.step = String(step);
      container.appendChild(slider);
      return slider;
    }

    this.hueReadout_ = addLabel('Hue');
    this.hueSlider_ = addSlider(360, 5);
    this.saturationReadout_ = addLabel('Saturation');
    this.saturationSlider_ = addSlider(100, 1);
    this.brightnessReadout_ = addLabel('Brightness');
    this.brightnessSlider_ = addSlider(100, 1);

    this.boundEvents_.push(
        Blockly.browserEvents.conditionalBind(
            this.hueSlider_, 'input', this, this.onSliderChange_));
    this.boundEvents_.push(
        Blockly.browserEvents.conditionalBind(
            this.saturationSlider_, 'input', this, this.onSliderChange_));
    this.boundEvents_.push(
        Blockly.browserEvents.conditionalBind(
            this.brightnessSlider_, 'input', this, this.onSliderChange_));

    container.appendChild(document.createElement('hr'));

    if (window.EyeDropper) {
      // If the browser supports the eyedropper API, create a button for it.
      const button = document.createElement('button');
      button.classList.add('fieldColourEyedropper');
      container.appendChild(button);
      this.boundEvents_.push(
          Blockly.browserEvents.conditionalBind(
              button, 'click', this, this.onEyedropperEvent_));
    } else {
      // Otherwise, fall back on colour input elements. Browsers generally
      // provide an eyedropper feature as part of their colour input editor.
      const label = document.createElement('label');
      label.classList.add('fieldColourEyedropper');
      const input = document.createElement('input');
      input.type = 'color';
      label.appendChild(input);
      container.appendChild(label);
      this.boundEvents_.push(
          Blockly.browserEvents.conditionalBind(
              input, 'input', this, this.onBrowserColourInputEvent_));
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
   * Updates the value of this field based on the editor sliders.
   * @param {?Event} event Unused.
   * @private
   */
  onSliderChange_(event) {
    const hue = parseFloat(this.hueSlider_.value);
    const saturation = parseFloat(this.saturationSlider_.value);
    const brightness = parseFloat(this.brightnessSlider_.value);
    const hsv = new HsvColour(
        hue / 360.0, saturation / 100.0, brightness / 100.0);
    const rgb = new RgbColour().loadFromHsv(hsv);
    this.setValue(rgb.toHex());
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
      this.setValue(result.sRGBHex);
      this.updateSliderValues_();
    });
  }

  /**
   * Updates the value of this field and editor sliders based on a colour input.
   * @param {?InputEvent} event The event generated from editing an input
   *   element.
   * @private
   */
  onBrowserColourInputEvent_(event) {
    this.setValue(event.target.value);
    this.updateSliderValues_();
  }

  /**
   * Updates the gradient backgrounds of the slider tracks and readouts based
   * on the slider values.
   * @private
   */
  renderSliders_() {
    const hue = parseFloat(this.hueSlider_.value);
    const saturation = parseFloat(this.saturationSlider_.value);
    const brightness = parseFloat(this.brightnessSlider_.value);

    this.hueReadout_.textContent = String(hue);
    this.saturationReadout_.textContent = String(saturation);
    this.brightnessReadout_.textContent = String(brightness);

    const hsv = new HsvColour(
        hue / 360.0, saturation / 100.0, brightness / 100.0);
    // Temporary colour structures to allow manipulation in the HSV colour space
    // and conversion to the RGB colour space.
    const tempHsv = new HsvColour();
    const tempRgb = new RgbColour();
    const trackRadius = '8px';

    let hueGradient = 'linear-gradient(to right, ';
    tempHsv.copy(hsv).setHue(0.0/6.0);
    hueGradient += tempRgb.loadFromHsv(tempHsv).toHex() +
        ' ' + trackRadius + ', ';
    tempHsv.copy(hsv).setHue(1.0/6.0);
    hueGradient += tempRgb.loadFromHsv(tempHsv).toHex() + ', ';
    tempHsv.copy(hsv).setHue(2.0/6.0);
    hueGradient += tempRgb.loadFromHsv(tempHsv).toHex() + ', ';
    tempHsv.copy(hsv).setHue(3.0/6.0);
    hueGradient += tempRgb.loadFromHsv(tempHsv).toHex() + ', ';
    tempHsv.copy(hsv).setHue(4.0/6.0);
    hueGradient += tempRgb.loadFromHsv(tempHsv).toHex() + ', ';
    tempHsv.copy(hsv).setHue(5.0/6.0);
    hueGradient += tempRgb.loadFromHsv(tempHsv).toHex() + ', ';
    tempHsv.copy(hsv).setHue(6.0/6.0);
    hueGradient += tempRgb.loadFromHsv(tempHsv).toHex() +
        ' calc(100% - ' + trackRadius + '))';
    this.hueSlider_.style.setProperty('--slider-track-background', hueGradient);

    let saturationGradient = 'linear-gradient(to right, ';
    tempHsv.copy(hsv).setSaturation(0.0);
    saturationGradient += tempRgb.loadFromHsv(tempHsv).toHex() +
        ' ' + trackRadius + ', ';
    tempHsv.copy(hsv).setSaturation(1.0);
    saturationGradient += tempRgb.loadFromHsv(tempHsv).toHex() +
        ' calc(100% - ' + trackRadius + '))';
    this.saturationSlider_.style.setProperty(
        '--slider-track-background', saturationGradient);

    let brightnessGradient = 'linear-gradient(to right, ';
    tempHsv.copy(hsv).setBrightness(0.0);
    brightnessGradient += tempRgb.loadFromHsv(tempHsv).toHex() +
        ' ' + trackRadius + ', ';
    tempHsv.copy(hsv).setBrightness(1.0);
    brightnessGradient += tempRgb.loadFromHsv(tempHsv).toHex() +
        ' calc(100% - ' + trackRadius + '))';
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

    const rgb = new RgbColour().loadFromHex(this.getValue());
    const hsv = new HsvColour().loadFromRgb(rgb);

    this.hueSlider_.value = String(hsv.h * 360.0);
    this.saturationSlider_.value = String(hsv.s * 100.0);
    this.brightnessSlider_.value = String(hsv.v * 100.0);

    this.renderSliders_();
  }
}

Blockly.fieldRegistry.register(
    'field_colour_hsv_sliders', FieldColourHsvSliders);

/**
 * CSS for colour slider fields.
 */
Blockly.Css.register(`\
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
    width: 24px;
    height: 24px;
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
    width: 24px;
    height: 24px;
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
    width: 24px;
    height: 24px;
  }`
);
