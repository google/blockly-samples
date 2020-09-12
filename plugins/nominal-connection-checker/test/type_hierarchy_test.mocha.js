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
        'A': { },
      });
      chai.assert.isTrue(hierarchy.typeExists('A'));
    });

    test('Case', function() {
      const hierarchy = new TypeHierarchy({
        'A': { },
      });
      chai.assert.isFalse(hierarchy.typeExists('a'),
          'Expected TypeHierarchy to be case-sensitive.');
    });

    test('Padding', function() {
      const hierarchy = new TypeHierarchy({
        'A': { },
      });
      chai.assert.isFalse(hierarchy.typeExists(' A '),
          'Expected TypeHierarchy to respect padding.');
    });

    test('Super but not defined', function() {
      const hierarchy = new TypeHierarchy({
        'A': {
          'fulfills': ['B'],
        },
      });
      chai.assert.isFalse(hierarchy.typeExists('B'),
          'Expected only top-level types to exist.');
    });
  });

  suite('typeIsExactlyType', function() {
    test('Simple', function() {
      const hierarchy = new TypeHierarchy({
        'A': { },
      });
      chai.assert.isTrue(hierarchy.typeIsExactlyType('A', 'A'));
    });

    test('Case', function() {
      const hierarchy = new TypeHierarchy({
        'A': { },
      });
      chai.assert.isFalse(hierarchy.typeIsExactlyType('A', 'a'),
          'Expected TypeHierarchy to be case-sensitive.');
    });

    test('Padding', function() {
      const hierarchy = new TypeHierarchy({
        'A': { },
      });
      chai.assert.isFalse(hierarchy.typeIsExactlyType('A', ' A '),
          'Expected TypeHierarchy to respect padding.');
    });

    test('Super', function() {
      const hierarchy = new TypeHierarchy({
        'A': {
          'fulfills': ['B'],
        },
        'B': { },
      });
      chai.assert.isFalse(hierarchy.typeIsExactlyType('A', 'B'));
    });

    test('Sub', function() {
      const hierarchy = new TypeHierarchy({
        'A': { },
        'B': {
          'fulfills': ['A'],
        },
      });
      chai.assert.isFalse(hierarchy.typeIsExactlyType('A', 'B'));
    });
  });

  suite('typeIsSuperOfType', function() {
    test('Empty fulfills', function() {
      const hierarchy = new TypeHierarchy({
        'A': {
          'fulfills': [],
        },
      });
      chai.assert.isFalse(hierarchy.typeIsSuperOfType('B', 'A'));
    });

    test('Undefined fulfills', function() {
      const hierarchy = new TypeHierarchy({
        'A': { },
      });
      chai.assert.isFalse(hierarchy.typeIsSuperOfType('B', 'A'));
    });

    test('Super defined first', function() {
      const hierarchy = new TypeHierarchy({
        'B': { },
        'A': {
          'fulfills': ['B'],
        },
      });
      chai.assert.isTrue(hierarchy.typeIsSuperOfType('B', 'A'));
    });

    test('Super defined second', function() {
      const hierarchy = new TypeHierarchy({
        'A': {
          'fulfills': ['B'],
        },
        'B': { },
      });
      chai.assert.isTrue(hierarchy.typeIsSuperOfType('B', 'A'));
    });

    test('Super not defined', function() {
      const hierarchy = new TypeHierarchy({
        'A': {
          'fulfills': ['B'],
        },
      });
      chai.assert.isTrue(hierarchy.typeIsSuperOfType('B', 'A'));
    });

    test('Multiple supers', function() {
      const hierarchy = new TypeHierarchy({
        'A': {
          'fulfills': ['B', 'C', 'D'],
        },
      });
      chai.assert.isTrue(hierarchy.typeIsSuperOfType('B', 'A'));
      chai.assert.isTrue(hierarchy.typeIsSuperOfType('C', 'A'));
      chai.assert.isTrue(hierarchy.typeIsSuperOfType('D', 'A'));
    });

    test('Deep super', function() {
      const hierarchy = new TypeHierarchy({
        'A': {
          'fulfills': ['B'],
        },
        'B': {
          'fulfills': ['C'],
        },
        'C': {
          'fulfills': ['D'],
        },
        'D': { },
      });
      chai.assert.isTrue(hierarchy.typeIsSuperOfType('B', 'A'));
      chai.assert.isTrue(hierarchy.typeIsSuperOfType('C', 'A'));
      chai.assert.isTrue(hierarchy.typeIsSuperOfType('D', 'A'));
    });
  });

  suite('typeIsSubOfType', function() {
    test('Empty fulfills', function() {
      const hierarchy = new TypeHierarchy({
        'A': {
          'fulfills': [],
        },
      });
      chai.assert.isFalse(hierarchy.typeIsSubOfType('A', 'B'));
    });

    test('Undefined fulfills', function() {
      const hierarchy = new TypeHierarchy({
        'A': { },
      });
      chai.assert.isFalse(hierarchy.typeIsSubOfType('A', 'B'));
    });

    test('Super defined first', function() {
      const hierarchy = new TypeHierarchy({
        'B': { },
        'A': {
          'fulfills': ['B'],
        },
      });
      chai.assert.isTrue(hierarchy.typeIsSubOfType('A', 'B'));
    });

    test('Super defined second', function() {
      const hierarchy = new TypeHierarchy({
        'A': {
          'fulfills': ['B'],
        },
        'B': { },
      });
      chai.assert.isTrue(hierarchy.typeIsSubOfType('A', 'B'));
    });

    test('Super not defined', function() {
      const hierarchy = new TypeHierarchy({
        'A': {
          'fulfills': ['B'],
        },
      });
      chai.assert.isTrue(hierarchy.typeIsSubOfType('A', 'B'));
    });

    test('Multiple supers', function() {
      const hierarchy = new TypeHierarchy({
        'A': {
          'fulfills': ['B', 'C', 'D'],
        },
      });
      chai.assert.isTrue(hierarchy.typeIsSubOfType('A', 'B'));
      chai.assert.isTrue(hierarchy.typeIsSubOfType('A', 'C'));
      chai.assert.isTrue(hierarchy.typeIsSubOfType('A', 'D'));
    });

    test('Deep super', function() {
      const hierarchy = new TypeHierarchy({
        'A': {
          'fulfills': ['B'],
        },
        'B': {
          'fulfills': ['C'],
        },
        'C': {
          'fulfills': ['D'],
        },
        'D': { },
      });
      chai.assert.isTrue(hierarchy.typeIsSubOfType('A', 'B'));
      chai.assert.isTrue(hierarchy.typeIsSubOfType('A', 'C'));
      chai.assert.isTrue(hierarchy.typeIsSubOfType('A', 'D'));
    });
  });
});
