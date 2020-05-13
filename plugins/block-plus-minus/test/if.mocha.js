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
  /**
   * Asserts that the if block has the expected inputs and fields.
   * @param {!Blockly.Block} block The if block to check.
   * @param {number} ifCount The number of ifs we expect.
   * @param {=boolean} hasElse If we expect an else input.
   */
  function assertIfBlockStructure(block, ifCount, hasElse) {
    const inputs = block.inputList;
    assert.exists(inputs);
    const length = inputs.length;
    const expectedLength = hasElse ? ifCount * 2 + 1 : ifCount * 2;
    assert.equal(length, expectedLength);
    for (let i = 0; i < ifCount; i++) {
      assert.equal(inputs[i * 2].name, 'IF' + i);
      assert.equal(inputs[i * 2 + 1].name, 'DO' + i);
      if (i > 0) {
        assert.isNotNull(block.getField('MINUS' + i));
      }
    }
    if (hasElse) {
      assert.equal(inputs[length - 1].name, 'ELSE');
    }
  }

  setup(function() {
    this.workspace = new Blockly.Workspace();
  });

  teardown(function() {
    this.workspace.dispose();
  });

  test('Structure', function() {
    this.block = this.workspace.newBlock('controls_if');
    assertIfBlockStructure(this.block, 1);
  });

  suite('blockToCode', function() {
    const trivialCreateBlock = () => this.workspace.newBlock('controls_if');
    const dartSuiteTestCases = [
      {title: 'Trivial', expectedCode: 'if (false) {\n}\n',
        createBlock: trivialCreateBlock},
    ];
    const jsSuiteTestCases = [
      {title: 'Trivial', expectedCode: 'if (false) {\n}\n',
        createBlock: trivialCreateBlock},
    ];
    const luaSuiteTestCases = [
      {title: 'Trivial', expectedCode: 'if false then\nend\n',
        createBlock: trivialCreateBlock},
    ];
    const phpSuiteTestCases = [
      {title: 'Trivial', expectedCode: 'if (false) {\n}\n',
        createBlock: trivialCreateBlock},
    ];
    const pythonSuiteTestCases = [
      {title: 'Trivial', expectedCode: 'if False:\nundefined',
        createBlock: trivialCreateBlock},
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
    function assertXmlMatch(xml, blockType, expectedBlockContents='') {
      const expectedXml =
          new RegExp('<block[^>]* type="' + blockType +
              '" [^>]*>\\s*' + expectedBlockContents + '\\s*</block>');
      assert.match(xml, expectedXml);
    }

    suite('blockToXml', function() {

      setup(function() {
        this.block = this.workspace.newBlock('controls_if');
      });

      test('Trivial', function() {
        const xml =
            Blockly.Xml.domToPrettyText(Blockly.Xml.blockToDom(this.block));
        assertXmlMatch(xml, 'controls_if');
      });

      test('No else', function() {
        this.block.plus();
        this.block.plus();
        const expectedBlockContents =
            '<mutation elseif="2"></mutation>';
        const xml =
            Blockly.Xml.domToPrettyText(Blockly.Xml.blockToDom(this.block));
        assertXmlMatch(xml, 'controls_if', expectedBlockContents);
      });

      test('With else', function() {
        const block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
            `<block type="controls_if" id="if" x="44" y="134">
        <mutation elseif="3" else="1"></mutation>
      </block>`
        ), this.workspace);
        const expectedBlockContents =
            '<mutation elseif="3" else="1"></mutation>';
        const xml =
            Blockly.Xml.domToPrettyText(Blockly.Xml.blockToDom(block));
        assertXmlMatch(xml, 'controls_if', expectedBlockContents);
      });
    });

    suite('xmlToBlock', function() {
      test('Trivial', function() {
        const block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
            '<block type="controls_if"/>'
        ), this.workspace);
        assertIfBlockStructure(block, 1);
      });

      test('No else', function() {
        const block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
            `<block type="controls_if">
        <mutation elseif="2"></mutation>
      </block>`
        ), this.workspace);
        assertIfBlockStructure(block, 3);
      });

      test('With else', function() {
        const block = Blockly.Xml.domToBlock(Blockly.Xml.textToDom(
            `<block type="controls_if" id="if" x="44" y="134">
        <mutation elseif="3" else="1"></mutation>
      </block>`
        ), this.workspace);
        assertIfBlockStructure(block, 4, true);
      });
    });
  });

  suite('Adding and removing inputs', function() {
    setup(function() {
      this.block = this.workspace.newBlock('controls_if');
    });

    test('Add', function() {
      assertIfBlockStructure(this.block, 1);
      this.block.plus();
      assertIfBlockStructure(this.block, 2);
    });

    test('Add lots', function() {
      assertIfBlockStructure(this.block, 1);
      for (let i = 0; i < 9; i++) {
        this.block.plus();
      }
      assertIfBlockStructure(this.block, 10);
    });

    test('Remove nothing', function() {
      assertIfBlockStructure(this.block, 1);
      this.block.minus();
      assertIfBlockStructure(this.block, 1);
    });

    test('Remove', function() {
      assertIfBlockStructure(this.block, 1);
      this.block.plus();
      this.block.minus();
      assertIfBlockStructure(this.block, 1);
    });

    test('Remove lots', function() {
      assertIfBlockStructure(this.block, 1);
      for (let i = 0; i < 9; i++) {
        this.block.plus();
      }
      for (let i = 0; i < 5; i++) {
        this.block.minus();
      }
      assertIfBlockStructure(this.block, 5);
    });

    test('Remove attached', function() {
      const block = this.workspace.newBlock('logic_boolean');

      assertIfBlockStructure(this.block, 1);
      this.block.plus();
      this.block.getInput('IF1').connection
          .connect(block.outputConnection);
      assert.equal(this.block.getInputTargetBlock('IF1'), block);

      this.block.minus();
      assertIfBlockStructure(this.block, 1);
      assert.isNull(block.outputConnection.targetBlock());

      // Assert that it does not get reattached. Only reattach on undo.
      this.block.plus();
      assertIfBlockStructure(this.block, 2);
      assert.isNull(block.outputConnection.targetBlock());
    });
  });
});
