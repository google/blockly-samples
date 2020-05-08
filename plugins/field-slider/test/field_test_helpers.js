/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('chai').assert;
const Blockly = require('blockly');


/**
 * @typedef {{
 *            title:string,
 *            value:*
 *            expectedValue:?
 *          }}
 */
let Run;

/**
 * Assert a field's value is the same as the expected value.
 * @param {Blockly.Field} field The field.
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

/**
 * Runs provided creation test cases.
 * @param {Array<Run>} runs The test cases to run.
 * @param {function(T, Run)} assertion The assertion to use.
 * @param {function(new:T,Run):T} creation The creation method to use.
 * @template {!Blockly.Field} T
 * @this {Mocha}
 */
function runCreationTests_(runs, assertion, creation) {
  runs.forEach(function(run) {
    test(run.title, function() {
      const field = creation(run);
      assertion(field, run);
    });
  });
}

/**
 * Runs suite of tests for constructor for the specified field.
 * @param {function(new:T, *=)} TestedField The class of the field being tested.
 * @param {Array<Run>} validValueRuns Test cases with invalid values for given
 *    field.
 * @param {Array<Run>} invalidValueRuns Test cases with valid values for given
 *    field.
 * @param {function(T, Run)} validRunAssertField Asserts that field has expected
 *    values.
 * @param {function(T)} assertFieldDefault Asserts that field has default
 *    values.
 * @template {!Blockly.Field} T
 * @this {Mocha}
 */
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

/**
 * Runs suite of tests for fromJson creation of specified field.
 * @param {function(new:T, *=)} TestedField The class of the field being tested.
 * @param {Array<Run>} validValueRuns Test cases with invalid values for given
 *    field.
 * @param {Array<Run>} invalidValueRuns Test cases with valid values for given
 *    field.
 * @param {function(T, Run)} validRunAssertField Asserts that field has expected
 *    values.
 * @param {function(T)} assertFieldDefault Asserts that field has default
 *    values.
 * @template {!Blockly.Field} T
 * @this {Mocha}
 */
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

/**
 * Runs tests for setValue calls.
 * @param {Array<Run>} validValueRuns Test cases with invalid values.
 * @param {Array<Run>} invalidValueRuns Test cases with valid values.
 * @param {*} invalidRunExpectedValue Expected default value.
 * @template {!Blockly.Field} T
 * @this {Mocha}
 */
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
  runConstructorSuiteTests,
  runFromJsonSuiteTests,
  runSetValueTests,
};
