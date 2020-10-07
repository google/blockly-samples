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

const {pluginInfo, INPUT_PRIORITY, OUTPUT_PRIORITY} =
    require('../src/index.js');

suite('NominalConnectionChecker', function() {
  setup(function() {
    Blockly.defineBlocksWithJsonArray([
      {
        'type': 'static_animal',
        'message0': 'Animal',
        'output': ['Animal'],
        'style': 'math_blocks',
      },
      {
        'type': 'static_mammal',
        'message0': 'Mammal',
        'output': ['Mammal'],
        'style': 'math_blocks',
      },
      {
        'type': 'static_reptile',
        'message0': 'Reptile',
        'output': ['Reptile'],
        'style': 'math_blocks',
      },
      {
        'type': 'static_dog',
        'message0': 'Dog',
        'output': ['Dog'],
        'style': 'math_blocks',
      },
      {
        'type': 'static_cat',
        'message0': 'Cat',
        'output': ['Cat'],
        'style': 'math_blocks',
      },
      {
        'type': 'static_bat',
        'message0': 'Bat',
        'output': ['Bat'],
        'style': 'math_blocks',
      },
      {
        'type': 'static_weigh_animal',
        'message0': 'Weigh Animal %1',
        'args0': [
          {
            'type': 'input_value',
            'name': 'INPUT',
            'check': 'Animal',
          },
        ],
        'style': 'math_blocks',
      },
      {
        'type': 'static_milk_mammal',
        'message0': 'Milk Mammal %1',
        'args0': [
          {
            'type': 'input_value',
            'name': 'INPUT',
            'check': 'Mammal',
          },
        ],
        'style': 'math_blocks',
      },
      {
        'type': 'static_train_dog',
        'message0': 'Train Dog %1',
        'args0': [
          {
            'type': 'input_value',
            'name': 'INPUT',
            'check': 'Dog',
          },
        ],
        'style': 'math_blocks',
      },
      {
        'type': 'static_launch_flying',
        'message0': 'Launch Flying Animal %1',
        'args0': [
          {
            'type': 'input_value',
            'name': 'INPUT',
            'check': 'FlyingAnimal',
          },
        ],
        'style': 'math_blocks',
      },
      {
        'type': 'static_identity',
        'message0': 'Identity %1',
        'args0': [
          {
            'type': 'input_value',
            'name': 'INPUT',
            'check': 'T',
          },
        ],
        'output': ['T'],
        'style': 'text_blocks',
      },
      {
        'type': 'static_select_random',
        'message0': 'Select Random %1 %2 %3',
        'args0': [
          {
            'type': 'input_value',
            'name': 'INPUT',
            'check': 'T',
          },
          {
            'type': 'input_value',
            'name': 'INPUT2',
            'check': 'T',
          },
          {
            'type': 'input_value',
            'name': 'INPUT3',
            'check': 'T',
          },
        ],
        'output': ['T'],
        'style': 'text_blocks',
      },
    ]);

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

    const options = {
      plugins: {
        ...pluginInfo,
      },
    };

    this.workspace = new Blockly.Workspace(options);
    this.workspace.connectionChecker.init(hierarchyDef);
    this.checker = this.workspace.connectionChecker;

    this.getBlockOutput = function(blockType) {
      const block = this.workspace.newBlock(blockType);
      return [
        block.outputConnection,
        block,
      ];
    };
    this.getBlockInput = function(blockType) {
      const block = this.workspace.newBlock(blockType);
      return [
        block.getInput('INPUT').connection,
        block,
      ];
    };

    this.assertCanConnect = function(conn1, conn2) {
      chai.assert.isTrue(this.checker.doTypeChecks(conn1, conn2));
    };
    this.assertCannotConnect = function(conn1, conn2) {
      chai.assert.isFalse(this.checker.doTypeChecks(conn1, conn2));
    };
  });

  teardown(function() {
    delete Blockly.Blocks['static_animal'];
    delete Blockly.Blocks['static_mammal'];
    delete Blockly.Blocks['static_reptile'];
    delete Blockly.Blocks['static_dog'];
    delete Blockly.Blocks['static_cat'];
    delete Blockly.Blocks['static_bat'];
    delete Blockly.Blocks['static_weigh_animal'];
    delete Blockly.Blocks['static_milk_mammal'];
    delete Blockly.Blocks['static_train_dog'];
    delete Blockly.Blocks['static_launch_flying'];
    delete Blockly.Blocks['static_identity'];
    delete Blockly.Blocks['static_select_random'];
  });

  suite('Simple subtyping', function() {
    test('Exact types', function() {
      const [dogOut] = this.getBlockOutput('static_dog');
      const [trainDogIn] = this.getBlockInput('static_train_dog');
      this.assertCanConnect(dogOut, trainDogIn);
    });

    test('Simple super', function() {
      const [dogOut] = this.getBlockOutput('static_dog');
      const [milkMammalIn] = this.getBlockInput('static_milk_mammal');
      this.assertCanConnect(dogOut, milkMammalIn);
    });

    test('Multiple supers', function() {
      const [batOut] = this.getBlockOutput('static_bat');
      const [milkMammalIn] = this.getBlockInput('static_milk_mammal');
      const [launchFlyingIn] = this.getBlockInput('static_launch_flying');
      this.assertCanConnect(batOut, milkMammalIn);
      this.assertCanConnect(batOut, launchFlyingIn);
    });

    test('Deep supers', function() {
      const [dogOut] = this.getBlockOutput('static_dog');
      const [weighAnimalIn] = this.getBlockInput('static_weigh_animal');
      this.assertCanConnect(dogOut, weighAnimalIn);
    });

    test('Multiple output checks', function() {
      const [dogOut] = this.getBlockOutput('static_dog');
      dogOut.setCheck(['Random', 'dog']);
      const [trainDogIn] = this.getBlockInput('static_train_dog');
      this.assertCannotConnect(dogOut, trainDogIn);
    });

    test('Multiple input checks', function() {
      const [dogOut] = this.getBlockOutput('static_dog');
      const [trainDogIn] = this.getBlockInput('static_train_dog');
      trainDogIn.setCheck(['Random', 'dog']);
      this.assertCannotConnect(dogOut, trainDogIn);
    });

    test('Unrelated types', function() {
      const [batOut] = this.getBlockOutput('static_bat');
      const [trainDogIn] = this.getBlockInput('static_train_dog');
      this.assertCannotConnect(batOut, trainDogIn);
    });

    test('Backwards types', function() {
      const [mammalOut] = this.getBlockOutput('static_mammal');
      const [trainDogIn] = this.getBlockInput('static_train_dog');
      this.assertCannotConnect(mammalOut, trainDogIn);
    });
  });

  suite('Simple generics', function() {
    // Both explicit is the other suite.

    test('Parent explicit, child unbound', function() {
      const [trainDogIn] = this.getBlockInput('static_train_dog');
      const [identityOut] = this.getBlockOutput('static_identity');
      this.assertCanConnect(trainDogIn, identityOut);
    });

    test('Parent explicit, child bound sub', function() {
      const [milkMammalIn] = this.getBlockInput('static_milk_mammal');
      const [identityOut, block] = this.getBlockOutput('static_identity');
      this.checker.bindType(block, 'T', 'dog', INPUT_PRIORITY);
      this.assertCanConnect(milkMammalIn, identityOut);
    });

    test('Parent explicit, child bound super', function() {
      const [trainDogIn] = this.getBlockInput('static_train_dog');
      const [identityOut, block] = this.getBlockOutput('static_identity');
      this.checker.bindType(block, 'T', 'mammal', INPUT_PRIORITY);
      this.assertCannotConnect(trainDogIn, identityOut);
    });

    test('Parent unbound, child explicit', function() {
      const [identityIn] = this.getBlockInput('static_identity');
      const [dogOut] = this.getBlockOutput('static_dog');
      this.assertCanConnect(identityIn, dogOut);
    });

    test('Parent unbound, child unbound', function() {
      const [identityIn] = this.getBlockInput('static_identity');
      const [identityOut] = this.getBlockOutput('static_identity');
      this.assertCanConnect(identityIn, identityOut);
    });

    test('Parent unbound, child bound', function() {
      const [identityIn] = this.getBlockInput('static_identity');
      const [identityOut, block] = this.getBlockOutput('static_identity');
      this.checker.bindType(block, 'T', 'dog', INPUT_PRIORITY);
      this.assertCanConnect(identityIn, identityOut);
    });

    test('Parent bound, child explicit sub', function() {
      const [identityIn, block] = this.getBlockInput('static_identity');
      const [dogOut] = this.getBlockOutput('static_dog');
      this.checker.bindType(block, 'T', 'mammal', OUTPUT_PRIORITY);
      this.assertCanConnect(identityIn, dogOut);
    });

    test('Parent bound, child explicit super', function() {
      const [identityIn, block] = this.getBlockInput('static_identity');
      const [mammalOut] = this.getBlockOutput('static_mammal');
      this.checker.bindType(block, 'T', 'dog', OUTPUT_PRIORITY);
      this.assertCannotConnect(identityIn, mammalOut);
    });

    test('Parent bound, child unbound', function() {
      const [identityIn, block] = this.getBlockInput('static_identity');
      const [identityOut] = this.getBlockOutput('static_identity');
      this.checker.bindType(block, 'T', 'dog', OUTPUT_PRIORITY);
      this.assertCanConnect(identityIn, identityOut);
    });

    test('Parent bound, child bound sub', function() {
      const [identityIn, inBlock] = this.getBlockInput('static_identity');
      const [identityOut, outBlock] = this.getBlockOutput('static_identity');
      this.checker.bindType(inBlock, 'T', 'mammal', OUTPUT_PRIORITY);
      this.checker.bindType(outBlock, 'T', 'dog', INPUT_PRIORITY);
      this.assertCanConnect(identityIn, identityOut);
    });

    test('Parent bound, child bound super', function() {
      const [identityIn, inBlock] = this.getBlockInput('static_identity');
      const [identityOut, outBlock] = this.getBlockOutput('static_identity');
      this.checker.bindType(inBlock, 'T', 'dog', OUTPUT_PRIORITY);
      this.checker.bindType(outBlock, 'T', 'mammal', INPUT_PRIORITY);
      this.assertCannotConnect(identityIn, identityOut);
    });
  });

  suite('Multiple explicit types on generics', function() {
    setup(function() {
      this.checker.init({
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
      });
    });

    test('Multi parent - compat child', function() {
      const [identityIn, inBlock] = this.getBlockInput('static_identity');
      const [identityOut, outBlock] = this.getBlockOutput('static_identity');
      this.checker.bindType(inBlock, 'T', 'typeC', OUTPUT_PRIORITY);
      this.checker.bindType(inBlock, 'T', 'typeD', OUTPUT_PRIORITY);
      this.checker.bindType(outBlock, 'T', 'typeA', INPUT_PRIORITY);
      this.assertCanConnect(identityIn, identityOut);
    });

    test('Multi parent - incompat child', function() {
      const [identityIn, inBlock] = this.getBlockInput('static_identity');
      const [identityOut, outBlock] = this.getBlockOutput('static_identity');
      this.checker.bindType(inBlock, 'T', 'typeC', OUTPUT_PRIORITY);
      this.checker.bindType(inBlock, 'T', 'typeD', OUTPUT_PRIORITY);
      this.checker.bindType(outBlock, 'T', 'typeE', INPUT_PRIORITY);
      this.assertCannotConnect(identityIn, identityOut);
    });

    test('Multi child - compat parent', function() {
      const [identityIn, inBlock] = this.getBlockInput('static_identity');
      const [identityOut, outBlock] = this.getBlockOutput('static_identity');
      this.checker.bindType(inBlock, 'T', 'typeA', OUTPUT_PRIORITY);
      this.checker.bindType(outBlock, 'T', 'typeC', INPUT_PRIORITY);
      this.checker.bindType(outBlock, 'T', 'typeD', INPUT_PRIORITY);
      this.assertCanConnect(identityIn, identityOut);
    });

    test('Multi child - incompat parent', function() {
      const [identityIn, inBlock] = this.getBlockInput('static_identity');
      const [identityOut, outBlock] = this.getBlockOutput('static_identity');
      this.checker.bindType(inBlock, 'T', 'typeE', OUTPUT_PRIORITY);
      this.checker.bindType(outBlock, 'T', 'typeC', INPUT_PRIORITY);
      this.checker.bindType(outBlock, 'T', 'typeD', INPUT_PRIORITY);
      this.assertCannotConnect(identityIn, identityOut);
    });

    test('Multi parent and child - compatible', function() {
      const [identityIn, inBlock] = this.getBlockInput('static_identity');
      const [identityOut, outBlock] = this.getBlockOutput('static_identity');
      this.checker.bindType(inBlock, 'T', 'typeC', OUTPUT_PRIORITY);
      this.checker.bindType(inBlock, 'T', 'typeD', OUTPUT_PRIORITY);
      this.checker.bindType(outBlock, 'T', 'typeC', INPUT_PRIORITY);
      this.checker.bindType(outBlock, 'T', 'typeD', INPUT_PRIORITY);
      this.assertCanConnect(identityIn, identityOut);
    });

    test('Multi parent and child - incompatible', function() {
      const [identityIn, inBlock] = this.getBlockInput('static_identity');
      const [identityOut, outBlock] = this.getBlockOutput('static_identity');
      this.checker.bindType(inBlock, 'T', 'typeG', OUTPUT_PRIORITY);
      this.checker.bindType(inBlock, 'T', 'typeH', OUTPUT_PRIORITY);
      this.checker.bindType(outBlock, 'T', 'typeC', INPUT_PRIORITY);
      this.checker.bindType(outBlock, 'T', 'typeD', INPUT_PRIORITY);
      this.assertCannotConnect(identityIn, identityOut);
    });
  });

  // This suite checks that bindings get updated correctly. It doesn't have
  // anything to do with compatibility.
  suite('getExplicitTypes', function() {
    setup(function() {
      this.assertNoType = function(conn) {
        const explicitTypes = this.checker.getExplicitTypes(
            conn.getSourceBlock(), 'T');
        chai.assert.isArray(explicitTypes);
        chai.assert.isEmpty(explicitTypes);
      };
      this.assertHasType = function(conn, binding) {
        const explicitTypes = this.checker.getExplicitTypes(
            conn.getSourceBlock(), 'T');
        chai.assert.include(explicitTypes, binding);
      };
    });

    suite('Priority', function() {
      setup(function() {
        this.block = this.workspace.newBlock('static_identity');

        this.assertHasType = function(type) {
          const explicitTypes = this.checker.getExplicitTypes(this.block, 'T');
          chai.assert.include(explicitTypes, type);
        };

        this.bindType = function(type, priority) {
          this.checker.bindType(this.block, 'T', type, priority);
        };

        this.unbindType = function(type, priority) {
          this.checker.unbindType(this.block, 'T', type, priority);
        };
      });

      test('Less than input', function() {
        this.bindType('Dog', 99);
        this.assertHasType('dog');
        this.bindType('Cat', INPUT_PRIORITY);
        this.assertHasType('cat');

        this.unbindType('Cat', INPUT_PRIORITY);
        this.assertHasType('dog');
      });

      test('Between input and output', function() {
        this.bindType('Dog', INPUT_PRIORITY);
        this.assertHasType('dog');
        this.bindType('Cat', 150);
        this.assertHasType('cat');
        this.bindType('Bat', OUTPUT_PRIORITY);
        this.assertHasType('bat');

        this.unbindType('Bat', OUTPUT_PRIORITY);
        this.assertHasType('cat');
        this.unbindType('Cat', 150);
        this.assertHasType('dog');
      });

      test('More than output', function() {
        this.bindType('Dog', OUTPUT_PRIORITY);
        this.assertHasType('dog');
        this.bindType('Cat', 201);
        this.assertHasType('cat');

        this.unbindType('Cat', 201);
        this.assertHasType('dog');
      });
    });

    suite('Simple, Two blocks', function() {
      test('Parent explicit, child explicit', function() {
        const [trainDogIn] = this.getBlockInput('static_train_dog');
        const [dogOut] = this.getBlockOutput('static_dog');

        trainDogIn.connect(dogOut);
        this.assertNoType(trainDogIn);
        this.assertNoType(dogOut);

        trainDogIn.disconnect();
        this.assertNoType(trainDogIn);
        this.assertNoType(dogOut);
      });

      test('Parent explicit, child unbound', function() {
        const [trainDogIn] = this.getBlockInput('static_train_dog');
        const [identityOut] = this.getBlockOutput('static_identity');

        trainDogIn.connect(identityOut);
        this.assertNoType(trainDogIn);
        this.assertHasType(identityOut, 'dog');

        trainDogIn.disconnect();
        this.assertNoType(trainDogIn);
        this.assertNoType(identityOut);
      });

      test('Parent explicit, child bound', function() {
        const [milkMammalIn] = this.getBlockInput('static_milk_mammal');
        const [identityOut, block] = this.getBlockOutput('static_identity');
        this.checker.bindType(block, 'T', 'dog', INPUT_PRIORITY);

        milkMammalIn.connect(identityOut);
        this.assertNoType(milkMammalIn);
        this.assertHasType(identityOut, 'mammal');

        milkMammalIn.disconnect();
        this.assertNoType(milkMammalIn);
        this.assertHasType(identityOut, 'dog');
      });

      test('Parent unbound, child explicit', function() {
        const [identityIn] = this.getBlockInput('static_identity');
        const [dogOut] = this.getBlockOutput('static_dog');

        identityIn.connect(dogOut);
        this.assertHasType(identityIn, 'dog');
        this.assertNoType(dogOut);

        identityIn.disconnect();
        this.assertNoType(identityIn);
        this.assertNoType(dogOut);
      });

      test('Parent unbound, child unbound', function() {
        const [identityIn] = this.getBlockInput('static_identity');
        const [identityOut] = this.getBlockOutput('static_identity');

        identityIn.connect(identityOut);
        this.assertNoType(identityIn);
        this.assertNoType(identityOut);

        identityIn.disconnect();
        this.assertNoType(identityIn);
        this.assertNoType(identityOut);
      });

      test('Parent unbound, child bound', function() {
        const [identityIn] = this.getBlockInput('static_identity');
        const [identityOut, block] = this.getBlockOutput('static_identity');
        this.checker.bindType(block, 'T', 'dog', INPUT_PRIORITY);

        identityIn.connect(identityOut);
        this.assertHasType(identityIn, 'dog');
        this.assertHasType(identityOut, 'dog');

        identityIn.disconnect();
        this.assertNoType(identityIn);
        this.assertHasType(identityOut, 'dog');
      });

      test('Parent bound, child explicit', function() {
        const [identityIn, block] = this.getBlockInput('static_identity');
        const [dogOut] = this.getBlockOutput('static_dog');
        this.checker.bindType(block, 'T', 'mammal', OUTPUT_PRIORITY);

        identityIn.connect(dogOut);
        this.assertHasType(identityIn, 'mammal');
        this.assertNoType(dogOut);

        identityIn.disconnect();
        this.assertHasType(identityIn, 'mammal');
        this.assertNoType(dogOut);
      });

      test('Parent bound, child unbound', function() {
        const [identityIn, block] = this.getBlockInput('static_identity');
        const [identityOut] = this.getBlockOutput('static_identity');
        this.checker.bindType(block, 'T', 'dog', OUTPUT_PRIORITY);

        identityIn.connect(identityOut);
        this.assertHasType(identityIn, 'dog');
        this.assertHasType(identityOut, 'dog');

        identityIn.disconnect();
        this.assertHasType(identityIn, 'dog');
        this.assertNoType(identityOut);
      });

      test('Parent bound, child bound', function() {
        const [identityIn, inId] = this.getBlockInput('static_identity');
        const [identityOut, outId] = this.getBlockOutput('static_identity');
        this.checker.bindType(inId, 'T', 'mammal', OUTPUT_PRIORITY);
        this.checker.bindType(outId, 'T', 'dog', INPUT_PRIORITY);

        identityIn.connect(identityOut);
        this.assertHasType(identityIn, 'mammal');
        this.assertHasType(identityOut, 'mammal');

        identityIn.disconnect();
        this.assertHasType(identityIn, 'mammal');
        this.assertHasType(identityOut, 'dog');
      });

      test('Parent explicit, child bound -> disconnect child\'s child',
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
          });
    });

    suite('Flow through connections', function() {
      test('A unbound, B unbound, C explicit', function() {
        const [aIn] = this.getBlockInput('static_identity');
        const [bIn, b] = this.getBlockInput('static_identity');
        const bOut = b.outputConnection;
        const [cOut] = this.getBlockOutput('static_dog');

        aIn.connect(bOut);
        this.assertNoType(aIn);
        this.assertNoType(bOut);

        bIn.connect(cOut);
        this.assertNoType(cOut);
        this.assertHasType(bIn, 'dog');
        this.assertHasType(aIn, 'dog');

        bIn.disconnect(cOut);
        this.assertNoType(aIn);
        this.assertNoType(bIn);
        this.assertNoType(cOut);
      });

      test('A unbound, B unbound, C bound', function() {
        const [aIn] = this.getBlockInput('static_identity');
        const [bIn, b] = this.getBlockInput('static_identity');
        const bOut = b.outputConnection;
        const [cOut, block] = this.getBlockOutput('static_identity');
        this.checker.bindType(block, 'T', 'dog', 201);

        aIn.connect(bOut);
        this.assertNoType(aIn);
        this.assertNoType(bIn);

        bIn.connect(cOut);
        this.assertHasType(bIn, 'dog');
        this.assertHasType(aIn, 'dog');

        bIn.disconnect();
        this.assertNoType(aIn);
        this.assertNoType(bIn);
      });

      test('A explicit, B unbound, C unbound', function() {
        const [aIn] = this.getBlockInput('static_train_dog');
        const [bIn, b] = this.getBlockInput('static_identity');
        const bOut = b.outputConnection;
        const [cOut] = this.getBlockOutput('static_identity');

        aIn.connect(bOut);
        this.assertNoType(aIn);
        this.assertHasType(bOut, 'dog');

        bIn.connect(cOut);
        this.assertNoType(aIn);
        this.assertHasType(bIn, 'dog');
        this.assertHasType(cOut, 'dog');

        bIn.disconnect();
        this.assertNoType(aIn);
        this.assertHasType(bIn, 'dog');
        this.assertNoType(cOut);

        aIn.disconnect();
        this.assertNoType(aIn);
        this.assertNoType(bOut);
        this.assertNoType(cOut);
      });

      test('A bound, B unbound, C unbound', function() {
        const [aIn, block] = this.getBlockInput('static_identity');
        const [bIn, b] = this.getBlockInput('static_identity');
        const bOut = b.outputConnection;
        const [cOut] = this.getBlockOutput('static_identity');
        this.checker.bindType(block, 'T', 'dog', 201);

        aIn.connect(bOut);
        this.assertHasType(bOut, 'dog');

        bIn.connect(cOut);
        this.assertHasType(bOut, 'dog');
        this.assertHasType(cOut, 'dog');

        bIn.disconnect();
        this.assertHasType(bOut, 'dog');
        this.assertNoType(cOut);
        aIn.disconnect();
        this.assertNoType(bOut);
        this.assertNoType(cOut);
      });

      test('C explicit, B unbound, A unbound', function() {
        const [aIn] = this.getBlockInput('static_identity');
        const [bIn, b] = this.getBlockInput('static_identity');
        const bOut = b.outputConnection;
        const [cOut] = this.getBlockOutput('static_dog');

        cOut.connect(bIn);
        this.assertNoType(cOut);
        this.assertHasType(bIn, 'dog');

        bOut.connect(aIn);
        this.assertNoType(cOut);
        this.assertHasType(bOut, 'dog');
        this.assertHasType(aIn, 'dog');

        bOut.disconnect();
        this.assertNoType(cOut);
        this.assertHasType(bOut, 'dog');
        this.assertNoType(aIn);

        cOut.disconnect();
        this.assertNoType(cOut);
        this.assertNoType(bIn);
        this.assertNoType(aIn);
      });

      test('C bound, B unbound, A unbound', function() {
        const [aIn] = this.getBlockInput('static_identity');
        const [bIn, b] = this.getBlockInput('static_identity');
        const bOut = b.outputConnection;
        const [cOut, block] = this.getBlockOutput('static_identity');
        this.checker.bindType(block, 'T', 'dog', 201);

        cOut.connect(bIn);
        this.assertHasType(bIn, 'dog');

        bOut.connect(aIn);
        this.assertHasType(bOut, 'dog');
        this.assertHasType(aIn, 'dog');

        bOut.disconnect();
        this.assertHasType(bOut, 'dog');
        this.assertNoType(aIn);
        cOut.disconnect();
        this.assertNoType(bIn);
        this.assertNoType(aIn);
      });

      test('C unbound, B unbound, A explicit', function() {
        const [aIn] = this.getBlockInput('static_train_dog');
        const [bIn, b] = this.getBlockInput('static_identity');
        const bOut = b.outputConnection;
        const [cOut] = this.getBlockOutput('static_identity');

        cOut.connect(bIn);
        this.assertNoType(cOut);
        this.assertNoType(bIn);

        bOut.connect(aIn);
        this.assertNoType(aIn);
        this.assertHasType(bOut, 'dog');
        this.assertHasType(cOut, 'dog');

        bOut.disconnect();
        this.assertNoType(aIn);
        this.assertNoType(cOut);
        this.assertNoType(bIn);
      });

      test('C unbound, B unbound, A bound', function() {
        const [aIn, block] = this.getBlockInput('static_identity');
        const [bIn, b] = this.getBlockInput('static_identity');
        const bOut = b.outputConnection;
        const [cOut] = this.getBlockOutput('static_identity');
        this.checker.bindType(block, 'T', 'dog', 201);

        cOut.connect(bIn);
        this.assertNoType(cOut);
        this.assertNoType(bIn);

        bOut.connect(aIn);
        this.assertHasType(bOut, 'dog');
        this.assertHasType(cOut, 'dog');

        bOut.disconnect();
        this.assertNoType(cOut);
        this.assertNoType(bIn);
      });

      test('Flow to sibling, explicit', function() {
        const [selectRandomIn1, selectRandom] =
            this.getBlockInput('static_select_random');
        const selectRandomIn2 = selectRandom.getInput('INPUT2').connection;
        const [identityOut] = this.getBlockOutput('static_identity');
        const [dogOut] = this.getBlockOutput('static_dog');

        selectRandomIn1.connect(identityOut);
        this.assertNoType(selectRandomIn1);
        this.assertNoType(identityOut);

        selectRandomIn2.connect(dogOut);
        this.assertHasType(selectRandomIn1, 'dog');
        this.assertHasType(identityOut, 'dog');

        selectRandomIn2.disconnect();
        this.assertNoType(selectRandomIn1);
        this.assertNoType(identityOut);
      });

      test('Flow to sibling, bound', function() {
        const [selectRandomIn1, selectRandom] =
            this.getBlockInput('static_select_random');
        const selectRandomIn2 = selectRandom.getInput('INPUT2').connection;
        const [identityOut1] = this.getBlockOutput('static_identity');
        const [identityOut2, block] = this.getBlockOutput('static_identity');
        this.checker.bindType(block, 'T', 'dog', 201);

        selectRandomIn1.connect(identityOut1);
        this.assertNoType(selectRandomIn1);
        this.assertNoType(identityOut1);

        selectRandomIn2.connect(identityOut2);
        this.assertHasType(selectRandomIn1, 'dog');
        this.assertHasType(identityOut1, 'dog');

        selectRandomIn2.disconnect();
        this.assertNoType(selectRandomIn1);
        this.assertNoType(identityOut1);
      });

      test('Flow to parsib, explicit', function() {
        const [selectRandomIn1, selectRandom] =
            this.getBlockInput('static_select_random');
        const selectRandomIn2 = selectRandom.getInput('INPUT2').connection;
        const [identityOut1] = this.getBlockOutput('static_identity');
        const [identityIn, identity] = this.getBlockInput('static_identity');
        const identityOut2 = identity.outputConnection;
        const [dogOut] = this.getBlockOutput('static_dog');

        selectRandomIn1.connect(identityOut1);
        this.assertNoType(selectRandomIn1);
        this.assertNoType(identityOut1);

        selectRandomIn2.connect(identityOut2);
        this.assertNoType(selectRandomIn1);
        this.assertNoType(identityOut1);
        this.assertNoType(identityOut2);

        identityIn.connect(dogOut);
        this.assertHasType(selectRandomIn1, 'dog');
        this.assertHasType(identityOut1, 'dog');
        this.assertHasType(identityOut2, 'dog');

        identityIn.disconnect();
        this.assertNoType(selectRandomIn1);
        this.assertNoType(identityOut1);
        this.assertNoType(identityOut2);
      });

      test('Flow to parsib, bound', function() {
        const [selectRandomIn1, selectRandom] =
            this.getBlockInput('static_select_random');
        const selectRandomIn2 = selectRandom.getInput('INPUT2').connection;
        const [identityOut1] = this.getBlockOutput('static_identity');
        const [identityIn, identity] = this.getBlockInput('static_identity');
        const identityOut2 = identity.outputConnection;
        const [identityOut3, block] = this.getBlockOutput('static_identity');
        this.checker.bindType(block, 'T', 'dog', 201);

        selectRandomIn1.connect(identityOut1);
        this.assertNoType(selectRandomIn1);
        this.assertNoType(identityOut1);

        selectRandomIn2.connect(identityOut2);
        this.assertNoType(selectRandomIn1);
        this.assertNoType(identityOut1);
        this.assertNoType(identityOut2);

        identityIn.connect(identityOut3);
        this.assertHasType(selectRandomIn1, 'dog');
        this.assertHasType(identityOut1, 'dog');
        this.assertHasType(identityOut2, 'dog');

        identityIn.disconnect();
        this.assertNoType(selectRandomIn1);
        this.assertNoType(identityOut1);
        this.assertNoType(identityOut2);
      });
    });

    suite('Unification', function() {
      suite('External bindings', function() {
        test('Single', function() {
          const [identityIn, block] = this.getBlockInput('static_identity');
          this.checker.bindType(block, 'T', 'Mammal', 1);
          this.assertHasType(identityIn, 'mammal');
        });

        test('Multiple identical', function() {
          const [identityIn, block] = this.getBlockInput('static_identity');
          this.checker.bindType(block, 'T', 'Mammal', 1);
          this.checker.bindType(block, 'T', 'Mammal', 1);
          this.assertHasType(identityIn, 'mammal');
        });

        test('Multiple different - same priorities', function() {
          const [identityIn, block] = this.getBlockInput('static_identity');
          this.checker.bindType(block, 'T', 'Mammal', 1);
          this.checker.bindType(block, 'T', 'Reptile', 1);
          this.assertHasType(identityIn, 'animal');
        });

        test('Multiple different - different priorities', function() {
          const [identityIn, block] = this.getBlockInput('static_identity');
          this.checker.bindType(block, 'T', 'Mammal', 2);
          this.checker.bindType(block, 'T', 'Reptile', 1);
          this.assertHasType(identityIn, 'mammal');
        });
      });

      suite('Input types', function() {
        test('Direct children', function() {
          const [select1, select] = this.getBlockInput('static_select_random');
          const select2 = select.getInput('INPUT2').connection;
          const [dogOut] = this.getBlockOutput('static_dog');
          const [catOut] = this.getBlockOutput('static_cat');
          this.checker.bindType(select, 'T', 'Mammal', OUTPUT_PRIORITY);
          select1.connect(dogOut);
          select2.connect(catOut);
          this.checker.unbindType(select, 'T', 'Mammal', OUTPUT_PRIORITY);
          this.assertHasType(select1, 'mammal');
        });

        test('Grandchildren', function() {
          const [select1, select] = this.getBlockInput('static_select_random');
          const select2 = select.getInput('INPUT2').connection;
          const [identityOut1, identity1] =
              this.getBlockOutput('static_identity');
          const identityIn1 = identity1.getInput('INPUT').connection;
          const [identityOut2, identity2] =
              this.getBlockOutput('static_identity');
          const identityIn2 = identity2.getInput('INPUT').connection;
          const [dogOut] = this.getBlockOutput('static_dog');
          const [catOut] = this.getBlockOutput('static_cat');
          this.checker.bindType(select, 'T', 'Mammal', OUTPUT_PRIORITY);
          select1.connect(identityOut1);
          select2.connect(identityOut2);
          identityIn1.connect(dogOut);
          identityIn2.connect(catOut);
          this.checker.unbindType(select, 'T', 'Mammal', OUTPUT_PRIORITY);
          this.assertHasType(select1, 'mammal');
        });

        test('Children and grandchildren', function() {
          const [select1, select] = this.getBlockInput('static_select_random');
          const select2 = select.getInput('INPUT2').connection;
          const [identityOut1, identity1] =
              this.getBlockOutput('static_identity');
          const identityIn1 = identity1.getInput('INPUT').connection;
          const [dogOut] = this.getBlockOutput('static_dog');
          const [catOut] = this.getBlockOutput('static_cat');
          this.checker.bindType(select, 'T', 'Mammal', OUTPUT_PRIORITY);
          select1.connect(identityOut1);
          identityIn1.connect(dogOut);
          select2.connect(catOut);
          this.checker.unbindType(select, 'T', 'Mammal', OUTPUT_PRIORITY);
          this.assertHasType(select1, 'mammal');
        });
      });

      suite('Output types', function() {
        test('Siblings', function() {
          const [select1, select] = this.getBlockInput('static_select_random');
          const select2 = select.getInput('INPUT2').connection;
          const select3 = select.getInput('INPUT3').connection;
          const [dogOut] = this.getBlockOutput('static_dog');
          const [catOut] = this.getBlockOutput('static_cat');
          const [identityOut] = this.getBlockOutput('static_identity');
          this.checker.bindType(select, 'T', 'Mammal', OUTPUT_PRIORITY);
          select1.connect(dogOut);
          select2.connect(catOut);
          select3.connect(identityOut);
          this.checker.unbindType(select, 'T', 'Mammal', OUTPUT_PRIORITY);
          this.assertHasType(identityOut, 'mammal');
        });

        test('Parsibs', function() {
          const [select1, select] = this.getBlockInput('static_select_random');
          const select2 = select.getInput('INPUT2').connection;
          const select3 = select.getInput('INPUT3').connection;
          const [dogOut] = this.getBlockOutput('static_dog');
          const [catOut] = this.getBlockOutput('static_cat');
          const [identityOut1, identity] =
              this.getBlockOutput('static_identity');
          const identityIn = identity.getInput('INPUT').connection;
          const [identityOut2] = this.getBlockOutput('static_identity');
          this.checker.bindType(select, 'T', 'Mammal', OUTPUT_PRIORITY);
          select1.connect(dogOut);
          select2.connect(catOut);
          select3.connect(identityOut1);
          identityIn.connect(identityOut2);
          this.checker.unbindType(select, 'T', 'Mammal', OUTPUT_PRIORITY);
          this.assertHasType(identityOut2, 'mammal');
        });

        test('Siblings and parsibs', function() {
          const [select1In1, select1] =
              this.getBlockInput('static_select_random');
          const select1In2 = select1.getInput('INPUT2').connection;
          const [dogOut] = this.getBlockOutput('static_dog');
          const [select2In1, select2] =
              this.getBlockInput('static_select_random');
          const select2In2 = select2.getInput('INPUT2').connection;
          const select2Out = select2.outputConnection;
          const [catOut] = this.getBlockOutput('static_cat');
          const [identityOut] = this.getBlockOutput('static_identity');
          this.checker.bindType(select1, 'T', 'Mammal', OUTPUT_PRIORITY);
          select1In1.connect(dogOut);
          select1In2.connect(select2Out);
          select2In1.connect(catOut);
          select2In2.connect(identityOut);
          this.checker.unbindType(select1, 'T', 'Mammal', OUTPUT_PRIORITY);
          this.assertHasType(identityOut, 'mammal');
        });
      });
    });
  });

  suite('getExplicitTypesOfConnection', function() {
    setup(function() {
      this.assertHasType = function(connection, type) {
        chai.assert.include(
            this.checker.getExplicitTypesOfConnection(connection), type);
      };
    });

    test('Explicit connection', function() {
      const [dogOut] = this.getBlockOutput('static_dog');
      this.assertHasType(dogOut, 'dog');
    });

    test('Unbound generic', function() {
      const [identityOut] = this.getBlockOutput('static_identity');
      const explicitTypes =
          this.checker.getExplicitTypesOfConnection(identityOut);
      chai.assert.isArray(explicitTypes);
      chai.assert.isEmpty(explicitTypes);
    });

    test('Externally bound', function() {
      const [identityOut, identity] = this.getBlockOutput('static_identity');
      this.checker.bindType(identity, 'T', 'dog', 201);
      this.assertHasType(identityOut, 'dog');
    });

    test('Explicit child', function() {
      const [identityIn] = this.getBlockInput('static_identity');
      const [dogOut] = this.getBlockOutput('static_dog');
      identityIn.connect(dogOut);
      this.assertHasType(identityIn, 'dog');
    });

    test('Explicit parent', function() {
      const [identityOut] = this.getBlockOutput('static_identity');
      const [dogIn] = this.getBlockInput('static_train_dog');
      identityOut.connect(dogIn);
      this.assertHasType(identityOut, 'dog');
    });
  });
});
