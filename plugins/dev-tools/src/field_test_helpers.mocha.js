/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {assert} from 'chai';

/**
 * Run configuration information.
 * @typedef {{
 *            title:string,
 *            value:*
 *            expectedValue:?
 *          }}
 */
let Run;

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
 * @param {Array<Run>} runs The test cases to run.
 * @param {function(Blockly.Field, Run)} assertion The assertion to use.
 * @param {function(new:Blockly.Field,Run):Blockly.Field} creation The creation
 *    method to use.
 * @this Mocha
 * @private
 */
function runCreationTests_(runs, assertion, creation) {
  runs.forEach(function(run) {
    test(run.title, function() {
      const field = creation(run);
      assertion(field, run);
    });
  });
}

/**
 * Runs suite of tests for constructor for the specified field.
 * @param {function(new:Blockly.Field, *=)} TestedField The class of the field
 *    being tested.
 * @param {Array<Run>} validValueRuns Test cases with invalid values for given
 *    field.
 * @param {Array<Run>} invalidValueRuns Test cases with valid values for given
 *    field.
 * @param {function(Blockly.Field, Run)} validRunAssertField Asserts that field
 *    has expected values.
 * @param {function(Blockly.Field)} assertFieldDefault Asserts that field has
 *    default values.
 * @this Mocha
 */
export function runConstructorSuiteTests(TestedField, validValueRuns,
    invalidValueRuns, validRunAssertField, assertFieldDefault) {
  suite('Constructor', function() {
    test('Empty', function() {
      const field = new TestedField();
      assertFieldDefault(field);
    });
    const createWithJS = function(run) {
      return new TestedField(...run.args);
    };
    runCreationTests_(invalidValueRuns, assertFieldDefault, createWithJS);
    runCreationTests_(validValueRuns, validRunAssertField, createWithJS);
  });
}

/**
 * Runs suite of tests for fromJson creation of specified field.
 * @param {function(new:Blockly.Field, *=)} TestedField The class of the field
 *    being tested.
 * @param {Array<Run>} validValueRuns Test cases with invalid values for given
 *    field.
 * @param {Array<Run>} invalidValueRuns Test cases with valid values for given
 *    field.
 * @param {function(Blockly.Field, Run)} validRunAssertField Asserts that field
 *    has expected values.
 * @param {function(Blockly.Field)} assertFieldDefault Asserts that field has
 *    default values.
 * @this Mocha
 */
export function runFromJsonSuiteTests(TestedField, validValueRuns,
    invalidValueRuns, validRunAssertField, assertFieldDefault) {
  suite('fromJson', function() {
    test('Empty', function() {
      const field = TestedField.fromJson({});
      assertFieldDefault(field);
    });
    const createWithJson = function(run) {
      return TestedField.fromJson(run.json);
    };
    runCreationTests_(invalidValueRuns, assertFieldDefault, createWithJson);
    runCreationTests_(validValueRuns, validRunAssertField, createWithJson);
  });
}

/**
 * Runs tests for setValue calls.
 * @param {Array<Run>} validValueRuns Test cases with invalid values.
 * @param {Array<Run>} invalidValueRuns Test cases with valid values.
 * @param {*} invalidRunExpectedValue Expected default value.
 * @this Mocha
 */
export function runSetValueTests(validValueRuns, invalidValueRuns,
    invalidRunExpectedValue) {
  invalidValueRuns.forEach(function(run) {
    test(run.title, function() {
      this.field.setValue(run.value);
      assertFieldValue(this.field, invalidRunExpectedValue);
    });
  });
  validValueRuns.forEach(function(run) {
    test(run.title, function() {
      this.field.setValue(run.value);
      assertFieldValue(this.field, run.expectedValue);
    });
  });
}
