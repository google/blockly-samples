/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const {testHelpers} = require('@blockly/dev-tools');
const {assert} = require('chai');
// const {assertFieldValue} = require('@blockly/dev-tools').testHelpers;
const {FieldBitmap} = require('../src/index');

function processTestCases(testCases) {
  return testCases.map(x => ({
                         title: x.title,
                         value: x.value,
                         args: [x.value, null, {}],
                         json: {value: x.value}
                       }));
}

const {
  FieldCreationTestCase,
  FieldValueTestCase,
  runConstructorSuiteTests,
  runFromJsonSuiteTests,
  runSetValueTests,
} = testHelpers;

suite('FieldBitmap', function() {
  /**
   * Configuration for field tests with invalid values.
   * @type {Array<FieldCreationTestCase>}
   */
  const invalidValueTestCases = processTestCases([
    {title: 'Undefined', value: undefined},
    {title: 'Null', value: null},
    {title: 'NaN', value: NaN},
    {title: 'Non-Parsable String', value: 'bad'},
    {title: 'Not an array', value: 1},
    {title: 'Not a 2D array', value: [0, 1, 0, 1]},
    {
      title: 'Not a rectangle',
      value: [[1, 1, 1], [1, 1, 1, 1, 1, 1], [1, 1, 1]]
    },
    {
      title: 'Contains non-binary number',
      value: [[1, 99, 1], [1, 1, 1, 1, 1, 1], [1, 1, 1]]
    },
    {
      title: 'Contains bad value',
      value: [[1, 'b', 1], [1, 1, 1, 1, 1, 1], [1, 1, 1]]
    },
  ]);

  /**
   * Configuration for field tests with valid values.
   * @type {Array<FieldCreationTestCase>}
   */
  const validValueTestCases = processTestCases([
    {title: '3x3 solid', value: [[1, 1, 1], [1, 1, 1], [1, 1, 1]]},
    {
      title: '4x4 solid',
      value: [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]]
    },
    {title: '3x3 checkerboard', value: [[1, 0, 1], [0, 1, 0], [1, 0, 1]]},
    {
      title: '4x4 solid',
      value: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
    },
  ]);

  /**
   * The expected default value for the field being tested.
   * @type {*}
   */
  const defaultFieldValue = [
    [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0]
  ];  // TODO update with default value
  /**
   * Asserts that the field property values are set to default.
   * @param {FieldBitmap} field The field to check.
   */
  const assertFieldDefault = function(field) {
    console.log(
        'ASSERT1', JSON.stringify(field.getValue()),
        JSON.stringify(defaultFieldValue));
    assert(
        JSON.stringify(field.getValue()) === JSON.stringify(defaultFieldValue));
  };
  /**
   * Asserts that the field properties are correct based on the test case.
   * @param {FieldBitmap} field The field to check.
   * @param {FieldValueTestCase} testCase The test case.
   */
  const validTestCaseAssertField = function(field, testCase) {
    const expectedValue = testCase.value;
    console.log('ASSERT2');
    console.log('ACTUAL', JSON.stringify(field.getValue()));
    console.log('EXPECTED', JSON.stringify(expectedValue));
    assert(JSON.stringify(field.getValue()) === JSON.stringify(expectedValue));
  };

  function runTestCases(testCases, createTestCallback) {
    testCases.forEach((testCase) => {
      let testCall = (testCase.skip ? test.skip : test);
      testCall = (testCase.only ? test.only : testCall);
      testCall(testCase.title, createTestCallback(testCase));
    });
  }
  function runSetValueTests(
      validValueTestCases, invalidValueTestCases, invalidRunExpectedValue,
      invalidRunExpectedText) {
    /**
     * Creates test callback for invalid setValue test.
     * @param {!FieldValueTestCase} testCase The test case information.
     * @return {!Function} The test callback.
     */
    const createInvalidSetValueTestCallback = (testCase) => {
      return function() {
        var field = FieldBitmap.fromJson(testCase.json);
        field.setValue(testCase.value);
        assertFieldDefault(field);
      };
    };
    /**
     * Creates test callback for valid setValue test.
     * @param {!FieldValueTestCase} testCase The test case information.
     * @return {!Function} The test callback.
     */
    const createValidSetValueTestCallback = (testCase) => {
      return function() {
        var field = FieldBitmap.fromJson(defaultFieldValue);
        field.setValue(testCase.value);
        validTestCaseAssertField(field, testCase);
      };
    };

    testHelpers.runTestCases(
        invalidValueTestCases, createInvalidSetValueTestCallback);
    testHelpers.runTestCases(
        validValueTestCases, createValidSetValueTestCallback);
  }


  runConstructorSuiteTests(
      FieldBitmap, validValueTestCases, invalidValueTestCases,
      validTestCaseAssertField, assertFieldDefault);

  runFromJsonSuiteTests(
      FieldBitmap, validValueTestCases, invalidValueTestCases,
      validTestCaseAssertField, assertFieldDefault);

  runSetValueTests(
      validValueTestCases, invalidValueTestCases, defaultFieldValue);

  // suite('Validators', function() {
  //   // TODO
  // });
});
