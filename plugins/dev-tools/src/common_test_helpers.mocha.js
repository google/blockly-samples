/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Run configuration information.
 * @typedef {{
 *            title:string,
 *            value:*
 *            skip:(boolean|undefined),
 *            only:(boolean|undefined),
 *            expectedValue:?
 *          }}
 */
let Run;

/**
 * Runs provided test cases.
 * @param {Array<Run>} runs The test cases to run.
 * @param {function(Run):function} testFn Function that returns test callback.
 * @private
 */
export function runTestCases(runs, testFn) {
  runs.forEach((run) => {
    let testCall = (run.skip ? test.skip : test);
    testCall = (run.only ? test.skip : testCall);
    testCall(run.title, testFn(run));
  });
}
