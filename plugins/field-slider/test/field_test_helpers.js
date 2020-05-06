/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('chai').assert;

/**
 * Assert a field's value is the same as the expected value.
 * @param {Field} field The field.
 * @param {*} expectedValue The expected value.
 * @param {string=} opt_expectedText The expected text.
 */
function assertFieldValue(field, expectedValue, opt_expectedText) {
  const actualValue = field.getValue();
  const actualText = field.getText();
  opt_expectedText = opt_expectedText || String(expectedValue);
  assert.equal(actualValue, expectedValue, 'Value');
  assert.equal(actualText, opt_expectedText, 'Text');
}
function runContructorSuiteTests(TestedField, validValueRuns, invalidValueRuns,
    assertFieldDefault, assertField) {
  suite('Constructor', function() {
    test('Empty', function() {
      const field = new TestedField();
      assertFieldDefault(field);
    });
    invalidValueRuns.forEach(function(run) {
      test(run.title, function() {
        const field = new TestedField(...run.args);
        assertFieldDefault(field);
      });
    });
    validValueRuns.forEach(function(run) {
      test(run.title, function() {
        const field = new TestedField(...run.args);
        assertField(field, run.expectedValue);
      });
    });
  });
}

function runFromJsonSuiteTests(TestedField, validValueRuns, invalidValueRuns,
    assertFieldDefault, assertField) {
  suite('fromJson', function() {
    test('Empty', function() {
      const field = TestedField.fromJson({});
      assertFieldDefault(field);
    });
    invalidValueRuns.forEach(function(run) {
      test(run.title, function() {
        const field = TestedField.fromJson(run.json);
        assertFieldDefault(field);
      });
    });
    validValueRuns.forEach(function(run) {
      test(run.title, function() {
        const field = TestedField.fromJson(run.json);
        assertField(field, run.expectedValue);
      });
    });
  });
}

function runSetValueTests(validValueRuns, invalidValueRuns,
    invalidRunExpectedValue) {
  invalidValueRuns.forEach(function(run) {
    test(run.title, function() {
      this.field.setValue(run.value);
      assertFieldValue(this.field, invalidRunExpectedValue);
    });
  });
  validValueRuns.forEach(function(run) {
    test(run.title, function() {
      this.field.setValue(run.value);
      assertFieldValue(this.field, run.expectedValue);
    });
  });
}

module.exports = {
  assertFieldValue,
  runContructorSuiteTests,
  runFromJsonSuiteTests,
  runSetValueTests,
};
