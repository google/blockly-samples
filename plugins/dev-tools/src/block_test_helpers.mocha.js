/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {assert} from 'chai';
import * as sinon from 'sinon';
import * as commonTestHelpers from './common_test_helpers.mocha';
import * as Blockly from 'blockly/core';

const {
  runTestCases,
  runTestSuites,
  TestCase,
  TestSuite,
} = commonTestHelpers;

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
 * @type {boolean|undefined} Whether to use workspaceToCode instead of
 * blockToCode for test.
 */
CodeGenerationTestCase.prototype.useWorkspaceToCode = false;
/**
 * A function that creates the block for the test.
 * @param {!Blockly.Workspace} workspace The workspace context for this test.
 * @return {!Blockly.Block}
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
 * Serialization test case.
 * @extends {TestCase}
 * @record
 */
export function SerializationTestCase() {}
SerializationTestCase.prototype = new TestCase();
/**
 * @type {string} The xml to use for test.
 */
SerializationTestCase.prototype.xml = '';
/**
 * @type {string|undefined} The expected xml after round trip. Provided if
 *    different from xml that is passed in.
 */
SerializationTestCase.prototype.expectedXml = '';
/**
 * A function that asserts tests has the expected structure after converting to
 *    block from given xml.
 * @param {!Blockly.Block} block The block to check.
 */
SerializationTestCase.prototype.assertBlockStructure = undefined;

/**
 * Returns mocha test callback for code generation based on provided
 *    generator.
 * @param {!Blockly.Generator} generator The generator to use in test.
 * @return {function(!CodeGenerationTestCase):!Function} Function that
 *    returns mocha test callback based on test case.
 * @private
 */
const createCodeGenerationTestFn_ = (generator) => {
  return (testCase) => {
    return function() {
      const block = testCase.createBlock(this.workspace);
      let code;
      let innerOrder;
      if (testCase.useWorkspaceToCode) {
        code = generator.workspaceToCode(this.workspace);
      } else {
        generator.init(this.workspace);
        code = generator.blockToCode(block);
        if (Array.isArray(code)) {
          innerOrder = code[1];
          code = code[0];
        }
      }
      const assertFunc = (typeof testCase.expectedCode === 'string') ?
          assert.equal : assert.match;
      assertFunc(code, testCase.expectedCode);
      if (!testCase.useWorkspaceToCode &&
          testCase.expectedInnerOrder !== undefined) {
        assert.equal(innerOrder, testCase.expectedInnerOrder);
      }
    };
  };
};

/**
 * Runs blockToCode test suites.
 * @param {!Array<!CodeGenerationTestSuite>} testSuites The test suites to run.
 */
export const runCodeGenerationTestSuites = (testSuites) => {
  /**
   * Creates function used to generate mocha test callback.
   * @param {!CodeGenerationTestSuite} suiteInfo The test suite information.
   * @return {function(!CodeGenerationTestCase):!Function} Function that
   *    creates mocha test callback.
   */
  const createTestFn = (suiteInfo) => {
    return createCodeGenerationTestFn_(suiteInfo.generator);
  };

  runTestSuites(testSuites, createTestFn);
};

/**
 * Runs serialization test suite.
 * @param {!Array<!SerializationTestCase>} testCases The test cases to run.
 */
export const runSerializationTestSuite = (testCases) => {
  /**
   * Creates test callback for xmlToBlock test.
   * @param {!SerializationTestCase} testCase The test case information.
   * @return {!Function} The test callback.
   */
  const createXmlToBlockTestCallback = (testCase) => {
    return function() {
      const block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
          testCase.xml), this.workspace);
      testCase.assertBlockStructure(block);
    };
  };
  /**
   * Creates test callback for xml round trip test.
   * @param {!SerializationTestCase} testCase The test case information.
   * @return {!Function} The test callback.
   */
  const createXmlRoundTripTestCallback = (testCase) => {
    return function() {
      const block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
          testCase.xml), this.workspace);
      const generatedXml =
          Blockly.Xml.domToPrettyText(
              Blockly.Xml.blockToDom(block));
      const expectedXml = testCase.expectedXml || testCase.xml;
      assert.equal(generatedXml, expectedXml);
    };
  };
  suite('Serialization', function() {
    suite('xmlToBlock', function() {
      runTestCases(testCases, createXmlToBlockTestCallback);
    });
    suite('xml round-trip', function() {
      setup(function() {
        sinon.stub(Blockly.utils, 'genUid').returns('1');
      });

      teardown(function() {
        sinon.restore();
      });

      runTestCases(testCases, createXmlRoundTripTestCallback);
    });
  });
};
