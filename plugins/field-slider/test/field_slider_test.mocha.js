/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const {assert} = require('chai');
const sinon = require('sinon');
const {
  assertSliderField,
  assertSliderFieldDefault} = require('../test/field_slider_test_helpers');
const {runConstructorSuiteTests, runFromJsonSuiteTests, runSetValueTests,
  assertFieldValue} = require('@blockly/dev-tools');
const {FieldSlider} = require('../dist/index');

suite('FieldSlider', function() {
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
  ];
  /**
   * Configuration for field tests with valid values.
   * @type {Array<Run>}
   */
  const validValueRuns = [
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
  const addArgsAndJson = function(run) {
    run.args = Array(4).fill(run.value);
    run.json = {'value': run.value, 'min': run.value, 'max': run.value,
      'precision': run.value};
  };
  invalidValueRuns.forEach(addArgsAndJson);
  validValueRuns.forEach(addArgsAndJson);

  /**
   * Asserts that the field properties are correct based on the test run
   *    configuration.
   * @param {FieldSlider} field The field to check.
   * @param {Run} run The run configuration.
   */
  const validRunAssertField = function(field, run) {
    assertSliderField(field, run.value, run.value, run.value, run.value);
  };

  runConstructorSuiteTests(
      FieldSlider, validValueRuns, invalidValueRuns, validRunAssertField,
      assertSliderFieldDefault);

  runFromJsonSuiteTests(FieldSlider, validValueRuns, invalidValueRuns,
      validRunAssertField, assertSliderFieldDefault);

  suite('setValue', function() {
    suite('Empty -> New Value', function() {
      setup(function() {
        this.field = new FieldSlider();
      });
      runSetValueTests(validValueRuns, invalidValueRuns, 0);
    });
    suite('Value -> New Value', function() {
      setup(function() {
        this.field = new FieldSlider(1);
      });
      runSetValueTests(validValueRuns, invalidValueRuns, 1);
    });
    suite('Constraints', function() {
      const runs = [
        {title: 'Float', json: {}, value: 123.456, expectedValue: 123.456},
        {title: '0.01', json: {precision: .01}, value: 123.456,
          expectedValue: 123.46},
        {title: '0.5', json: {precision: .5}, value: 123.456,
          expectedValue: 123.5},
        {title: '1', json: {precision: 1}, value: 123.456,
          expectedValue: 123},
        {title: '1.5', json: {precision: 1.5}, value: 123.456,
          expectedValue: 123},
      ];
      suite('Precision', function() {
        runs.forEach(function(run) {
          test(run.title, function() {
            const sliderField = FieldSlider.fromJson(run.json);
            sliderField.setValue(run.value);
            assertFieldValue(sliderField, run.expectedValue);
          });
        });
        test('Null', function() {
          const sliderField = FieldSlider.fromJson({precision: null});
          assert.equal(sliderField.getPrecision(), 0);
        });
      });
      suite('Min', function() {
        const runs = [
          {title: '-10', json: {min: -10}, values: [-20, 0, 20],
            expectedValues: [-10, 0, 20]},
          {title: '0', json: {min: 0}, values: [-20, 0, 20],
            expectedValues: [0, 0, 20]},
          {title: '+10', json: {min: 10}, values: [-20, 0, 20],
            expectedValues: [10, 10, 20]},
        ];
        runs.forEach(function(run) {
          test(run.title, function() {
            const sliderField = FieldSlider.fromJson(run.json);
            run.values.forEach(function(value, i) {
              sliderField.setValue(value);
              assertFieldValue(sliderField, run.expectedValues[i]);
            });
          });
          test('Null', function() {
            const sliderField = FieldSlider.fromJson({min: null});
            assert.equal(sliderField.getMin(), -Infinity);
          });
        });
      });
      suite('Max', function() {
        const runs = [
          {title: '-10', json: {max: -10}, values: [-20, 0, 20],
            expectedValues: [-20, -10, -10]},
          {title: '0', json: {max: 0}, values: [-20, 0, 20],
            expectedValues: [-20, 0, 0]},
          {title: '+10', json: {max: 10}, values: [-20, 0, 20],
            expectedValues: [-20, 0, 10]},
        ];
        runs.forEach(function(run) {
          test(run.title, function() {
            const sliderField = FieldSlider.fromJson(run.json);
            run.values.forEach(function(value, i) {
              sliderField.setValue(value);
              assertFieldValue(sliderField, run.expectedValues[i]);
            });
          });
          test('Null', function() {
            const sliderField = FieldSlider.fromJson({max: null});
            assert.equal(sliderField.getMax(), Infinity);
          });
        });
      });
    });
  });

  suite('Validators', function() {
    setup(function() {
      this.sliderField = new FieldSlider(1);
      this.sliderField.htmlInput_ = Object.create(null);
      this.sliderField.htmlInput_.oldValue_ = '1';
      this.sliderField.htmlInput_.untypedDefaultValue_ = 1;
      this.stub = sinon.stub(this.sliderField, 'resizeEditor_');
    });
    teardown(function() {
      sinon.restore();
    });
    const runs = [
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
    runs.forEach(function(run) {
      suite(run.title, function() {
        setup(function() {
          this.sliderField.setValidator(run.validator);
        });
        test('When Editing', function() {
          this.sliderField.isBeingEdited_ = true;
          this.sliderField.htmlInput_.value = String(run.value);
          this.sliderField.onHtmlInputChange_(null);
          assertFieldValue(
              this.sliderField, run.expectedValue, String(run.value));
        });
        test('When Not Editing', function() {
          this.sliderField.setValue(run.value);
          assertFieldValue(this.sliderField, run.expectedValue);
        });
      });
    });
  });

  suite('Customizations', function() {
    suite('Min', function() {
      test('JS Constructor', function() {
        const field = new FieldSlider(0, -10);
        assertSliderField(field, -10, Infinity, 0, 0);
      });
      test('JSON Definition', function() {
        const field = FieldSlider.fromJson({
          min: -10,
        });
        assertSliderField(field, -10, Infinity, 0, 0);
      });
      test('Set Constraints', function() {
        const field = new FieldSlider();
        field.setConstraints(-10);
        assertSliderField(field, -10, Infinity, 0, 0);
      });
      test('Set Min', function() {
        const field = new FieldSlider();
        field.setMin(-10);
        assertSliderField(field, -10, Infinity, 0, 0);
      });
      test('JS Configuration - Simple', function() {
        const field = new FieldSlider(
            undefined, undefined, undefined, undefined, undefined, {
              min: -10,
            });
        assertSliderField(field, -10, Infinity, 0, 0);
      });
      test('JS Configuration - Ignore', function() {
        const field = new FieldSlider(
            undefined, -1, undefined, undefined, undefined, {
              min: -10,
            });
        assertSliderField(field, -10, Infinity, 0, 0);
      });
    });
    suite('Max', function() {
      test('JS Constructor', function() {
        const field = new FieldSlider(0, undefined, 10);
        assertSliderField(field, -Infinity, 10, 0, 0);
      });
      test('JSON Definition', function() {
        const field = FieldSlider.fromJson({
          max: 10,
        });
        assertSliderField(field, -Infinity, 10, 0, 0);
      });
      test('Set Constraints', function() {
        const field = new FieldSlider();
        field.setConstraints(undefined, 10);
        assertSliderField(field, -Infinity, 10, 0, 0);
      });
      test('Set Max', function() {
        const field = new FieldSlider();
        field.setMax(10);
        assertSliderField(field, -Infinity, 10, 0, 0);
      });
      test('JS Configuration - Simple', function() {
        const field = new FieldSlider(
            undefined, undefined, undefined, undefined, undefined, {
              max: 10,
            });
        assertSliderField(field, -Infinity, 10, 0, 0);
      });
      test('JS Configuration - Ignore', function() {
        const field = new FieldSlider(
            undefined, undefined, 1, undefined, undefined, {
              max: 10,
            });
        assertSliderField(field, -Infinity, 10, 0, 0);
      });
    });
    suite('Precision', function() {
      test('JS Constructor', function() {
        const field = new FieldSlider(0, undefined, undefined, 1);
        assertSliderField(field, -Infinity, Infinity, 1, 0);
      });
      test('JSON Definition', function() {
        const field = FieldSlider.fromJson({
          precision: 1,
        });
        assertSliderField(field, -Infinity, Infinity, 1, 0);
      });
      test('Set Constraints', function() {
        const field = new FieldSlider();
        field.setConstraints(undefined, undefined, 1);
        assertSliderField(field, -Infinity, Infinity, 1, 0);
      });
      test('Set Precision', function() {
        const field = new FieldSlider();
        field.setPrecision(1);
        assertSliderField(field, -Infinity, Infinity, 1, 0);
      });
      test('JS Configuration - Simple', function() {
        const field = new FieldSlider(
            undefined, undefined, undefined, undefined, undefined, {
              precision: 1,
            });
        assertSliderField(field, -Infinity, Infinity, 1, 0);
      });
      test('JS Configuration - Ignore', function() {
        const field = new FieldSlider(
            undefined, undefined, undefined, .5, undefined, {
              precision: 1,
            });
        assertSliderField(field, -Infinity, Infinity, 1, 0);
      });
    });
  });
});
