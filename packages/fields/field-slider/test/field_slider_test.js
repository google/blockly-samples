/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Unit tests for FieldSlider.
 * @author kozbial@google.com (Monica Kozbial)
 */

const assert = require('assert');
const sinon = require('sinon');

const FieldSlider = require('../dist/field-slider.umd').FieldSlider;

suite('FieldSlider', () => {
  function assertValue(sliderField, expectedValue, opt_expectedText) {
    var actualValue = sliderField.getValue();
    var actualText = sliderField.getText();
    opt_expectedText = opt_expectedText || String(expectedValue);
    assert.equal(String(actualValue), String(expectedValue));
    assert.equal(Number(actualValue), expectedValue);
    assert.equal(actualText, opt_expectedText);
  }
  function assertValueDefault(sliderField) {
    assertValue(sliderField, 0);
  }
  function assertSliderField(sliderField, expectedMin, expectedMax,
      expectedPrecision, expectedValue) {
    assertValue(sliderField, expectedValue);
    assert.equal(sliderField.getMin(), expectedMin);
    assert.equal(sliderField.getMax(), expectedMax);
    assert.equal(sliderField.getPrecision(), expectedPrecision);
  }
  function assertSliderFieldDefault(sliderField) {
    assertSliderField(sliderField, -Infinity, Infinity, 0, 0);
  }
  function createsliderFieldSameValuesConstructor(value) {
    return new FieldSlider(value, value, value, value);
  }
  function createsliderFieldSameValuesJson(value) {
    return FieldSlider.fromJson(
        { 'value': value, min: value, max: value, precision: value });
  }
  function assertSliderFieldSameValues(sliderField, value) {
    assertSliderField(sliderField, value, value, value, value);
  }
  suite('Constructor', () => {
    test('Empty', async () => {
      const sliderField = new FieldSlider();
      assertSliderFieldDefault(sliderField);
    });
    test('Undefined', async () => {
      const sliderField = createsliderFieldSameValuesConstructor(undefined);
      assertSliderFieldDefault(sliderField);
    });
    test('NaN', async () => {
      const sliderField = createsliderFieldSameValuesConstructor(NaN);
      assertSliderFieldDefault(sliderField);
    });
    test('Integer', async () => {
      const sliderField = createsliderFieldSameValuesConstructor(1);
      assertSliderFieldSameValues(sliderField, 1);
    });
    test('Float', async () => {
      const sliderField = createsliderFieldSameValuesConstructor(1.5);
      assertSliderFieldSameValues(sliderField, 1.5);
    });
    test('Integer String', async () => {
      const sliderField = createsliderFieldSameValuesConstructor('1');
      assertSliderFieldSameValues(sliderField, 1);
    });
    test('Float String', async () => {
      const sliderField = createsliderFieldSameValuesConstructor('1.5');
      assertSliderFieldSameValues(sliderField, 1.5);
    });
    test('Infinity', async () => {
      const sliderField = createsliderFieldSameValuesConstructor('Infinity');
      assertSliderFieldSameValues(sliderField, Infinity);
    });
    test('Negative Infinity String', async () => {
      const sliderField = createsliderFieldSameValuesConstructor('-Infinity');
      assertSliderFieldSameValues(sliderField, -Infinity);
    });
  });
  suite('fromJson', () => {
    test('Empty', async () => {
      const sliderField = FieldSlider.fromJson({});
      assertSliderFieldDefault(sliderField);
    });
    test('Undefined', async () => {
      const sliderField = createsliderFieldSameValuesJson(undefined);
      assertSliderFieldDefault(sliderField);
    });
    test('NaN', async () => {
      const sliderField = createsliderFieldSameValuesJson(NaN);
      assertSliderFieldDefault(sliderField);
    });
    test('Integer', async () => {
      const sliderField = createsliderFieldSameValuesJson(1);
      assertSliderFieldSameValues(sliderField, 1);
    });
    test('Float', async () => {
      const sliderField = createsliderFieldSameValuesJson(1.5);
      assertSliderFieldSameValues(sliderField, 1.5);
    });
    test('Integer String', async () => {
      const sliderField = createsliderFieldSameValuesJson('1');
      assertSliderFieldSameValues(sliderField, 1);
    });
    test('Float String', async () => {
      const sliderField = createsliderFieldSameValuesJson('1.5');
      assertSliderFieldSameValues(sliderField, 1.5);
    });
    test('Infinity', async () => {
      const sliderField = createsliderFieldSameValuesJson('Infinity');
      assertSliderFieldSameValues(sliderField, Infinity);
    });
    test('Negative Infinity String', async () => {
      const sliderField = createsliderFieldSameValuesJson('-Infinity');
      assertSliderFieldSameValues(sliderField, -Infinity);
    });
  });
  suite('setValue', () => {
    suite('Value Types', () => {
      suite('Empty -> New Value', () => {
        setup(() => {
          this.sliderField = new FieldSlider();
        });
        test('Null', async () => {
          this.sliderField.setValue(null);
          assertValueDefault(this.sliderField);
        });
        test('Undefined', async () => {
          this.sliderField.setValue(undefined);
          assertValueDefault(this.sliderField);
        });
        test('Non-Parsable String', async () => {
          this.sliderField.setValue('bad');
          assertValueDefault(this.sliderField);
        });
        test('NaN', async () => {
          this.sliderField.setValue(NaN);
          assertValueDefault(this.sliderField);
        });
        test('Integer', async () => {
          this.sliderField.setValue(2);
          assertValue(this.sliderField, 2);
        });
        test('Float', async () => {
          this.sliderField.setValue(2.5);
          assertValue(this.sliderField, 2.5);
        });
        test('Integer String', async () => {
          this.sliderField.setValue('2');
          assertValue(this.sliderField, 2);
        });
        test('Float String', async () => {
          this.sliderField.setValue('2.5');
          assertValue(this.sliderField, 2.5);
        });
        test('Infinity', async () => {
          this.sliderField.setValue(Infinity);
          assertValue(this.sliderField, Infinity);
        });
        test('Negative Infinity String', async () => {
          this.sliderField.setValue('-Infinity');
          assertValue(this.sliderField, -Infinity);
        });
      });
      suite('Value -> New Value', () => {
        setup(() => {
          this.sliderField = new FieldSlider(1);
        });
        test('Null', async () => {
          this.sliderField.setValue(null);
          assertValue(this.sliderField, 1);
        });
        test('Undefined', async () => {
          this.sliderField.setValue(undefined);
          assertValue(this.sliderField, 1);
        });
        test('Non-Parsable String', async () => {
          this.sliderField.setValue('bad');
          assertValue(this.sliderField, 1);
        });
        test('NaN', async () => {
          this.sliderField.setValue(NaN);
          assertValue(this.sliderField, 1);
        });
        test('Integer', async () => {
          this.sliderField.setValue(2);
          assertValue(this.sliderField, 2);
        });
        test('Float', async () => {
          this.sliderField.setValue(2.5);
          assertValue(this.sliderField, 2.5);
        });
        test('Integer String', async () => {
          this.sliderField.setValue('2');
          assertValue(this.sliderField, 2);
        });
        test('Float String', async () => {
          this.sliderField.setValue('2.5');
          assertValue(this.sliderField, 2.5);
        });
        test('Infinity', async () => {
          this.sliderField.setValue(Infinity);
          assertValue(this.sliderField, Infinity);
        });
        test('Negative Infinity String', async () => {
          this.sliderField.setValue('-Infinity');
          assertValue(this.sliderField, -Infinity);
        });
      });
    });
    suite('Constraints', () => {
      suite('Precision', () => {
        test('Float', async () => {
          const sliderField = new FieldSlider();
          sliderField.setValue(123.456);
          assertValue(sliderField, 123.456);
        });
        test('0.01', async () => {
          const sliderField = new FieldSlider.fromJson({ precision: .01 });
          sliderField.setValue(123.456);
          assertValue(sliderField, 123.46);
        });
        test('0.5', async () => {
          const sliderField = new FieldSlider.fromJson({ precision: .5 });
          sliderField.setValue(123.456);
          assertValue(sliderField, 123.5);
        });
        test('1', async () => {
          const sliderField = new FieldSlider.fromJson({ precision: 1 });
          sliderField.setValue(123.456);
          assertValue(sliderField, 123);
        });
        test('1.5', async () => {
          const sliderField = new FieldSlider.fromJson({ precision: 1.5 });
          sliderField.setValue(123.456);
          assertValue(sliderField, 123);
        });
        test('Null', async () => {
          const sliderField = new FieldSlider.fromJson({ precision: null});
          assert.equal(sliderField.getPrecision(), 0);
        });
      });
      suite('Min', () => {
        test('-10', async () => {
          const sliderField = new FieldSlider.fromJson({ min: -10 });
          sliderField.setValue(-20);
          assertValue(sliderField, -10);
          sliderField.setValue(0);
          assertValue(sliderField, 0);
          sliderField.setValue(20);
          assertValue(sliderField, 20);
        });
        test('0', async () => {
          const sliderField = new FieldSlider.fromJson({ min: 0 });
          sliderField.setValue(-20);
          assertValue(sliderField, 0);
          sliderField.setValue(0);
          assertValue(sliderField, 0);
          sliderField.setValue(20);
          assertValue(sliderField, 20);
        });
        test('+10', async () => {
          const sliderField = new FieldSlider.fromJson({ min: 10 });
          sliderField.setValue(-20);
          assertValue(sliderField, 10);
          sliderField.setValue(0);
          assertValue(sliderField, 10);
          sliderField.setValue(20);
          assertValue(sliderField, 20);
        });
        test('Null', async () => {
          const sliderField = new FieldSlider.fromJson({ min: null});
          assert.equal(sliderField.getMin(), -Infinity);
        });
      });
      suite('Max', () => {
        test('-10', async () => {
          const sliderField = new FieldSlider.fromJson({ max: -10 });
          sliderField.setValue(-20);
          assertValue(sliderField, -20);
          sliderField.setValue(0);
          assertValue(sliderField, -10);
          sliderField.setValue(20);
          assertValue(sliderField, -10);
        });
        test('0', async () => {
          const sliderField = new FieldSlider.fromJson({ max: 0 });
          sliderField.setValue(-20);
          assertValue(sliderField, -20);
          sliderField.setValue(0);
          assertValue(sliderField, 0);
          sliderField.setValue(20);
          assertValue(sliderField, 0);
        });
        test('+10', async () => {
          const sliderField = new FieldSlider.fromJson({ max: 10 });
          sliderField.setValue(-20);
          assertValue(sliderField, -20);
          sliderField.setValue(0);
          assertValue(sliderField, 0);
          sliderField.setValue(20);
          assertValue(sliderField, 10);
        });
        test('null', async () => {
          const sliderField = new FieldSlider.fromJson({ max: null});
          assert.equal(sliderField.getMax(), Infinity);
        });
      });
    });
  });
  suite('Validators', () => {
    setup(() => {
      this.sliderField = new FieldSlider(1);
      this.sliderField.htmlInput_ = Object.create(null);
      this.sliderField.htmlInput_.oldValue_ = '1';
      this.sliderField.htmlInput_.untypedDefaultValue_ = 1;
      this.stub = sinon.stub(this.sliderField, 'resizeEditor_');
    });
    teardown(() => {
      this.sliderField.setValidator(null);
      this.sliderField.htmlInput_ = null;
      if (this.stub) {
        this.stub.restore();
      }
    });
    suite('Null Validator', () => {
      setup(() => {
        this.sliderField.setValidator(() => {
          return null;
        });
      });
      test('When Editing', async () => {
        this.sliderField.isBeingEdited_ = true;
        this.sliderField.htmlInput_.value = '2';
        this.sliderField.onHtmlInputChange_(null);
        assertValue(this.sliderField, 1, '2');
        this.sliderField.isBeingEdited_ = false;
      });
      test('When Not Editing', async () => {
        this.sliderField.setValue(2);
        assertValue(this.sliderField, 1);
      });
    });
    suite('Force End with 6 Validator', () => {
      setup(() => {
        this.sliderField.setValidator(function(newValue) {
          return String(newValue).replace(/.$/, "6");
        });
      });
      test('When Editing', async () => {
        this.sliderField.isBeingEdited_ = true;
        this.sliderField.htmlInput_.value = '25';
        this.sliderField.onHtmlInputChange_(null);
        assertValue(this.sliderField, 26, '25');
        this.sliderField.isBeingEdited_ = false;
      });
      test('When Not Editing', async () => {
        this.sliderField.setValue(25);
        assertValue(this.sliderField, 26);
      });
    });
    suite('Returns Undefined Validator', () => {
      setup(() => {
        this.sliderField.setValidator(() => {});
      });
      test('When Editing', async () => {
        this.sliderField.isBeingEdited_ = true;
        this.sliderField.htmlInput_.value = '2';
        this.sliderField.onHtmlInputChange_(null);
        assertValue(this.sliderField, 2);
        this.sliderField.isBeingEdited_ = false;
      });
      test('When Not Editing', async () => {
        this.sliderField.setValue(2);
        assertValue(this.sliderField, 2);
      });
    });
  });
  suite('Customizations', () => {
    suite('Min', () => {
      test('JS Constructor', async () => {
        var field = new FieldSlider(0, -10);
        assertSliderField(field, -10, Infinity, 0, 0);
      });
      test('JSON Definition', async () => {
        var field = FieldSlider.fromJson({
          min: -10,
        });
        assertSliderField(field, -10, Infinity, 0, 0);
      });
      test('Set Constraints', async () => {
        var field = new FieldSlider();
        field.setConstraints(-10);
        assertSliderField(field, -10, Infinity, 0, 0);
      });
      test('Set Min', async () => {
        var field = new FieldSlider();
        field.setMin(-10);
        assertSliderField(field, -10, Infinity, 0, 0);
      });
      test('JS Configuration - Simple', async () => {
        var field = new FieldSlider(
            undefined, undefined, undefined, undefined, undefined, {
              min: -10
            });
        assertSliderField(field, -10, Infinity, 0, 0);
      });
      test('JS Configuration - Ignore', async () => {
        var field = new FieldSlider(
            undefined, -1, undefined, undefined, undefined, {
              min: -10
            });
        assertSliderField(field, -10, Infinity, 0, 0);
      });
    });
    suite('Max', () => {
      test('JS Constructor', async () => {
        var field = new FieldSlider(0, undefined, 10);
        assertSliderField(field, -Infinity, 10, 0, 0);
      });
      test('JSON Definition', async () => {
        var field = FieldSlider.fromJson({
          max: 10,
        });
        assertSliderField(field, -Infinity, 10, 0, 0);
      });
      test('Set Constraints', async () => {
        var field = new FieldSlider();
        field.setConstraints(undefined, 10);
        assertSliderField(field, -Infinity, 10, 0, 0);
      });
      test('Set Max', async () => {
        var field = new FieldSlider();
        field.setMax(10);
        assertSliderField(field, -Infinity, 10, 0, 0);
      });
      test('JS Configuration - Simple', async () => {
        var field = new FieldSlider(
            undefined, undefined, undefined, undefined, undefined, {
              max: 10
            });
        assertSliderField(field, -Infinity, 10, 0, 0);
      });
      test('JS Configuration - Ignore', async () => {
        var field = new FieldSlider(
            undefined, undefined, 1, undefined, undefined, {
              max: 10
            });
        assertSliderField(field, -Infinity, 10, 0, 0);
      });
    });
    suite('Precision', () => {
      test('JS Constructor', async () => {
        var field = new FieldSlider(0, undefined, undefined, 1);
        assertSliderField(field, -Infinity, Infinity, 1, 0);
      });
      test('JSON Definition', async () => {
        var field = FieldSlider.fromJson({
          precision: 1,
        });
        assertSliderField(field, -Infinity, Infinity, 1, 0);
      });
      test('Set Constraints', async () => {
        var field = new FieldSlider();
        field.setConstraints(undefined, undefined, 1);
        assertSliderField(field, -Infinity, Infinity, 1, 0);
      });
      test('Set Precision', async () => {
        var field = new FieldSlider();
        field.setPrecision(1);
        assertSliderField(field, -Infinity, Infinity, 1, 0);
      });
      test('JS Configuration - Simple', async () => {
        var field = new FieldSlider(
            undefined, undefined, undefined, undefined, undefined, {
              precision: 1
            });
        assertSliderField(field, -Infinity, Infinity, 1, 0);
      });
      test('JS Configuration - Ignore', async () => {
        var field = new FieldSlider(
            undefined, undefined, undefined, .5, undefined, {
              precision: 1
            });
        assertSliderField(field, -Infinity, Infinity, 1, 0);
      });
    });
  });
});
