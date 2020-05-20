/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {assert} from 'chai';
import {runTestSuites, TestCase, TestSuite} from './common_test_helpers.mocha';

export const assertBlockXmlContentsMatch = (
    xml, blockType, expectedBlockContents='') => {
  const expectedXml =
      new RegExp('<block[^>]* type="' + blockType +
          '" [^>]*>\\s*' + expectedBlockContents + '\\s*</block>');
  assert.match(xml, expectedXml);
};

/**
 * Test case configuration information.
 * @typedef {TestCase}
 * @property {string} expectedCode The expected code.
 * @property {function(Blockly.Workspace):Blockly.Block} createBlock A function
 *    that creates the block for the test.
 */
export let CodeGenerationTestCase;

/**
 * Test case configuration information.
 * @typedef {TestSuite}
 * @property {Blockly.Generator} generator The generator associated with this
 *    test suite.
 * @property {Array<CodeGenerationTestCase>} testCases The test cases for this
 *    suite.
 */
export let CodeGenerationTestSuite;

/**
 * Returns mocha test callback for code generation based on provided
 *    generator.
 * @param {Blockly.Generator} generator The generator to use in test.
 * @return {function(CodeGenerationTestCase): Function} The test callback.
 * @private
 */
const createCodeGenerationTestFn_ = (generator) => {
  return (testCase) => {
    return function() {
      const block = testCase.createBlock(this.workspace);
      const code = generator.blockToCode(block);
      assert.equal(code, testCase.expectedCode);
    };
  };
};

/**
 * Runs blockToCode test suites.
 * @param {Array<CodeGenerationTestSuite>} testSuites The test suites to run.
 */
export const runCodeGenerationTestSuites = (testSuites) => {
  /**
   * Creates function used to generate mocha test callback.
   * @param {TestSuite} suiteInfo The test suite information.
   * @return {function(TestCase): Function} Function that creates
   *    mocha test callback.
   */
  const createTestFn = (suiteInfo) => {
    return (
    /** @type {function(TestCase):function} */ createCodeGenerationTestFn_(
          (/** @type {CodeGenerationTestSuite} */ suiteInfo).generator)
    );
  };
  runTestSuites(/** @type {Array<TestSuite>} */ testSuites, createTestFn);
};
