/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Unit tests for NominalConnectionChecker.
 */

const chai = require('chai');
const Blockly = require('blockly/node');

const {pluginInfo, ConnectionCheckError} = require('../src/index.js');
const {
  clearTwoBlockTests, twoBlockTest, runTwoBlockTests,
  clearThreeBlockTests, threeBlockTest, runThreeBlockTests,
  clearSiblingTests, siblingTest, runSiblingTests,
  createBlockDefs,
} = require('./connection_checker_test_helper.mocha');

suite('NominalConnectionChecker', function() {
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
      'GetterList': {
        'params': [
          {
            'name': 'A',
            'variance': 'co',
          },
        ],
      },
      'AdderList': {
        'params': [
          {
            'name': 'A',
            'variance': 'contra',
          },
        ],
      },
      'List': {
        'fulfills': ['GetterList[A]', 'AdderList[A]'],
        'params': [
          {
            'name': 'A',
            'variance': 'inv',
          },
        ],
      },
    };

    const blockTypes = [
      'random',
      'animal',
      'flyinganimal',
      'mammal',
      'reptile',
      'dog',
      'cat',
      'bat',
      't',
      'getterlist[animal]',
      'getterlist[mammal]',
      'getterlist[flyinganimal]',
      'getterlist[dog]',
      'getterlist[bat]',
      'adderlist[animal]',
      'adderlist[mammal]',
      'adderlist[flyinganimal]',
      'adderlist[dog]',
      'adderlist[bat]',
      'list[animal]',
      'list[mammal]',
      'list[flyinganimal]',
      'list[dog]',
      'list[bat]',
    ];
    this.blocks = createBlockDefs(blockTypes);
    Blockly.defineBlocksWithJsonArray(this.blocks);

    const options = {
      plugins: {
        ...pluginInfo,
      },
    };

    this.workspace = new Blockly.Workspace(options);
    this.workspace.connectionChecker.init(hierarchyDef);
    this.checker = this.workspace.connectionChecker;

    this.bindConnection = function(conn, binding) {
      this.checker.bindType(conn.getSourceBlock(), 'T', binding);
    };
    this.unbindConnection = function(conn) {
      this.checker.unbindType(conn.getSourceBlock(), 'T');
    };
  });

  teardown(function() {
    for (const block of this.blocks) {
      delete Blockly.Blocks[block.type];
    }
  });

  suite('doTypeChecks', function() {
    setup(function() {
      this.assertCanConnect = function(conn1, conn2) {
        chai.assert.isTrue(this.checker.doTypeChecks(conn1, conn2),
            'Expected to be able to connect ' + conn2.name + ' to ' +
            conn1.name);
      };
      this.assertCannotConnect = function(conn1, conn2) {
        chai.assert.isFalse(this.checker.doTypeChecks(conn1, conn2),
            'Expected to be unable to connect ' + conn2.name + ' to ' +
             conn1.name);
      };
    });

    suite('Bad types', function() {
      setup(function() {
        this.assertThrows = (conn1, conn2) => {
          chai.assert.throws(() => {
            this.checker.doTypeChecks(conn1, conn2);
          }, ConnectionCheckError);
        };
      });

      clearTwoBlockTests();

      twoBlockTest('Padding', function() {
        Blockly.defineBlocksWithJsonArray(createBlockDefs(['  dog  ']));
        const dogIn = this.getOuterInput('dog');
        const paddingOut = this.getOuterInput('  dog  ');
        this.assertThrows(dogIn, paddingOut);
      });

      twoBlockTest('Type not defined', function() {
        Blockly.defineBlocksWithJsonArray(createBlockDefs(['typeA']));
        const aIn = this.getOuterInput('typeA');
        const aOut = this.getInnerOutput('typeA');
        this.assertThrows(aIn, aOut);
      });

      twoBlockTest('Missing params', function() {
        Blockly.defineBlocksWithJsonArray(createBlockDefs(['list']));
        const listIn = this.getOuterInput('list');
        const listOut = this.getInnerOutput('list');
        this.assertThrows(listIn, listOut);
      });

      twoBlockTest('Extra params', function() {
        Blockly.defineBlocksWithJsonArray(createBlockDefs(['list[dog, dog]']));
        const listIn = this.getOuterInput('list[dog, dog]');
        const listOut = this.getInnerOutput('list[dog, dog]');
        this.assertThrows(listIn, listOut);
      });

      runTwoBlockTests();
    });

    suite('Simple subtyping', function() {
      clearTwoBlockTests();

      twoBlockTest('Exact types', function() {
        const dogIn = this.getOuterInput('dog');
        const dogOut = this.getInnerOutput('dog');
        this.assertCanConnect(dogIn, dogOut);
      });

      twoBlockTest('Simple super', function() {
        const mammalIn = this.getOuterInput('mammal');
        const dogOut = this.getInnerOutput('dog');
        this.assertCanConnect(mammalIn, dogOut);
      });

      twoBlockTest('Multiple supers', function() {
        const mammalIn = this.getOuterInput('mammal');
        const flyingAnimalIn = this.getOuterInput('flyinganimal');
        const batOut = this.getInnerOutput('bat');
        this.assertCanConnect(mammalIn, batOut);
        this.assertCanConnect(flyingAnimalIn, batOut);
      });

      twoBlockTest('Deep supers', function() {
        const animalIn = this.getOuterInput('animal');
        const dogOut = this.getInnerOutput('dog');
        this.assertCanConnect(animalIn, dogOut);
      });

      twoBlockTest('Unrelated types', function() {
        const dogIn = this.getOuterInput('dog');
        const batOut = this.getInnerOutput('bat');
        this.assertCannotConnect(dogIn, batOut);
      });

      twoBlockTest('Backwards types', function() {
        const dogIn = this.getOuterInput('dog');
        const mammalOut = this.getInnerOutput('mammal');
        this.assertCannotConnect(dogIn, mammalOut);
      });

      runTwoBlockTests();

      clearSiblingTests();

      siblingTest('Exact types multiple inputs', function() {
        const dog = this.getMain('dog');
        const dogOut = this.getInnerOutput('dog');

        this.assertCanConnect(dog.in1, dogOut);
      });

      siblingTest('Sibling types multiple inputs', function() {
        const dog = this.getMain('dog');
        const catOut = this.getInnerOutput('cat');

        this.assertCannotConnect(dog.in1, catOut);
      });

      runSiblingTests();
    });

    suite('Simple generics', function() {
      // Both explicit is the other suite.

      clearTwoBlockTests();

      twoBlockTest('Outer explicit, inner unbound', function() {
        const dogIn = this.getOuterInput('dog');
        const tOut = this.getInnerOutput('t');
        this.assertCanConnect(dogIn, tOut);
      });

      twoBlockTest('Outer explicit, inner bound sub', function() {
        const mammalIn = this.getOuterInput('mammal');
        const tOut = this.getInnerOutput('t');
        this.bindConnection(tOut, 'dog');
        this.assertCanConnect(mammalIn, tOut);
      });

      twoBlockTest('Outer explicit, inner bound super', function() {
        const dogIn = this.getOuterInput('dog');
        const tOut = this.getInnerOutput('t');
        this.bindConnection(tOut, 'mammal');
        this.assertCannotConnect(dogIn, tOut);
      });

      twoBlockTest('Outer explicit, inner bound different case', function() {
        const dogIn = this.getOuterInput('dog');
        const tOut = this.getInnerOutput('t');
        this.bindConnection(tOut, 'DOG');
        this.assertCanConnect(dogIn, tOut);
      });

      twoBlockTest('Outer unbound, inner explicit', function() {
        const tIn = this.getOuterInput('t');
        const dogOut = this.getInnerOutput('dog');
        this.assertCanConnect(tIn, dogOut);
      });

      twoBlockTest('Outer unbound, inner unbound', function() {
        const tIn = this.getOuterInput('t');
        const tOut = this.getInnerOutput('t');
        this.assertCanConnect(tIn, tOut);
      });

      twoBlockTest('Outer unbound, inner bound', function() {
        const tIn = this.getOuterInput('t');
        const tOut = this.getInnerOutput('t');
        this.bindConnection(tOut, 'dog');
        this.assertCanConnect(tIn, tOut);
      });

      twoBlockTest('Outer bound, child explicit sub', function() {
        const tIn = this.getOuterInput('t');
        const dogOut = this.getInnerOutput('dog');
        this.bindConnection(tIn, 'mammal');
        this.assertCanConnect(tIn, dogOut);
      });

      twoBlockTest('Outer bound, child explicit super', function() {
        const tIn = this.getOuterInput('t');
        const dogOut = this.getInnerOutput('mammal');
        this.bindConnection(tIn, 'dog');
        this.assertCannotConnect(tIn, dogOut);
      });

      twoBlockTest('Outer bound, child unbound', function() {
        const tIn = this.getOuterInput('t');
        const tOut = this.getInnerOutput('t');
        this.bindConnection(tIn, 'dog');
        this.assertCanConnect(tIn, tOut);
      });

      twoBlockTest('Outer bound, child bound sub', function() {
        const tIn = this.getOuterInput('t');
        const tOut = this.getInnerOutput('t');
        this.bindConnection(tIn, 'mammal');
        this.bindConnection(tIn, 'dog');
        this.assertCanConnect(tIn, tOut);
      });

      twoBlockTest('Outer bound, child bound super', function() {
        const tIn = this.getOuterInput('t');
        const tOut = this.getInnerOutput('t');
        this.bindConnection(tIn, 'dog');
        this.bindConnection(tIn, 'mammal');
        this.assertCanConnect(tIn, tOut);
      });

      twoBlockTest('Outer bound different case, inner explicit', function() {
        const tIn = this.getOuterInput('t');
        const dogOut = this.getInnerOutput('dog');
        this.bindConnection(tIn, 'DOG');
        this.assertCanConnect(tIn, dogOut);
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

        this.assertCanConnect(t.in2, typeDOut);
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

        this.assertCanConnect(t.in2, t2.out);
      });

      siblingTest('No outer, incompat inners', function() {
        const t = this.getMain('t');
        const typeAOut = this.getInnerOutput('typeA');
        const typeEOut = this.getInnerOutput('typeE');

        t.in1.connect(typeAOut);

        this.assertCannotConnect(t.in2, typeEOut);
      });

      siblingTest('Outer unbound, compat inners', function() {
        const tIn = this.getOuterInput('t');
        const t = this.getMain('t');
        const typeCOut = this.getInnerOutput('typeC');
        const typeDOut = this.getInnerOutput('typeD');

        tIn.connect(t.out);
        t.in1.connect(typeCOut);

        this.assertCanConnect(t.in2, typeDOut);
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

        this.assertCanConnect(t.in2, t2.out);
      });

      siblingTest('Outer unbound, incompat inners', function() {
        const tIn = this.getOuterInput('t');
        const t = this.getMain('t');
        const typeAOut = this.getInnerOutput('typeA');
        const typeEOut = this.getInnerOutput('typeE');

        tIn.connect(t.out);
        t.in1.connect(typeAOut);

        this.assertCannotConnect(t.in2, typeEOut);
      });

      // The following tests make sure the other branch is run.
      siblingTest('Outer bound, second inner incompat', function() {
        const tIn = this.getOuterInput('t');
        const t = this.getMain('t');
        const typeCOut = this.getInnerOutput('typeC');
        const typeDOut = this.getInnerOutput('typeD');

        this.bindConnection(tIn, 'typeC');
        tIn.connect(t.out);
        t.in1.connect(typeCOut);

        this.assertCannotConnect(t.in2, typeDOut);
      });

      siblingTest('Outer explicit, second inner incompat', function() {
        const typeCIn = this.getOuterInput('typeC');
        const t = this.getMain('t');
        const typeCOut = this.getInnerOutput('typeC');
        const typeDOut = this.getInnerOutput('typeD');

        typeCIn.connect(t.out);
        t.in1.connect(typeCOut);

        this.assertCannotConnect(t.in2, typeDOut);
      });

      siblingTest('Main bound, second inner incompat', function() {
        const t = this.getMain('t');
        const typeCOut = this.getInnerOutput('typeC');
        const typeDOut = this.getInnerOutput('typeD');

        this.bindConnection(t.out, 'typeC');
        t.in1.connect(typeCOut);

        this.assertCannotConnect(t.in2, typeDOut);
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
          'typeF': {},
          'typeG': {
            'fulfills': ['typeE', 'typeF'],
          },
          'typeH': {
            'fulfills': ['typeE', 'typeF'],
          },
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

      siblingTest('Multi main, compat inner', function() {
        const t = this.getMain('t');
        const typeCOut = this.getInnerOutput('typeC');
        const typeDOut = this.getInnerOutput('typeD');
        const typeAOut = this.getInnerOutput('typeA');

        this.bindConnection(t.out, 'typeA');
        t.in1.connect(typeCOut);
        t.in2.connect(typeDOut);
        this.unbindConnection(t.out);

        this.assertCanConnect(t.in3, typeAOut);
      });

      siblingTest('Multi main, incompat inner', function() {
        const t = this.getMain('t');
        const typeCOut = this.getInnerOutput('typeC');
        const typeDOut = this.getInnerOutput('typeD');
        const typeEOut = this.getInnerOutput('typeE');

        this.bindConnection(t.out, 'typeA');
        t.in1.connect(typeCOut);
        t.in2.connect(typeDOut);
        this.unbindConnection(t.out);

        this.assertCannotConnect(t.in3, typeEOut);
      });

      siblingTest('Compat outer, multi main', function() {
        const typeAIn = this.getOuterInput('typeA');
        const t = this.getMain('t');
        const typeCOut = this.getInnerOutput('typeC');
        const typeDOut = this.getInnerOutput('typeD');

        t.in1.connect(typeCOut);
        t.in2.connect(typeDOut);

        this.assertCanConnect(typeAIn, t.out);
      });

      siblingTest('Incompat outer, multi main', function() {
        const typeEIn = this.getOuterInput('typeE');
        const t = this.getMain('t');
        const typeCOut = this.getInnerOutput('typeC');
        const typeDOut = this.getInnerOutput('typeD');

        t.in1.connect(typeCOut);
        t.in2.connect(typeDOut);

        this.assertCannotConnect(typeEIn, t.out);
      });

      siblingTest('2 multi mains, compatible', function() {
        const t1 = this.getMain('t', 't1');
        const t2 = this.getMain('t', 't2');
        const typeCOut1 = this.getInnerOutput('typeC');
        const typeDOut1 = this.getInnerOutput('typeD');
        const typeCOut2 = this.getInnerOutput('typeC');
        const typeDOut2 = this.getInnerOutput('typeD');

        t1.in1.connect(typeCOut1);
        t1.in2.connect(typeDOut1);

        t2.in1.connect(typeCOut2);
        t2.in2.connect(typeDOut2);

        this.assertCanConnect(t1.in3, t2.out);
      });

      siblingTest('2 multi mains, incompatible', function() {
        const t1 = this.getMain('t', 't1');
        const t2 = this.getMain('t', 't2');
        const typeCOut = this.getInnerOutput('typeC');
        const typeDOut = this.getInnerOutput('typeD');
        const typeGOut = this.getInnerOutput('typeG');
        const typeHOut = this.getInnerOutput('typeH');

        t1.in1.connect(typeCOut);
        t1.in2.connect(typeDOut);

        t2.in1.connect(typeGOut);
        t2.in2.connect(typeHOut);

        this.assertCannotConnect(t1.in3, t2.out);
      });

      runSiblingTests();
    });
  });

  suite('bindType', function() {
    suite('Disconnect connections', function() {
      setup(function() {
        this.assertIsConnected = function(conn) {
          chai.assert.isTrue(conn.isConnected(),
              'Expected ' + conn.name + ' to be connected.');
        };
        this.assertIsNotConnected = function(conn) {
          chai.assert.isFalse(conn.isConnected(),
              'Expected ' + conn.name + ' to be unconnected.');
        };
      });

      clearThreeBlockTests();

      threeBlockTest('Outer valid, inner valid', function() {
        const dogIn = this.getOuterInput('dog');
        const t = this.getMain('t');
        const dogOut = this.getInnerOutput('dog');

        dogIn.connect(t.out);
        t.in.connect(dogOut);
        this.bindConnection(t.out, 'dog');

        this.assertIsConnected(t.out);
        this.assertIsConnected(t.in);
      });

      threeBlockTest('Outer valid, inner invalid', function() {
        const mammalIn = this.getOuterInput('mammal');
        const t = this.getMain('t');
        const catOut = this.getInnerOutput('cat');

        mammalIn.connect(t.out);
        t.in.connect(catOut);
        this.bindConnection(t.out, 'dog');

        this.assertIsConnected(t.out);
        this.assertIsNotConnected(t.in);
      });

      threeBlockTest('Outer invalid, inner valid', function() {
        const mammalIn = this.getOuterInput('mammal');
        const t = this.getMain('t');
        const batOut = this.getInnerOutput('bat');

        mammalIn.connect(t.out);
        t.in.connect(batOut);
        this.bindConnection(t.out, 'flyinganimal');

        this.assertIsNotConnected(t.out);
        this.assertIsConnected(t.in);
      });

      threeBlockTest('Outer invalid, inner invalid', function() {
        const dogIn = this.getOuterInput('dog');
        const t = this.getMain('t');
        const dogOut = this.getInnerOutput('dog');

        dogIn.connect(t.out);
        t.in.connect(dogOut);
        this.bindConnection(t.out, 'cat');

        this.assertIsNotConnected(t.out);
        this.assertIsNotConnected(t.in);
      });

      runThreeBlockTests();

      clearSiblingTests();

      siblingTest('Some inners valid', function() {
        const t = this.getMain('t');
        const dogOut = this.getInnerOutput('dog');
        const catOut = this.getInnerOutput('cat');

        this.bindConnection(t.out, 'mammal');
        t.in1.connect(dogOut);
        t.in2.connect(catOut);
        this.unbindConnection(t.out);
        this.bindConnection(t.out, 'dog');

        this.assertIsConnected(t.in1);
        this.assertIsNotConnected(t.in2);
      });

      runSiblingTests();
    });
  });

  suite('getExplicitTypes', function() {
    setup(function() {
      this.assertNoType = function(conn) {
        const explicitTypes = this.checker.getExplicitTypes(
            conn.getSourceBlock(), 'T');
        chai.assert.isArray(explicitTypes,
            'Expected getExplicitTypes to return an array.');
        chai.assert.isEmpty(explicitTypes,
            'Expected ' + conn.name + ' to not have a type.');
      };
      this.assertHasType = function(conn, type) {
        const explicitTypes = this.checker.getExplicitTypes(
            conn.getSourceBlock(), 'T');
        chai.assert.include(explicitTypes, type,
            'Expected ' + conn.name + ' to have type ' + type + '.');
      };
    });

    suite('Bad types', function() {
      setup(function() {
        this.assertThrows = (conn) => {
          chai.assert.throws(() => {
            this.checker.getExplicitTypes(conn.getSourceBlock(), 'T');
          }, ConnectionCheckError);
        };
      });

      clearTwoBlockTests();

      twoBlockTest('Padding', function() {
        Blockly.defineBlocksWithJsonArray(createBlockDefs(['  dog  ']));
        const dogIn = this.getOuterInput('  dog  ');
        const tOut = this.getInnerOutput('t');
        dogIn.connect(tOut);
        this.assertThrows(tOut);
      });

      twoBlockTest('Type not defined', function() {
        Blockly.defineBlocksWithJsonArray(createBlockDefs(['typeA']));
        const aIn = this.getOuterInput('typeA');
        const tOut = this.getInnerOutput('t');
        aIn.connect(tOut);
        this.assertThrows(tOut);
      });

      twoBlockTest('Missing params', function() {
        Blockly.defineBlocksWithJsonArray(createBlockDefs(['list']));
        const listIn = this.getOuterInput('list');
        const tOut = this.getInnerOutput('t');
        listIn.connect(tOut);
        this.assertThrows(tOut);
      });

      twoBlockTest('Extra params', function() {
        Blockly.defineBlocksWithJsonArray(createBlockDefs(['list[dog, dog]']));
        const listIn = this.getOuterInput('list[dog, dog]');
        const tOut = this.getInnerOutput('t');
        listIn.connect(tOut);
        this.assertThrows(tOut);
      });

      runTwoBlockTests();
    });

    suite('Single blocks', function() {
      clearTwoBlockTests();

      twoBlockTest('Outer explicit', function() {
        const dogIn = this.getOuterInput('dog');
        this.assertNoType(dogIn);
      });

      twoBlockTest('Inner explicit', function() {
        const dogOut = this.getInnerOutput('dog');
        this.assertNoType(dogOut);
      });

      twoBlockTest('Outer unbound', function() {
        const tIn = this.getOuterInput('t');
        this.assertNoType(tIn);
      });

      twoBlockTest('Inner unbound', function() {
        const tOut = this.getInnerOutput('t');
        this.assertNoType(tOut);
      });

      twoBlockTest('Outer bound programmatically', function() {
        const tIn = this.getOuterInput('t');
        this.bindConnection(tIn, 'dog');
        this.assertHasType(tIn, 'dog');
      });

      twoBlockTest('Inner bound programmatically', function() {
        const tOut = this.getInnerOutput('t');
        this.bindConnection(tOut, 'dog');
        this.assertHasType(tOut, 'dog');
      });

      runTwoBlockTests();
    });

    suite('Flow through connections', function() {
      clearTwoBlockTests();

      twoBlockTest('From parent, explicit', function() {
        const dogIn = this.getOuterInput('dog');
        const tOut = this.getInnerOutput('t');

        dogIn.connect(tOut);

        this.assertHasType(tOut, 'dog');
      });

      twoBlockTest('From parent, bound', function() {
        const tIn = this.getOuterInput('t');
        const tOut = this.getInnerOutput('t');

        this.bindConnection(tIn, 'dog');
        tIn.connect(tOut);

        this.assertHasType(tOut, 'dog');
      });

      twoBlockTest('From child, explicit', function() {
        const tIn = this.getOuterInput('t');
        const dogOut = this.getInnerOutput('dog');

        tIn.connect(dogOut);

        this.assertHasType(tIn, 'dog');
      });

      twoBlockTest('From child, bound', function() {
        const tIn = this.getOuterInput('t');
        const tOut = this.getInnerOutput('t');

        this.bindConnection(tOut, 'dog');
        tIn.connect(tOut);

        this.assertHasType(tIn, 'dog');
      });

      runTwoBlockTests();

      clearThreeBlockTests();

      threeBlockTest('From grandparent', function() {
        const dogIn = this.getOuterInput('dog');
        const t = this.getMain('t');
        const tOut = this.getInnerOutput('t');

        dogIn.connect(t.out);
        t.in.connect(tOut);

        this.assertHasType(tOut, 'dog');
      });

      threeBlockTest('From grandchild', function() {
        const tIn = this.getOuterInput('t');
        const t = this.getMain('t');
        const dogOut = this.getInnerOutput('dog');

        tIn.connect(t.out);
        t.in.connect(dogOut);

        this.assertHasType(tIn, 'dog');
      });

      runThreeBlockTests();

      clearSiblingTests();

      siblingTest('From ancestor', function() {
        const dogIn = this.getOuterInput('dog');
        const tOut = this.getInnerOutput('t');

        let t = {in1: dogIn};
        for (let i = 0; i < 10; i++) {
          const newT = this.getMain('t');
          t.in1.connect(newT.out);
          t = newT;
        }
        t.in1.connect(tOut);

        this.assertHasType(tOut, 'dog');
      });

      siblingTest('From descendant', function() {
        const tIn = this.getOuterInput('t');
        const dogOut = this.getInnerOutput('dog');

        let t = {in1: tIn};
        for (let i = 0; i < 10; i++) {
          const newT = this.getMain('t');
          t.in1.connect(newT.out);
          t = newT;
        }
        t.in1.connect(dogOut);

        this.assertHasType(tIn, 'dog');
      });

      siblingTest('From parsib', function() {
        const t1 = this.getMain('t', 't1');
        const t2 = this.getMain('t', 't2');
        const dogOut = this.getInnerOutput('dog');
        const tOut = this.getInnerOutput('t');

        t1.in1.connect(dogOut);
        t1.in2.connect(t2.out);
        t2.in1.connect(tOut);

        this.assertHasType(tOut, 'dog');
      });

      siblingTest('From ancestor parsib', function() {
        const t1 = this.getMain('t', 't1');
        const dogOut = this.getInnerOutput('dog');
        const tOut = this.getInnerOutput('t');

        let tNext = t1;
        for (let i = 0; i < 10; i++) {
          const tNew = this.getMain('t');
          tNext.in1.connect(tNew.out);
          tNext = tNew;
        }
        tNext.in1.connect(tOut);
        t1.in2.connect(dogOut);

        this.assertHasType(tOut, 'dog');
      });

      siblingTest('From sibling', function() {
        const t = this.getMain('t');
        const dogOut = this.getInnerOutput('dog');
        const tOut = this.getInnerOutput('t');

        t.in1.connect(dogOut);
        t.in2.connect(tOut);

        this.assertHasType(tOut, 'dog');
      });

      siblingTest('From cousin', function() {
        const t1 = this.getMain('t', 't1');
        const t2 = this.getMain('t', 't2');
        const t3 = this.getMain('t', 't3');
        const dogOut = this.getInnerOutput('dog');
        const tOut = this.getInnerOutput('t');

        t1.in1.connect(t2.out);
        t1.in2.connect(t3.out);
        t2.in1.connect(dogOut);
        t3.in1.connect(tOut);

        this.assertHasType(tOut, 'dog');
      });

      siblingTest('From second cousin', function() {
        const t1 = this.getMain('t', 't1');
        const t2 = this.getMain('t', 't2');
        const t3 = this.getMain('t', 't3');
        const t4 = this.getMain('t', 't4');
        const t5 = this.getMain('t', 't5');
        const dogOut = this.getInnerOutput('dog');
        const tOut = this.getInnerOutput('t');

        t1.in1.connect(t2.out);
        t1.in2.connect(t3.out);
        t2.in1.connect(t4.out);
        t3.in1.connect(t5.out);
        t4.in1.connect(dogOut);
        t5.in1.connect(tOut);

        this.assertHasType(tOut, 'dog');
      });

      siblingTest('From first cousin once removed', function() {
        const t1 = this.getMain('t', 't1');
        const t2 = this.getMain('t', 't2');
        const t3 = this.getMain('t', 't3');
        const t4 = this.getMain('t', 't4');
        const dogOut = this.getInnerOutput('dog');
        const tOut = this.getInnerOutput('t');

        t1.in1.connect(t2.out);
        t1.in2.connect(t3.out);
        t2.in1.connect(dogOut);
        t3.in1.connect(t4.out);
        t4.in1.connect(tOut);

        this.assertHasType(tOut, 'dog');
      });

      siblingTest('From nibling', function() {
        const t1 = this.getMain('t', 't1');
        const t2 = this.getMain('t', 't2');
        const dogOut = this.getInnerOutput('dog');
        const tOut = this.getInnerOutput('t');

        t1.in1.connect(t2.out);
        t1.in2.connect(tOut);
        t2.in1.connect(dogOut);

        this.assertHasType(tOut, 'dog');
      });

      siblingTest('From grandnibling', function() {
        const t1 = this.getMain('t', 't1');
        const t2 = this.getMain('t', 't2');
        const t3 = this.getMain('t', 't3');
        const dogOut = this.getInnerOutput('dog');
        const tOut = this.getInnerOutput('t');

        t1.in1.connect(t2.out);
        t1.in2.connect(tOut);
        t2.in1.connect(t3.out);
        t3.in1.connect(dogOut);

        this.assertHasType(tOut, 'dog');
      });

      runSiblingTests();
    });

    suite('Flow through different generics', function() {
      clearSiblingTests();

      setup(function() {
        const types = ['T', 'a', 'b', '1', '*'];
        this.genericBlocks = createBlockDefs(types);
        Blockly.defineBlocksWithJsonArray(this.genericBlocks);
      });

      teardown(function() {
        for (const block of this.genericBlocks) {
          delete Blockly.Blocks[block.type];
        }
      });

      siblingTest('Differently cased generics - explicit outer', function() {
        const dogIn = this.getOuterInput('dog');

        let t = {in1: dogIn};
        for (let i = 0; i < 3; i++) {
          const TNew = this.getMain('T');
          t.in1.connect(TNew.out);

          const tNew = this.getMain('t');
          TNew.in1.connect(tNew.out);
          t = tNew;
        }

        this.assertHasType(t.out, 'dog');
      });

      siblingTest('Differently cased generic - explicit inner', function() {
        const tIn = this.getOuterInput('t');
        const dogOut = this.getInnerOutput('dog');

        let t = {in1: tIn};
        for (let i = 0; i < 3; i++) {
          const TNew = this.getMain('T');
          t.in1.connect(TNew.out);

          const tNew = this.getMain('t');
          TNew.in1.connect(tNew.out);
          t = tNew;
        }
        t.in1.connect(dogOut);

        this.assertHasType(tIn, 'dog');
      });

      siblingTest('Different generics - explicit outer', function() {
        const dogIn = this.getOuterInput('dog');
        const connT = this.getMain('T', 'connT');
        const conna = this.getMain('a', 'conna');
        const connb = this.getMain('b', 'connb');
        const conn1 = this.getMain('1', 'conn1');
        const connStar = this.getMain('*', 'connStar');
        const tOut = this.getInnerOutput('t');

        dogIn.connect(connT.out);
        connT.in1.connect(conna.out);
        conna.in1.connect(connb.out);
        connb.in1.connect(conn1.out);
        conn1.in1.connect(connStar.out);
        connStar.in1.connect(tOut);

        this.assertHasType(tOut, 'dog');
      });

      siblingTest('Different generics - explicit inner', function() {
        const tIn = this.getOuterInput('t');
        const connT = this.getMain('T', 'connT');
        const conna = this.getMain('a', 'conna');
        const connb = this.getMain('b', 'connb');
        const conn1 = this.getMain('1', 'conn1');
        const connStar = this.getMain('*', 'connStar');
        const dogOut = this.getInnerOutput('dog');

        tIn.connect(connT.out);
        connT.in1.connect(conna.out);
        conna.in1.connect(connb.out);
        connb.in1.connect(conn1.out);
        conn1.in1.connect(connStar.out);
        connStar.in1.connect(dogOut);

        this.assertHasType(tIn, 'dog');
      });

      runSiblingTests();

      test('Differently cased on same block - lowercase input', function() {
        Blockly.defineBlocksWithJsonArray([{
          'type': 'different_cases',
          'message0': '%1',
          'args0': [
            {
              'type': 'input_value',
              'name': 'INPUT1',
              'check': ['t'],
            },
          ],
          'output': ['T'],
        }]);

        const dog = this.workspace.newBlock('static_dog_outer_value');
        const differentCases1 = this.workspace.newBlock('different_cases');
        const differentCases2 = this.workspace.newBlock('different_cases');

        const dogIn = dog.getInput('INPUT1').connection;
        const differentCases1Out = differentCases1.outputConnection;
        const differentCases1In = differentCases1.getInput('INPUT1').connection;
        const differentCases2Out = differentCases2.outputConnection;

        // For logging.
        dogIn.name = 'dogIn';
        differentCases1Out.name = 'differentCases1Out';
        differentCases1In.name = 'differentCases1In';
        differentCases2Out.name = 'differentCases2Out';

        dogIn.connect(differentCases1Out);
        differentCases1In.connect(differentCases2Out);

        this.assertHasType(differentCases2Out, 'dog');

        delete Blockly.Blocks['different_cases'];
      });

      test('Differently cased on same block - lowercase output', function() {
        Blockly.defineBlocksWithJsonArray([{
          'type': 'different_cases',
          'message0': '%1',
          'args0': [
            {
              'type': 'input_value',
              'name': 'INPUT1',
              'check': ['T'],
            },
          ],
          'output': ['t'],
        }]);

        const dog = this.workspace.newBlock('static_dog_outer_value');
        const differentCases1 = this.workspace.newBlock('different_cases');
        const differentCases2 = this.workspace.newBlock('different_cases');

        const dogIn = dog.getInput('INPUT1').connection;
        const differentCases1Out = differentCases1.outputConnection;
        const differentCases1In = differentCases1.getInput('INPUT1').connection;
        const differentCases2Out = differentCases2.outputConnection;

        // For logging.
        dogIn.name = 'dogIn';
        differentCases1Out.name = 'differentCases1Out';
        differentCases1In.name = 'differentCases1In';
        differentCases2Out.name = 'differentCases2Out';

        dogIn.connect(differentCases1Out);
        differentCases1In.connect(differentCases2Out);

        this.assertHasType(differentCases2Out, 'dog');
      });
    });

    suite('Update on connect', function() {
      suite('Single explicit', function() {
        clearThreeBlockTests();

        threeBlockTest('Connect inner explicit last', function() {
          const tIn = this.getOuterInput('t');
          const t = this.getMain('t');
          const dogOut = this.getInnerOutput('dog');

          tIn.connect(t.out);
          t.in.connect(dogOut);

          this.assertHasType(tIn, 'dog');
        });

        threeBlockTest('Connect inner explicit first', function() {
          const tIn = this.getOuterInput('t');
          const t = this.getMain('t');
          const dogOut = this.getInnerOutput('dog');

          t.in.connect(dogOut);
          tIn.connect(t.out);

          this.assertHasType(tIn, 'dog');
        });

        threeBlockTest('Connect outer explicit last', function() {
          const dogIn = this.getOuterInput('dog');
          const t = this.getMain('t');
          const tOut = this.getInnerOutput('t');

          t.in.connect(tOut);
          dogIn.connect(t.out);

          this.assertHasType(tOut, 'dog');
        });

        threeBlockTest('Connect outer explicit first', function() {
          const dogIn = this.getOuterInput('dog');
          const t = this.getMain('t');
          const tOut = this.getInnerOutput('t');

          dogIn.connect(t.out);
          t.in.connect(tOut);

          this.assertHasType(tOut, 'dog');
        });

        runThreeBlockTests();
      });

      suite('Outer and inner explicit', function() {
        clearThreeBlockTests();

        threeBlockTest('Connect inner last', function() {
          const mammalIn = this.getOuterInput('mammal');
          const t = this.getMain('t');
          const dogOut = this.getInnerOutput('dog');

          mammalIn.connect(t.out);
          t.in.connect(dogOut);

          this.assertHasType(t.out, 'mammal');
        });

        threeBlockTest('Connect outer last', function() {
          const mammalIn = this.getOuterInput('mammal');
          const t = this.getMain('t');
          const dogOut = this.getInnerOutput('dog');

          t.in.connect(dogOut);
          mammalIn.connect(t.out);

          this.assertHasType(t.out, 'mammal');
        });

        runThreeBlockTests();
      });
    });

    suite('Update on disconnect', function() {
      suite('Single explicit', function() {
        clearThreeBlockTests();

        threeBlockTest('Inner explicit', function() {
          const tIn = this.getOuterInput('t');
          const t = this.getMain('t');
          const dogOut = this.getInnerOutput('dog');

          tIn.connect(t.out);
          t.in.connect(dogOut);
          t.in.disconnect();

          this.assertNoType(tIn);
        });

        threeBlockTest('Outer explicit', function() {
          const dogIn = this.getOuterInput('dog');
          const t = this.getMain('t');
          const tOut = this.getInnerOutput('t');

          t.in.connect(tOut);
          dogIn.connect(t.out);
          dogIn.disconnect();

          this.assertNoType(tOut);
        });

        runThreeBlockTests();
      });

      suite('Outer and inner explicit', function() {
        clearThreeBlockTests();

        threeBlockTest('Disconnect inner', function() {
          this.mammalIn = this.getOuterInput('mammal');
          this.t = this.getMain('t');
          this.dogOut = this.getInnerOutput('dog');

          this.mammalIn.connect(this.t.out);
          this.t.in.connect(this.dogOut);

          this.mammalIn.disconnect();

          this.assertHasType(this.t.out, 'dog');
        });

        threeBlockTest('Disconnect outer', function() {
          this.mammalIn = this.getOuterInput('mammal');
          this.t = this.getMain('t');
          this.dogOut = this.getInnerOutput('dog');

          this.mammalIn.connect(this.t.out);
          this.t.in.connect(this.dogOut);

          this.dogOut.disconnect();

          this.assertHasType(this.t.out, 'mammal');
        });

        runThreeBlockTests();
      });
    });

    suite('Update on bind', function() {
      clearThreeBlockTests();

      threeBlockTest('Override outer', function() {
        const mammalIn = this.getOuterInput('mammal');
        const t = this.getMain('t');

        mammalIn.connect(t.out);
        this.bindConnection(t.out, 'dog');

        this.assertHasType(t.out, 'dog');
      });

      threeBlockTest('Override outer w/ inner', function() {
        const mammalIn = this.getOuterInput('mammal');
        const t = this.getMain('t');
        const dogOut = this.getInnerOutput('dog');

        mammalIn.connect(t.out);
        t.in.connect(dogOut);
        this.bindConnection(t.out, 'dog');

        this.assertHasType(t.out, 'dog');
      });

      threeBlockTest('Override inner', function() {
        const t = this.getMain('t');
        const dogOut = this.getInnerOutput('dog');

        t.in.connect(dogOut);
        this.bindConnection(t.out, 'mammal');

        this.assertHasType(t.out, 'mammal');
      });

      runThreeBlockTests();
    });

    suite('Update on unbind', function() {
      clearThreeBlockTests();

      threeBlockTest('Stop overriding outer', function() {
        const mammalIn = this.getOuterInput('mammal');
        const t = this.getMain('t');

        mammalIn.connect(t.out);
        this.bindConnection(t.out, 'dog');
        this.unbindConnection(t.out);

        this.assertHasType(t.out, 'mammal');
      });

      threeBlockTest('Stop overriding outer w/ inner', function() {
        const mammalIn = this.getOuterInput('mammal');
        const t = this.getMain('t');
        const dogOut = this.getInnerOutput('dog');

        mammalIn.connect(t.out);
        t.in.connect(dogOut);
        this.bindConnection(t.out, 'dog');
        this.unbindConnection(t.out);

        this.assertHasType(t.out, 'mammal');
      });

      threeBlockTest('Stop overriding inner', function() {
        const t = this.getMain('t');
        const dogOut = this.getInnerOutput('dog');

        t.in.connect(dogOut);
        this.bindConnection(t.out, 'mammal');
        this.unbindConnection(t.out);

        this.assertHasType(t.out, 'dog');
      });

      runThreeBlockTests();
    });

    suite('Unification', function() {
      suite('Inputs', function() {
        clearSiblingTests();

        siblingTest('Direct children', function() {
          const t = this.getMain('t');
          const dogOut = this.getInnerOutput('dog');
          const catOut = this.getInnerOutput('cat');

          this.bindConnection(t.out, 'mammal');
          t.in1.connect(dogOut);
          t.in2.connect(catOut);
          this.unbindConnection(t.out);

          this.assertHasType(t.out, 'mammal');
        });

        siblingTest('Grandchildren', function() {
          const t1 = this.getMain('t', 't1');
          const t2 = this.getMain('t', 't2');
          const t3 = this.getMain('t', 't3');
          const dogOut = this.getInnerOutput('dog');
          const catOut = this.getInnerOutput('cat');

          this.bindConnection(t1.out, 'mammal');
          t1.in1.connect(t2.out);
          t1.in2.connect(t3.out);
          t2.in1.connect(dogOut);
          t3.in1.connect(catOut);
          this.unbindConnection(t1.out);

          this.assertHasType(t1.out, 'mammal');
        });

        siblingTest('Children and grandchildren', function() {
          const t1 = this.getMain('t', 't1');
          const t2 = this.getMain('t', 't2');
          const dogOut = this.getInnerOutput('dog');
          const catOut = this.getInnerOutput('cat');

          this.bindConnection(t1.out, 'mammal');
          t1.in1.connect(t2.out);
          t1.in2.connect(catOut);
          t2.in1.connect(dogOut);
          this.unbindConnection(t1.out);

          this.assertHasType(t1.out, 'mammal');
        });

        runSiblingTests();
      });

      suite('Outputs', function() {
        clearSiblingTests();

        siblingTest('Siblings', function() {
          const t = this.getMain('t');
          const dogOut = this.getInnerOutput('dog');
          const catOut = this.getInnerOutput('cat');
          const tOut = this.getInnerOutput('t');

          this.bindConnection(t.out, 'mammal');
          t.in1.connect(dogOut);
          t.in2.connect(catOut);
          t.in3.connect(tOut);
          this.unbindConnection(t.out);

          this.assertHasType(tOut, 'mammal');
        });

        siblingTest('Parsibs', function() {
          const t1 = this.getMain('t', 't1');
          const t2 = this.getMain('t', 't2');
          const dogOut = this.getInnerOutput('dog');
          const catOut = this.getInnerOutput('cat');
          const tOut = this.getInnerOutput('t');

          this.bindConnection(t1.out, 'mammal');
          t1.in1.connect(dogOut);
          t1.in2.connect(catOut);
          t1.in3.connect(t2.out);
          t2.in1.connect(tOut);
          this.unbindConnection(t1.out);

          this.assertHasType(tOut, 'mammal');
        });

        siblingTest('Siblings and parsibs', function() {
          const t1 = this.getMain('t', 't1');
          const t2 = this.getMain('t', 't2');
          const dogOut = this.getInnerOutput('dog');
          const catOut = this.getInnerOutput('cat');
          const tOut = this.getInnerOutput('t');

          this.bindConnection(t1.out, 'mammal');
          t1.in1.connect(dogOut);
          t1.in2.connect(t2.out);
          t2.in1.connect(catOut);
          t2.in2.connect(tOut);
          this.unbindConnection(t1.out);

          this.assertHasType(tOut, 'mammal');
        });

        runSiblingTests();
      });
    });
  });

  suite('getExplicitTypesOfConnection', function() {
    setup(function() {
      this.assertNoType = function(conn) {
        const explicitTypes = this.checker.getExplicitTypesOfConnection(conn);
        chai.assert.isArray(explicitTypes,
            'Expected getExplicitTypesOfConnection to return an array.');
        chai.assert.isEmpty(explicitTypes,
            'Expected ' + conn.name + ' to not have a type.');
      };
      this.assertHasType = function(conn, type) {
        chai.assert.include(
            this.checker.getExplicitTypesOfConnection(conn), type,
            'Expected ' + conn.name + ' to have type ' + type + '.');
      };
    });

    clearTwoBlockTests();

    twoBlockTest('Explicit input', function() {
      const dogIn = this.getOuterInput('dog');
      this.assertHasType(dogIn, 'dog');
    });

    twoBlockTest('Explicit output', function() {
      const dogOut = this.getInnerOutput('dog');
      this.assertHasType(dogOut, 'dog');
    });

    twoBlockTest('Unbound generic input', function() {
      const tIn = this.getOuterInput('t');
      this.assertNoType(tIn);
    });

    twoBlockTest('Unbound generic output', function() {
      const tOut = this.getInnerOutput('t');
      this.assertNoType(tOut);
    });

    twoBlockTest('Programmatically bound input', function() {
      const tIn = this.getOuterInput('t');
      this.bindConnection(tIn, 'dog');
      this.assertHasType(tIn, 'dog');
    });

    twoBlockTest('Programmatically bound output', function() {
      const tOut = this.getInnerOutput('t');
      this.bindConnection(tOut, 'dog');
      this.assertHasType(tOut, 'dog');
    });

    twoBlockTest('Explicit inner', function() {
      const tIn = this.getOuterInput('t');
      const dogOut = this.getInnerOutput('dog');

      tIn.connect(dogOut);

      this.assertHasType(tIn, 'dog');
    });

    twoBlockTest('Explicit outer', function() {
      const dogIn = this.getOuterInput('dog');
      const tOut = this.getInnerOutput('t');

      dogIn.connect(tOut);

      this.assertHasType(tOut, 'dog');
    });

    runTwoBlockTests();

    suite('Bad types', function() {
      setup(function() {
        this.assertThrows = (conn) => {
          chai.assert.throws(() => {
            this.checker.getExplicitTypesOfConnection(conn);
          }, ConnectionCheckError);
        };
      });

      clearTwoBlockTests();

      twoBlockTest('Padding', function() {
        Blockly.defineBlocksWithJsonArray(createBlockDefs(['  dog  ']));
        const dogIn = this.getOuterInput('  dog  ');
        const tOut = this.getInnerOutput('t');
        dogIn.connect(tOut);
        this.assertThrows(tOut);
      });

      twoBlockTest('Type not defined', function() {
        Blockly.defineBlocksWithJsonArray(createBlockDefs(['typeA']));
        const aIn = this.getOuterInput('typeA');
        const tOut = this.getInnerOutput('t');
        aIn.connect(tOut);
        this.assertThrows(tOut);
      });

      twoBlockTest('Missing params', function() {
        Blockly.defineBlocksWithJsonArray(createBlockDefs(['list']));
        const listIn = this.getOuterInput('list');
        const tOut = this.getInnerOutput('t');
        listIn.connect(tOut);
        this.assertThrows(tOut);
      });

      twoBlockTest('Extra params', function() {
        Blockly.defineBlocksWithJsonArray(createBlockDefs(['list[dog, dog]']));
        const listIn = this.getOuterInput('list[dog, dog]');
        const tOut = this.getInnerOutput('t');
        listIn.connect(tOut);
        this.assertThrows(tOut);
      });

      runTwoBlockTests();
    });
  });
});
