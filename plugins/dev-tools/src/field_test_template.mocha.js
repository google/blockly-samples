/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const fieldTest = require('../test/field_test_helpers.mocha');
const {FieldTemplate} = require('../dist/index');

suite('FieldTemplate', function() {
  /**
   * Configuration for field tests with invalid values.
   * @type {Array<Run>}
   */
  const invalidValueRuns = [
    // TODO
  ];
  /**
   * Configuration for field tests with valid values.
   * @type {Array<Run>}
   */
  const validValueRuns = [
    // TODO
  ];
  /**
   * The expected default value for the field being tested.
   * @type {*}
   */
  const defaultFieldValue = 0; // TODO update with default value
  /**
   * Asserts that the field property values are set to default.
   * @param {FieldTemplate} field The field to check.
   */
  const assertFieldDefault = function(field) {
    // TODO
  };
  /**
   * Asserts that the field properties are correct based on the test run
   *    configuration.
   * @param {FieldTemplate} field The field to check.
   * @param {Run} run The run configuration.
   */
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
      setup(function() {
        this.field = new FieldTemplate();
      });
      fieldTest.runSetValueTests(
          validValueRuns, invalidValueRuns, defaultFieldValue);
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
