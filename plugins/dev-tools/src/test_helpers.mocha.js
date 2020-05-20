/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as commonHelpers from './common_test_helpers.mocha';
import * as blockTestHelpers from './block_test_helpers.mocha';
import * as fieldTestHelpers from './field_test_helpers.mocha';

const {
  MochaTestCallback,
  TestCase,
  TestCaseCallbackGenerator,
  TestSuiteCallbackGenerator,
  runTestCases,
} = commonHelpers;

const {
  assertBlockXmlContentsMatch,
  CodeGenerationTestCase,
  CodeGenerationTestSuite,
  runCodeGenerationTestSuites,
} = blockTestHelpers;

const {
  assertFieldValue,
  runConstructorSuiteTests,
  runFromJsonSuiteTests,
  runSetValueTests,
} = fieldTestHelpers;

export {
  assertFieldValue,
  assertBlockXmlContentsMatch,
  CodeGenerationTestCase,
  CodeGenerationTestSuite,
  MochaTestCallback,
  runCodeGenerationTestSuites,
  runConstructorSuiteTests,
  runFromJsonSuiteTests,
  runSetValueTests,
  runTestCases,
  TestCase,
  TestCaseCallbackGenerator,
  TestSuiteCallbackGenerator,
};
