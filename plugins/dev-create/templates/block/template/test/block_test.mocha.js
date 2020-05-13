/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


const chai = require('chai');
const Blockly = require('blockly');
const {testHelpers} = require('@blockly/dev-tools');
require('../dist/index');

const assert = chai.assert;
const {runTestCases} = testHelpers;

suite('BlockTemplate', function() {
  setup(function() {
    this.workspace = new Blockly.Workspace();
  });

  teardown(function() {
    this.workspace.dispose();
  });

  test('Structure', function() {
    this.block = this.workspace.newBlock('block_template');
    // TODO
    // Example:
    // assert.exists(this.block.inputList, 'Has inputList');
    // assert.equal(this.block.inputList.length, 3);
    // assert.equal(this.block.getInput('IF').connection.check_.length, 1);
    // assert.equal(this.block.getInput('IF').connection.check_[0], 'Boolean');
    // assert.exists(this.block.onchangeWrapper_, 'Has onchange handler');
  });

  suite('blockToCode', function() {
    // TODO remove test code for unsupported languages
    // TODO add other relevant tests cases, such as with connected inputs
    const trivialCreateBlock = () => this.workspace.newBlock('block_template');
    const dartSuiteTestCases = [
      {title: 'Trivial', expectedCode: '', createBlock: trivialCreateBlock},
    ];
    const jsSuiteTestCases = [
      {title: 'Trivial', expectedCode: '', createBlock: trivialCreateBlock},
    ];
    const luaSuiteTestCases = [
      {title: 'Trivial', expectedCode: '', createBlock: trivialCreateBlock},
    ];
    const phpSuiteTestCases = [
      {title: 'Trivial', expectedCode: '', createBlock: trivialCreateBlock},
    ];
    const pythonSuiteTestCases = [
      {title: 'Trivial', expectedCode: '', createBlock: trivialCreateBlock},
    ];
    const testSuites = [
      {title: 'Dart', generator: Blockly.Dart, testCases: dartSuiteTestCases},
      {title: 'JavaScript', generator: Blockly.JavaScript,
        testCases: jsSuiteTestCases},
      {title: 'Lua', generator: Blockly.Lua, testCases: luaSuiteTestCases},
      {title: 'PHP', generator: Blockly.PHP, testCases: phpSuiteTestCases},
      {title: 'Python', generator: Blockly.Python,
        testCases: pythonSuiteTestCases},
    ];

    const createGeneratorTestFn = (generator) => {
      return (testCase) => {
        return function() {
          const block = testCase.createBlock();
          const code = generator.blockToCode(block);
          assert.equal(code, testCase.expectedCode);
        };
      };
    };

    testSuites.forEach(function(suiteInfo) {
      suite(suiteInfo.title, function() {
        runTestCases(
            suiteInfo.testCases, createGeneratorTestFn(suiteInfo.generator));
      });
    });
  });

  suite('Serialization', function() {
    test('blockToXml', function() {
      const expectedXml = ''; // TODO
      const xml = Blockly.Xml.domToText(Blockly.Xml.blockToDom(this.block));
      assert.equal(xml, expectedXml);
    });

    test('xmlToBlock', function() {
      const block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
          '<block type="block_template"/>'
      ), this.workspace);
      // TODO
    });

    // TODO Add more cases?
  });

  // TODO add add any other relevant tests
});
