/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const {testHelpers} = require('@blockly/dev-tools');
const FieldDate = require('../dist/date_compressed');

const {
  assertFieldValue, FieldCreationTestCase, FieldValueTestCase,
  runConstructorSuiteTests, runFromJsonSuiteTests, runSetValueTests,
} = testHelpers;

suite('FieldDate', function() {
  /**
   * Configuration for field tests with invalid values.
   * @type {Array<FieldCreationTestCase>}
   */
  const invalidValueTestCases = [
    {title: 'Undefined', value: undefined},
    {title: 'Null', value: null},
    {title: 'NaN', value: NaN},
    {title: 'Non-Parsable String', value: 'bad'},
    {title: 'Invalid Date - Month(2020-13-20)', value: '2020-13-20'},
    {title: 'Invalid Date - Day(2020-02-32)', value: '2020-02-32'},
  ];
  /**
   * Configuration for field tests with valid values.
   * @type {Array<FieldCreationTestCase>}
   */
  const validValueTestCases = [
    {title: 'String', value: '3030-03-30', expectedValue: '3030-03-30'},
  ];
  const addArgsAndJson = function(testCase) {
    testCase.args = [testCase.value];
    testCase.json = {'date': testCase.value};
  };
  invalidValueTestCases.forEach(addArgsAndJson);
  validValueTestCases.forEach(addArgsAndJson);
  // Construct ISO string using current timezone.
  // Cannot use toISOString() because it returns in UTC.
  const defaultFieldValue = new Date().toLocaleDateString('en-US')
      .replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2')
      .replace(/-(\d)(?!\d)/g, '-0$1');
  const assertFieldDefault = function(field) {
    assertFieldValue(field, defaultFieldValue);
  };

  /**
   * Asserts that the field properties are correct based on the test case.
   * @param {FieldDate} field The field to check.
   * @param {FieldValueTestCase} testCase The test case.
   */
  const validTestCaseAssertField = function(field, testCase) {
    assertFieldValue(field, testCase.value);
  };

  runConstructorSuiteTests(
      FieldDate, validValueTestCases, invalidValueTestCases,
      validTestCaseAssertField, assertFieldDefault);

  runFromJsonSuiteTests(
      FieldDate, validValueTestCases, invalidValueTestCases,
      validTestCaseAssertField, assertFieldDefault);

  suite('setValue', function() {
    suite('Empty -> New Value', function() {
      setup(function() {
        this.field = new FieldDate();
      });
      runSetValueTests(
          validValueTestCases, invalidValueTestCases, defaultFieldValue);
    });
    suite('Value -> New Value', function() {
      const initialValue = '2020-02-20';
      setup(function() {
        this.field = new FieldDate(initialValue);
      });
      runSetValueTests(
          validValueTestCases, invalidValueTestCases, initialValue);
    });
  });

  suite('Validators', function() {
    setup(function() {
      this.field = new FieldDate('2020-02-20');
    });
    teardown(function() {
      this.field.setValidator(null);
    });
    suite('Null Validator', function() {
      setup(function() {
        this.field.setValidator(() => {
          return null;
        });
      });
      test('New Value', function() {
        this.field.setValue('3030-03-30');
        assertFieldValue(this.field, '2020-02-20');
      });
    });
    suite('Force Day 20s Validator', function() {
      setup(function() {
        this.field.setValidator(function(newValue) {
          return newValue.substr(0, 8) + '2' + newValue.substr(9, 1);
        });
      });
      test('New Value', function() {
        this.field.setValue('3030-03-30');
        assertFieldValue(this.field, '3030-03-20');
      });
    });
    suite('Returns Undefined Validator', function() {
      setup(function() {
        this.field.setValidator(() => {});
      });
      test('New Value', function() {
        this.field.setValue('3030-03-30');
        assertFieldValue(this.field, '3030-03-30');
      });
    });
  });
});
