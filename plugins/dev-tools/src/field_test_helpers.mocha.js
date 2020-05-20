/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {assert} from 'chai';
import {runTestCases, TestCase} from './common_test_helpers.mocha';

/**
 * Assert a field's value is the same as the expected value.
 * @param {Blockly.Field} field The field.
 * @param {*} expectedValue The expected value.
 * @param {string=} expectedText The expected text.
 */
export function assertFieldValue(field, expectedValue,
    expectedText = undefined) {
  const actualValue = field.getValue();
  const actualText = field.getText();
  expectedText = expectedText || String(expectedValue);
  assert.equal(actualValue, expectedValue, 'Value');
  assert.equal(actualText, expectedText, 'Text');
}

/**
 * Runs provided creation test cases.
 * @param {Array<TestCase>} testCases The test cases to run.
 * @param {function(Blockly.Field, TestCase)} assertion The assertion to use.
 * @param {function(new:Blockly.Field,TestCase):Blockly.Field} creation A
 *    function that returns an instance of the field based on the test case.
 * @private
 */
function runCreationTests_(testCases, assertion, creation) {
  runTestCases(testCases, (testCase) => {
    return function() {
      const field = creation(testCase);
      assertion(field, testCase);
    };
  });
}

/**
 * Runs suite of tests for constructor for the specified field.
 * @param {function(new:Blockly.Field, *=)} TestedField The class of the field
 *    being tested.
 * @param {Array<TestCase>} validValueTestCases Test cases with invalid values
 *    for given field.
 * @param {Array<TestCase>} invalidValueTestCases Test cases with valid values
 *    for given field.
 * @param {function(Blockly.Field, TestCase)} validRunAssertField Asserts that
 *    field has expected values.
 * @param {function(Blockly.Field)} assertFieldDefault Asserts that field has
 *    default values.
 */
export function runConstructorSuiteTests(TestedField, validValueTestCases,
    invalidValueTestCases, validRunAssertField, assertFieldDefault) {
  suite('Constructor', function() {
    test('Empty', function() {
      const field = new TestedField();
      assertFieldDefault(field);
    });
    const createWithJS = function(testCase) {
      return new TestedField(...testCase.args);
    };
    runCreationTests_(invalidValueTestCases, assertFieldDefault, createWithJS);
    runCreationTests_(validValueTestCases, validRunAssertField, createWithJS);
  });
}

/**
 * Runs suite of tests for fromJson creation of specified field.
 * @param {function(new:Blockly.Field, *=)} TestedField The class of the field
 *    being tested.
 * @param {Array<TestCase>} validValueTestCases Test cases with invalid values
 *    for given field.
 * @param {Array<TestCase>} invalidValueTestCases Test cases with valid values
 *    for given field.
 * @param {function(Blockly.Field, TestCase)} validRunAssertField Asserts that
 *    field has expected values.
 * @param {function(Blockly.Field)} assertFieldDefault Asserts that field has
 *    default values.
 */
export function runFromJsonSuiteTests(TestedField, validValueTestCases,
    invalidValueTestCases, validRunAssertField, assertFieldDefault) {
  suite('fromJson', function() {
    test('Empty', function() {
      const field = TestedField.fromJson({});
      assertFieldDefault(field);
    });
    const createWithJson = function(run) {
      return TestedField.fromJson(run.json);
    };
    runCreationTests_(
        invalidValueTestCases, assertFieldDefault, createWithJson);
    runCreationTests_(validValueTestCases, validRunAssertField, createWithJson);
  });
}

/**
 * Runs tests for setValue calls.
 * @param {Array<TestCase>} validValueTestCases Test cases with invalid values.
 * @param {Array<TestCase>} invalidValueTestCases Test cases with valid values.
 * @param {*} invalidRunExpectedValue Expected default value.
 */
export function runSetValueTests(validValueTestCases, invalidValueTestCases,
    invalidRunExpectedValue) {
  runTestCases(invalidValueTestCases, (testCase) => {
    return function() {
      this.field.setValue(testCase.value);
      assertFieldValue(this.field, invalidRunExpectedValue);
    };
  });
  runTestCases(validValueTestCases, (testCase) => {
    return function() {
      this.field.setValue(testCase.value);
      assertFieldValue(this.field, testCase.expectedValue);
    };
  });
}
