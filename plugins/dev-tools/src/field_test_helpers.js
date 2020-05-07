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

function runCreationTests_(runs, assertion, creation) {
  runs.forEach(function(run) {
    test(run.title, function() {
      const field = creation(run);
      assertion(field, run);
    });
  });
}

function runConstructorSuiteTests(TestedField, validValueRuns, invalidValueRuns,
    validRunAssertField, assertFieldDefault) {
  suite('Constructor', function() {
    test('Empty', function() {
      const field = new TestedField();
      assertFieldDefault(field);
    });
    const createWithJS = function(run) {
      return new TestedField(...run.args);
    };
    runCreationTests_(invalidValueRuns, assertFieldDefault, createWithJS);
    runCreationTests_(validValueRuns, validRunAssertField, createWithJS);
  });
}

function runFromJsonSuiteTests(TestedField, validValueRuns, invalidValueRuns,
    validRunAssertField, assertFieldDefault) {
  suite('fromJson', function() {
    test('Empty', function() {
      const field = TestedField.fromJson({});
      assertFieldDefault(field);
    });
    const createWithJson = function(run) {
      return TestedField.fromJson(run.json);
    };
    runCreationTests_(invalidValueRuns, assertFieldDefault, createWithJson);
    runCreationTests_(validValueRuns, validRunAssertField, createWithJson);
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

exports = {
  assertFieldValue,
  runConstructorSuiteTests,
  runFromJsonSuiteTests,
  runSetValueTests,
};
