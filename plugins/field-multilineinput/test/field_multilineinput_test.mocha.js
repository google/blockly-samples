/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const {testHelpers} = require('@blockly/dev-tools');
const {FieldMultilineInput} = require('../src/index');
const {assert} = require('chai');

const {
  assertFieldValue, FieldCreationTestCase, FieldValueTestCase,
  runConstructorSuiteTests, runFromJsonSuiteTests, runSetValueTests,
} = testHelpers;

suite('FieldMultilineInput', function() {
  /**
   * Configuration for field tests with invalid values.
   * @type {Array<FieldCreationTestCase>}
   */
  const invalidValueTestCases = [
    {title: 'Undefined', value: undefined},
    {title: 'Null', value: null},
  ];
  /**
   * Configuration for field tests with valid values.
   * @type {Array<FieldCreationTestCase>}
   */
  const validValueTestCases = [
    {title: 'Empty string', value: '', expectedValue: ''},
    {title: 'String no newline', value: 'value', expectedValue: 'value'},
    {
      title: 'String with newline',
      value: 'bark bark\n bark bark bark\n bark bar bark bark\n',
      expectedValue: 'bark bark\n bark bark bark\n bark bar bark bark\n',
    },
    {title: 'Boolean true', value: true, expectedValue: 'true'},
    {title: 'Boolean false', value: false, expectedValue: 'false'},
    {title: 'Number (Truthy)', value: 1, expectedValue: '1'},
    {title: 'Number (Falsy)', value: 0, expectedValue: '0'},
    {title: 'NaN', value: NaN, expectedValue: 'NaN'},
  ];
  const addArgsAndJson = function(testCase) {
    testCase.args = [testCase.value];
    testCase.json = {'text': testCase.value};
  };
  invalidValueTestCases.forEach(addArgsAndJson);
  validValueTestCases.forEach(addArgsAndJson);

  /**
   * The expected default value for the field being tested.
   * @type {*}
   */
  const defaultFieldValue = '';
  /**
   * Asserts that the field property values are set to default.
   * @param {!FieldMultilineInput} field The field to check.
   */
  const assertFieldDefault = function(field) {
    assertFieldValue(field, defaultFieldValue);
  };

  /**
   * Asserts that the field properties are correct based on the test case.
   * @param {FieldMultilineInput} field The field to check.
   * @param {FieldValueTestCase} testCase The test case.
   */
  const validTestCaseAssertField = function(field, testCase) {
    assertFieldValue(field, testCase.expectedValue);
  };

  runConstructorSuiteTests(
      FieldMultilineInput, validValueTestCases, invalidValueTestCases,
      validTestCaseAssertField, assertFieldDefault);

  runFromJsonSuiteTests(
      FieldMultilineInput, validValueTestCases, invalidValueTestCases,
      validTestCaseAssertField, assertFieldDefault);

  suite('setValue', function() {
    suite('Empty -> New Value', function() {
      setup(function() {
        this.field = new FieldMultilineInput();
      });
      runSetValueTests(
          validValueTestCases, invalidValueTestCases, defaultFieldValue);
    });
    suite('Value -> New Value', function() {
      const initialValue = 'oldValue';
      setup(function() {
        this.field = new FieldMultilineInput(initialValue);
      });
      runSetValueTests(
          validValueTestCases, invalidValueTestCases, initialValue);
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
        const field = new FieldMultilineInput(value);
        block.getInput('INPUT').appendField(field, 'MULTILINE');
        const jso = Blockly.serialization.blocks.save(block);
        assert.deepEqual(jso['fields'], {'MULTILINE': value});
      };
    });

    teardown(function() {
      this.workspace.dispose();
    });

    test('Single line', function() {
      this.assertValue('this is a single line');
    });

    test('Multiple lines', function() {
      this.assertValue('this\nis\n  multiple\n    lines');
    });
  });
});
