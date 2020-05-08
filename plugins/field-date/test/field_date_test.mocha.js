/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const fieldTest = require('../../field-slider/test/field_test_helpers');
const FieldDate = require('../dist/date_compressed');

suite('FieldDate', function() {
  const invalidValueRuns = [
    {title: 'Undefined', value: undefined},
    {title: 'Null', value: null},
    {title: 'NaN', value: NaN},
    // TODO(kozbial): investigate failures and add bug and/or ability to skip.
    // {title: 'Non-Parsable String', value: 'bad'},
    // {title: 'Invalid Date - Month(2020-13-20)', value: '2020-13-20'},
    // {title: 'Invalid Date - Day(2020-02-32)', value: '2020-02-32'},
  ];
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
    fieldTest.assertFieldValue(field, defaultFieldValue);
  };
  const validRunAssertField = function(field, run) {
    fieldTest.assertFieldValue(field, run.value);
  };

  fieldTest.runConstructorSuiteTests(
      FieldDate, validValueRuns, invalidValueRuns, validRunAssertField,
      assertFieldDefault);

  fieldTest.runFromJsonSuiteTests(
      FieldDate, validValueRuns, invalidValueRuns, validRunAssertField,
      assertFieldDefault);

  suite('setValue', function() {
    suite('Empty -> New Value', function() {
      setup(function() {
        this.field = new FieldDate();
      });
      fieldTest.runSetValueTests(
          validValueRuns, invalidValueRuns, defaultFieldValue);
    });
    suite('Value -> New Value', function() {
      const initialValue = '2020-02-20';
      setup(function() {
        this.field = new FieldDate(initialValue);
      });
      fieldTest.runSetValueTests(
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
        fieldTest.assertFieldValue(this.field, '2020-02-20');
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
        fieldTest.assertFieldValue(this.field, '3030-03-20');
      });
    });
    suite('Returns Undefined Validator', function() {
      setup(function() {
        this.field.setValidator(() => {});
      });
      test('New Value', function() {
        this.field.setValue('3030-03-30');
        fieldTest.assertFieldValue(this.field, '3030-03-30');
      });
    });
  });
});
