/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as commonHelpers from './common_test_helpers.mocha';
import * as blockTestHelpers from './block_test_helpers.mocha';
import * as fieldTestHelpers from './field_test_helpers.mocha';

const {
  TestCase,
  TestSuite,
  runTestCases,
} = commonHelpers;

const {
  CodeGenerationTestCase,
  CodeGenerationTestSuite,
  runCodeGenerationTestSuites,
  runSerializationTestSuite,
  SerializationTestCase,
} = blockTestHelpers;

const {
  assertFieldValue,
  runConstructorSuiteTests,
  runFromJsonSuiteTests,
  runSetValueTests,
} = fieldTestHelpers;

export {
  assertFieldValue,
  CodeGenerationTestCase,
  CodeGenerationTestSuite,
  runCodeGenerationTestSuites,
  runConstructorSuiteTests,
  runFromJsonSuiteTests,
  runSerializationTestSuite,
  runSetValueTests,
  runTestCases,
  SerializationTestCase,
  TestCase,
  TestSuite,
};
