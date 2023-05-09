/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const {testHelpers} = require('@blockly/dev-tools');
const {FieldAngle} = require('../src/index');
const {assert} = require('chai');

const {
  assertFieldValue, FieldCreationTestCase, FieldValueTestCase,
  runConstructorSuiteTests, runFromJsonSuiteTests, runSetValueTests,
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
    {title: 'Infinity', value: Infinity, expectedValue: Infinity},
    {title: 'Negative Infinity', value: -Infinity, expectedValue: -Infinity},
    {title: 'Infinity String', value: 'Infinity', expectedValue: Infinity},
    {title: 'Negative Infinity String', value: '-Infinity',
      expectedValue: -Infinity},
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
    {title: '> 360°', value: 362, expectedValue: 2},
  ];
  const addArgsAndJson = function(testCase) {
    testCase.args = [testCase.value];
    testCase.json = {'value': testCase.value};
  };
  invalidValueTestCases.forEach(addArgsAndJson);
  validValueTestCases.forEach(addArgsAndJson);

  /**
   * The expected default value for the field being tested.
   * @type {*}
   */
  const defaultFieldValue = 0;
  /**
   * Asserts that the field property values are set to default.
   * @param {FieldAngle} field The field to check.
   */
  const assertFieldDefault = function(field) {
    assertFieldValue(field, defaultFieldValue);
  };
  /**
   * Asserts that the field properties are correct based on the test case.
   * @param {FieldAngle} field The field to check.
   * @param {!FieldValueTestCase} testCase The test case.
   */
  const validTestCaseAssertField = function(field, testCase) {
    assertFieldValue(field, testCase.expectedValue);
  };

  runConstructorSuiteTests(
      FieldAngle, validValueTestCases, invalidValueTestCases,
      validTestCaseAssertField, assertFieldDefault);

  runFromJsonSuiteTests(FieldAngle, validValueTestCases, invalidValueTestCases,
      validTestCaseAssertField, assertFieldDefault);

  suite('setValue', function() {
    /**
     * Create a mock block that may be used as the source block for a field.
     * @returns {!Object} Mock block.
     */
    function createBlockMock() {
      return {
        'id': 'test',
        'rendered': false,
        'workspace': {
          'rendered': false,
        },
        'isShadow': function() {
          return false;
        },
        'renameVarById': Blockly.Block.prototype.renameVarById,
        'updateVarName': Blockly.Block.prototype.updateVarName,
        'isDeadOrDying': () => false,
      };
    }

    suite('Empty -> New Value', function() {
      setup(function() {
        this.field = new FieldAngle();
      });
      runSetValueTests(
          validValueTestCases, invalidValueTestCases, defaultFieldValue);
      test('With source block', function() {
        this.field.setSourceBlock(createBlockMock());
        this.field.setValue(2.5);
        assertFieldValue(this.field, 2.5);
      });
    });
    suite('Value -> New Value', function() {
      const initialValue = 1;
      setup(function() {
        this.field = new FieldAngle(initialValue);
      });
      runSetValueTests(
          validValueTestCases, invalidValueTestCases, initialValue);
      test('With source block', function() {
        this.field.setSourceBlock(createBlockMock());
        this.field.setValue(2.5);
        assertFieldValue(this.field, 2.5);
      });
    });
    suite('Value -> New Value', function() {
      const initialValue = 1;
      setup(function() {
        this.field = new FieldAngle(initialValue);
      });
      runSetValueTests(
          validValueTestCases, invalidValueTestCases, initialValue);
      test('With source block', function() {
        this.field.setSourceBlock(createBlockMock());
        this.field.setValue(2.5);
        assertFieldValue(this.field, 2.5);
      });
    });
  });

  suite('Validators', function() {
    setup(function() {
      this.field = new FieldAngle(1);
    });
    const testSuites = [
      {title: 'Null Validator',
        validator:
            function() {
              return null;
            },
        value: 2, expectedValue: 1},
      {title: 'Force multiple of 30 Validator',
        validator:
            function(newValue) {
              return Math.round(newValue / 30) * 30;
            },
        value: 25, expectedValue: 30},
      {title: 'Returns Undefined Validator', validator: function() {},
        value: 2, expectedValue: 2},
    ];
    testSuites.forEach(function(suiteInfo) {
      suite(suiteInfo.title, function() {
        setup(function() {
          this.field.setValidator(suiteInfo.validator);
        });
        test('New Value', function() {
          this.field.setValue(suiteInfo.value);
          assertFieldValue(
              this.field, suiteInfo.expectedValue, suiteInfo.expectedText);
        });
      });
    });
  });

  suite('Customizations', function() {
    suite('Clockwise', function() {
      test('JS Configuration', function() {
        const field = new FieldAngle(0, null, {
          clockwise: true,
        });
        assert.isTrue(field.clockwise);
      });
      test('JSON Definition', function() {
        const field = FieldAngle.fromJson({
          value: 0,
          clockwise: true,
        });
        assert.isTrue(field.clockwise);
      });
    });

    suite('Offset', function() {
      test('JS Configuration', function() {
        const field = new FieldAngle(0, null, {
          offset: 90,
        });
        assert.equal(field.offset, 90);
      });
      test('JSON Definition', function() {
        const field = FieldAngle.fromJson({
          value: 0,
          offset: 90,
        });
        assert.equal(field.offset, 90);
      });
    });

    suite('Wrap', function() {
      test('JS Configuration', function() {
        const field = new FieldAngle(0, null, {
          wrap: 180,
        });
        assert.equal(field.wrap, 180);
      });
      test('JSON Definition', function() {
        const field = FieldAngle.fromJson({
          value: 0,
          wrap: 180,
        });
        assert.equal(field.wrap, 180);
      });
    });

    suite('Round', function() {
      test('JS Configuration', function() {
        const field = new FieldAngle(0, null, {
          round: 30,
        });
        assert.equal(field.round, 30);
      });
      test('JSON Definition', function() {
        const field = FieldAngle.fromJson({
          value: 0,
          round: 30,
        });
        assert.equal(field.round, 30);
      });
    });

    suite('Mode', function() {
      suite('Compass', function() {
        test('JS Configuration', function() {
          const field = new FieldAngle(0, null, {
            mode: 'compass',
          });
          assert.equal(field.offset, 90);
          assert.isTrue(field.clockwise);
        });
        test('JS Configuration', function() {
          const field = FieldAngle.fromJson({
            value: 0,
            mode: 'compass',
          });
          assert.equal(field.offset, 90);
          assert.isTrue(field.clockwise);
        });
      });
      suite('Protractor', function() {
        test('JS Configuration', function() {
          const field = new FieldAngle(0, null, {
            mode: 'protractor',
          });
          assert.equal(field.offset, 0);
          assert.isFalse(field.clockwise);
        });
        test('JS Configuration', function() {
          const field = FieldAngle.fromJson({
            value: 0,
            mode: 'protractor',
          });
          assert.equal(field.offset, 0);
          assert.isFalse(field.clockwise);
        });
      });
    });
  });

  suite('Serialization', function() {
    setup(function() {
      this.workspace = new Blockly.Workspace();
      Blockly.defineBlocksWithJsonArray([{
        'type': 'row_block',
        'message0': '%1',
        'args0': [
          {
            'type': 'input_value',
            'name': 'INPUT',
          },
        ],
        'output': null,
      }]);

      this.assertValue = (value) => {
        const block = this.workspace.newBlock('row_block');
        const field = new FieldAngle(value);
        block.getInput('INPUT').appendField(field, 'ANGLE');
        const jso = Blockly.serialization.blocks.save(block);
        assert.deepEqual(jso['fields'], {'ANGLE': value});
      };
    });

    teardown(function() {
      this.workspace.dispose();
    });

    test('Simple', function() {
      this.assertValue(90);
    });

    test('Max precision', function() {
      this.assertValue(1.000000000000001);
    });

    test('Smallest number', function() {
      this.assertValue(5e-324);
    });
  });
});
