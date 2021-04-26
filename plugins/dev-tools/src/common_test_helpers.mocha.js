/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Test case configuration information.
 * @record
 */
export function TestCase() {}
/**
 * @type {string} The title for the test case.
 */
TestCase.prototype.title = '';
/**
 * @type {boolean|undefined} Whether this test case should be skipped. Used to
 *    skip buggy test case and should have an associated bug.
 */
TestCase.prototype.skip = false;
/**
 * @type {boolean|undefined} Whether this test case should be called as only.
 *    Used for debugging.
 */
TestCase.prototype.only = false;

/**
 * Test suite configuration information.
 * @record
 * @template {TestCase} T
 */
export function TestSuite() {}
/**
 * @type {string} The title for the test case.
 */
TestSuite.prototype.title = '';
/**
 * @type {boolean} Whether this test suite should be skipped. Used to
 *    skip buggy test case and should have an associated bug.
 */
TestSuite.prototype.skip = false;
/**
 * @type {boolean} Whether this test suite should be called as only.
 *    Used for debugging.s
 */
TestSuite.prototype.only = false;
/**
 * @type {!Array<T>} The associated test cases.
 */
TestSuite.prototype.testCases = [];

/**
 * Runs provided test cases.
 * @template {TestCase} T
 * @param {!Array<T>} testCases The test cases to run.
 * @param {function(T):Function} createTestCallback Creates test
 *    callback using given test case.
 */
export function runTestCases(testCases, createTestCallback) {
  testCases.forEach((testCase) => {
    let testCall = (testCase.skip ? test.skip : test);
    testCall = (testCase.only ? test.only : testCall);
    testCall(testCase.title, createTestCallback(testCase));
  });
}

/**
 * Runs provided test suite.
 * @template {TestSuite} T
 * @param {Array<!TestSuite<T>>} testSuites The test suites to run.
 * @param {function(!TestSuite<T>):(function(T):!Function)
 *    } createTestCaseCallback Creates test case callback using given test
 *    suite.
 */
export function runTestSuites(testSuites, createTestCaseCallback) {
  testSuites.forEach((testSuite) => {
    let suiteCall = (testSuite.skip ? suite.skip : suite);
    suiteCall = (testSuite.only ? suite.only : suiteCall);
    suiteCall(testSuite.title, function() {
      runTestCases(testSuite.testCases, createTestCaseCallback(testSuite));
    });
  });
}

/**
 * Captures the strings sent to console.warn() when calling a function.
 * Copies from core.
 * @param {function} innerFunc The function where warnings may called.
 * @return {string[]} The warning messages (only the first arguments).
 */
export function captureWarnings(innerFunc) {
  const msgs = [];
  const nativeConsoleWarn = console.warn;
  try {
    console.warn = function(msg) {
      msgs.push(msg);
    };
    innerFunc();
  } finally {
    console.warn = nativeConsoleWarn;
  }
  return msgs;
}
