/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const {testHelpers} = require('@blockly/dev-tools');
const { assertFieldValue } = require('../../dev-tools/src/field_test_helpers.mocha');
const {FieldBitmap} = require('../src/index');

const {
  FieldCreationTestCase, FieldValueTestCase, runConstructorSuiteTests,
  runFromJsonSuiteTests, runSetValueTests,
} = testHelpers;

suite('FieldBitmap', function() {
  /**
   * Configuration for field tests with invalid values.
   * @type {Array<FieldCreationTestCase>}
   */
  const invalidValueTestCases = [
    { title: 'Undefined', value: undefined} ,
    { title: 'Null', value: null },
    { title: 'NaN', value: NaN },
    { title: 'Non-Parsable String', value: 'bad' },
    { title: 'Not an array', value: 1 },
    { title: 'Not a 2D array', value: [0, 1, 0, 1] },
    { title: 'Not a rectangle', value: [[1, 1, 1], [1, 1, 1, 1, 1, 1], [1, 1, 1]] },
    { title: 'Contains non-binary number', value: [[1, 99, 1], [1, 1, 1, 1, 1, 1], [1, 1, 1]] },
    { title: 'Contains bad value', value: [[1,'b',1], [1,1,1,1,1,1], [1,1,1]] },
  ];
  /**
   * Configuration for field tests with valid values.
   * @type {Array<FieldCreationTestCase>}
   */
  const validValueTestCases = [
    { title: '3x3 solid', value: [[1, 1, 1], [1, 1, 1], [1, 1, 1]] },
    { title: '4x4 solid', value: [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]] },
    { title: '3x3 checkerboard', value: [[1, 0, 1], [0, 1, 0], [1, 0, 1]] },
    { title: '4x4 solid', value: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]] },
  ];
  /**
   * The expected default value for the field being tested.
   * @type {*}
   */
  const defaultFieldValue = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]]; // TODO update with default value
  /**
   * Asserts that the field property values are set to default.
   * @param {FieldBitmap} field The field to check.
   */
  const assertFieldDefault = function(field) {
    // TODO Recommend use of assertFieldValue from testHelpers
    assertFieldValue(field, defaultFieldValue);
  };
  /**
   * Asserts that the field properties are correct based on the test case.
   * @param {FieldBitmap} field The field to check.
   * @param {FieldValueTestCase} testCase The test case.
   */
  const validTestCaseAssertField = function(field, testCase) {
    assertFieldValue(field, testCase.value);
  };

  // runConstructorSuiteTests(
  //     FieldBitmap, validValueTestCases, invalidValueTestCases,
  //     validTestCaseAssertField, assertFieldDefault);

  runFromJsonSuiteTests(
      FieldBitmap, validValueTestCases, invalidValueTestCases,
      validTestCaseAssertField, assertFieldDefault);

  suite('setValue', function() {
    suite('Empty -> New Value', function() {
      setup(function() {
        this.field = new FieldBitmap();
      });
      runSetValueTests(
          validValueTestCases, invalidValueTestCases, defaultFieldValue);
    });
    suite('Value -> New Value', function() {
      const initialValue = 1; // TODO update with initial value for test.
      setup(function() {
        this.field = new FieldBitmap(initialValue);
      });
      runSetValueTests(
          validValueTestCases, invalidValueTestCases, initialValue);
    });
  });

  suite('Validators', function() {
    // TODO
  });

  // TODO add any other relevant tests
});
