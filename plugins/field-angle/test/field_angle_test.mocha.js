/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const {assert} = require('chai');
const sinon = require('sinon');
const {assertAngleField, assertAngleFieldDefault} = require(
    './field_angle_test_helpers.mocha');
const {testHelpers} = require('@blockly/dev-tools');
const {FieldAngle} = require('../src/index');

const {
  assertFieldValue, FieldCreationTestCase, FieldValueTestCase,
  runConstructorSuiteTests, runFromJsonSuiteTests, runSetValueTests,
  runTestCases,
} = testHelpers;

suite('FieldAngle', function() {
  /**
   * Configuration for field tests with invalid values.
   * @type {Array<FieldCreationTestCase>}
   */
  const invalidValueTestCases = [
    {title: 'Undefined', value: undefined},
    {title: 'Null', value: null},
    {title: 'NaN', value: NaN},
    {title: 'Non-Parsable String', value: 'bad'},
  ];
  /**
   * Configuration for field tests with valid values.
   * @type {Array<FieldCreationTestCase>}
   */
  const validValueTestCases = [
    {title: 'Integer', value: 1, expectedValue: 1},
    {title: 'Float', value: 1.5, expectedValue: 1.5},
    {title: 'Integer String', value: '1', expectedValue: 1},
    {title: 'Float String', value: '1.5', expectedValue: 1.5},
    {title: 'Infinity', value: Infinity, expectedValue: Infinity},
    {title: 'Negative Infinity', value: -Infinity, expectedValue: -Infinity},
    {title: 'Infinity String', value: 'Infinity', expectedValue: Infinity},
    {title: 'Negative Infinity String', value: '-Infinity',
      expectedValue: -Infinity},
  ];
  const addArgsAndJson = function(testCase) {
    testCase.args = Array(4).fill(testCase.value);
    testCase.json = {'value': testCase.value, 'min': testCase.value,
      'max': testCase.value, 'precision': testCase.value};
  };
  invalidValueTestCases.forEach(addArgsAndJson);
  validValueTestCases.forEach(addArgsAndJson);

  /**
   * Asserts that the field properties are correct based on the test case.
   * @param {FieldAngle} field The field to check.
   * @param {FieldValueTestCase} testCase The test case.
   */
  const validTestCaseAssertField = function(field, testCase) {
    assertAngleField(
        field, testCase.value, testCase.value, testCase.value, testCase.value);
  };

  runConstructorSuiteTests(
      FieldAngle, validValueTestCases, invalidValueTestCases,
      validTestCaseAssertField, assertAngleFieldDefault);

  runFromJsonSuiteTests(FieldAngle, validValueTestCases, invalidValueTestCases,
      validTestCaseAssertField, assertAngleFieldDefault);

  suite('setValue', function() {
    suite('Empty -> New Value', function() {
      setup(function() {
        this.field = new FieldAngle();
      });
      runSetValueTests(validValueTestCases, invalidValueTestCases, 0);
    });
    suite('Value -> New Value', function() {
      setup(function() {
        this.field = new FieldAngle(1);
      });
      runSetValueTests(validValueTestCases, invalidValueTestCases, 1);
    });
    suite('Constraints', function() {
      const testCases = [
        {title: 'Float', json: {}, value: 123.456, expectedValue: 123.456},
        {title: '0.01', json: {precision: 0.01}, value: 123.456,
          expectedValue: 123.46},
        {title: '0.5', json: {precision: 0.5}, value: 123.456,
          expectedValue: 123.5},
        {title: '1', json: {precision: 1}, value: 123.456,
          expectedValue: 123},
        {title: '1.5', json: {precision: 1.5}, value: 123.456,
          expectedValue: 123},
      ];
      suite('Precision', function() {
        runTestCases(testCases, function(testCase) {
          return function() {
            const angleField = FieldAngle.fromJson(testCase.json);
            angleField.setValue(testCase.value);
            assertFieldValue(angleField, testCase.expectedValue);
          };
        });
        test('Null', function() {
          const angleField = FieldAngle.fromJson({precision: null});
          assert.equal(angleField.getPrecision(), 0);
        });
      });
      const setValueBoundsTestFn = (testCase) => {
        return function() {
          const angleField = FieldAngle.fromJson(testCase.json);
          testCase.values.forEach(function(value, i) {
            angleField.setValue(value);
            assertFieldValue(angleField, testCase.expectedValues[i]);
          });
        };
      };
      suite('Min', function() {
        const testCases = [
          {title: '-10', json: {min: -10}, values: [-20, 0, 20],
            expectedValues: [-10, 0, 20]},
          {title: '0', json: {min: 0}, values: [-20, 0, 20],
            expectedValues: [0, 0, 20]},
          {title: '+10', json: {min: 10}, values: [-20, 0, 20],
            expectedValues: [10, 10, 20]},
        ];
        runTestCases(testCases, setValueBoundsTestFn);
        test('Null', function() {
          const angleField = FieldAngle.fromJson({min: null});
          assert.equal(angleField.getMin(), -Infinity);
        });
      });
      suite('Max', function() {
        const testCases = [
          {title: '-10', json: {max: -10}, values: [-20, 0, 20],
            expectedValues: [-20, -10, -10]},
          {title: '0', json: {max: 0}, values: [-20, 0, 20],
            expectedValues: [-20, 0, 0]},
          {title: '+10', json: {max: 10}, values: [-20, 0, 20],
            expectedValues: [-20, 0, 10]},
        ];
        runTestCases(testCases, setValueBoundsTestFn);
        test('Null', function() {
          const angleField = FieldAngle.fromJson({max: null});
          assert.equal(angleField.getMax(), Infinity);
        });
      });
    });
  });

  suite('Validators', function() {
    setup(function() {
      this.angleField = new FieldAngle(1);
      this.stub = sinon.stub(this.angleField, 'resizeEditor_');
    });
    teardown(function() {
      sinon.restore();
    });
    const testSuites = [
      {title: 'Null Validator', validator:
            function() {
              return null;
            },
      value: 2, expectedValue: 1},
      {title: 'Force End with 6 Validator', validator:
            function(newValue) {
              return String(newValue).replace(/.$/, '6');
            },
      value: 25, expectedValue: 26},
      {title: 'Returns Undefined Validator', validator: function() {}, value: 2,
        expectedValue: 2},
    ];
    testSuites.forEach(function(suiteInfo) {
      suite(suiteInfo.title, function() {
        setup(function() {
          this.angleField.setValidator(suiteInfo.validator);
        });
        test('When Not Editing', function() {
          this.angleField.setValue(suiteInfo.value);
          assertFieldValue(this.angleField, suiteInfo.expectedValue);
        });
      });
    });
  });

  suite('Customizations', function() {
    suite('Min', function() {
      test('JS Constructor', function() {
        const field = new FieldAngle(0, -10);
        assertAngleField(field, -10, Infinity, 0, 0);
      });
      test('JSON Definition', function() {
        const field = FieldAngle.fromJson({
          min: -10,
        });
        assertAngleField(field, -10, Infinity, 0, 0);
      });
      test('Set Constraints', function() {
        const field = new FieldAngle();
        field.setConstraints(-10);
        assertAngleField(field, -10, Infinity, 0, 0);
      });
      test('Set Min', function() {
        const field = new FieldAngle();
        field.setMin(-10);
        assertAngleField(field, -10, Infinity, 0, 0);
      });
      test('JS Configuration - Simple', function() {
        const field = new FieldAngle(
            undefined, undefined, undefined, undefined, undefined, {
              min: -10,
            });
        assertAngleField(field, -10, Infinity, 0, 0);
      });
      test('JS Configuration - Ignore', function() {
        const field = new FieldAngle(
            undefined, -1, undefined, undefined, undefined, {
              min: -10,
            });
        assertAngleField(field, -10, Infinity, 0, 0);
      });
    });
    suite('Max', function() {
      test('JS Constructor', function() {
        const field = new FieldAngle(0, undefined, 10);
        assertAngleField(field, -Infinity, 10, 0, 0);
      });
      test('JSON Definition', function() {
        const field = FieldAngle.fromJson({
          max: 10,
        });
        assertAngleField(field, -Infinity, 10, 0, 0);
      });
      test('Set Constraints', function() {
        const field = new FieldAngle();
        field.setConstraints(undefined, 10);
        assertAngleField(field, -Infinity, 10, 0, 0);
      });
      test('Set Max', function() {
        const field = new FieldAngle();
        field.setMax(10);
        assertAngleField(field, -Infinity, 10, 0, 0);
      });
      test('JS Configuration - Simple', function() {
        const field = new FieldAngle(
            undefined, undefined, undefined, undefined, undefined, {
              max: 10,
            });
        assertAngleField(field, -Infinity, 10, 0, 0);
      });
      test('JS Configuration - Ignore', function() {
        const field = new FieldAngle(
            undefined, undefined, 1, undefined, undefined, {
              max: 10,
            });
        assertAngleField(field, -Infinity, 10, 0, 0);
      });
    });
    suite('Precision', function() {
      test('JS Constructor', function() {
        const field = new FieldAngle(0, undefined, undefined, 1);
        assertAngleField(field, -Infinity, Infinity, 1, 0);
      });
      test('JSON Definition', function() {
        const field = FieldAngle.fromJson({
          precision: 1,
        });
        assertAngleField(field, -Infinity, Infinity, 1, 0);
      });
      test('Set Constraints', function() {
        const field = new FieldAngle();
        field.setConstraints(undefined, undefined, 1);
        assertAngleField(field, -Infinity, Infinity, 1, 0);
      });
      test('Set Precision', function() {
        const field = new FieldAngle();
        field.setPrecision(1);
        assertAngleField(field, -Infinity, Infinity, 1, 0);
      });
      test('JS Configuration - Simple', function() {
        const field = new FieldAngle(
            undefined, undefined, undefined, undefined, undefined, {
              precision: 1,
            });
        assertAngleField(field, -Infinity, Infinity, 1, 0);
      });
      test('JS Configuration - Ignore', function() {
        const field = new FieldAngle(
            undefined, undefined, undefined, 0.5, undefined, {
              precision: 1,
            });
        assertAngleField(field, -Infinity, Infinity, 1, 0);
      });
    });
  });
});
