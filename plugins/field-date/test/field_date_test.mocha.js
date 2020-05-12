/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


const {runConstructorSuiteTests, runFromJsonSuiteTests, runSetValueTests,
  assertFieldValue} = require('@blockly/dev-tools');
const FieldDate = require('../dist/date_compressed');

suite('FieldDate', function() {
  /**
   * Configuration for field tests with invalid values.
   * @type {Array<Run>}
   */
  const invalidValueRuns = [
    {title: 'Undefined', value: undefined},
    {title: 'Null', value: null},
    {title: 'NaN', value: NaN},
    // TODO(269): investigate failures and only skip for creation tests.
    // {title: 'Non-Parsable String', value: 'bad'},
    // {title: 'Invalid Date - Month(2020-13-20)', value: '2020-13-20'},
    // {title: 'Invalid Date - Day(2020-02-32)', value: '2020-02-32'},
  ];
  /**
   * Configuration for field tests with valid values.
   * @type {Array<Run>}
   */
  const validValueRuns = [
    {title: 'String', value: '3030-03-30', expectedValue: '3030-03-30'},
  ];
  const addArgsAndJson = function(run) {
    run.args = [run.value];
    run.json = {'date': run.value};
  };
  invalidValueRuns.forEach(addArgsAndJson);
  validValueRuns.forEach(addArgsAndJson);
  const defaultFieldValue = new Date().toISOString().substring(0, 10);
  const assertFieldDefault = function(field) {
    assertFieldValue(field, defaultFieldValue);
  };
  const validRunAssertField = function(field, run) {
    assertFieldValue(field, run.value);
  };

  runConstructorSuiteTests(
      FieldDate, validValueRuns, invalidValueRuns, validRunAssertField,
      assertFieldDefault);

  runFromJsonSuiteTests(
      FieldDate, validValueRuns, invalidValueRuns, validRunAssertField,
      assertFieldDefault);

  suite('setValue', function() {
    suite('Empty -> New Value', function() {
      setup(function() {
        this.field = new FieldDate();
      });
      runSetValueTests(
          validValueRuns, invalidValueRuns, defaultFieldValue);
    });
    suite('Value -> New Value', function() {
      const initialValue = '2020-02-20';
      setup(function() {
        this.field = new FieldDate(initialValue);
      });
      runSetValueTests(
          validValueRuns, invalidValueRuns, initialValue);
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
