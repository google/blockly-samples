/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Test case configuration information.
 * @typedef {object<*>}
 * @property {string} title The title for the test case.
 * @property {?} value The value.
 * @property {?} expectedValue The expected value.
 * @property {boolean} [skip] Whether this test case should be skipped. Used to
 *    skip buggy test case and should have an associated bug.
 * @property {boolean} [only] Whether this test case should be called as only.
 *    Used for debugging.
 */
export let TestCase;

/**
 * Test case configuration information.
 * @typedef {object<*>}
 * @property {string} title The title for the test suite.
 * @property {Array<TestCase>} testCases The associated test cases.
 */
export let TestSuite;

/**
 * Function that creates a mocha test callback based on test case.
 * @typedef {function(TestCase):function(Function=)}
 */
let MochaCallbackCreateFn;

/**
 * Runs provided test cases.
 * @param {Array<TestCase>} testCases The test cases to run.
 * @param {MochaCallbackCreateFn} testFn Function that returns
 *    test callback.
 */
export function runTestCases(testCases, testFn) {
  testCases.forEach((testCase) => {
    let testCall = (testCase.skip ? test.skip : test);
    testCall = (testCase.only ? test.only : testCall);
    testCall(testCase.title, testFn(testCase));
  });
}

/**
 * Runs provided test suite.
 * @param {Array<TestSuite>} testSuites The test suites to run.
 * @param {function(TestSuite):MochaCallbackCreateFn} createTestFn A function
 *    that creates function that creates test callback.
 */
export function runTestSuites(testSuites, createTestFn) {
  testSuites.forEach(function(suiteInfo) {
    suite(suiteInfo.title, function() {
      runTestCases(
          suiteInfo.testCases,
          createTestFn(suiteInfo));
    });
  });
}
