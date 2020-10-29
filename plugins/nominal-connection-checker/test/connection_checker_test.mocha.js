/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Unit tests for NominalConnectionChecker.
 */

const chai = require('chai');
const sinon = require('sinon');
const Blockly = require('blockly/node');

const {pluginInfo} = require('../src/index.js');
const {INPUT_PRIORITY, OUTPUT_PRIORITY} = require('../src/generic_map.js');

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
    this.genericMap = this.checker.getGenericMap();

    this.getBlockOutput = function(blockType) {
      const block = this.workspace.newBlock(blockType);
      return [
        block.outputConnection,
        block.id,
        block,
      ];
    };
    this.getBlockInput = function(blockType) {
      const block = this.workspace.newBlock(blockType);
      return [
        block.getInput('INPUT').connection,
        block.id,
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
      const [identityOut, id] = this.getBlockOutput('static_identity');
      this.genericMap.bindTypeToExplicit(id, 'T', 'dog', INPUT_PRIORITY);
      this.assertCanConnect(milkMammalIn, identityOut);
    });

    test('Parent explicit, child bound super', function() {
      const [trainDogIn] = this.getBlockInput('static_train_dog');
      const [identityOut, id] = this.getBlockOutput('static_identity');
      this.genericMap.bindTypeToExplicit(id, 'T', 'mammal', INPUT_PRIORITY);
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
      const [identityOut, id] = this.getBlockOutput('static_identity');
      this.genericMap.bindTypeToExplicit(id, 'T', 'dog', INPUT_PRIORITY);
      this.assertCanConnect(identityIn, identityOut);
    });

    test('Parent bound, child explicit sub', function() {
      const [identityIn, id] = this.getBlockInput('static_identity');
      const [dogOut] = this.getBlockOutput('static_dog');
      this.genericMap.bindTypeToExplicit(id, 'T', 'mammal', OUTPUT_PRIORITY);
      this.assertCanConnect(identityIn, dogOut);
    });

    test('Parent bound, child explicit super', function() {
      const [identityIn, id] = this.getBlockInput('static_identity');
      const [mammalOut] = this.getBlockOutput('static_mammal');
      this.genericMap.bindTypeToExplicit(id, 'T', 'dog', OUTPUT_PRIORITY);
      this.assertCannotConnect(identityIn, mammalOut);
    });

    test('Parent bound, child unbound', function() {
      const [identityIn, id] = this.getBlockInput('static_identity');
      const [identityOut] = this.getBlockOutput('static_identity');
      this.genericMap.bindTypeToExplicit(id, 'T', 'dog', OUTPUT_PRIORITY);
      this.assertCanConnect(identityIn, identityOut);
    });

    test('Parent bound, child bound sub', function() {
      const [identityIn, inId] = this.getBlockInput('static_identity');
      const [identityOut, outId] = this.getBlockOutput('static_identity');
      this.genericMap.bindTypeToExplicit(inId, 'T', 'mammal', OUTPUT_PRIORITY);
      this.genericMap.bindTypeToExplicit(outId, 'T', 'dog', INPUT_PRIORITY);
      this.assertCanConnect(identityIn, identityOut);
    });

    test('Parent bound, child bound super', function() {
      const [identityIn, inId] = this.getBlockInput('static_identity');
      const [identityOut, outId] = this.getBlockOutput('static_identity');
      this.genericMap.bindTypeToExplicit(inId, 'T', 'dog', OUTPUT_PRIORITY);
      this.genericMap.bindTypeToExplicit(outId, 'T', 'mammal', INPUT_PRIORITY);
      this.assertCannotConnect(identityIn, identityOut);
    });

    test('Parent bound, multiple child explicit sub', function() {
      const [selectRandomIn, id] = this.getBlockInput('static_select_random');
      const [dogOut] = this.getBlockOutput('static_dog');
      const [batOut] = this.getBlockOutput('static_bat');
      this.genericMap.bindTypeToExplicit(id, 'T', 'mammal', OUTPUT_PRIORITY);
      this.assertCanConnect(selectRandomIn, dogOut);
      this.genericMap.bindTypeToExplicit(id, 'T', 'dog', INPUT_PRIORITY);
      // Expect the output binding to get priority.
      this.assertCanConnect(selectRandomIn, batOut);
    });

    test.skip('Parent unbound, multiple child explicit sub', function() {
      const [selectRandomIn, id] = this.getBlockInput('static_select_random');
      const [dogOut] = this.getBlockOutput('static_dog');
      const [batOut] = this.getBlockOutput('static_bat');
      this.assertCanConnect(selectRandomIn, dogOut);
      this.genericMap.bindTypeToExplicit(id, 'T', 'dog', INPUT_PRIORITY);

      // TODO: Pick functionality.
      this.assertCanConnect(selectRandomIn, batOut);
      this.assertCannotConnect(selectRandomIn, batOut);
    });

    test('Parent explicit, child bound multiple explicit sub', function() {
      const [milkMammalIn] = this.getBlockInput('static_milk_mammal');
      const [selectRandomOut, id] = this.getBlockOutput('static_select_random');
      this.genericMap.bindTypeToExplicit(id, 'T', 'dog', INPUT_PRIORITY);
      this.genericMap.bindTypeToExplicit(id, 'T', 'bat', INPUT_PRIORITY);
      this.assertCanConnect(milkMammalIn, selectRandomOut);
    });

    test('Parent explicit, child bound multiple explicit some sub', function() {
      const [launchFlyingIn] = this.getBlockInput('static_launch_flying');
      const [selectRandomOut, id] = this.getBlockOutput('static_select_random');
      this.genericMap.bindTypeToExplicit(id, 'T', 'dog', INPUT_PRIORITY);
      this.genericMap.bindTypeToExplicit(id, 'T', 'bat', INPUT_PRIORITY);
      this.assertCannotConnect(launchFlyingIn, selectRandomOut);
    });
  });

  // This suite checks that bindings get updated correctly. It doesn't have
  // anything to do with compatibility.
  suite('Binding: connect and disconnect', function() {
    setup(function() {
      this.clock = sinon.useFakeTimers();

      this.assertNoBinding = function(conn) {
        chai.assert.isUndefined(
            this.genericMap.getExplicitType(
                conn.getSourceBlock().id, conn.getCheck()[0]));
      };
      this.assertHasBinding = function(conn, binding) {
        chai.assert.equal(
            this.genericMap.getExplicitType(
                conn.getSourceBlock().id, conn.getCheck()[0]),
            binding);
      };
    });

    teardown(function() {
      this.clock.restore();
    });

    test('Parent explicit, child explicit', function() {
      const [trainDogIn] = this.getBlockInput('static_train_dog');
      const [dogOut] = this.getBlockOutput('static_dog');

      trainDogIn.connect(dogOut);
      this.clock.tick(1);
      this.assertNoBinding(trainDogIn);
      this.assertNoBinding(dogOut);

      trainDogIn.disconnect();
      this.clock.tick(1);
      this.assertNoBinding(trainDogIn);
      this.assertNoBinding(dogOut);
    });

    test('Parent explicit, child unbound', function() {
      const [trainDogIn] = this.getBlockInput('static_train_dog');
      const [identityOut] = this.getBlockOutput('static_identity');

      trainDogIn.connect(identityOut);
      this.clock.tick(1);
      this.assertNoBinding(trainDogIn);
      this.assertHasBinding(identityOut, 'dog');

      trainDogIn.disconnect();
      this.clock.tick(1);
      this.assertNoBinding(trainDogIn);
      this.assertNoBinding(identityOut);
    });

    test('Parent explicit, child bound', function() {
      const [milkMammalIn] = this.getBlockInput('static_milk_mammal');
      const [identityOut, id] = this.getBlockOutput('static_identity');
      this.genericMap.bindTypeToExplicit(id, 'T', 'dog', INPUT_PRIORITY);

      milkMammalIn.connect(identityOut);
      this.clock.tick(1);
      this.assertNoBinding(milkMammalIn);
      this.assertHasBinding(identityOut, 'mammal');

      milkMammalIn.disconnect();
      this.clock.tick();
      this.assertNoBinding(milkMammalIn);
      this.assertHasBinding(identityOut, 'dog');
    });

    test('Parent unbound, child explicit', function() {
      const [identityIn] = this.getBlockInput('static_identity');
      const [dogOut] = this.getBlockOutput('static_dog');

      identityIn.connect(dogOut);
      this.clock.tick(1);
      this.assertHasBinding(identityIn, 'dog');
      this.assertNoBinding(dogOut);

      identityIn.disconnect();
      this.clock.tick(1);
      this.assertNoBinding(identityIn);
      this.assertNoBinding(dogOut);
    });

    test('Parent unbound, child unbound', function() {
      const [identityIn] = this.getBlockInput('static_identity');
      const [identityOut] = this.getBlockOutput('static_identity');

      identityIn.connect(identityOut);
      this.clock.tick(1);
      this.assertNoBinding(identityIn);
      this.assertNoBinding(identityOut);

      identityIn.disconnect();
      this.clock.tick(1);
      this.assertNoBinding(identityIn);
      this.assertNoBinding(identityOut);
    });

    test('Parent unbound, child bound', function() {
      const [identityIn] = this.getBlockInput('static_identity');
      const [identityOut, id] = this.getBlockOutput('static_identity');
      this.genericMap.bindTypeToExplicit(id, 'T', 'dog', INPUT_PRIORITY);

      identityIn.connect(identityOut);
      this.clock.tick(1);
      this.assertHasBinding(identityIn, 'dog');
      this.assertHasBinding(identityOut, 'dog');

      identityIn.disconnect();
      this.clock.tick(1);
      this.assertNoBinding(identityIn);
      this.assertHasBinding(identityOut, 'dog');
    });

    test('Parent bound, child explicit', function() {
      const [identityIn, id] = this.getBlockInput('static_identity');
      const [dogOut] = this.getBlockOutput('static_dog');
      this.genericMap.bindTypeToExplicit(id, 'T', 'mammal', OUTPUT_PRIORITY);

      identityIn.connect(dogOut);
      this.clock.tick(1);
      this.assertHasBinding(identityIn, 'mammal');
      this.assertNoBinding(dogOut);

      identityIn.disconnect();
      this.clock.tick(1);
      this.assertHasBinding(identityIn, 'mammal');
      this.assertNoBinding(dogOut);
    });

    test('Parent bound, child unbound', function() {
      const [identityIn, id] = this.getBlockInput('static_identity');
      const [identityOut] = this.getBlockOutput('static_identity');
      this.genericMap.bindTypeToExplicit(id, 'T', 'dog', OUTPUT_PRIORITY);

      identityIn.connect(identityOut);
      this.clock.tick(1);
      this.assertHasBinding(identityIn, 'dog');
      this.assertHasBinding(identityOut, 'dog');

      identityIn.disconnect();
      this.clock.tick(1);
      this.assertHasBinding(identityIn, 'dog');
      this.assertNoBinding(identityOut);
    });

    test('Parent bound, child bound', function() {
      const [identityIn, inId] = this.getBlockInput('static_identity');
      const [identityOut, outId] = this.getBlockOutput('static_identity');
      this.genericMap.bindTypeToExplicit(inId, 'T', 'mammal', OUTPUT_PRIORITY);
      this.genericMap.bindTypeToExplicit(outId, 'T', 'dog', INPUT_PRIORITY);

      identityIn.connect(identityOut);
      this.clock.tick(1);
      this.assertHasBinding(identityIn, 'mammal');
      this.assertHasBinding(identityOut, 'mammal');

      identityIn.disconnect();
      this.clock.tick(1);
      this.assertHasBinding(identityIn, 'mammal');
      this.assertHasBinding(identityOut, 'dog');
    });

    test('Parent explicit, child bound -> disconnect child\'s child',
        function() {
          const [milkMammalIn] = this.getBlockInput('static_milk_mammal');
          const [identityOut, , identity] =
              this.getBlockOutput('static_identity');
          const identityIn = identity.getInput('INPUT').connection;
          const [dogOut] = this.getBlockOutput('static_dog');

          identityIn.connect(dogOut);
          this.clock.tick(1);
          this.assertHasBinding(identityIn, 'dog');
          this.assertNoBinding(dogOut);

          milkMammalIn.connect(identityOut);
          this.clock.tick(1);
          this.assertNoBinding(milkMammalIn);
          this.assertHasBinding(identityIn, 'mammal');
          this.assertNoBinding(dogOut);

          identityIn.disconnect();
          this.clock.tick();
          this.assertNoBinding(milkMammalIn);
          this.assertHasBinding(identityIn, 'mammal');
          this.assertNoBinding(dogOut);
        });

    test('Parent bound, child explicit -> disconnect parent\'s parent',
        function() {
          const [milkMammalIn] = this.getBlockInput('static_milk_mammal');
          const [identityIn, , identity] =
              this.getBlockInput('static_identity');
          const identityOut = identity.outputConnection;
          const [dogOut] = this.getBlockOutput('static_dog');

          milkMammalIn.connect(identityOut);
          this.clock.tick(1);
          this.assertNoBinding(milkMammalIn);
          this.assertHasBinding(identityIn, 'mammal');

          identityIn.connect(dogOut);
          this.clock.tick(1);
          this.assertNoBinding(milkMammalIn);
          this.assertHasBinding(identityIn, 'mammal');
          this.assertNoBinding(dogOut);


          milkMammalIn.disconnect();
          this.clock.tick(1);
          this.assertNoBinding(milkMammalIn);
          this.assertHasBinding(identityIn, 'dog');
          this.assertNoBinding(dogOut);
        });

    test.skip('A unbound, B unbound, C explicit', function() {
      const [aIn] = this.getBlockInput('static_identity');
      const [bIn, , b] = this.getBlockInput('static_identity');
      const bOut = b.outputConnection;
      const [cOut] = this.getBlockOutput('static_dog');

      aIn.connect(bOut);
      this.clock.tick(1);
      this.assertNoBinding(aIn);
      this.assertNoBinding(bOut);

      bIn.connect(cOut);
      this.clock.tick(1);
      this.assertNoBinding(cOut);
      this.assertHasBinding(bIn, 'dog');
      this.assertHasBinding(aIn, 'dog');

      bIn.disconnect(cOut);
      this.clock.tick(1);
      this.assertNoBinding(aIn);
      this.assertNoBinding(bIn);
      this.assertNoBinding(cOut);
    });

    test('A explicit, B unbound, C unbound', function() {
      const [aIn] = this.getBlockInput('static_train_dog');
      const [bIn, , b] = this.getBlockInput('static_identity');
      const bOut = b.outputConnection;
      const [cOut] = this.getBlockOutput('static_identity');

      aIn.connect(bOut);
      this.clock.tick(1);
      this.assertNoBinding(aIn);
      this.assertHasBinding(bOut, 'dog');

      bIn.connect(cOut);
      this.clock.tick(1);
      this.assertNoBinding(aIn);
      this.assertHasBinding(bIn, 'dog');
      this.assertHasBinding(cOut, 'dog');

      bIn.disconnect();
      this.clock.tick(1);
      this.assertNoBinding(aIn);
      this.assertHasBinding(bIn, 'dog');
      this.assertNoBinding(cOut);

      aIn.disconnect();
      this.clock.tick(1);
      this.assertNoBinding(aIn);
      this.assertNoBinding(bOut);
      this.assertNoBinding(cOut);
    });

    test('C explicit, B unbound, A unbound', function() {
      const [aIn] = this.getBlockInput('static_identity');
      const [bIn, , b] = this.getBlockInput('static_identity');
      const bOut = b.outputConnection;
      const [cOut] = this.getBlockOutput('static_dog');

      cOut.connect(bIn);
      this.clock.tick(1);
      this.assertNoBinding(cOut);
      this.assertHasBinding(bIn, 'dog');

      bOut.connect(aIn);
      this.clock.tick(1);
      this.assertNoBinding(cOut);
      this.assertHasBinding(bOut, 'dog');
      this.assertHasBinding(aIn, 'dog');

      bOut.disconnect();
      this.clock.tick(1);
      this.assertNoBinding(cOut);
      this.assertHasBinding(bOut, 'dog');
      this.assertNoBinding(aIn);

      cOut.disconnect();
      this.clock.tick(1);
      this.assertNoBinding(cOut);
      this.assertNoBinding(bIn);
      this.assertNoBinding(aIn);
    });

    test.skip('C unbound, B unbound, A explicit', function() {
      const [aIn] = this.getBlockInput('static_train_dog');
      const [bIn, , b] = this.getBlockInput('static_identity');
      const bOut = b.outputConnection;
      const [cOut] = this.getBlockOutput('static_identity');

      cOut.connect(bIn);
      this.clock.tick(1);
      this.assertNoBinding(cOut);
      this.assertNoBinding(bIn);

      bOut.connect(aIn);
      this.clock.tick(1);
      this.assertNoBinding(aIn);
      this.assertHasBinding(bOut, 'dog');
      this.assertHasBinding(cOut, 'dog');

      bOut.disconnect();
      this.clock.tick(1);
      this.assertNoBinding(aIn);
      this.assertNoBinding(cOut);
      this.assertNoBinding(bIn);
    });

    test('Parent unbound, multiple child explicit sub same', function() {
      const [selectRandomIn1, , selectRandom] =
          this.getBlockInput('static_select_random');
      const selectRandomIn2 = selectRandom.getInput('INPUT2').connection;
      const [dogOut1] = this.getBlockOutput('static_dog');
      const [dogOut2] = this.getBlockOutput('static_dog');

      selectRandomIn1.connect(dogOut1);
      this.clock.tick(1);
      this.assertNoBinding(dogOut1);
      this.assertHasBinding(selectRandomIn1, 'dog');

      selectRandomIn2.connect(dogOut2);
      this.clock.tick(1);
      this.assertNoBinding(dogOut1);
      this.assertNoBinding(dogOut2);
      this.assertHasBinding(selectRandomIn1, 'dog');

      selectRandomIn1.disconnect();
      this.clock.tick(1);
      this.assertNoBinding(dogOut2);
      this.assertHasBinding(selectRandomIn1, 'dog');

      selectRandomIn2.disconnect();
      this.clock.tick(1);
      this.assertNoBinding(dogOut2);
      this.assertNoBinding(selectRandomIn2);
    });

    // The following tests are for if we decide to implement Proposal 2.
    // https://docs.google.com/document/d/1QKYkmWjkle1JWCi3O8jXr8-7Toazh1pW_4EaVVgB_OI/edit#heading=h.z2m9hs1ghrwp
    test.skip('Parent unbound, multiple child explicit sub different',
        function() {
          const [selectRandomIn1, , selectRandom] =
              this.getBlockInput('static_select_random');
          const selectRandomIn2 = selectRandom.getInput('INPUT2').connection;
          const [dogOut] = this.getBlockOutput('static_dog');
          const [batOut] = this.getBlockOutput('static_bat');

          selectRandomIn1.connect(dogOut);
          this.clock.tick(1);
          this.assertNoBinding(dogOut);
          this.assertHasBinding(selectRandomIn1, 'dog');

          selectRandomIn2.connect(batOut);
          this.clock.tick(1);
          this.assertNoBinding(dogOut);
          this.assertNoBinding(batOut);
          this.assertHasBinding(selectRandomIn1, 'mammal');

          selectRandomIn1.disconnect();
          this.clock.tick(1);
          this.assertNoBinding(batOut);
          this.assertHasBinding(selectRandomIn1, 'bat');

          selectRandomIn2.disconnect();
          this.clock.tick(1);
          this.assertNoBinding(batOut);
          this.assertNoBinding(selectRandomIn2);
        });

    test.skip('Parent unbound, multiple child explicit sub mixed levels',
        function() {
          const [selectRandomIn1, , selectRandom] =
              this.getBlockInput('static_select_random');
          const selectRandomIn2 = selectRandom.getInput('INPUT2').connection;
          const [dogOut] = this.getBlockOutput('static_dog');
          const [mammalOut] = this.getBlockOutput('static_mammal');

          selectRandomIn1.connect(dogOut);
          this.clock.tick(1);
          this.assertNoBinding(dogOut);
          this.assertHasBinding(selectRandomIn1, 'dog');

          selectRandomIn2.connect(mammalOut);
          this.clock.tick(1);
          this.assertNoBinding(dogOut);
          this.assertNoBinding(mammalOut);
          this.assertHasBinding(selectRandomIn1, 'mammal');

          selectRandomIn1.disconnect();
          this.clock.tick(1);
          this.assertNoBinding(mammalOut);
          this.assertHasBinding(selectRandomIn1, 'mammal');

          selectRandomIn2.disconnect();
          this.clock.tick(1);
          this.assertNoBinding(mammalOut);
          this.assertNoBinding(selectRandomIn2);
        });

    test.skip('Parent unbound, multiple child explicit sub mixed levels 2',
        function() {
          const [selectRandomIn1, , selectRandom] =
              this.getBlockInput('static_select_random');
          const selectRandomIn2 = selectRandom.getInput('INPUT2').connection;
          const [dogOut] = this.getBlockOutput('static_dog');
          const [reptileOut] = this.getBlockOutput('static_reptile');

          selectRandomIn1.connect(dogOut);
          this.clock.tick(1);
          this.assertNoBinding(dogOut);
          this.assertHasBinding(selectRandomIn1, 'dog');

          selectRandomIn2.connect(reptileOut);
          this.clock.tick(1);
          this.assertNoBinding(dogOut);
          this.assertNoBinding(reptileOut);
          this.assertHasBinding(selectRandomIn1, 'animal');

          selectRandomIn1.disconnect();
          this.clock.tick(1);
          this.assertNoBinding(reptileOut);
          this.assertHasBinding(selectRandomIn1, 'reptile');

          selectRandomIn2.disconnect();
          this.clock.tick(1);
          this.assertNoBinding(reptileOut);
          this.assertNoBinding(selectRandomIn2);
        });
  });
});
