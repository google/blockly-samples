/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Test case configuration information.
 * @typedef {{
 *            title:string,
 *            value:*
 *            skip:(boolean|undefined),
 *            only:(boolean|undefined),
 *            expectedValue:?
 *          }}
 */
export let TestCase;

/**
 * Runs provided test cases.
 * @param {Array<TestCase>} testCases The test cases to run.
 * @param {function(TestCase):function} testFn Function that returns test
 *  callback.
 */
export function runTestCases(testCases, testFn) {
  testCases.forEach((testCase) => {
    let testCall = (testCase.skip ? test.skip : test);
    testCall = (testCase.only ? test.only : testCall);
    testCall(testCase.title, testFn(testCase));
  });
}
