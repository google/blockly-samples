/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Unit tests for TypeHierarchy.
 */

const chai = require('chai');

const {TypeHierarchy} = require('../src/type_hierarchy');

suite('TypeHierarchy', function() {
  suite('typeExists', function() {
    test('Simple', function() {
      const hierarchy = new TypeHierarchy({
        'typeA': { },
      });
      chai.assert.isTrue(hierarchy.typeExists('typeA'));
    });

    test('Case', function() {
      const hierarchy = new TypeHierarchy({
        'typeA': { },
      });
      chai.assert.isTrue(hierarchy.typeExists('typea'),
          'Expected TypeHierarchy to be case-insensitive.');
    });

    test('Padding', function() {
      const hierarchy = new TypeHierarchy({
        'typeA': { },
      });
      chai.assert.isFalse(hierarchy.typeExists(' typeA '),
          'Expected TypeHierarchy to respect padding.');
    });

    test('Super but not defined', function() {
      const hierarchy = new TypeHierarchy({
        'typeA': {
          'fulfills': ['typeB'],
        },
      });
      chai.assert.isFalse(hierarchy.typeExists('typeB'),
          'Expected only top-level types to exist.');
    });
  });

  suite('typeIsExactlyType', function() {
    test('Simple', function() {
      const hierarchy = new TypeHierarchy({
        'A': { },
      });
      chai.assert.isTrue(hierarchy.typeIsExactlyType('typeA', 'typeA'));
    });

    test('Case', function() {
      const hierarchy = new TypeHierarchy({
        'typeA': { },
      });
      chai.assert.isTrue(hierarchy.typeIsExactlyType('typeA', 'typea'),
          'Expected TypeHierarchy to be case-insensitive.');
      chai.assert.isTrue(hierarchy.typeIsExactlyType('typea', 'typeA'),
          'Expected TypeHierarchy to be case-insensitive.');
    });

    test('Padding', function() {
      const hierarchy = new TypeHierarchy({
        'typeA': { },
      });
      chai.assert.isFalse(hierarchy.typeIsExactlyType('typeA', ' typeA '),
          'Expected TypeHierarchy to respect padding.');
    });

    test('Super', function() {
      const hierarchy = new TypeHierarchy({
        'typeA': {
          'fulfills': ['typeB'],
        },
        'typeB': { },
      });
      chai.assert.isFalse(hierarchy.typeIsExactlyType('typeA', 'typeB'));
    });

    test('Sub', function() {
      const hierarchy = new TypeHierarchy({
        'typeA': { },
        'typeB': {
          'fulfills': ['typeA'],
        },
      });
      chai.assert.isFalse(hierarchy.typeIsExactlyType('typeA', 'typeB'));
    });
  });

  suite('typeFulfillsType', function() {
    test('Empty fulfills', function() {
      const hierarchy = new TypeHierarchy({
        'typeA': {
          'fulfills': [],
        },
      });
      chai.assert.isFalse(hierarchy.typeFulfillsType('typeA', 'typeB'));
    });

    test('Undefined fulfills', function() {
      const hierarchy = new TypeHierarchy({
        'typeA': { },
      });
      chai.assert.isFalse(hierarchy.typeFulfillsType('typeA', 'typeB'));
    });

    test('Super defined first', function() {
      const hierarchy = new TypeHierarchy({
        'typeB': { },
        'typeA': {
          'fulfills': ['typeB'],
        },
      });
      chai.assert.isTrue(hierarchy.typeFulfillsType('typeA', 'typeB'));
    });

    test('Super defined second', function() {
      const hierarchy = new TypeHierarchy({
        'A': {
          'fulfills': ['B'],
        },
        'B': { },
      });
      chai.assert.isTrue(hierarchy.typeFulfillsType('A', 'B'));
    });

    test('Multiple supers', function() {
      const hierarchy = new TypeHierarchy({
        'typeA': {
          'fulfills': ['typeB', 'typeC', 'typeD'],
        },
        'typeB': { },
        'typeC': { },
        'typeD': { },
      });
      chai.assert.isTrue(hierarchy.typeFulfillsType('typeA', 'typeB'));
      chai.assert.isTrue(hierarchy.typeFulfillsType('typeA', 'typeC'));
      chai.assert.isTrue(hierarchy.typeFulfillsType('typeA', 'typeD'));
    });

    test('Deep super', function() {
      const hierarchy = new TypeHierarchy({
        'typeA': {
          'fulfills': ['typeB'],
        },
        'typeB': {
          'fulfills': ['typeC'],
        },
        'typeC': {
          'fulfills': ['typeD'],
        },
        'typeD': { },
      });
      chai.assert.isTrue(hierarchy.typeFulfillsType('typeA', 'typeB'));
      chai.assert.isTrue(hierarchy.typeFulfillsType('typeA', 'typeC'));
      chai.assert.isTrue(hierarchy.typeFulfillsType('typeA', 'typeD'));
    });

    test('Case', function() {
      const hierarchy = new TypeHierarchy({
        'typeA': {
          'fulfills': ['typeB'],
        },
        'typeb': { },
      });
      chai.assert.isTrue(hierarchy.typeFulfillsType('typeA', 'typeb'));
      chai.assert.isTrue(hierarchy.typeFulfillsType('typeA', 'typeB'));
      chai.assert.isTrue(hierarchy.typeFulfillsType('typea', 'typeb'));
      chai.assert.isTrue(hierarchy.typeFulfillsType('typea', 'typeB'));
    });
  });
});
