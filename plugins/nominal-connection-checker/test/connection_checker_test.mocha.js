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

    this.getBlockOutput = function(blockType) {
      return this.workspace.newBlock(blockType).outputConnection;
    };
    this.getBlockInput = function(blockType) {
      return this.workspace.newBlock(blockType).getInput('INPUT').connection;
    };
  });

  teardown(function() {
    delete Blockly.Blocks['static_animal'];
    delete Blockly.Blocks['static_mammal'];
    delete Blockly.Blocks['static_dog'];
    delete Blockly.Blocks['static_bat'];
    delete Blockly.Blocks['static_weigh_animal'];
    delete Blockly.Blocks['static_milk_mammal'];
    delete Blockly.Blocks['static_train_dog'];
    delete Blockly.Blocks['static_launch_flying'];
  });

  suite('Simple subtyping', function() {
    test('Exact types', function() {
      const dogOut = this.getBlockOutput('static_dog');
      const trainDogIn = this.getBlockInput('static_train_dog');
      chai.assert.isTrue(this.checker.doTypeChecks(dogOut, trainDogIn));
    });

    test('Simple super', function() {
      const dogOut = this.getBlockOutput('static_dog');
      const milkMammalIn = this.getBlockInput('static_milk_mammal');
      chai.assert.isTrue(this.checker.doTypeChecks(dogOut, milkMammalIn));
    });

    test('Multiple supers', function() {
      const batOut = this.getBlockOutput('static_bat');
      const milkMammalIn = this.getBlockInput('static_milk_mammal');
      const launchFlyingIn = this.getBlockInput('static_launch_flying');
      chai.assert.isTrue(this.checker.doTypeChecks(batOut, milkMammalIn));
      chai.assert.isTrue(this.checker.doTypeChecks(batOut, launchFlyingIn));
    });

    test('Deep supers', function() {
      const dogOut = this.getBlockOutput('static_dog');
      const weighAnimalIn = this.getBlockInput('static_weigh_animal');
      chai.assert.isTrue(this.checker.doTypeChecks(dogOut, weighAnimalIn));
    });

    test('Multiple output checks', function() {
      const dogOut = this.getBlockOutput('static_dog');
      dogOut.setCheck(['Random', 'Dog']);
      const trainDogIn = this.getBlockInput('static_train_dog');
      chai.assert.isTrue(this.checker.doTypeChecks(dogOut, trainDogIn));
    });

    test('Multiple input checks', function() {
      const dogOut = this.getBlockOutput('static_dog');
      const trainDogIn = this.getBlockInput('static_train_dog');
      trainDogIn.setCheck(['Random', 'Dog']);
      chai.assert.isTrue(this.checker.doTypeChecks(dogOut, trainDogIn));
    });

    test('Unrelated types', function() {
      const batOut = this.getBlockOutput('static_bat');
      const trainDogIn = this.getBlockInput('static_train_dog');
      chai.assert.isFalse(this.checker.doTypeChecks(batOut, trainDogIn));
    });

    test('Backwards types', function() {
      const mammalOut = this.getBlockOutput('static_mammal');
      const trainDogIn = this.getBlockInput('static_train_dog');
      chai.assert.isFalse(this.checker.doTypeChecks(mammalOut, trainDogIn));
    });
  });
});
