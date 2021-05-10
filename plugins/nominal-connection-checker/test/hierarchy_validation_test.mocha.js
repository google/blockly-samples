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
const {MissingTypeNameError, LeftBracketError,
  RightBracketError, ExtraCharactersError} =
    require('../src/type_structure.js');

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
        'The type name \'%s\' conflicts with the type name(s) [%s]';

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
          conflictMsg, 'typeA', 'TypeA'));
    });

    test('Type conflicts multiple', function() {
      validateHierarchy({
        'typeA': { },
        'TypeA': { },
        'Typea': { },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(
          conflictMsg, 'typeA', 'TypeA, Typea'));
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
          conflictMsg, 'typeA', 'TypeA'));
      chai.assert.isTrue(this.errorStub.calledWith(
          conflictMsg, 'typeB', 'TypeB'));
    });
  });

  suite('Defined supers', function() {
    const errorMsg = 'The type %s says it fulfills the type %s, but that' +
        ' type is not defined.';
    const genericMsg = 'The type %s says it fulfills the type %s, but that ' +
        'type appears to be generic, which is not allowed.';

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

    test('Defined with params', function() {
      validateHierarchy({
        'typeA': {
          'fulfills': ['typeB[A]'],
          'params': [
            {
              'name': 'A',
              'variance': 'co',
            },
          ],
        },
        'typeB': {
          'params': [
            {
              'name': 'A',
              'variance': 'co',
            },
          ],
        },
      });
      chai.assert.isTrue(this.errorStub.notCalled);
    });

    test('Undefined with params', function() {
      validateHierarchy({
        'typeA': {
          'fulfills': ['typeB[A]'],
          'params': [
            {
              'name': 'A',
              'variance': 'co',
            },
          ],
        },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(errorMsg, 'typeA', 'typeB'));
    });

    test('Generic super', function() {
      validateHierarchy({
        'typeA': {
          'fulfills': ['A'],
        },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(
          this.errorStub.calledWith(genericMsg, 'typeA', 'A'));
    });
  });

  suite('Duplicate supers', function() {
    const errorMsg = 'The type %s fulfills the type %s multiple times.';

    test('Simple', function() {
      validateHierarchy({
        'typeA': { },
        'typeB': {
          'fulfills': ['typeA', 'typeA'],
        },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(errorMsg, 'typeB', 'typeA'));
    });

    test('Case', function() {
      validateHierarchy({
        'typeA': { },
        'typeB': {
          'fulfills': ['typea', 'typeA'],
        },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(errorMsg, 'typeB', 'typeA'));
    });

    test('Params', function() {
      validateHierarchy({
        'typeA': {
          'params': [
            {
              'name': 'A',
              'variance': 'co',
            },
          ],
        },
        'typeB': {
          'fulfills': ['typeA[A]', 'typeA[B]'],
          'params': [
            {
              'name': 'A',
              'variance': 'co',
            },
            {
              'name': 'B',
              'variance': 'co',
            },
          ],
        },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(errorMsg, 'typeB', 'typeA'));
    });
  });

  suite('Circular dependencies', function() {
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

    test('Direct with case', function() {
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

    test('Direct w/ params', function() {
      validateHierarchy({
        'typeA': {
          'fulfills': ['typeA[A]'],
          'params': [
            {
              'name': 'A',
              'variance': 'co',
            },
          ],
        },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(
          'The type typeA creates a circular dependency: ' +
          'typeA fulfills typeA[A]'));
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

    test('Indirect cycle w/ params', function() {
      validateHierarchy({
        'typeA': {
          'fulfills': ['typeB[A]'],
          'params': [
            {
              'name': 'A',
              'variance': 'co',
            },
          ],
        },
        'typeB': {
          'fulfills': ['typeA[B]'],
          'params': [
            {
              'name': 'B',
              'variance': 'co',
            },
          ],
        },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(
          'The type typeA creates a circular dependency: ' +
          'typeA fulfills typeB[A] fulfills typeA[B]'));
    });

    test('Indirect cycle w/ one param', function() {
      validateHierarchy({
        'typeA': {
          'fulfills': ['typeB[typeC]'],
        },
        'typeB': {
          'fulfills': ['typeA'],
          'params': [
            {
              'name': 'B',
              'variance': 'co',
            },
          ],
        },
        'typeC': { },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(
          'The type typeA creates a circular dependency: ' +
          'typeA fulfills typeB[typeC] fulfills typeA'));
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

    test('"123"', function() {
      validateHierarchy({
        '123': { },
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

  suite('Characters', function() {
    setup(function() {
      const errorMsg = 'The type %s includes an illegal %s character (\'%s\').';

      this.assertValid = function(hierarchy) {
        validateHierarchy(hierarchy);
        chai.assert.isTrue(this.errorStub.notCalled);
      };
      this.assertInvalid = function(hierarchy, type, char, charName) {
        validateHierarchy(hierarchy);
        chai.assert.isTrue(this.errorStub.calledOnce);
        chai.assert.isTrue(
            this.errorStub.calledWith(errorMsg, type, charName, char));
      };
    });

    test('Comma', function() {
      this.assertInvalid({
        'type,type': { },
      }, 'type,type', ',', 'comma');
    });

    test('Space', function() {
      this.assertInvalid({
        'type type': { },
      }, 'type type', ' ', 'space');
    });

    test('Left bracket', function() {
      this.assertInvalid({
        'type[': { },
      }, 'type[', '[', 'left bracket');
    });

    test('Right bracket', function() {
      this.assertInvalid({
        'type]': { },
      }, 'type]', ']', 'right bracket');
    });
  });

  suite('Supers parsing', function() {
    setup(function() {
      this.assertInvalid = function(hierarchy, errorType) {
        validateHierarchy(hierarchy);
        chai.assert.isTrue(this.errorStub.calledOnce);
        chai.assert.isTrue(
            this.errorStub.getCall(0).args[3] instanceof errorType);
      };
    });

    test('Missing type name', function() {
      this.assertInvalid({
        'typeA': {
          'fulfills': ['[typeB]'],
        },
        'typeB': { },
      }, MissingTypeNameError);
    });

    test('Unmatched left', function() {
      this.assertInvalid({
        'typeA': {
          'fulfills': ['typeB['],
        },
        'typeB': { },
      }, LeftBracketError);
    });

    test('Unmatched right', function() {
      this.assertInvalid({
        'typeA': {
          'fulfills': ['typeB]'],
        },
        'typeB': { },
      }, RightBracketError);
    });

    test('Extra characters', function() {
      this.assertInvalid({
        'typeA': {
          'fulfills': ['typeB[typeB]test'],
        },
        'typeB': { },
      }, ExtraCharactersError);
    });
  });

  suite('Super params defined', function() {
    setup(function() {
      this.assertInvalid = function(hierarchyDef, generic, badParam) {
        validateHierarchy(hierarchyDef);
        chai.assert.isTrue(this.errorStub.calledOnce);
        chai.assert.isTrue(this.errorStub.getCall(0).args[3] == badParam);
        const includes = this.errorStub.getCall(0).args[0].includes('generic');
        if (generic) {
          chai.assert.isTrue(
              includes, 'Expected the error to be for a generic param.');
        } else {
          chai.assert.isFalse(
              includes, 'Expected the error to be for an explicit param.');
        }
      };
      this.assertValid = function(hierarchyDef) {
        validateHierarchy(hierarchyDef);
        chai.assert.isTrue(this.errorStub.notCalled);
      };
    });

    test('Undefined explicit', function() {
      this.assertInvalid({
        'typeA': {
          'fulfills': ['typeB[typeC]'],
        },
        'typeB': {
          'params': [
            {
              'name': 'B',
              'variance': 'co',
            },
          ],
        },
      }, false, 'typeC');
    });

    test('Defined explicit, case', function() {
      this.assertValid({
        'typeA': {
          'fulfills': ['typeB[TYPEC]'],
        },
        'typeB': {
          'params': [
            {
              'name': 'B',
              'variance': 'co',
            },
          ],
        },
        'typeC': { },
      });
    });

    test('Undefined nested explicit', function() {
      this.assertInvalid({
        'typeA': {
          'fulfills': ['typeB[typeB[typeC]]'],
        },
        'typeB': {
          'params': [
            {
              'name': 'B',
              'variance': 'co',
            },
          ],
        },
      }, false, 'typeC');
    });

    test('Undefined generic', function() {
      this.assertInvalid({
        'typeA': {
          'fulfills': ['typeB[A]'],
          'params': [
            {
              'name': 'B',
              'variance': 'co',
            },
          ],
        },
        'typeB': {
          'params': [
            {
              'name': 'B',
              'variance': 'co',
            },
          ],
        },
      }, true, 'A');
    });

    test('Undefined generic, no params', function() {
      this.assertInvalid({
        'typeA': {
          'fulfills': ['typeB[A]'],
        },
        'typeB': {
          'params': [
            {
              'name': 'B',
              'variance': 'co',
            },
          ],
        },
      }, true, 'A');
    });

    test('Defined generic', function() {
      this.assertValid({
        'typeA': {
          'fulfills': ['typeB[A]'],
          'params': [
            {
              'name': 'A',
              'variance': 'co',
            },
          ],
        },
        'typeB': {
          'params': [
            {
              'name': 'B',
              'variance': 'co',
            },
          ],
        },
        'typeC': { },
      });
    });

    test('Defined generic, case', function() {
      this.assertValid({
        'typeA': {
          'fulfills': ['typeB[a]'],
          'params': [
            {
              'name': 'A',
              'variance': 'co',
            },
          ],
        },
        'typeB': {
          'params': [
            {
              'name': 'B',
              'variance': 'co',
            },
          ],
        },
        'typeC': { },
      });
    });

    test('Undefined nested generic', function() {
      this.assertInvalid({
        'typeA': {
          'fulfills': ['typeB[typeB[A]]'],
          'params': [
            {
              'name': 'B',
              'variance': 'co',
            },
          ],
        },
        'typeB': {
          'params': [
            {
              'name': 'B',
              'variance': 'co',
            },
          ],
        },
      }, true, 'A');
    });
  });

  suite('Super param numbers correct', function() {
    const errorMsg = 'The type %s says it fulfills the type %s, but %s ' +
        'requires %s type(s) while %s type(s) are provided.';
    const genericErrorMsg = 'The type %s says it fulfills the type %s, but ' +
        '%s appears to be generic and have parameters, which is not allowed.';

    test('Too many params, 0', function() {
      validateHierarchy({
        'typeA': {
          'fulfills': ['typeB[A]'],
          'params': [
            {
              'name': 'A',
              'variance': 'co',
            },
          ],
        },
        'typeB': { },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(errorMsg,
          'typeA', 'typeB[A]', 'typeB', 0, 1));
    });

    test('Too many params, 1', function() {
      validateHierarchy({
        'typeA': {
          'fulfills': ['typeB[A, B]'],
          'params': [
            {
              'name': 'A',
              'variance': 'co',
            },
            {
              'name': 'B',
              'variance': 'co',
            },
          ],
        },
        'typeB': {
          'params': [
            {
              'name': 'T',
              'variance': 'co',
            },
          ],
        },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(errorMsg,
          'typeA', 'typeB[A, B]', 'typeB', 1, 2));
    });

    test('Nested too many params', function() {
      validateHierarchy({
        'typeA': {
          'fulfills': ['typeB[typeB[A, B]]'],
          'params': [
            {
              'name': 'A',
              'variance': 'co',
            },
            {
              'name': 'B',
              'variance': 'co',
            },
          ],
        },
        'typeB': {
          'params': [
            {
              'name': 'T',
              'variance': 'co',
            },
          ],
        },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(errorMsg,
          'typeA', 'typeB[typeB[A, B]]', 'typeB', 1, 2));
    });

    test('Too few params, 0', function() {
      validateHierarchy({
        'typeA': {
          'fulfills': ['typeB'],
        },
        'typeB': {
          'params': [
            {
              'name': 'T',
              'variance': 'co',
            },
          ],
        },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(errorMsg,
          'typeA', 'typeB', 'typeB', 1, 0));
    });

    test('Two few params, 1', function() {
      validateHierarchy({
        'typeA': {
          'fulfills': ['typeB[A]'],
          'params': [
            {
              'name': 'A',
              'variance': 'co',
            },
          ],
        },
        'typeB': {
          'params': [
            {
              'name': 'T',
              'variance': 'co',
            },
            {
              'name': 'U',
              'variance': 'co',
            },
          ],
        },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(errorMsg,
          'typeA', 'typeB[A]', 'typeB', 2, 1));
    });

    test('Nested too few params', function() {
      validateHierarchy({
        'typeA': {
          'fulfills': ['typeB[typeC, typeB[A]]'],
          'params': [
            {
              'name': 'A',
              'variance': 'co',
            },
          ],
        },
        'typeB': {
          'params': [
            {
              'name': 'T',
              'variance': 'co',
            },
            {
              'name': 'U',
              'variance': 'co',
            },
          ],
        },
        'typeC': { },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(errorMsg,
          'typeA', 'typeB[typeC, typeB[A]]', 'typeB', 2, 1));
    });

    test('Generic param with params', function() {
      validateHierarchy({
        'typeA': {
          'fulfills': ['typeB[A[typeC]]'],
          'params': [
            {
              'name': 'A',
              'variance': 'co',
            },
          ],
        },
        'typeB': {
          'params': [
            {
              'name': 'T',
              'variance': 'co',
            },
          ],
        },
        'typeC': { },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(genericErrorMsg,
          'typeA', 'typeB[A[typeC]]', 'A'));
    });
  });

  suite('Super param variances correct', function() {
    setup(function() {
      this.assertInvalid = function(hierarchy, ...includes) {
        validateHierarchy(hierarchy);
        chai.assert.isTrue(this.errorStub.calledOnce);
        const arg = this.errorStub.getCall(0).args[0];
        for (const str of includes) {
          chai.assert.isTrue(arg.includes(str));
        }
      };
      this.assertValid = function(hierarchy) {
        validateHierarchy(hierarchy);
        chai.assert.isTrue(this.errorStub.notCalled);
      };
    });

    test('Bad variance', function() {

    });

    test('Co and co', function() {
      this.assertValid({
        'typeA': {
          'fulfills': ['typeB[A]'],
          'params': [
            {
              'name': 'A',
              'variance': 'co',
            },
          ],
        },
        'typeB': {
          'params': [
            {
              'name': 'B',
              'variance': 'co',
            },
          ],
        },
      });
    });

    test('Co and contra', function() {
      this.assertInvalid({
        'typeA': {
          'fulfills': ['typeB[A]'],
          'params': [
            {
              'name': 'A',
              'variance': 'contra',
            },
          ],
        },
        'typeB': {
          'params': [
            {
              'name': 'B',
              'variance': 'co',
            },
          ],
        },
      }, 'covariant', 'contravariant');
    });

    test('Co and inv', function() {
      this.assertValid({
        'typeA': {
          'fulfills': ['typeB[A]'],
          'params': [
            {
              'name': 'A',
              'variance': 'inv',
            },
          ],
        },
        'typeB': {
          'params': [
            {
              'name': 'B',
              'variance': 'co',
            },
          ],
        },
      });
    });

    test('Contra and co', function() {
      this.assertInvalid({
        'typeA': {
          'fulfills': ['typeB[A]'],
          'params': [
            {
              'name': 'A',
              'variance': 'co',
            },
          ],
        },
        'typeB': {
          'params': [
            {
              'name': 'B',
              'variance': 'contra',
            },
          ],
        },
      }, 'contravariant', 'covariant');
    });

    test('Contra and contra', function() {
      this.assertValid({
        'typeA': {
          'fulfills': ['typeB[A]'],
          'params': [
            {
              'name': 'A',
              'variance': 'contra',
            },
          ],
        },
        'typeB': {
          'params': [
            {
              'name': 'B',
              'variance': 'contra',
            },
          ],
        },
      });
    });

    test('Contra and inv', function() {
      this.assertValid({
        'typeA': {
          'fulfills': ['typeB[A]'],
          'params': [
            {
              'name': 'A',
              'variance': 'inv',
            },
          ],
        },
        'typeB': {
          'params': [
            {
              'name': 'B',
              'variance': 'contra',
            },
          ],
        },
      });
    });

    test('Inv and co', function() {
      this.assertInvalid({
        'typeA': {
          'fulfills': ['typeB[A]'],
          'params': [
            {
              'name': 'A',
              'variance': 'co',
            },
          ],
        },
        'typeB': {
          'params': [
            {
              'name': 'B',
              'variance': 'inv',
            },
          ],
        },
      }, 'invariant', 'covariant');
    });

    test('Inv and contra', function() {
      this.assertInvalid({
        'typeA': {
          'fulfills': ['typeB[A]'],
          'params': [
            {
              'name': 'A',
              'variance': 'contra',
            },
          ],
        },
        'typeB': {
          'params': [
            {
              'name': 'B',
              'variance': 'inv',
            },
          ],
        },
      }, 'invariant', 'contravariant');
    });

    test('Inv and inv', function() {
      this.assertValid({
        'typeA': {
          'fulfills': ['typeB[A]'],
          'params': [
            {
              'name': 'A',
              'variance': 'inv',
            },
          ],
        },
        'typeB': {
          'params': [
            {
              'name': 'B',
              'variance': 'inv',
            },
          ],
        },
      });
    });

    test('Nested bad variance', function() {
      this.assertInvalid({
        'typeA': {
          'fulfills': ['typeB[typeB[A]]'],
          'params': [
            {
              'name': 'A',
              'variance': 'co',
            },
          ],
        },
        'typeB': {
          'params': [
            {
              'name': 'B',
              'variance': 'inv',
            },
          ],
        },
      }, 'invariant', 'covariant');
    });
  });

  suite('Variances', function() {
    test('Valid', function() {
      validateHierarchy({
        'typeA': {
          'params': [
            {
              'name': 'A',
              'variance': 'co',
            },
            {
              'name': 'B',
              'variance': 'contra',
            },
            {
              'name': 'C',
              'variance': 'inv',
            },
          ],
        },
      });
      chai.assert.isTrue(this.errorStub.notCalled);
    });

    test('Valid, case', function() {
      validateHierarchy({
        'typeA': {
          'params': [
            {
              'name': 'A',
              'variance': 'CO',
            },
            {
              'name': 'B',
              'variance': 'CONTRA',
            },
            {
              'name': 'C',
              'variance': 'INV',
            },
          ],
        },
      });
      chai.assert.isTrue(this.errorStub.notCalled);
    });

    test('Valid, extra', function() {
      validateHierarchy({
        'typeA': {
          'params': [
            {
              'name': 'A',
              'variance': 'covariant',
            },
            {
              'name': 'B',
              'variance': 'contravariant',
            },
            {
              'name': 'C',
              'variance': 'invariant',
            },
          ],
        },
      });
      chai.assert.isTrue(this.errorStub.notCalled);
    });

    test('Not provided', function() {
      const noVarianceMsg = 'The parameter %s of %s does not declare a ' +
          'variance, which is required.';
      validateHierarchy({
        'typeA': {
          'params': [
            {
              'name': 'A',
            },
          ],
        },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(
          this.errorStub.calledWith(noVarianceMsg, 'A', 'typeA'));
    });

    test('Invalid', function() {
      const errorMsg = 'The parameter %s of %s threw the following error: %s';
      validateHierarchy({
        'typeA': {
          'params': [
            {
              'name': 'A',
              'variance': 'test',
            },
          ],
        },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(
          this.errorStub.calledWith(errorMsg, 'A', 'typeA'));
    });
  });

  suite('Param names', function() {
    test('Not provided', function() {
      const noNameMsg = 'Parameter #%s of %s does not declare a name, which ' +
          'is required.';
      validateHierarchy({
        'typeA': {
          'params': [
            {
              'variance': 'co',
            },
          ],
        },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(noNameMsg, 1, 'typeA'));
    });

    test('Invalid', function() {
      const errorMsg = 'The parameter name %s of %s is invalid. Parameter ' +
          'names must be a single character.';
      validateHierarchy({
        'typeA': {
          'params': [
            {
              'name': 'test',
              'variance': 'co',
            },
          ],
        },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(errorMsg, 'test', 'typeA'));
    });
  });

  suite('Conflicting param names', function() {
    const conflictMsg = 'The param name %s in %s conflicts with the ' +
        'param(s) [%s]';
    test('Param conflicts once', function() {
      this.errorStub.callsFake((...params) => console.log(params));
      validateHierarchy({
        'typeA': {
          'params': [
            {
              'name': 'A',
              'variance': 'co',
            },
            {
              'name': 'a',
              'variance': 'co',
            },
          ],
        },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(
          this.errorStub.calledWith(conflictMsg, 'A', 'typeA', '#2 (a)'));
    });

    test('Param conflicts multiple', function() {
      validateHierarchy({
        'typeA': {
          'params': [
            {
              'name': 'A',
              'variance': 'co',
            },
            {
              'name': 'a',
              'variance': 'co',
            },
            {
              'name': 'A',
              'variance': 'co',
            },
          ],
        },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(
          conflictMsg, 'A', 'typeA', '#2 (a), #3 (A)'));
    });
  });

  suite('Fulfills is array', function() {
    const error = 'The type %s provides a `fulfills` property, but it is not ' +
        'an array';

    test('Array', function() {
      validateHierarchy({
        'typeA': {
          'fulfills': ['typeB'],
        },
        'typeB': { },
      });
      chai.assert.isTrue(this.errorStub.notCalled);
    });

    test('Object', function() {
      validateHierarchy({
        'typeA': {
          'fulfills': { },
        },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(error, 'typeA'));
    });

    test('String', function() {
      validateHierarchy({
        'typeA': {
          'fulfills': 'typeB',
        },
        'typeB': { },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(error, 'typeA'));
    });

    test('Number', function() {
      validateHierarchy({
        'typeA': {
          'fulfills': 1,
        },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(error, 'typeA'));
    });
  });

  suite('Params is array', function() {
    const error = 'The type %s provides a `params` property, but it is not an' +
        ' array';

    test('Array', function() {
      validateHierarchy({
        'typeA': {
          'params': [
            {
              'name': 'A',
              'variance': 'co',
            },
          ],
        },
      });
      chai.assert.isTrue(this.errorStub.notCalled);
    });

    test('Object', function() {
      validateHierarchy({
        'typeA': {
          'params': {
            'A': 'co',
          },
        },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(error, 'typeA'));
    });

    test('String', function() {
      validateHierarchy({
        'typeA': {
          'params': 'A:co',
        },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(error, 'typeA'));
    });

    test('Number', function() {
      validateHierarchy({
        'typeA': {
          'params': 1,
        },
      });
      chai.assert.isTrue(this.errorStub.calledOnce);
      chai.assert.isTrue(this.errorStub.calledWith(error, 'typeA'));
    });
  });
});
