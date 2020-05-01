/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
require('blockly');

const FieldDate = require('../dist/date_compressed');

suite('Date Fields', () => {
  /**
   * Assert that the date field's value is the same as the expected value.
   * @param {FieldDate} dateField The date field.
   * @param {string} expectedValue The expected date string value.
   */
  function assertValue(dateField, expectedValue) {
    const actualValue = dateField.getValue();
    const actualText = dateField.getText();
    assert.equal(actualValue, expectedValue);
    assert.equal(actualText, expectedValue);
  }
  /**
   * Assert that the date field's value is the same as its default value.
   * @param {FieldDate} dateField The date field.
   */
  function assertValueDefault(dateField) {
    const today = new Date().toISOString().substring(0, 10);
    assertValue(dateField, today);
  }
  suite('Constructor', () => {
    test('Empty', () => {
      const dateField = new FieldDate();
      assertValueDefault(dateField);
    });
    test('Undefined', () => {
      const dateField = new FieldDate(undefined);
      assertValueDefault(dateField);
    });
    test('2020-02-20', () => {
      const dateField = new FieldDate('2020-02-20');
      assertValue(dateField, '2020-02-20');
    });
  });
  suite('fromJson', () => {
    test('Empty', () => {
      const dateField = FieldDate.fromJson({});
      assertValueDefault(dateField);
    });
    test('Undefined', () => {
      const dateField = FieldDate.fromJson({date: undefined});
      assertValueDefault(dateField);
    });
    test('2020-02-20', () => {
      const dateField = FieldDate.fromJson({date: '2020-02-20'});
      assertValue(dateField, '2020-02-20');
    });
  });
  suite('setValue', () => {
    suite('Empty -> New Value', () => {
      setup(() => {
        this.dateField = new FieldDate();
      });
      test('Null', () => {
        this.dateField.setValue(null);
        assertValueDefault(this.dateField);
      });
      test('Undefined', () => {
        this.dateField.setValue(undefined);
        assertValueDefault(this.dateField);
      });
      test('Non-Parsable String', () => {
        this.dateField.setValue('bad');
        assertValueDefault(this.dateField);
      });
      test('Invalid Date - Month(2020-13-20)', () => {
        this.dateField.setValue('2020-13-20');
        assertValueDefault(this.dateField);
      });
      test('Invalid Date - Day(2020-02-32)', () => {
        this.dateField.setValue('2020-02-32');
        assertValueDefault(this.dateField);
      });
      test('3030-03-30', () => {
        this.dateField.setValue('3030-03-30');
        assertValue(this.dateField, '3030-03-30');
      });
    });
    suite('Value -> New Value', () => {
      setup(() => {
        this.dateField = new FieldDate('2020-02-20');
      });
      test('Null', () => {
        this.dateField.setValue(null);
        assertValue(this.dateField, '2020-02-20');
      });
      test('Undefined', () => {
        this.dateField.setValue(undefined);
        assertValue(this.dateField, '2020-02-20');
      });
      test('Non-Parsable String', () => {
        this.dateField.setValue('bad');
        assertValue(this.dateField, '2020-02-20');
      });
      test('Invalid Date - Month(2020-13-20)', () => {
        this.dateField.setValue('2020-13-20');
        assertValue(this.dateField, '2020-02-20');
      });
      test('Invalid Date - Day(2020-02-32)', () => {
        this.dateField.setValue('2020-02-32');
        assertValue(this.dateField, '2020-02-20');
      });
      test('3030-03-30', () => {
        this.dateField.setValue('3030-03-30');
        assertValue(this.dateField, '3030-03-30');
      });
    });
  });
  suite('Validators', () => {
    setup(() => {
      this.dateField = new FieldDate('2020-02-20');
    });
    teardown(() => {
      this.dateField.setValidator(null);
    });
    suite('Null Validator', () => {
      setup(() => {
        this.dateField.setValidator(() => {
          return null;
        });
      });
      test('New Value', () => {
        this.dateField.setValue('3030-03-30');
        assertValue(this.dateField, '2020-02-20');
      });
    });
    suite('Force Day 20s Validator', () => {
      setup(() => {
        this.dateField.setValidator(function(newValue) {
          return newValue.substr(0, 8) + '2' + newValue.substr(9, 1);
        });
      });
      test('New Value', () => {
        this.dateField.setValue('3030-03-30');
        assertValue(this.dateField, '3030-03-20');
      });
    });
    suite('Returns Undefined Validator', () => {
      setup(() => {
        this.dateField.setValidator(() => {});
      });
      test('New Value', () => {
        this.dateField.setValue('3030-03-30');
        assertValue(this.dateField, '3030-03-30');
      });
    });
  });
});
