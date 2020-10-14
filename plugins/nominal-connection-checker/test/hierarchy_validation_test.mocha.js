/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Unit tests for validation of a type hierarchy definition.
 */

const chai = require('chai');
const sinon = require('sinon');

const {validateHierarchy} = require('../src/hierarchy_validation.js');

suite('Hierarchy Validation', function() {
  setup(function() {
    this.errorStub = sinon.stub(console, 'error');
  });

  teardown(function() {
    this.errorStub.restore();
  });

  suite('Correct type', function() {
    test('Object', function() {
      validateHierarchy({});
      chai.assert.isTrue(this.errorStub.notCalled);
    });

    test('Undefined', function() {
      validateHierarchy();
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(
          'The hierarchy definition should be an object.'));
    });

    test('Array', function() {
      validateHierarchy([]);
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(
          'The hierarchy definition should be an object.'));
    });
  });

  suite('Conflicts', function() {
    const conflictMsg =
        'The type name \'%s\' conflicts with the type name(s) %s';

    test('No conflicts', function() {
      validateHierarchy({
        'typeA': { },
        'typeB': { },
        'typeC': { },
      });
      chai.assert.isTrue(this.errorStub.notCalled);
    });

    test('Type conflicts once', function() {
      validateHierarchy({
        'typeA': { },
        'TypeA': { },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(
          conflictMsg, 'typeA', ['TypeA']));
    });

    test('Type conflicts multiple', function() {
      validateHierarchy({
        'typeA': { },
        'TypeA': { },
        'Typea': { },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(
          conflictMsg, 'typeA', ['TypeA', 'Typea']));
    });

    test('Multiple conflicts', function() {
      validateHierarchy({
        'typeA': { },
        'TypeA': { },
        'typeB': { },
        'TypeB': { },
      });
      chai.assert.isTrue(this.errorStub.calledTwice);
      chai.assert.isTrue(this.errorStub.calledWith(
          conflictMsg, 'typeA', ['TypeA']));
      chai.assert.isTrue(this.errorStub.calledWith(
          conflictMsg, 'typeB', ['TypeB']));
    });
  });

  suite('Defined supers', function() {
    const errorMsg = 'The type %s says it fulfills the type %s, but that' +
        ' type is not defined';

    test('Defined before', function() {
      validateHierarchy({
        'typeB': { },
        'typeA': {
          'fulfills': ['typeB'],
        },
      });
      chai.assert.isTrue(this.errorStub.notCalled);
    });

    test('Defined after', function() {
      validateHierarchy({
        'typeA': {
          'fulfills': ['typeB'],
        },
        'typeB': { },
      });
      chai.assert.isTrue(this.errorStub.notCalled);
    });

    test('Not defined', function() {
      validateHierarchy({
        'typeA': {
          'fulfills': ['typeB'],
        },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(errorMsg, 'typeA', 'typeB'));
    });

    test('Case', function() {
      validateHierarchy({
        'typeB': { },
        'typeA': {
          'fulfills': ['TypeB'],
        },
      });
      chai.assert.isTrue(this.errorStub.notCalled);
    });
  });

  suite('Circular Dependencies', function() {
    test('No cycles', function() {
      validateHierarchy({
        'typeA': {
          'fulfills': ['typeB'],
        },
        'typeB': {
          'fulfills': ['typeC'],
        },
        'typeC': {
          'fulfills': ['typeD'],
        },
        'typeD': {
          'fulfills': ['typeE'],
        },
        'typeE': { },
      });
      chai.assert.isTrue(this.errorStub.notCalled);
    });

    test('Direct cycle', function() {
      validateHierarchy({
        'typeA': {
          'fulfills': ['typeA'],
        },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(
          'The type typeA creates a circular dependency: ' +
          'typeA fulfills typeA'));
    });

    test('Indirect cycle', function() {
      validateHierarchy({
        'typeA': {
          'fulfills': ['typeB'],
        },
        'typeB': {
          'fulfills': ['typeA'],
        },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(
          'The type typeA creates a circular dependency: ' +
          'typeA fulfills typeB fulfills typeA'));
    });

    test('Really indirect cycle', function() {
      validateHierarchy({
        'typeA': {
          'fulfills': ['typeB', 'typeC', 'typeD'],
        },
        'typeB': {
          'fulfills': ['typeE'],
        },
        'typeC': {
          'fulfills': ['typeF', 'typeG'],
        },
        'typeD': {
          'fulfills': ['typeH', 'typeJ'],
        },
        'typeE': { },
        'typeF': { },
        'typeG': { },
        'typeH': { },
        'typeJ': {
          'fulfills': ['typeA'],
        },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(
          'The type typeA creates a circular dependency: ' +
          'typeA fulfills typeD fulfills typeJ fulfills typeA'));
    });

    test('Two divergent cycles', function() {
      validateHierarchy({
        'typeA': {
          'fulfills': ['typeB', 'typeC'],
        },
        'typeB': {
          'fulfills': ['typeA'],
        },
        'typeC': {
          'fulfills': ['typeA'],
        },
      });
      chai.assert.isTrue(this.errorStub.calledTwice);
      chai.assert.isTrue(this.errorStub.calledWith(
          'The type typeA creates a circular dependency: ' +
          'typeA fulfills typeB fulfills typeA'));
      chai.assert.isTrue(this.errorStub.calledWith(
          'The type typeA creates a circular dependency: ' +
          'typeA fulfills typeC fulfills typeA'));
    });

    test('Two convergent cycles', function() {
      validateHierarchy({
        'typeA': {
          'fulfills': ['typeC'],
        },
        'typeB': {
          'fulfills': ['typeC'],
        },
        'typeC': {
          'fulfills': ['typeA', 'typeB'],
        },
      });
      chai.assert.isTrue(this.errorStub.calledTwice);
      chai.assert.isTrue(this.errorStub.calledWith(
          'The type typeA creates a circular dependency: ' +
          'typeA fulfills typeC fulfills typeA'));
      chai.assert.isTrue(this.errorStub.calledWith(
          'The type typeC creates a circular dependency: ' +
          'typeC fulfills typeB fulfills typeC'));
    });

    test('Two independent cycles', function() {
      validateHierarchy({
        'typeA': {
          'fulfills': ['typeB'],
        },
        'typeB': {
          'fulfills': ['typeA'],
        },
        'typeC': {
          'fulfills': ['typeD'],
        },
        'typeD': {
          'fulfills': ['typeC'],
        },
      });
      chai.assert.isTrue(this.errorStub.calledTwice);
      chai.assert.isTrue(this.errorStub.calledWith(
          'The type typeA creates a circular dependency: ' +
          'typeA fulfills typeB fulfills typeA'));
      chai.assert.isTrue(this.errorStub.calledWith(
          'The type typeC creates a circular dependency: ' +
          'typeC fulfills typeD fulfills typeC'));
    });

    test('Case', function() {
      validateHierarchy({
        'typeA': {
          'fulfills': ['TypeA'],
        },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(
          'The type typeA creates a circular dependency: ' +
          'typeA fulfills TypeA'));
    });
  });

  suite('Generics', function() {
    const errorMsg = 'The type %s will act like a generic type if used as a ' +
        'connection check, because it is a single character.';

    test('"valid"', function() {
      validateHierarchy({
        'valid': { },
      });
      chai.assert.isTrue(this.errorStub.notCalled);
    });

    test('"a"', function() {
      validateHierarchy({
        'a': { },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(errorMsg, 'a'));
    });

    test('"A"', function() {
      validateHierarchy({
        'A': { },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(errorMsg, 'A'));
    });

    test('"*"', function() {
      validateHierarchy({
        '*': { },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(errorMsg, '*'));
    });

    test('"1"', function() {
      validateHierarchy({
        '1': { },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(errorMsg, '1'));
    });
  });
});
