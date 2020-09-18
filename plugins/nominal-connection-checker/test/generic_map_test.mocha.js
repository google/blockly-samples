/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Unit tests for GenericMap
 */

const chai = require('chai');
const Blockly = require('blockly/node');

const {pluginInfo} = require('../src/index.js');
const {GenericMap, INPUT_PRIORITY, OUTPUT_PRIORITY} =
    require('../src/generic_map.js');

suite('GenericMap', function() {
  setup(function() {
    Blockly.defineBlocksWithJsonArray([
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
    ]);

    const options = {
      plugins: {
        ...pluginInfo,
      },
    };

    this.workspace = new Blockly.Workspace(options);
    this.genericMap = new GenericMap(this.workspace);
    this.dependerBlock = this.workspace.newBlock('static_identity');
    this.dependerId = this.dependerBlock.id;
    this.dependencyBlock = this.workspace.newBlock('static_identity');
    this.dependencyId = this.dependencyBlock.id;

    this.assertHasType = function(type) {
      chai.assert.equal(
          this.genericMap.getExplicitType(this.dependencyId, 'T'),
          type);
    };

    this.bindType = function(type, priority) {
      this.genericMap.bindTypeToExplicit(
          this.dependencyId, 'T', type, priority);
    };

    this.unbindType = function(type, priority) {
      this.genericMap.unbindTypeFromExplicit(
          this.dependencyId, 'T', type, priority);
    };
  });

  teardown(function() {
    delete Blockly.Blocks['static_identity'];
  });

  suite('Priority', function() {
    test('Input then output', function() {
      this.bindType('test', INPUT_PRIORITY);
      this.assertHasType('test');
      this.bindType('test2', OUTPUT_PRIORITY);
      this.assertHasType('test2');

      this.unbindType('test2', OUTPUT_PRIORITY);
      this.assertHasType('test');
    });

    test('Output then input', function() {
      this.bindType('test', OUTPUT_PRIORITY);
      this.assertHasType('test');
      this.bindType('test2', INPUT_PRIORITY);
      this.assertHasType('test');

      this.unbindType('test2', INPUT_PRIORITY);
      this.assertHasType('test');
    });

    test('Less than input', function() {
      this.bindType('test', 99);
      this.assertHasType('test');
      this.bindType('test2', INPUT_PRIORITY);
      this.assertHasType('test2');

      this.unbindType('test2', INPUT_PRIORITY);
      this.assertHasType('test');
    });

    test('Between input and output', function() {
      this.bindType('test', INPUT_PRIORITY);
      this.assertHasType('test');
      this.bindType('test2', 150);
      this.assertHasType('test2');
      this.bindType('test3', OUTPUT_PRIORITY);
      this.assertHasType('test3');

      this.unbindType('test3', OUTPUT_PRIORITY);
      this.assertHasType('test2');
      this.unbindType('test2', 150);
      this.assertHasType('test');
    });

    test('More than output', function() {
      this.bindType('test', OUTPUT_PRIORITY);
      this.assertHasType('test');
      this.bindType('test2', 201);
      this.assertHasType('test2');

      this.unbindType('test2', 201);
      this.assertHasType('test');
    });
  });

  suite('bindToGeneric', function() {
    test('Simple', function() {
      this.bindType('test', OUTPUT_PRIORITY);
      this.genericMap.bindTypeToGeneric(
          this.dependerId, 'T', this.dependencyId, 'T', OUTPUT_PRIORITY);
      chai.assert.equal(
          this.genericMap.getExplicitType(this.dependerId, 'T'),
          'test');
    });

    test('Depender block doesn\'t exist', function() {
      chai.assert.throws(() => {
        this.genericMap.bindTypeToGeneric(
            'cats', 'T', this.dependencyId, 'T', OUTPUT_PRIORITY);
      }, 'The depender id (cats) is not a valid block id');
    });

    test('Dependency block doesn\'t exist', function() {
      chai.assert.throws(() => {
        this.genericMap.bindTypeToGeneric(
            this.dependerId, 'T', 'cats', 'T', OUTPUT_PRIORITY);
      }, 'The dependency id (cats) is not a valid block id');
    });

    test('Dependency type isn\'t bound', function() {
      chai.assert.throws(() => {
        this.genericMap.bindTypeToGeneric(
            this.dependerId, 'T', this.dependencyId, 'T', OUTPUT_PRIORITY);
      }, /The type T on block .+ is not bound to an explicit type./);
    });
  });

  suite('unbindFromGeneric', function() {
    setup(function() {
      this.bindGeneric = function(dependencyId, dependencyType) {
        this.genericMap.bindTypeToGeneric(
            this.dependerId,
            'T',
            dependencyId,
            dependencyType,
            OUTPUT_PRIORITY);
      };

      this.unbindGeneric = function(dependencyId, dependencyType) {
        this.genericMap.unbindTypeFromGeneric(
            this.dependerId,
            'T',
            dependencyId,
            dependencyType,
            OUTPUT_PRIORITY);
      };

      this.assertHasType = function(type) {
        chai.assert.equal(
            this.genericMap.getExplicitType(this.dependerId, type));
      };
    });

    test('Simple', function() {
      this.bindType('test', OUTPUT_PRIORITY);
      this.bindGeneric(this.dependencyId, 'T');
      this.unbindGeneric(this.dependencyId, 'T');
      chai.assert.isUndefined(
          this.genericMap.getExplicitType(this.dependerId, 'T'));
    });

    test('Dependency block has no dependers', function() {
      this.bindType('test', OUTPUT_PRIORITY);
      this.bindGeneric(this.dependencyId, 'T');
      this.unbindGeneric('cats', 'T');
      this.assertHasType('test');
    });

    test('Dependency type has no dependers', function() {
      this.bindType('test', OUTPUT_PRIORITY);
      this.bindGeneric(this.dependencyId, 'T');
      this.unbindGeneric(this.dependencyId, 'G');
      this.assertHasType('test');
    });

    test('Depender block is not bound', function() {
      chai.assert.doesNotThrow(() => {
        this.unbindGeneric(this.dependencyId, 'T');
      });
    });

    test('Depender type is not bound', function() {
      this.bindType('test', OUTPUT_PRIORITY);
      this.bindGeneric(this.dependencyId, 'T');
      chai.assert.doesNotThrow(() => {
        this.genericMap.unbindTypeFromGeneric(
            this.dependerId, 'G', this.dependencyId, 'T', OUTPUT_PRIORITY);
      });
    });
  });
});

