/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {assert} from 'chai';
import * as commonTestHelpers from './common_test_helpers.mocha';

const {
  runTestSuites,
  TestCase,
  TestSuite,
} = commonTestHelpers;

export const assertBlockXmlContentsMatch = (
    xml, blockType, expectedBlockContents='') => {
  const expectedXml =
      new RegExp('<block [^>]*type="' + blockType +
          '"[^>]*>\\s*' + expectedBlockContents + '\\s*</block>');
  assert.match(xml, expectedXml);
};

/**
 * Code generation test case.
 * @extends {TestCase}
 * @record
 */
export function CodeGenerationTestCase() {}
CodeGenerationTestCase.prototype = new TestCase();
/**
 * @type {string} The expected code.
 */
CodeGenerationTestCase.prototype.expectedCode = '';
/**
 * @type {number|undefined} The expected inner order.
 */
CodeGenerationTestCase.prototype.expectedInnerOrder = undefined;
/**
 * A function that creates the block for the test.
 * @param {Blockly.Workspace} workspace The workspace context for this test.
 * @return {Blockly.Block}
 */
CodeGenerationTestCase.prototype.createBlock = undefined;

/**
 * Code generation test suite.
 * @extends {TestSuite<CodeGenerationTestCase>}
 * @record
 */
export function CodeGenerationTestSuite() {}
CodeGenerationTestSuite.prototype = new TestSuite();
/**
 * @type {!Blockly.Generator} The generator to use for running test cases.
 */
CodeGenerationTestSuite.prototype.generator = undefined;


/**
 * Returns mocha test callback for code generation based on provided
 *    generator.
 * @param {Blockly.Generator} generator The generator to use in test.
 * @return {function(CodeGenerationTestCase):Function} Function that
 *    returns mocha test callback based on test case.
 * @private
 */
const createCodeGenerationTestFn_ = (generator) => {
  /**
   * Returns mocha test callback based on test case.
   * @param {CodeGenerationTestCase} testCase
   * @return {function(CodeGenerationTestCase):Function}
   */
  const testFn = (testCase) => {
    return function() {
      const block = testCase.createBlock(this.workspace);
      const tuple = generator.blockToCode(block);
      let code;
      let innerOrder;
      if (Array.isArray(tuple)) {
        innerOrder = tuple[1];
        code = tuple[0];
      } else {
        code = tuple;
      }
      const assertFunc = (typeof testCase.expectedCode === 'string') ?
          assert.equal : assert.match;
      assertFunc(code, testCase.expectedCode);
      if (testCase.expectedInnerOrder !== undefined) {
        assert.equal(innerOrder, testCase.expectedInnerOrder);
      }
    };
  };
  return testFn;
};

/**
 * Runs blockToCode test suites.
 * @param {Array<CodeGenerationTestSuite>} testSuites The test suites to run.
 */
export const runCodeGenerationTestSuites = (testSuites) => {
  /**
   * Creates function used to generate mocha test callback.
   * @param {CodeGenerationTestSuite} suiteInfo The test suite information.
   * @return {function(CodeGenerationTestCase):Function} Function that
   *    creates mocha test callback.
   */
  const createTestFn = (suiteInfo) => {
    return createCodeGenerationTestFn_(suiteInfo.generator);
  };
  
  runTestSuites(testSuites, createTestFn);
};
