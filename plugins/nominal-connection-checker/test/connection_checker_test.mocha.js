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

const {pluginInfo} = require('../src/index.js');
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
    };

    const types = Object.keys(hierarchyDef);
    types.push('T');
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

      runTwoBlockTests();
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

        this.bindConnection(t.out, 'typeA');
        t.in1.connect(typeCOut);
        t.in2.connect(typeDOut);
        this.unbindConnection(t.out);

        this.assertCanConnect(typeAIn, t.out);
      });

      siblingTest('Incompat outer, multi main', function() {
        const typeEIn = this.getOuterInput('typeE');
        const t = this.getMain('t');
        const typeCOut = this.getInnerOutput('typeC');
        const typeDOut = this.getInnerOutput('typeD');

        this.bindConnection(t.out, 'typeA');
        t.in1.connect(typeCOut);
        t.in2.connect(typeDOut);
        this.unbindConnection(t.out);

        this.assertCannotConnect(typeEIn, t.out);
      });

      siblingTest('2 multi mains, compatible', function() {
        const t1 = this.getMain('t', 't1');
        const t2 = this.getMain('t', 't2');
        const typeCOut1 = this.getInnerOutput('typeC');
        const typeDOut1 = this.getInnerOutput('typeD');
        const typeCOut2 = this.getInnerOutput('typeC');
        const typeDOut2 = this.getInnerOutput('typeD');

        this.bindConnection(t1.out, 'typeA');
        t1.in1.connect(typeCOut1);
        t1.in2.connect(typeDOut1);
        this.unbindConnection(t1.out);

        this.bindConnection(t2.out, 'typeA');
        t2.in1.connect(typeCOut2);
        t2.in2.connect(typeDOut2);
        this.unbindConnection(t2.out);

        this.assertCanConnect(t1.in3, t2.out);
      });

      siblingTest('2 multi mains, incompatible', function() {
        const t1 = this.getMain('t', 't1');
        const t2 = this.getMain('t', 't2');
        const typeCOut = this.getInnerOutput('typeC');
        const typeDOut = this.getInnerOutput('typeD');
        const typeGOut = this.getInnerOutput('typeG');
        const typeHOut = this.getInnerOutput('typeH');

        this.bindConnection(t1.out, 'typeA');
        t1.in1.connect(typeCOut);
        t1.in2.connect(typeDOut);
        this.unbindConnection(t1.out);

        this.bindConnection(t2.out, 'typeE');
        t2.in1.connect(typeGOut);
        t2.in2.connect(typeHOut);
        this.unbindConnection(t2.out);

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

      threeBlockTest('Outer valid, bind main, inner valid', function() {
        const dogIn = this.getOuterInput('dog');
        const t = this.getMain('t');
        const dogOut = this.getInnerOutput('dog');

        dogIn.connect(t.out);
        t.in.connect(dogOut);
        this.bindConnection(t.out, 'dog');

        this.assertIsConnected(t.out);
        this.assertIsConnected(t.in);
      });

      threeBlockTest('Outer valid, bind main, inner invalid', function() {
        const mammalIn = this.getOuterInput('mammal');
        const t = this.getMain('t');
        const catOut = this.getInnerOutput('cat');

        mammalIn.connect(t.out);
        t.in.connect(catOut);
        this.bindConnection(t.out, 'dog');

        this.assertIsConnected(t.out);
        this.assertIsNotConnected(t.in);
      });

      threeBlockTest('Outer invalid, bind main, inner valid', function() {
        const mammalIn = this.getOuterInput('mammal');
        const t = this.getMain('t');
        const batOut = this.getInnerOutput('bat');

        mammalIn.connect(t.out);
        t.in.connect(batOut);
        this.bindConnection(t.out, 'flyinganimal');

        this.assertIsNotConnected(t.out);
        this.assertIsConnected(t.in);
      });

      threeBlockTest('Outer invalid, bind main, inner invalid', function() {
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

      siblingTest('Bind main, some inners valid', function() {
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

    suite('Flow through connections', function() {
      suite('Two blocks', function() {
        clearTwoBlockTests();

        twoBlockTest('Outer explicit, inner explicit', function() {
          const dogIn = this.getOuterInput('dog');
          const dogOut = this.getInnerOutput('dog');

          dogIn.connect(dogOut);
          this.assertNoType(dogIn);
          this.assertNoType(dogOut);

          dogIn.disconnect();
          this.assertNoType(dogIn);
          this.assertNoType(dogOut);
        });

        twoBlockTest('Outer explicit, inner unbound', function() {
          const dogIn = this.getOuterInput('dog');
          const identityOut = this.getInnerOutput('t');

          dogIn.connect(identityOut);
          this.assertNoType(dogIn);
          this.assertHasType(identityOut, 'dog');

          dogIn.disconnect();
          this.assertNoType(dogIn);
          this.assertNoType(identityOut);
        });

        twoBlockTest('Outer explicit, inner bound', function() {
          const mammalIn = this.getOuterInput('mammal');
          const tOut = this.getInnerOutput('t');
          this.bindConnection(tOut, 'dog');

          mammalIn.connect(tOut);
          this.assertNoType(mammalIn);
          this.assertHasType(tOut, 'dog');

          mammalIn.disconnect();
          this.assertNoType(mammalIn);
          this.assertHasType(tOut, 'dog');
        });

        twoBlockTest('Outer unbound, inner explicit', function() {
          const identityIn = this.getOuterInput('t');
          const dogOut = this.getInnerOutput('dog');

          identityIn.connect(dogOut);
          this.assertHasType(identityIn, 'dog');
          this.assertNoType(dogOut);

          identityIn.disconnect();
          this.assertNoType(identityIn);
          this.assertNoType(dogOut);
        });

        twoBlockTest('Outer unbound, inner unbound', function() {
          const identityIn = this.getOuterInput('t');
          const identityOut = this.getInnerOutput('t');

          identityIn.connect(identityOut);
          this.assertNoType(identityIn);
          this.assertNoType(identityOut);

          identityIn.disconnect();
          this.assertNoType(identityIn);
          this.assertNoType(identityOut);
        });

        twoBlockTest('Outer unbound, inner bound', function() {
          const identityIn = this.getOuterInput('t');
          const identityOut = this.getInnerOutput('t');
          this.bindConnection(identityOut, 'dog');

          identityIn.connect(identityOut);
          this.assertHasType(identityIn, 'dog');
          this.assertHasType(identityOut, 'dog');

          identityIn.disconnect();
          this.assertNoType(identityIn);
          this.assertHasType(identityOut, 'dog');
        });

        twoBlockTest('Outer bound, inner explicit', function() {
          const identityIn = this.getOuterInput('t');
          const dogOut = this.getInnerOutput('dog');
          this.bindConnection(identityIn, 'mammal');

          identityIn.connect(dogOut);
          this.assertHasType(identityIn, 'mammal');
          this.assertNoType(dogOut);

          identityIn.disconnect();
          this.assertHasType(identityIn, 'mammal');
          this.assertNoType(dogOut);
        });

        twoBlockTest('Outer bound, inner unbound', function() {
          const identityIn = this.getOuterInput('t');
          const identityOut = this.getInnerOutput('t');
          this.bindConnection(identityIn, 'dog');

          identityIn.connect(identityOut);
          this.assertHasType(identityIn, 'dog');
          this.assertHasType(identityOut, 'dog');

          identityIn.disconnect();
          this.assertHasType(identityIn, 'dog');
          this.assertNoType(identityOut);
        });

        twoBlockTest('Outer bound, inner bound', function() {
          const identityIn = this.getOuterInput('t');
          const identityOut = this.getInnerOutput('t');
          this.bindConnection(identityIn, 'mammal');
          this.bindConnection(identityOut, 'dog');

          identityIn.connect(identityOut);
          this.assertHasType(identityIn, 'mammal');
          this.assertHasType(identityOut, 'dog');

          identityIn.disconnect();
          this.assertHasType(identityIn, 'mammal');
          this.assertHasType(identityOut, 'dog');
        });

        runTwoBlockTests();

        /* test('Parent explicit, child bound -> disconnect child\'s child',
            function() {
              const [milkMammalIn] = this.getBlockInput('static_milk_mammal');
              const [identityOut, identity] =
                  this.getBlockOutput('static_identity');
              const identityIn = identity.getInput('INPUT').connection;
              const [dogOut] = this.getBlockOutput('static_dog');

              identityIn.connect(dogOut);
              this.assertHasType(identityIn, 'dog');
              this.assertNoType(dogOut);

              milkMammalIn.connect(identityOut);
              this.assertNoType(milkMammalIn);
              this.assertHasType(identityIn, 'mammal');
              this.assertNoType(dogOut);

              identityIn.disconnect();
              this.assertNoType(milkMammalIn);
              this.assertHasType(identityIn, 'mammal');
              this.assertNoType(dogOut);
            });

        test('Parent bound, child explicit -> disconnect parent\'s parent',
            function() {
              const [milkMammalIn] = this.getBlockInput('static_milk_mammal');
              const [identityIn, identity] =
                  this.getBlockInput('static_identity');
              const identityOut = identity.outputConnection;
              const [dogOut] = this.getBlockOutput('static_dog');

              milkMammalIn.connect(identityOut);
              this.assertNoType(milkMammalIn);
              this.assertHasType(identityIn, 'mammal');

              identityIn.connect(dogOut);
              this.assertNoType(milkMammalIn);
              this.assertHasType(identityIn, 'mammal');
              this.assertNoType(dogOut);


              milkMammalIn.disconnect();
              this.assertNoType(milkMammalIn);
              this.assertHasType(identityIn, 'dog');
              this.assertNoType(dogOut);
            }); */
      });

      suite('Three blocks', function() {
        clearThreeBlockTests();

        threeBlockTest('Outer unbound, main unbound, inner explicit',
            function() {
              const outerIn = this.getOuterInput('t');
              const main = this.getMain('t');
              const innerOut = this.getInnerOutput('dog');

              outerIn.connect(main.out);
              this.assertNoType(outerIn);
              this.assertNoType(main.out);

              main.in.connect(innerOut);
              this.assertNoType(innerOut);
              this.assertHasType(main.in, 'dog');
              this.assertHasType(outerIn, 'dog');

              main.in.disconnect(innerOut);
              this.assertNoType(outerIn);
              this.assertNoType(main.in);
              this.assertNoType(innerOut);
            });

        threeBlockTest('Outer unbound, main unbound, inner bound', function() {
          const outerIn = this.getOuterInput('t');
          const main = this.getMain('t');
          const innerOut = this.getInnerOutput('t');
          this.bindConnection(innerOut, 'dog');

          outerIn.connect(main.out);
          this.assertNoType(outerIn);
          this.assertNoType(main.in);

          main.in.connect(innerOut);
          this.assertHasType(main.in, 'dog');
          this.assertHasType(outerIn, 'dog');

          main.in.disconnect();
          this.assertNoType(outerIn);
          this.assertNoType(main.in);
        });

        threeBlockTest('Outer explicit, main unbound, inner unbound',
            function() {
              const outerIn = this.getOuterInput('dog');
              const main = this.getMain('t');
              const innerOut = this.getInnerOutput('t');

              outerIn.connect(main.out);
              this.assertNoType(outerIn);
              this.assertHasType(main.out, 'dog');

              main.in.connect(innerOut);
              this.assertNoType(outerIn);
              this.assertHasType(main.in, 'dog');
              this.assertHasType(innerOut, 'dog');

              main.in.disconnect();
              this.assertNoType(outerIn);
              this.assertHasType(main.in, 'dog');
              this.assertNoType(innerOut);

              outerIn.disconnect();
              this.assertNoType(outerIn);
              this.assertNoType(main.out);
              this.assertNoType(innerOut);
            });

        threeBlockTest('Outer bound, main unbound, inner unbound', function() {
          const outerIn = this.getOuterInput('t');
          const main = this.getMain('t');
          const innerOut = this.getInnerOutput('t');
          this.bindConnection(outerIn, 'dog');

          outerIn.connect(main.out);
          this.assertHasType(main.out, 'dog');

          main.in.connect(innerOut);
          this.assertHasType(main.out, 'dog');
          this.assertHasType(innerOut, 'dog');

          main.in.disconnect();
          this.assertHasType(main.out, 'dog');
          this.assertNoType(innerOut);
          outerIn.disconnect();
          this.assertNoType(main.out);
          this.assertNoType(innerOut);
        });

        threeBlockTest('Inner explicit, main unbound, outer unbound',
            function() {
              const outerIn = this.getOuterInput('t');
              const main = this.getMain('t');
              const innerOut = this.getInnerOutput('dog');

              innerOut.connect(main.in);
              this.assertNoType(innerOut);
              this.assertHasType(main.in, 'dog');

              main.out.connect(outerIn);
              this.assertNoType(innerOut);
              this.assertHasType(main.out, 'dog');
              this.assertHasType(outerIn, 'dog');

              main.out.disconnect();
              this.assertNoType(innerOut);
              this.assertHasType(main.out, 'dog');
              this.assertNoType(outerIn);

              innerOut.disconnect();
              this.assertNoType(innerOut);
              this.assertNoType(main.in);
              this.assertNoType(outerIn);
            });

        threeBlockTest('Inner bound, main unbound, outer unbound', function() {
          const outerIn = this.getOuterInput('t');
          const main = this.getMain('t');
          const innerOut = this.getInnerOutput('t');
          this.bindConnection(innerOut, 'dog');

          innerOut.connect(main.in);
          this.assertHasType(main.in, 'dog');

          main.out.connect(outerIn);
          this.assertHasType(main.out, 'dog');
          this.assertHasType(outerIn, 'dog');

          main.out.disconnect();
          this.assertHasType(main.out, 'dog');
          this.assertNoType(outerIn);
          innerOut.disconnect();
          this.assertNoType(main.in);
          this.assertNoType(outerIn);
        });

        threeBlockTest('Inner unbound, main unbound, outer explicit',
            function() {
              const outerIn = this.getOuterInput('dog');
              const main = this.getMain('t');
              const innerOut = this.getInnerOutput('t');

              innerOut.connect(main.in);
              this.assertNoType(innerOut);
              this.assertNoType(main.in);

              main.out.connect(outerIn);
              this.assertNoType(outerIn);
              this.assertHasType(main.out, 'dog');
              this.assertHasType(innerOut, 'dog');

              main.out.disconnect();
              this.assertNoType(outerIn);
              this.assertNoType(innerOut);
              this.assertNoType(main.in);
            });

        threeBlockTest('Inner unbound, main unbound, outer bound', function() {
          const outerIn = this.getOuterInput('t');
          const main = this.getMain('t');
          const innerOut = this.getInnerOutput('t');
          this.bindConnection(outerIn, 'dog');

          innerOut.connect(main.in);
          this.assertNoType(innerOut);
          this.assertNoType(main.in);

          main.out.connect(outerIn);
          this.assertHasType(main.out, 'dog');
          this.assertHasType(innerOut, 'dog');

          main.out.disconnect();
          this.assertNoType(innerOut);
          this.assertNoType(main.in);
        });

        runThreeBlockTests();
      });

      suite('Siblings and parsibs', function() {
        clearSiblingTests();

        siblingTest('Flow to sibling, explicit', function() {
          const main = this.getMain('t');
          const tOut = this.getInnerOutput('t');
          const dogOut = this.getInnerOutput('dog');

          main.in1.connect(tOut);
          this.assertNoType(main.in1);
          this.assertNoType(tOut);

          main.in2.connect(dogOut);
          this.assertHasType(main.in2, 'dog');
          this.assertHasType(tOut, 'dog');

          main.in2.disconnect();
          this.assertNoType(main.in2);
          this.assertNoType(tOut);
        });

        siblingTest('Flow to sibling, bound', function() {
          const main = this.getMain('t');
          const tOut1 = this.getInnerOutput('t');
          const tOut2 = this.getInnerOutput('t');
          this.bindConnection(tOut2, 'dog');

          main.in1.connect(tOut1);
          this.assertNoType(main.in1);
          this.assertNoType(tOut1);

          main.in2.connect(tOut2);
          this.assertHasType(main.in2, 'dog');
          this.assertHasType(tOut1, 'dog');

          main.in2.disconnect();
          this.assertNoType(main.in1);
          this.assertNoType(tOut1);
        });

        siblingTest('Flow to parsib, explicit', function() {
          const main1 = this.getMain('t');
          const main2 = this.getMain('t');
          const tOut = this.getInnerOutput('t');
          const dogOut = this.getInnerOutput('dog');

          main1.in1.connect(tOut);
          this.assertNoType(main1.in1);
          this.assertNoType(tOut);

          main1.in2.connect(main2.out);
          this.assertNoType(main1.in1);
          this.assertNoType(main2.out);
          this.assertNoType(tOut);

          main2.in1.connect(dogOut);
          this.assertHasType(main1.in1, 'dog', 'main1.in1');
          this.assertHasType(main2.in1, 'dog', 'main2.in2');
          this.assertHasType(tOut, 'dog', 'tOut');

          main2.in1.disconnect();
          this.assertNoType(main1.in1);
          this.assertNoType(main2.in1);
          this.assertNoType(tOut);
        });

        siblingTest('Flow to parsib, bound', function() {
          const main1 = this.getMain('t');
          const main2 = this.getMain('t');
          const tOut1 = this.getInnerOutput('t');
          const tOut2 = this.getInnerOutput('t');
          this.bindConnection(tOut2, 'dog');

          main1.in1.connect(tOut1);
          this.assertNoType(main1.in1);
          this.assertNoType(tOut1);

          main1.in2.connect(main2.out);
          this.assertNoType(main1.in1);
          this.assertNoType(main2.out);
          this.assertNoType(tOut1);

          main2.in1.connect(tOut2);
          this.assertHasType(main1.in1, 'dog');
          this.assertHasType(main2.in1, 'dog');
          this.assertHasType(tOut1, 'dog');

          main2.in1.disconnect();
          this.assertNoType(main1.in1);
          this.assertNoType(main2.in1);
          this.assertNoType(tOut1);
        });

        runSiblingTests();
      });
    });

    suite('Unification', function() {
      suite('Inputs', function() {
        clearSiblingTests();

        siblingTest('Direct children', function() {
          const main = this.getMain('t');
          const dogOut = this.getInnerOutput('dog');
          const catOut = this.getInnerOutput('cat');

          this.bindConnection(main.out, 'mammal');
          main.in1.connect(dogOut);
          main.in2.connect(catOut);
          this.unbindConnection(main.out);

          this.assertHasType(main.out, 'mammal');
        });

        siblingTest('Grandchildren', function() {
          const main1 = this.getMain('t');
          const main2 = this.getMain('t');
          const main3 = this.getMain('t');
          const dogOut = this.getInnerOutput('dog');
          const catOut = this.getInnerOutput('cat');

          this.bindConnection(main1.out, 'mammal');
          main1.in1.connect(main2.out);
          main1.in2.connect(main3.out);
          main2.in1.connect(dogOut);
          main3.in1.connect(catOut);
          this.unbindConnection(main1.out);

          this.assertHasType(main1.out, 'mammal');
        });

        siblingTest('Children and grandchildren', function() {
          const main1 = this.getMain('t');
          const main2 = this.getMain('t');
          const dogOut = this.getInnerOutput('dog');
          const catOut = this.getInnerOutput('cat');

          this.bindConnection(main1.out, 'mammal');
          main1.in1.connect(main2.out);
          main1.in2.connect(catOut);
          main2.in1.connect(dogOut);
          this.unbindConnection(main1.out);

          this.assertHasType(main1.out, 'mammal');
        });

        runSiblingTests();
      });

      suite('Outputs', function() {
        clearSiblingTests();

        siblingTest('Siblings', function() {
          const main = this.getMain('t');
          const dogOut = this.getInnerOutput('dog');
          const catOut = this.getInnerOutput('cat');
          const tOut = this.getInnerOutput('t');

          this.bindConnection(main.out, 'mammal');
          main.in1.connect(dogOut);
          main.in2.connect(catOut);
          main.in3.connect(tOut);
          this.unbindConnection(main.out);

          this.assertHasType(tOut, 'mammal');
        });

        siblingTest('Parsibs', function() {
          const main1 = this.getMain('t');
          const main2 = this.getMain('t');
          const dogOut = this.getInnerOutput('dog');
          const catOut = this.getInnerOutput('cat');
          const tOut = this.getInnerOutput('t');

          this.bindConnection(main1.out, 'mammal');
          main1.in1.connect(dogOut);
          main1.in2.connect(catOut);
          main1.in3.connect(main2.out);
          main2.in1.connect(tOut);
          this.unbindConnection(main1.out);

          this.assertHasType(tOut, 'mammal');
        });

        siblingTest('Siblings and parsibs', function() {
          const main1 = this.getMain('t');
          const main2 = this.getMain('t');
          const dogOut = this.getInnerOutput('dog');
          const catOut = this.getInnerOutput('cat');
          const tOut = this.getInnerOutput('t');

          this.bindConnection(main1.out, 'mammal');
          main1.in1.connect(dogOut);
          main1.in2.connect(main2.out);
          main2.in1.connect(catOut);
          main2.in2.connect(tOut);
          this.unbindConnection(main1.out);

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

    twoBlockTest('Explicit', function() {
      const dogIn = this.getOuterInput('dog');
      const dogOut = this.getInnerOutput('dog');

      this.assertHasType(dogIn, 'dog');
      this.assertHasType(dogOut, 'dog');
    });

    twoBlockTest('Unbound generic', function() {
      const tIn = this.getOuterInput('t');
      const tOut = this.getInnerOutput('t');

      this.assertNoType(tIn);
      this.assertNoType(tOut);
    });

    twoBlockTest('Programmatically bound', function() {
      const tIn = this.getOuterInput('t');
      const tOut = this.getInnerOutput('t');

      this.bindConnection(tIn, 'dog');
      this.bindConnection(tOut, 'dog');

      this.assertHasType(tIn, 'dog');
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
  });
});
