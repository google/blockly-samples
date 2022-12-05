/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const {assert} = require('chai');
const {assertFieldValue} = require('@blockly/dev-tools').testHelpers;
const {FieldNumpad} = require('../src/index');

/**
 * Assert the numpad field options.
 * @param {FieldNumpad} numpadField The numpad field.
 * @param {number} expectedMin The expected min value.
 * @param {number} expectedMax  The expected max value.
 * @param {number} expectedPrecision The expected precision value.
 * @param {number} expectedValue The expected value.
 */
function assertNumpadField(numpadField, expectedMin, expectedMax,
    expectedPrecision, expectedValue) {
  assertFieldValue(numpadField, expectedValue);
  assert.equal(numpadField.getMin(), expectedMin, 'Min');
  assert.equal(numpadField.getMax(), expectedMax, 'Max');
  assert.equal(numpadField.getPrecision(), expectedPrecision, 'Precision');
}
/**
 * Assert the numpad field's value is the default value.
 * @param {FieldNumpad} numpadField The numpad field.
 */
function assertNumpadFieldDefault(numpadField) {
  assertNumpadField(numpadField, -Infinity, Infinity, 0, 0);
}

module.exports = {
  assertNumpadField,
  assertNumpadFieldDefault,
};
