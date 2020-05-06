/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('chai').assert;
const fieldTest = require('../test/field_test_helpers');
const FieldSlider = require('../dist/index').FieldSlider;


/**
 * Assert the slider field options.
 * @param {FieldSlider} sliderField The slider field.
 * @param {number} expectedMin The expected min value.
 * @param {number} expectedMax  The expected max value.
 * @param {number} expectedPrecision The expected precision value.
 * @param {number} expectedValue The expected value.
 */
function assertSliderField(sliderField, expectedMin, expectedMax,
    expectedPrecision, expectedValue) {
  fieldTest.assertFieldValue(sliderField, expectedValue);
  assert.equal(sliderField.getMin(), expectedMin, 'Min');
  assert.equal(sliderField.getMax(), expectedMax, 'Max');
  assert.equal(sliderField.getPrecision(), expectedPrecision, 'Precision');
}
/**
 * Assert the slider field's value is the default value.
 * @param {FieldSlider} sliderField The slider field.
 */
function assertSliderFieldDefault(sliderField) {
  assertSliderField(sliderField, -Infinity, Infinity, 0, 0);
}
/**
 * Create a simple slider field with constructor values that are all the same.
 * @param {number} value The constructor value.
 * @return {FieldSlider} A new field slider.
 */
function createSliderFieldSameValuesConstructor(value) {
  return new FieldSlider(value, value, value, value);
}
/**
 * Create a simple slider field with constructor values that are all the same
 * using the field's static fromJson method.
 * @param {number} value The constructor value.
 * @return {FieldSlider} A new field slider.
 */
function createSliderFieldSameValuesJson(value) {
  return FieldSlider.fromJson(
      {'value': value, 'min': value, 'max': value, 'precision': value});
}
/**
 * Assert all of the slider field's options are the same as the input value.
 * @param {FieldSlider} sliderField The slider field.
 * @param {number} value The constructor value.
 */
function assertSliderFieldSameValues(sliderField, value) {
  assertSliderField(sliderField, value, value, value, value);
}

module.exports = {
  assertSliderField,
  assertSliderFieldDefault,
  createSliderFieldSameValuesConstructor,
  createSliderFieldSameValuesJson,
  assertSliderFieldSameValues,
};
