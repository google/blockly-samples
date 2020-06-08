/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {assert} from 'chai';
import {runTestCases, TestCase} from './common_test_helpers.mocha';

/**
 * Field value test case.
 * @extends {TestCase}
 * @record
 */
export function FieldValueTestCase() {}
FieldValueTestCase.prototype = new TestCase();
/**
 * @type {*} The value to use in test.
 */
FieldValueTestCase.prototype.value = undefined;
/**
 * @type {*} The expected value.
 */
FieldValueTestCase.prototype.expectedValue = undefined;

/**
 * Field creation test case.
 * @extends {FieldValueTestCase}
 * @record
 */
export function FieldCreationTestCase() {}
FieldCreationTestCase.prototype = new FieldValueTestCase();
/**
 * @type {Array<*>} The arguments to pass to field constructor.
 */
FieldCreationTestCase.prototype.args = [];
/**
 * @type {string} The json to use in field creation.
 */
FieldCreationTestCase.prototype.json = undefined;

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
 * @param {Array<FieldCreationTestCase>} testCases The test cases to run.
 * @param {function(Blockly.Field, FieldCreationTestCase)} assertion The
 *    assertion to use.
 * @param {function(new:Blockly.Field,FieldCreationTestCase):Blockly.Field
 *    } creation A function that returns an instance of the field based on the
 *    provided test case.
 * @private
 */
function runCreationTests_(testCases, assertion, creation) {
  /**
   * Creates test callback for creation test.
   * @param {FieldCreationTestCase} testCase The test case to use.
   * @return {Function} The test callback.
   */
  const createTestFn = (testCase) => {
    return function() {
      const field = creation(testCase);
      assertion(field, testCase);
    };
  };
  runTestCases(testCases, createTestFn);
}

/**
 * Runs suite of tests for constructor for the specified field.
 * @param {function(new:Blockly.Field, *=)} TestedField The class of the field
 *    being tested.
 * @param {Array<FieldCreationTestCase>} validValueTestCases Test cases with
 *    valid values for given field.
 * @param {Array<FieldCreationTestCase>} invalidValueTestCases Test cases with
 *    invalid values for given field.
 * @param {function(Blockly.Field, FieldCreationTestCase)
 *    } validRunAssertField Asserts that field has expected values.
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
    /**
     * Creates a field using its constructor and the provided test case.
     * @param {FieldCreationTestCase} testCase The test case information.
     * @return {Blockly.Field} The instantiated field.
     */
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
 * @param {Array<FieldCreationTestCase>} validValueTestCases Test cases with
 *    valid values for given field.
 * @param {Array<FieldCreationTestCase>} invalidValueTestCases Test cases with
 *    invalid values for given field.
 * @param {function(Blockly.Field, FieldValueTestCase)
 *    } validRunAssertField Asserts that field has expected values.
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
    /**
     * Creates a field using fromJson and the provided test case.
     * @param {FieldCreationTestCase} testCase The test case information.
     * @return {Blockly.Field} The instantiated field.
     */
    const createWithJson = function(testCase) {
      return TestedField.fromJson(testCase.json);
    };
    runCreationTests_(
        invalidValueTestCases, assertFieldDefault, createWithJson);
    runCreationTests_(validValueTestCases, validRunAssertField, createWithJson);
  });
}

/**
 * Runs tests for setValue calls.
 * @param {Array<FieldValueTestCase>} validValueTestCases Test cases with
 *    valid values.
 * @param {Array<FieldValueTestCase>} invalidValueTestCases Test cases with
 *    invalid values.
 * @param {*} invalidRunExpectedValue Expected value for field after invalid
 *    call to setValue.
 */
export function runSetValueTests(validValueTestCases, invalidValueTestCases,
    invalidRunExpectedValue) {
  /**
   * Creates test callback for invalid setValue test.
   * @param {FieldValueTestCase} testCase The test case information.
   * @return {Function} The test callback.
   */
  const createInvalidSetValueTestCallback = (testCase) => {
    return function() {
      this.field.setValue(testCase.value);
      assertFieldValue(this.field, invalidRunExpectedValue);
    };
  };
  /**
   * Creates test callback for valid setValue test.
   * @param {FieldValueTestCase} testCase The test case information.
   * @return {Function} The test callback.
   */
  const createValidSetValueTestCallback = (testCase) => {
    return function() {
      this.field.setValue(testCase.value);
      assertFieldValue(this.field, testCase.expectedValue);
    };
  };
  runTestCases(invalidValueTestCases, createInvalidSetValueTestCallback);
  runTestCases(validValueTestCases, createValidSetValueTestCallback);
}
