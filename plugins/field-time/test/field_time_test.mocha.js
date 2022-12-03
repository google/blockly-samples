/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const {testHelpers} = require('@blockly/dev-tools');
const {FieldTime} = require('../src/index');

const {
  assertFieldValue, FieldCreationTestCase, FieldValueTestCase,
  runConstructorSuiteTests, runFromJsonSuiteTests, runSetValueTests,
} = testHelpers;

suite('FieldTime', function() {
  /**
   * Configuration for field tests with invalid values.
   * @type {Array<FieldCreationTestCase>}
   */
  const invalidValueTestCases = [
    {title: 'Undefined', value: undefined},
    {title: 'Null', value: null},
    {title: 'NaN', value: NaN},
    {title: 'Non-Parsable String', value: 'bad'},
    {title: 'Invalid Time - Hour(24:12)', value: '24:12'},
    {title: 'Invalid Time - Day(12:60)', value: '12:60'},
  ];
  /**
   * Configuration for field tests with valid values.
   * @type {Array<FieldCreationTestCase>}
   */
  const validValueTestCases = [
    {title: 'String', value: '01:23', expectedValue: '01:23'},
  ];
  const addArgsAndJson = function(testCase) {
    testCase.args = Array(4).fill(testCase.value);
    testCase.json = {'time': testCase.value};
  };
  invalidValueTestCases.forEach(addArgsAndJson);
  validValueTestCases.forEach(addArgsAndJson);

  const defaultFieldValue = '12:00';
  /**
   * Asserts that the field properties are correct based on the test case.
   * @param {FieldTime} field The field to check.
   * @param {FieldValueTestCase} testCase The test case.
   */
  const validTestCaseAssertField = function(field, testCase) {
    assertFieldValue(field, testCase.value);
  };
  const assertFieldDefault = function(field) {
    assertFieldValue(field, defaultFieldValue);
  };

  runConstructorSuiteTests(
      FieldTime, validValueTestCases, invalidValueTestCases,
      validTestCaseAssertField, assertFieldDefault);

  runFromJsonSuiteTests(FieldTime, validValueTestCases, invalidValueTestCases,
      validTestCaseAssertField, assertFieldDefault);

  suite('setValue', function() {
    suite('Empty -> New Value', function() {
      setup(function() {
        this.field = new FieldTime();
      });
      runSetValueTests(
          validValueTestCases, invalidValueTestCases, defaultFieldValue);
    });
    suite('Value -> New Value', function() {
      const initialValue = '01:23';
      setup(function() {
        this.field = new FieldTime(initialValue);
      });
      runSetValueTests(
          validValueTestCases, invalidValueTestCases, initialValue);
    });
  });

  suite('Validators', function() {
    setup(function() {
      this.field = new FieldTime('01:23');
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
        this.field.setValue('19:00');
        assertFieldValue(this.field, '01:23');
      });
    });
    suite('Force Minute 12 Validator', function() {
      setup(function() {
        this.field.setValidator(function(newValue) {
          return newValue.substr(0, 3) + '12';
        });
      });
      test('New Value', function() {
        this.field.setValue('19:00');
        assertFieldValue(this.field, '19:12');
      });
    });
    suite('Returns Undefined Validator', function() {
      setup(function() {
        this.field.setValidator(() => {});
      });
      test('New Value', function() {
        this.field.setValue('19:00');
        assertFieldValue(this.field, '19:00');
      });
    });
  });
});
