/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const sinon = require('sinon');
const helpers = require('../test/field_slider_test_helpers');

const FieldSlider = require('../dist/index').FieldSlider;

suite('FieldTemplate', function() {
  // Monica's note: I've also tried a version where I had two arrays, one for
  // default value runs and then the other ones. Not sure which is cleaner.
  const runs = [
    {title: 'Undefined', value: undefined, expectDefault: true},
    {title: 'Null', value: null, expectDefault: true},
    {title: 'NaN', value: NaN, expectDefault: true},
    {title: 'Non-Parsable String', value: 'bad', expectDefault: true}, /* I haven't figured out why, but this case fails for constructor and fromJson and it might be a case where config should run for setValue but not constructor and fromJson */
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

  suite('Constructor', function() {
    test('Empty', function() {
      const field = new FieldSlider();
      helpers.assertSliderFieldDefault(field);
    });
    runs.forEach(function(run) {
      // Monica's note: My understanding is that by having the if statement out
      // of the test function, the check doesn't happen when the test is run.
      if (run.expectDefault) {
        test(run.title, function() {
          const field =
              helpers.createSliderFieldSameValuesConstructor(run.value);
          helpers.assertSliderFieldDefault(field);
        });
      } else {
        test(run.title, function() {
          const field =
              helpers.createSliderFieldSameValuesConstructor(run.value);
          helpers.assertSliderFieldSameValues(field, run.expectedValue);
        });
      }
    });
  });
  suite('fromJson', function() {
    test('Empty', function() {
      const field =FieldSlider.fromJson({});
      helpers.assertSliderFieldDefault(field);
    });
    runs.forEach(function(run) {
      if (run.expectDefault) {
        test(run.title, function() {
          const field = helpers.createSliderFieldSameValuesJson(run.value);
          helpers.assertSliderFieldDefault(field);
        });
      } else {
        test(run.title, function() {
          const field = helpers.createSliderFieldSameValuesJson(run.value);
          helpers.assertSliderFieldSameValues(field, run.expectedValue);
        });
      }
    });
  });
  suite('setValue', function() {
    suite('Empty -> New Value', function() {
      setup(function() {
        this.field = new FieldSlider();
      });
      runs.forEach(function(run) {
        if (run.expectDefault) {
          test(run.title, function() {
            this.field.setValue(run.value);
            helpers.assertFieldValueDefault(this.field);
          });
        } else {
          test(run.title, function() {
            this.field.setValue(run.value);
            helpers.assertFieldValue(this.field, run.expectedValue);
          });
        }
      });
    });
    suite('Vale -> New Value', function() {
      setup(function() {
        this.field = new FieldSlider(1);
      });
      runs.forEach(function(run) {
        if (run.expectDefault) {
          test(run.title, function() {
            this.field.setValue(run.value);
            // Expect value to be unchanged.
            helpers.assertFieldValue(this.field, 1);
          });
        } else {
          test(run.title, function() {
            this.field.setValue(run.value);
            helpers.assertFieldValue(this.field, run.expectedValue);
          });
        }
      });
    });
    suite('Constraints', function() {
      // TODO
    });
  });
  suite('Validators', function() {
    // TODO
  });
});
