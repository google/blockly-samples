/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// const assert = require('assert').chai;
const fieldTest = require('../test/field_test_helpers');

const FieldTemplate = require('../dist/index').FieldTemplate;

suite('FieldTemplate', function() {
  const invalidValueRuns = [
    // TODO
  ];
  const validValueRuns = [
    // TODO
  ];
  const assertFieldDefault = function(field) {
    // TODO
  };
  const validRunAssertField = function(field, run) {
    // TODO
  };

  fieldTest.runConstructorSuiteTests(
      FieldTemplate, validValueRuns, invalidValueRuns, validRunAssertField,
      assertFieldDefault);

  fieldTest.runFromJsonSuiteTests(
      FieldTemplate, validValueRuns, invalidValueRuns, validRunAssertField,
      assertFieldDefault);

  suite('setValue', function() {
    suite('Empty -> New Value', function() {
      const defaultValue = 0; // TODO update with default value
      setup(function() {
        this.field = new FieldTemplate();
      });
      fieldTest.runSetValueTests(
          validValueRuns, invalidValueRuns, defaultValue);
    });
    suite('Value -> New Value', function() {
      const initialValue = 1; // TODO update with initial value for test.
      setup(function() {
        this.field = new FieldTemplate(initialValue);
      });
      fieldTest.runSetValueTests(
          validValueRuns, invalidValueRuns, initialValue);
    });
  });

  suite('Validators', function() {
    // TODO
  });

  // TODO add any other relevant tests
});
