/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const {assert} = require('chai');
const {assertFieldValue} = require('@blockly/dev-tools').testHelpers;
const {FieldAngle} = require('../src/index');


/**
 * Assert the angle field options.
 * @param {FieldAngle} angleField The angle field.
 * @param {number} expectedMin The expected min value.
 * @param {number} expectedMax  The expected max value.
 * @param {number} expectedPrecision The expected precision value.
 * @param {number} expectedValue The expected value.
 */
function assertAngleField(angleField, expectedMin, expectedMax,
    expectedPrecision, expectedValue) {
  assertFieldValue(angleField, expectedValue);
  assert.equal(angleField.getMin(), expectedMin, 'Min');
  assert.equal(angleField.getMax(), expectedMax, 'Max');
  assert.equal(angleField.getPrecision(), expectedPrecision, 'Precision');
}
/**
 * Assert the angle field's value is the default value.
 * @param {FieldAngle} angleField The angle field.
 */
function assertAngleFieldDefault(angleField) {
  assertAngleField(angleField, -Infinity, Infinity, 0, 0);
}

module.exports = {
  assertAngleField,
  assertAngleFieldDefault,
};
