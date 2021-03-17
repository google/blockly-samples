/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Unit tests for round-tripping though serialization.
 */

const chai = require('chai');
const Blockly = require('blockly/node');

const {pluginInfo} = require('../src/index.js');
const {getCheck} = require('../src/utils');
const {
  clearTwoBlockTests, twoBlockTest, runTwoBlockTests,
  clearThreeBlockTests, threeBlockTest, runThreeBlockTests,
  clearSiblingTests, siblingTest, runSiblingTests,
  createBlockDefs,
} = require('./connection_checker_test_helper.mocha');

suite('Serialization', function() {
  setup(function() {
    const hierarchyDef = {
      // Random is a type disconnected from the rest of the hierarchy.
      'Random': { },
      'Animal': { },
      'FlyingAnimal': {
        'fulfills': ['Animal'],
      },
      'Mammal': {
        'fulfills': ['Animal'],
      },
      'Reptile': {
        'fulfills': ['Animal'],
      },
      'Dog': {
        'fulfills': ['Mammal'],
      },
      'Cat': {
        'fulfills': ['Mammal'],
      },
      'Bat': {
        'fulfills': ['FlyingAnimal', 'Mammal'],
      },
    };

    let types = Object.keys(hierarchyDef);
    types.push('T');
    types = types.map((type) => type.toLowerCase());
    this.blocks = createBlockDefs(types);
    Blockly.defineBlocksWithJsonArray(this.blocks);

    const options = {
      plugins: {
        ...pluginInfo,
      },
    };

    this.workspace = new Blockly.Workspace(options);
    this.workspace.connectionChecker.init(hierarchyDef);
    this.checker = this.workspace.connectionChecker;

    this.bindConnection = function(connection, explicitType) {
      connection.getSourceBlock().bindType(getCheck(connection), explicitType);
    };
    this.assertRoundTrip = function() {
      const originalXml = Blockly.Xml.workspaceToDom(this.workspace);
      this.workspace.clear();
      Blockly.Xml.domToWorkspace(originalXml, this.workspace);
      const targetXml = Blockly.Xml.workspaceToDom(this.workspace);

      const expectedXmlText = Blockly.Xml.domToText(originalXml);
      const actualXmlText = Blockly.Xml.domToText(targetXml);

      chai.assert.equal(actualXmlText, expectedXmlText);
    };
  });

  teardown(function() {
    for (const block of this.blocks) {
      delete Blockly.Blocks[block.type];
    }
    this.workspace.dispose();
  });

  suite('Simple subtyping', function() {
    clearTwoBlockTests();

    twoBlockTest('Exact types', function() {
      const dogIn = this.getOuterInput('dog');
      const dogOut = this.getInnerOutput('dog');
      dogIn.connect(dogOut);
      this.assertRoundTrip();
    });

    twoBlockTest('Simple super', function() {
      const mammalIn = this.getOuterInput('mammal');
      const dogOut = this.getInnerOutput('dog');
      mammalIn.connect(dogOut);
      this.assertRoundTrip();
    });

    twoBlockTest('Deep super', function() {
      const animalIn = this.getOuterInput('animal');
      const dogOut = this.getInnerOutput('dog');
      animalIn.connect(dogOut);
      this.assertRoundTrip();
    });

    runTwoBlockTests();

    clearSiblingTests();

    siblingTest('Multiple exact types', function() {
      const dog = this.getMain('dog');
      const dogOut1 = this.getInnerOutput('dog');
      const dogOut2 = this.getInnerOutput('dog');
      dog.in1.connect(dogOut1);
      dog.in2.connect(dogOut2);
      this.assertRoundTrip();
    });

    siblingTest('Multiple sub types', function() {
      const mammal = this.getMain('mammal');
      const dogOut = this.getInnerOutput('dog');
      const catOut = this.getInnerOutput('cat');
      mammal.in1.connect(dogOut);
      mammal.in2.connect(catOut);
      this.assertRoundTrip();
    });

    runSiblingTests();
  });

  suite('Simple generics', function() {
    clearThreeBlockTests();

    threeBlockTest('Outer explicit, main generic, inner unbound',
        function() {
          const dogIn = this.getOuterInput('dog');
          const t = this.getMain('t');
          const tOut = this.getInnerOutput('t');
          dogIn.connect(t.out);
          t.in.connect(tOut);
          this.assertRoundTrip();
        });

    threeBlockTest('Outer explicit, main generic, inner explicit exact',
        function() {
          const dogIn = this.getOuterInput('dog');
          const t = this.getMain('t');
          const dogOut = this.getInnerOutput('dog');
          dogIn.connect(t.out);
          t.in.connect(dogOut);
          this.assertRoundTrip();
        });

    threeBlockTest('Outer explicit, main generic, inner explicit sub',
        function() {
          const mammalIn = this.getOuterInput('dog');
          const t = this.getMain('t');
          const dogOut = this.getInnerOutput('dog');
          mammalIn.connect(t.out);
          t.in.connect(dogOut);
          this.assertRoundTrip();
        });

    runThreeBlockTests();

    clearTwoBlockTests();

    twoBlockTest('Outer explicit, inner unbound', function() {
      const dogIn = this.getOuterInput('dog');
      const tOut = this.getInnerOutput('t');
      dogIn.connect(tOut);
      this.assertRoundTrip();
    });

    twoBlockTest('Outer explicit, inner bound exact', function() {
      const dogIn = this.getOuterInput('dog');
      const tOut = this.getInnerOutput('t');
      this.bindConnection(tOut, 'dog');
      dogIn.connect(tOut);
      this.assertRoundTrip();
    });

    twoBlockTest('Outer explicit, inner bound sub', function() {
      const mammalIn = this.getOuterInput('mammal');
      const tOut = this.getInnerOutput('t');
      this.bindConnection(tOut, 'dog');
      mammalIn.connect(tOut);
      this.assertRoundTrip();
    });

    twoBlockTest('Outer unbound, inner explicit', function() {
      const tIn = this.getOuterInput('t');
      const dogOut = this.getInnerOutput('dog');
      tIn.connect(dogOut);
      this.assertRoundTrip();
    });

    twoBlockTest('Outer unbound, inner unbound', function() {
      const tIn = this.getOuterInput('t');
      const tOut = this.getInnerOutput('t');
      tIn.connect(tOut);
      this.assertRoundTrip();
    });

    twoBlockTest('Outer unbound, inner bound', function() {
      const tIn = this.getOuterInput('t');
      const tOut = this.getInnerOutput('t');
      this.bindConnection(tOut, 'dog');
      tIn.connect(tOut);
      this.assertRoundTrip();
    });

    twoBlockTest('Outer bound, inner explicit exact', function() {
      const tIn = this.getOuterInput('t');
      const dogOut = this.getInnerOutput('dog');
      this.bindConnection(tIn, 'dog');
      tIn.connect(dogOut);
      this.assertRoundTrip();
    });

    twoBlockTest('Outer bound, inner explicit sub', function() {
      const tIn = this.getOuterInput('t');
      const dogOut = this.getInnerOutput('dog');
      this.bindConnection(tIn, 'mammal');
      tIn.connect(dogOut);
      this.assertRoundTrip();
    });

    twoBlockTest('Outer bound, inner unbound', function() {
      const tIn = this.getOuterInput('t');
      const tOut = this.getInnerOutput('t');
      this.bindConnection(tIn, 'dog');
      tIn.connect(tOut);
      this.assertRoundTrip();
    });

    twoBlockTest('Outer bound, inner bound exact', function() {
      const tIn = this.getOuterInput('t');
      const tOut = this.getInnerOutput('t');
      this.bindConnection(tIn, 'dog');
      this.bindConnection(tOut, 'dog');
      tIn.connect(tOut);
      this.assertRoundTrip();
    });

    twoBlockTest('Outer bound, inner bound sub', function() {
      const tIn = this.getOuterInput('t');
      const tOut = this.getInnerOutput('t');
      this.bindConnection(tIn, 'mammal');
      this.bindConnection(tOut, 'dog');
      tIn.connect(tOut);
      this.assertRoundTrip();
    });

    runTwoBlockTests();
  });

  suite('Multiple inputs on generics', function() {
    setup(function() {
      const hierarchy = {
        'typeA': {},
        'typeB': {},
        'typeC': {
          'fulfills': ['typeB', 'typeA'],
        },
        'typeD': {
          'fulfills': ['typeB', 'typeA'],
        },
        'typeE': {},
      };

      const types = Object.keys(hierarchy);
      this.multiTypeBlocks = createBlockDefs(types);
      Blockly.defineBlocksWithJsonArray(this.multiTypeBlocks);

      this.checker.init(hierarchy);
    });

    teardown(function() {
      for (const block of this.multiTypeBlocks) {
        delete Blockly.Blocks[block.type];
      }
    });

    clearSiblingTests();

    siblingTest('No outer, compat inners', function() {
      const t = this.getMain('t');
      const typeCOut = this.getInnerOutput('typeC');
      const typeDOut = this.getInnerOutput('typeD');
      t.in1.connect(typeCOut);
      t.in2.connect(typeDOut);
      this.assertRoundTrip();
    });

    siblingTest('No outer, half compat inners', function() {
      const t = this.getMain('t');
      const t2 = this.getMain('t');
      const typeAOut = this.getInnerOutput('typeA');
      const typeCOut = this.getInnerOutput('typeC');
      const typeDOut = this.getInnerOutput('typeD');
      t.in1.connect(typeAOut);
      t2.in1.connect(typeCOut);
      t2.in2.connect(typeDOut);
      t.in2.connect(t2.out);
      this.assertRoundTrip();
    });

    siblingTest('Outer unbound, compat inners', function() {
      const tIn = this.getOuterInput('t');
      const t = this.getMain('t');
      const typeCOut = this.getInnerOutput('typeC');
      const typeDOut = this.getInnerOutput('typeD');
      tIn.connect(t.out);
      t.in1.connect(typeCOut);
      t.in2.connect(typeDOut);
      this.assertRoundTrip();
    });

    siblingTest('Outer unbound, half compat inners', function() {
      const tIn = this.getOuterInput('t');
      const t = this.getMain('t');
      const t2 = this.getMain('t');
      const typeAOut = this.getInnerOutput('typeA');
      const typeCOut = this.getInnerOutput('typeC');
      const typeDOut = this.getInnerOutput('typeD');
      tIn.connect(t.out);
      t.in1.connect(typeAOut);
      t2.in1.connect(typeCOut);
      t2.in2.connect(typeDOut);
      t.in2.connect(t2.out);
      this.assertRoundTrip();
    });

    runSiblingTests();
  });

  suite('Multiple explicit types on generics', function() {
    setup(function() {
      const hierarchy = {
        'typeA': {},
        'typeB': {},
        'typeC': {
          'fulfills': ['typeB', 'typeA'],
        },
        'typeD': {
          'fulfills': ['typeB', 'typeA'],
        },
        'typeE': {},
      };

      const types = Object.keys(hierarchy);
      this.multiTypeBlocks = createBlockDefs(types);
      Blockly.defineBlocksWithJsonArray(this.multiTypeBlocks);

      this.checker.init(hierarchy);
    });

    teardown(function() {
      for (const block of this.multiTypeBlocks) {
        delete Blockly.Blocks[block.type];
      }
    });
    clearSiblingTests();

    siblingTest('Compat outer, multi main', function() {
      const typeAIn = this.getOuterInput('typeA');
      const t = this.getMain('t');
      const typeCOut = this.getInnerOutput('typeC');
      const typeDOut = this.getInnerOutput('typeD');
      typeAIn.connect(t.out);
      t.in1.connect(typeCOut);
      t.in2.connect(typeDOut);
      this.assertRoundTrip();
    });

    siblingTest('Two multi mains, compatible', function() {
      const t1 = this.getMain('t', 't1');
      const t2 = this.getMain('t', 't2');
      const typeCOut1 = this.getInnerOutput('typeC');
      const typeDOut1 = this.getInnerOutput('typeD');
      const typeCOut2 = this.getInnerOutput('typeC');
      const typeDOut2 = this.getInnerOutput('typeD');
      t1.in1.connect(t2.out);
      t1.in2.connect(typeCOut1);
      t1.in3.connect(typeDOut1);
      t2.in1.connect(typeCOut2);
      t2.in2.connect(typeDOut2);
      this.assertRoundTrip();
    });

    runSiblingTests();
  });
});
