/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const sinon = require('sinon');
const helpers = require('../test/field_slider_test_helpers');
const fieldTest = require('../test/field_test_helpers');

const FieldSlider = require('../dist/index').FieldSlider;

suite('FieldTemplate', function() {
  const invalidValueRuns = [
    {title: 'Undefined', value: undefined},
    {title: 'Null', value: null},
    {title: 'NaN', value: NaN},
    {title: 'Non-Parsable String', value: 'bad'},
  ];
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
  invalidValueRuns.forEach(function(run) {
    run.args = Array(4).fill(run.value);
    run.json = {
      'value': run.value, 'min': run.value, 'max': run.value,
      'precision': run.value};
  });
  validValueRuns.forEach(function(run) {
    run.args = Array(4).fill(run.value);
    run.json = {
      'value': run.value, 'min': run.value, 'max': run.value,
      'precision': run.value};
  });

  fieldTest.runContructorSuiteTests(
      FieldSlider, validValueRuns, invalidValueRuns,
      helpers.assertSliderFieldDefault, helpers.assertSliderFieldSameValues);

  fieldTest.runFromJsonSuiteTests(FieldSlider, validValueRuns, invalidValueRuns,
      helpers.assertSliderFieldDefault, helpers.assertSliderFieldSameValues);

  suite('setValue', function() {
    suite('Empty -> New Value', function() {
      setup(function() {
        this.field = new FieldSlider();
      });
      fieldTest.runSetValueTests(validValueRuns, invalidValueRuns, 0);
    });
    suite('Value -> New Value', function() {
      setup(function() {
        this.field = new FieldSlider(1);
      });
      fieldTest.runSetValueTests(validValueRuns, invalidValueRuns, 1);
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
            fieldTest.assertFieldValue(sliderField, run.expectedValue);
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
              fieldTest.assertFieldValue(sliderField, run.expectedValues[i]);
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
              fieldTest.assertFieldValue(sliderField, run.expectedValues[i]);
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
    // TODO
  });
});
