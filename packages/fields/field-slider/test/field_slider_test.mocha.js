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

const FieldSlider = require('../dist/index').FieldSlider;

suite('FieldSlider', () => {
  /**
   * Assert a slider field's value is the same as the expected value.
   * @param {FieldSlider} sliderField The slider field.
   * @param {string} expectedValue The expected value.
   * @param {string=} opt_expectedText The expected text.
   */
  function assertValue(sliderField, expectedValue, opt_expectedText) {
    const actualValue = sliderField.getValue();
    const actualText = sliderField.getText();
    opt_expectedText = opt_expectedText || String(expectedValue);
    assert.equal(String(actualValue), String(expectedValue));
    assert.equal(Number(actualValue), expectedValue);
    assert.equal(actualText, opt_expectedText);
  }
  /**
   * Assert the slider field's value is the default value.
   * @param {FieldSlider} sliderField The slider field.
   */
  function assertValueDefault(sliderField) {
    assertValue(sliderField, 0);
  }
  /**
   * Assert the slider field options.
   * @param {FieldSlider} sliderField The slider field.
   * @param {number} expectedMin The expected min value.
   * @param {number} expectedMax  The expected max value.
   * @param {number} expectedPrecision The expected precision value.
   * @param {number} expectedValue The expected value.
   */
  function assertSliderField(sliderField, expectedMin, expectedMax,
      expectedPrecision, expectedValue) {
    assertValue(sliderField, expectedValue);
    assert.equal(sliderField.getMin(), expectedMin);
    assert.equal(sliderField.getMax(), expectedMax);
    assert.equal(sliderField.getPrecision(), expectedPrecision);
  }
  /**
   * Assert the slider field's value is the default value.
   * @param {FieldSlider} sliderField The slider field.
   */
  function assertSliderFieldDefault(sliderField) {
    assertSliderField(sliderField, -Infinity, Infinity, 0, 0);
  }
  /**
   * Create a simple slider field with constructor values that are all the same.
   * @param {number} value The constructor value.
   * @return {FieldSlider} A new field slider.
   */
  function createsliderFieldSameValuesConstructor(value) {
    return new FieldSlider(value, value, value, value);
  }
  /**
   * Create a simple slider field with constructor values that are all the same
   * using the field's static fromJson method.
   * @param {number} value The constructor value.
   * @return {FieldSlider} A new field slider.
   */
  function createsliderFieldSameValuesJson(value) {
    return FieldSlider.fromJson(
        {'value': value, 'min': value, 'max': value, 'precision': value});
  }
  /**
   * Assert all of the slider field's options are the same as the input value.
   * @param {FieldSlider} sliderField The slider field.
   * @param {number} value The constructor value.
   */
  function assertSliderFieldSameValues(sliderField, value) {
    assertSliderField(sliderField, value, value, value, value);
  }
  suite('Constructor', () => {
    test('Empty', () => {
      const sliderField = new FieldSlider();
      assertSliderFieldDefault(sliderField);
    });
    test('Undefined', () => {
      const sliderField = createsliderFieldSameValuesConstructor(undefined);
      assertSliderFieldDefault(sliderField);
    });
    test('NaN', () => {
      const sliderField = createsliderFieldSameValuesConstructor(NaN);
      assertSliderFieldDefault(sliderField);
    });
    test('Integer', () => {
      const sliderField = createsliderFieldSameValuesConstructor(1);
      assertSliderFieldSameValues(sliderField, 1);
    });
    test('Float', () => {
      const sliderField = createsliderFieldSameValuesConstructor(1.5);
      assertSliderFieldSameValues(sliderField, 1.5);
    });
    test('Integer String', () => {
      const sliderField = createsliderFieldSameValuesConstructor('1');
      assertSliderFieldSameValues(sliderField, 1);
    });
    test('Float String', () => {
      const sliderField = createsliderFieldSameValuesConstructor('1.5');
      assertSliderFieldSameValues(sliderField, 1.5);
    });
    test('Infinity', () => {
      const sliderField = createsliderFieldSameValuesConstructor('Infinity');
      assertSliderFieldSameValues(sliderField, Infinity);
    });
    test('Negative Infinity String', () => {
      const sliderField = createsliderFieldSameValuesConstructor('-Infinity');
      assertSliderFieldSameValues(sliderField, -Infinity);
    });
  });
  suite('fromJson', () => {
    test('Empty', () => {
      const sliderField = FieldSlider.fromJson({});
      assertSliderFieldDefault(sliderField);
    });
    test('Undefined', () => {
      const sliderField = createsliderFieldSameValuesJson(undefined);
      assertSliderFieldDefault(sliderField);
    });
    test('NaN', () => {
      const sliderField = createsliderFieldSameValuesJson(NaN);
      assertSliderFieldDefault(sliderField);
    });
    test('Integer', () => {
      const sliderField = createsliderFieldSameValuesJson(1);
      assertSliderFieldSameValues(sliderField, 1);
    });
    test('Float', () => {
      const sliderField = createsliderFieldSameValuesJson(1.5);
      assertSliderFieldSameValues(sliderField, 1.5);
    });
    test('Integer String', () => {
      const sliderField = createsliderFieldSameValuesJson('1');
      assertSliderFieldSameValues(sliderField, 1);
    });
    test('Float String', () => {
      const sliderField = createsliderFieldSameValuesJson('1.5');
      assertSliderFieldSameValues(sliderField, 1.5);
    });
    test('Infinity', () => {
      const sliderField = createsliderFieldSameValuesJson('Infinity');
      assertSliderFieldSameValues(sliderField, Infinity);
    });
    test('Negative Infinity String', () => {
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
        test('Null', () => {
          this.sliderField.setValue(null);
          assertValueDefault(this.sliderField);
        });
        test('Undefined', () => {
          this.sliderField.setValue(undefined);
          assertValueDefault(this.sliderField);
        });
        test('Non-Parsable String', () => {
          this.sliderField.setValue('bad');
          assertValueDefault(this.sliderField);
        });
        test('NaN', () => {
          this.sliderField.setValue(NaN);
          assertValueDefault(this.sliderField);
        });
        test('Integer', () => {
          this.sliderField.setValue(2);
          assertValue(this.sliderField, 2);
        });
        test('Float', () => {
          this.sliderField.setValue(2.5);
          assertValue(this.sliderField, 2.5);
        });
        test('Integer String', () => {
          this.sliderField.setValue('2');
          assertValue(this.sliderField, 2);
        });
        test('Float String', () => {
          this.sliderField.setValue('2.5');
          assertValue(this.sliderField, 2.5);
        });
        test('Infinity', () => {
          this.sliderField.setValue(Infinity);
          assertValue(this.sliderField, Infinity);
        });
        test('Negative Infinity String', () => {
          this.sliderField.setValue('-Infinity');
          assertValue(this.sliderField, -Infinity);
        });
      });
      suite('Value -> New Value', () => {
        setup(() => {
          this.sliderField = new FieldSlider(1);
        });
        test('Null', () => {
          this.sliderField.setValue(null);
          assertValue(this.sliderField, 1);
        });
        test('Undefined', () => {
          this.sliderField.setValue(undefined);
          assertValue(this.sliderField, 1);
        });
        test('Non-Parsable String', () => {
          this.sliderField.setValue('bad');
          assertValue(this.sliderField, 1);
        });
        test('NaN', () => {
          this.sliderField.setValue(NaN);
          assertValue(this.sliderField, 1);
        });
        test('Integer', () => {
          this.sliderField.setValue(2);
          assertValue(this.sliderField, 2);
        });
        test('Float', () => {
          this.sliderField.setValue(2.5);
          assertValue(this.sliderField, 2.5);
        });
        test('Integer String', () => {
          this.sliderField.setValue('2');
          assertValue(this.sliderField, 2);
        });
        test('Float String', () => {
          this.sliderField.setValue('2.5');
          assertValue(this.sliderField, 2.5);
        });
        test('Infinity', () => {
          this.sliderField.setValue(Infinity);
          assertValue(this.sliderField, Infinity);
        });
        test('Negative Infinity String', () => {
          this.sliderField.setValue('-Infinity');
          assertValue(this.sliderField, -Infinity);
        });
      });
    });
    suite('Constraints', () => {
      suite('Precision', () => {
        test('Float', () => {
          const sliderField = new FieldSlider();
          sliderField.setValue(123.456);
          assertValue(sliderField, 123.456);
        });
        test('0.01', () => {
          const sliderField = FieldSlider.fromJson({precision: .01});
          sliderField.setValue(123.456);
          assertValue(sliderField, 123.46);
        });
        test('0.5', () => {
          const sliderField = FieldSlider.fromJson({precision: .5});
          sliderField.setValue(123.456);
          assertValue(sliderField, 123.5);
        });
        test('1', () => {
          const sliderField = FieldSlider.fromJson({precision: 1});
          sliderField.setValue(123.456);
          assertValue(sliderField, 123);
        });
        test('1.5', () => {
          const sliderField = FieldSlider.fromJson({precision: 1.5});
          sliderField.setValue(123.456);
          assertValue(sliderField, 123);
        });
        test('Null', () => {
          const sliderField = FieldSlider.fromJson({precision: null});
          assert.equal(sliderField.getPrecision(), 0);
        });
      });
      suite('Min', () => {
        test('-10', () => {
          const sliderField = FieldSlider.fromJson({min: -10});
          sliderField.setValue(-20);
          assertValue(sliderField, -10);
          sliderField.setValue(0);
          assertValue(sliderField, 0);
          sliderField.setValue(20);
          assertValue(sliderField, 20);
        });
        test('0', () => {
          const sliderField = FieldSlider.fromJson({min: 0});
          sliderField.setValue(-20);
          assertValue(sliderField, 0);
          sliderField.setValue(0);
          assertValue(sliderField, 0);
          sliderField.setValue(20);
          assertValue(sliderField, 20);
        });
        test('+10', () => {
          const sliderField = FieldSlider.fromJson({min: 10});
          sliderField.setValue(-20);
          assertValue(sliderField, 10);
          sliderField.setValue(0);
          assertValue(sliderField, 10);
          sliderField.setValue(20);
          assertValue(sliderField, 20);
        });
        test('Null', () => {
          const sliderField = FieldSlider.fromJson({min: null});
          assert.equal(sliderField.getMin(), -Infinity);
        });
      });
      suite('Max', () => {
        test('-10', () => {
          const sliderField = FieldSlider.fromJson({max: -10});
          sliderField.setValue(-20);
          assertValue(sliderField, -20);
          sliderField.setValue(0);
          assertValue(sliderField, -10);
          sliderField.setValue(20);
          assertValue(sliderField, -10);
        });
        test('0', () => {
          const sliderField = FieldSlider.fromJson({max: 0});
          sliderField.setValue(-20);
          assertValue(sliderField, -20);
          sliderField.setValue(0);
          assertValue(sliderField, 0);
          sliderField.setValue(20);
          assertValue(sliderField, 0);
        });
        test('+10', () => {
          const sliderField = FieldSlider.fromJson({max: 10});
          sliderField.setValue(-20);
          assertValue(sliderField, -20);
          sliderField.setValue(0);
          assertValue(sliderField, 0);
          sliderField.setValue(20);
          assertValue(sliderField, 10);
        });
        test('null', () => {
          const sliderField = FieldSlider.fromJson({max: null});
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
      test('When Editing', () => {
        this.sliderField.isBeingEdited_ = true;
        this.sliderField.htmlInput_.value = '2';
        this.sliderField.onHtmlInputChange_(null);
        assertValue(this.sliderField, 1, '2');
        this.sliderField.isBeingEdited_ = false;
      });
      test('When Not Editing', () => {
        this.sliderField.setValue(2);
        assertValue(this.sliderField, 1);
      });
    });
    suite('Force End with 6 Validator', () => {
      setup(() => {
        this.sliderField.setValidator(function(newValue) {
          return String(newValue).replace(/.$/, '6');
        });
      });
      test('When Editing', () => {
        this.sliderField.isBeingEdited_ = true;
        this.sliderField.htmlInput_.value = '25';
        this.sliderField.onHtmlInputChange_(null);
        assertValue(this.sliderField, 26, '25');
        this.sliderField.isBeingEdited_ = false;
      });
      test('When Not Editing', () => {
        this.sliderField.setValue(25);
        assertValue(this.sliderField, 26);
      });
    });
    suite('Returns Undefined Validator', () => {
      setup(() => {
        this.sliderField.setValidator(() => {});
      });
      test('When Editing', () => {
        this.sliderField.isBeingEdited_ = true;
        this.sliderField.htmlInput_.value = '2';
        this.sliderField.onHtmlInputChange_(null);
        assertValue(this.sliderField, 2);
        this.sliderField.isBeingEdited_ = false;
      });
      test('When Not Editing', () => {
        this.sliderField.setValue(2);
        assertValue(this.sliderField, 2);
      });
    });
  });
  suite('Customizations', () => {
    suite('Min', () => {
      test('JS Constructor', () => {
        const field = new FieldSlider(0, -10);
        assertSliderField(field, -10, Infinity, 0, 0);
      });
      test('JSON Definition', () => {
        const field = FieldSlider.fromJson({
          min: -10,
        });
        assertSliderField(field, -10, Infinity, 0, 0);
      });
      test('Set Constraints', () => {
        const field = new FieldSlider();
        field.setConstraints(-10);
        assertSliderField(field, -10, Infinity, 0, 0);
      });
      test('Set Min', () => {
        const field = new FieldSlider();
        field.setMin(-10);
        assertSliderField(field, -10, Infinity, 0, 0);
      });
      test('JS Configuration - Simple', () => {
        const field = new FieldSlider(
            undefined, undefined, undefined, undefined, undefined, {
              min: -10,
            });
        assertSliderField(field, -10, Infinity, 0, 0);
      });
      test('JS Configuration - Ignore', () => {
        const field = new FieldSlider(
            undefined, -1, undefined, undefined, undefined, {
              min: -10,
            });
        assertSliderField(field, -10, Infinity, 0, 0);
      });
    });
    suite('Max', () => {
      test('JS Constructor', () => {
        const field = new FieldSlider(0, undefined, 10);
        assertSliderField(field, -Infinity, 10, 0, 0);
      });
      test('JSON Definition', () => {
        const field = FieldSlider.fromJson({
          max: 10,
        });
        assertSliderField(field, -Infinity, 10, 0, 0);
      });
      test('Set Constraints', () => {
        const field = new FieldSlider();
        field.setConstraints(undefined, 10);
        assertSliderField(field, -Infinity, 10, 0, 0);
      });
      test('Set Max', () => {
        const field = new FieldSlider();
        field.setMax(10);
        assertSliderField(field, -Infinity, 10, 0, 0);
      });
      test('JS Configuration - Simple', () => {
        const field = new FieldSlider(
            undefined, undefined, undefined, undefined, undefined, {
              max: 10,
            });
        assertSliderField(field, -Infinity, 10, 0, 0);
      });
      test('JS Configuration - Ignore', () => {
        const field = new FieldSlider(
            undefined, undefined, 1, undefined, undefined, {
              max: 10,
            });
        assertSliderField(field, -Infinity, 10, 0, 0);
      });
    });
    suite('Precision', () => {
      test('JS Constructor', () => {
        const field = new FieldSlider(0, undefined, undefined, 1);
        assertSliderField(field, -Infinity, Infinity, 1, 0);
      });
      test('JSON Definition', () => {
        const field = FieldSlider.fromJson({
          precision: 1,
        });
        assertSliderField(field, -Infinity, Infinity, 1, 0);
      });
      test('Set Constraints', () => {
        const field = new FieldSlider();
        field.setConstraints(undefined, undefined, 1);
        assertSliderField(field, -Infinity, Infinity, 1, 0);
      });
      test('Set Precision', () => {
        const field = new FieldSlider();
        field.setPrecision(1);
        assertSliderField(field, -Infinity, Infinity, 1, 0);
      });
      test('JS Configuration - Simple', () => {
        const field = new FieldSlider(
            undefined, undefined, undefined, undefined, undefined, {
              precision: 1,
            });
        assertSliderField(field, -Infinity, Infinity, 1, 0);
      });
      test('JS Configuration - Ignore', () => {
        const field = new FieldSlider(
            undefined, undefined, undefined, .5, undefined, {
              precision: 1,
            });
        assertSliderField(field, -Infinity, Infinity, 1, 0);
      });
    });
  });
});
