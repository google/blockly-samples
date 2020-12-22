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
  test('Super not defined', function() {
    chai.assert.throws(
        function() {
          new TypeHierarchy({
            'typeA': {
              'fulfills': ['typeB'],
            },
          });
        },
        'The type typea says it fulfills the type typeb, but that type is not' +
        ' defined');
  });

  // TODO: Move this into typeFulfillsType once checking is added.
  suite('Hierarchy parsing', function() {
    suite('Parameter subtyping', function() {
      setup(function() {
        this.assertParams = function(hierarchy, sub, sup, structure) {
          const type = hierarchy.types_.get(sub);
          const params = type.getParamsForAncestor(sup);
          chai.assert.deepEqual(structure, params);
        };
      });

      test('Self params', function() {
        const hierarchy = new TypeHierarchy({
          'typeA': {
            'params': [
              {
                'name': 'A',
                'variance': 'co',
              },
            ],
          },
        });
        this.assertParams(hierarchy, 'typea', 'typea', [
          {
            'name': 'a',
            'params': [],
          },
        ]);
      });

      test('No params super', function() {
        const hierarchy = new TypeHierarchy({
          'typeA': { },
          'typeB': {
            'fulfills': ['typeA'],
            'params': [
              {
                'name': 'A',
                'variance': 'co',
              },
            ],
          },
        });
        const type = hierarchy.types_.get('typeb');
        const params = type.getParamsForAncestor('typea');
        chai.assert.isArray(params);
        chai.assert.isEmpty(params);
      });

      test('Single param', function() {
        const hierarchy = new TypeHierarchy({
          'typeA': {
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
        this.assertParams(hierarchy, 'typeb', 'typea', [
          {
            'name': 'b',
            'params': [],
          },
        ]);
      });

      test('Swapped params', function() {
        const hierarchy = new TypeHierarchy({
          'typeA': {
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
            'fulfills': ['typeA[D, C]'],
            'params': [
              {
                'name': 'C',
                'variance': 'co',
              },
              {
                'name': 'D',
                'variance': 'co',
              },
            ],
          },
        });
        this.assertParams(hierarchy, 'typeb', 'typea', [
          {
            'name': 'd',
            'params': [],
          },
          {
            'name': 'c',
            'params': [],
          },
        ]);
      });

      test('Deep subtype', function() {
        const hierarchy = new TypeHierarchy({
          'typeA': {
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
              {
                'name': 'C',
                'variance': 'co',
              },
            ],
          },
          'typeC': {
            'fulfills': ['typeB[E, D]'],
            'params': [
              {
                'name': 'D',
                'variance': 'co',
              },
              {
                'name': 'E',
                'variance': 'co',
              },
            ],
          },
        });
        this.assertParams(hierarchy, 'typec', 'typea', [
          {
            'name': 'e',
            'params': [],
          },
        ]);
      });

      test('Explicit params', function() {
        const hierarchy = new TypeHierarchy({
          'typeA': {
            'params': [
              {
                'name': 'A',
                'variance': 'co',
              },
            ],
          },
          'typeB': { },
          'typeC': {
            'fulfills': ['typeA[typeB]'],
          },
        });
        this.assertParams(hierarchy, 'typec', 'typea', [
          {
            'name': 'typeb',
            'params': [],
          },
        ]);
      });

      test('Explicit nested params', function() {
        const hierarchy = new TypeHierarchy({
          'typeA': {
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
          'typeC': {
            'fulfills': ['typeA[typeB[C]]'],
            'params': [
              {
                'name': 'C',
                'variance': 'co',
              },
            ],
          },
        });
        this.assertParams(hierarchy, 'typec', 'typea', [
          {
            'name': 'typeb',
            'params': [
              {
                'name': 'c',
                'params': [],
              },
            ],
          },
        ]);
      });
    });
  });

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

  suite('nearestCommonParents', function() {
    suite('Variable Arguments', function() {
      test('No args', function() {
        const hierarchy = new TypeHierarchy({
          'typeA': {},
        });
        const union = hierarchy.getNearestCommonParents();
        chai.assert.isArray(union);
        chai.assert.isEmpty(union);
      });

      test('One arg', function() {
        const hierarchy = new TypeHierarchy({
          'typeA': {},
        });
        const union = hierarchy.getNearestCommonParents('typeA');
        chai.assert.deepEqual(union, ['typea']);
      });
    });

    suite('Simple tree unions', function() {
      test('Unify self', function() {
        const hierarchy = new TypeHierarchy({
          'typeA': {},
        });
        const union = hierarchy.getNearestCommonParents('typeA', 'typeA');
        chai.assert.deepEqual(union, ['typea']);
      });

      test('Unify parent', function() {
        const hierarchy = new TypeHierarchy({
          'typeA': {},
          'typeB': {
            'fulfills': ['typeA'],
          },
        });
        const union = hierarchy.getNearestCommonParents('typeB', 'typeA');
        chai.assert.deepEqual(union, ['typea']);
      });

      test('Unify parsib', function() {
        const hierarchy = new TypeHierarchy({
          'typeA': {},
          'typeB': {
            'fulfills': ['typeA'],
          },
          'typeC': {
            'fulfills': ['typeA'],
          },
          'typeD': {
            'fulfills': ['typeB'],
          },
        });
        const union = hierarchy.getNearestCommonParents('typeD', 'typeC');
        chai.assert.deepEqual(union, ['typea']);
      });

      test('Unify grandparent', function() {
        const hierarchy = new TypeHierarchy({
          'typeA': {},
          'typeB': {
            'fulfills': ['typeA'],
          },
          'typeC': {
            'fulfills': ['typeB'],
          },
        });
        const union = hierarchy.getNearestCommonParents('typeC', 'typeA');
        chai.assert.deepEqual(union, ['typea']);
      });

      test('Unify grandparsib', function() {
        const hierarchy = new TypeHierarchy({
          'typeA': {},
          'typeB': {
            'fulfills': ['typeA'],
          },
          'typeC': {
            'fulfills': ['typeA'],
          },
          'typeD': {
            'fulfills': ['typeB'],
          },
          'typeE': {
            'fulfills': ['typeD'],
          },
        });
        const union = hierarchy.getNearestCommonParents('typeE', 'typeC');
        chai.assert.deepEqual(union, ['typea']);
      });

      test('Unify sibling', function() {
        const hierarchy = new TypeHierarchy({
          'typeA': {},
          'typeB': {
            'fulfills': ['typeA'],
          },
          'typeC': {
            'fulfills': ['typeA'],
          },
        });
        const union = hierarchy.getNearestCommonParents('typeB', 'typeC');
        chai.assert.deepEqual(union, ['typea']);
      });

      test('Unify cousin', function() {
        const hierarchy = new TypeHierarchy({
          'typeA': {},
          'typeB': {
            'fulfills': ['typeA'],
          },
          'typeC': {
            'fulfills': ['typeA'],
          },
          'typeD': {
            'fulfills': ['typeB'],
          },
          'typeE': {
            'fulfills': ['typeC'],
          },
        });
        const union = hierarchy.getNearestCommonParents('typeD', 'typeE');
        chai.assert.deepEqual(union, ['typea']);
      });

      test('Unify second cousin', function() {
        const hierarchy = new TypeHierarchy({
          'typeA': {},
          'typeB': {
            'fulfills': ['typeA'],
          },
          'typeC': {
            'fulfills': ['typeA'],
          },
          'typeD': {
            'fulfills': ['typeB'],
          },
          'typeE': {
            'fulfills': ['typeC'],
          },
          'typeF': {
            'fulfills': ['typeD'],
          },
          'typeG': {
            'fulfills': ['typeE'],
          },
        });
        const union = hierarchy.getNearestCommonParents('typeF', 'typeG');
        chai.assert.deepEqual(union, ['typea']);
      });

      test('Unify first cousin once removed', function() {
        const hierarchy = new TypeHierarchy({
          'typeA': {},
          'typeB': {
            'fulfills': ['typeA'],
          },
          'typeC': {
            'fulfills': ['typeA'],
          },
          'typeD': {
            'fulfills': ['typeB'],
          },
          'typeE': {
            'fulfills': ['typeC'],
          },
          'typeF': {
            'fulfills': ['typeD'],
          },
          'typeG': {
            'fulfills': ['typeE'],
          },
        });
        const union = hierarchy.getNearestCommonParents('typeD', 'typeG');
        chai.assert.deepEqual(union, ['typea']);
      });

      test('Unify child', function() {
        const hierarchy = new TypeHierarchy({
          'typeA': {},
          'typeB': {
            'fulfills': ['typeA'],
          },
        });
        const union = hierarchy.getNearestCommonParents('typeA', 'typeB');
        chai.assert.deepEqual(union, ['typea']);
      });

      test('Unify nibling', function() {
        const hierarchy = new TypeHierarchy({
          'typeA': {},
          'typeB': {
            'fulfills': ['typeA'],
          },
          'typeC': {
            'fulfills': ['typeA'],
          },
          'typeD': {
            'fulfills': ['typeB'],
          },
        });
        const union = hierarchy.getNearestCommonParents('typeC', 'typeD');
        chai.assert.deepEqual(union, ['typea']);
      });

      test('Unify grandnibling', function() {
        const hierarchy = new TypeHierarchy({
          'typeA': {},
          'typeB': {
            'fulfills': ['typeA'],
          },
          'typeC': {
            'fulfills': ['typeA'],
          },
          'typeD': {
            'fulfills': ['typeB'],
          },
          'typeE': {
            'fulfills': ['typeD'],
          },
        });
        const union = hierarchy.getNearestCommonParents('typeC', 'typeE');
        chai.assert.deepEqual(union, ['typea']);
      });

      test('Unify unrelated', function() {
        const hierarchy = new TypeHierarchy({
          'typeA': {},
          'typeB': {},
        });
        const union = hierarchy.getNearestCommonParents('typeA', 'typeB');
        chai.assert.isArray(union);
        chai.assert.isEmpty(union);
      });
    });

    /* All of these tests use the following graph. Children are below their
     * parents, except in the case of W and V. In that case there is an arrow
     * to indicate that V is a child of W.
     *
     *  .------U----.
     *  |       \   |
     *  |  W---->V  |
     *  |  |\    |  |
     *  |  | \   |  |
     *  \  |  Z  |  Q
     *   \ | / \ | /
     *    \|/   \|/
     *     X     Y
     */
    suite('Harder graph unions', function() {
      const hierarchy = new TypeHierarchy({
        'typeU': {},
        'typeW': {},
        'typeQ': {
          'fulfills': ['typeU'],
        },
        'typeV': {
          'fulfills': ['typeU', 'typeW'],
        },
        'typeZ': {
          'fulfills': ['typeW'],
        },
        'typeX': {
          'fulfills': ['typeU', 'typeW', 'typeZ'],
        },
        'typeY': {
          'fulfills': ['typeZ', 'typeV', 'typeQ'],
        },
      });

      test('X and Y', function() {
        const union = hierarchy.getNearestCommonParents('typeX', 'typeY');
        chai.assert.deepEqual(union, ['typez', 'typeu']);
      });

      test('X, Y and Z', function() {
        const union = hierarchy.getNearestCommonParents(
            'typeX', 'typeY', 'typeZ');
        chai.assert.deepEqual(union, ['typez']);
      });

      test('X, Y and W', function() {
        const union = hierarchy.getNearestCommonParents(
            'typeX', 'typeY', 'typeW');
        chai.assert.deepEqual(union, ['typew']);
      });

      test('X, Y and V', function() {
        const union = hierarchy.getNearestCommonParents(
            'typeX', 'typeY', 'typeV');
        chai.assert.deepEqual(union, ['typew', 'typeu']);
      });

      test('U and W', function() {
        const union = hierarchy.getNearestCommonParents('typeU', 'typeW');
        chai.assert.isArray(union);
        chai.assert.isEmpty(union);
      });
    });

    suite('Multiparent unions', function() {
      suite('Two parents, two children', function() {
        const hierarchy = new TypeHierarchy({
          'typeA': {},
          'typeB': {},
          'typeC': {
            'fulfills': ['typeA', 'typeB'],
          },
          'typeD': {
            'fulfills': ['typeA', 'typeB'],
          },
        });

        test('C and D', function() {
          const union = hierarchy.getNearestCommonParents('typeC', 'typeD');
          chai.assert.deepEqual(union, ['typea', 'typeb']);
        });

        test('C, D and A', function() {
          const union = hierarchy.getNearestCommonParents(
              'typeC', 'typeD', 'typeA');
          chai.assert.deepEqual(union, ['typea']);
        });

        test('A and B', function() {
          const union = hierarchy.getNearestCommonParents('typeA', 'typeB');
          chai.assert.isArray(union);
          chai.assert.isEmpty(union);
        });
      });

      suite('Three parents, three children', function() {
        const hierarchy = new TypeHierarchy({
          'typeA': {},
          'typeB': {},
          'typeC': {},
          'typeD': {
            'fulfills': ['typeA', 'typeB'],
          },
          'typeE': {
            'fulfills': ['typeA', 'typeB', 'typeC'],
          },
          'typeF': {
            'fulfills': ['typeB', 'typeC'],
          },
        });

        test('D and E', function() {
          const union = hierarchy.getNearestCommonParents('typeD', 'typeE');
          chai.assert.deepEqual(union, ['typea', 'typeb']);
        });

        test('E and F', function() {
          const union = hierarchy.getNearestCommonParents('typeE', 'typeF');
          chai.assert.deepEqual(union, ['typeb', 'typec']);
        });

        test('D and F', function() {
          const union = hierarchy.getNearestCommonParents('typeD', 'typeF');
          chai.assert.deepEqual(union, ['typeb']);
        });

        test('D, E and F', function() {
          const union = hierarchy.getNearestCommonParents(
              'typeD', 'typeE', 'typeF');
          chai.assert.deepEqual(union, ['typeb']);
        });

        test('D, E and A', function() {
          const union = hierarchy.getNearestCommonParents(
              'typeD', 'typeE', 'typeA');
          chai.assert.deepEqual(union, ['typea']);
        });

        test('D, E, F and B', function() {
          const union = hierarchy.getNearestCommonParents(
              'typeD', 'typeE', 'typeF', 'typeB');
          chai.assert.deepEqual(union, ['typeb']);
        });

        test('D, E and C', function() {
          const union = hierarchy.getNearestCommonParents(
              'typeD', 'typeE', 'typeC');
          chai.assert.isArray(union);
          chai.assert.isEmpty(union);
        });
      });

      suite('Two layers', function() {
        const hierarchy = new TypeHierarchy({
          'typeA': {},
          'typeB': {},
          'typeC': {},
          'typeD': {
            'fulfills': ['typeA', 'typeB'],
          },
          'typeE': {
            'fulfills': ['typeA', 'typeB', 'typeC'],
          },
          'typeF': {
            'fulfills': ['typeB', 'typeC'],
          },
          'typeG': {
            'fulfills': ['typeD', 'typeE'],
          },
          'typeH': {
            'fulfills': ['typeD', 'typeE'],
          },
        });

        test('G and H', function() {
          const union = hierarchy.getNearestCommonParents('typeG', 'typeH');
          chai.assert.deepEqual(union, ['typed', 'typee']);
        });

        test('G, H and F', function() {
          const union = hierarchy.getNearestCommonParents(
              'typeG', 'typeH', 'typeF');
          chai.assert.deepEqual(union, ['typeb', 'typec']);
        });
      });

      suite('Three layers', function() {
        const hierarchy = new TypeHierarchy({
          'typeA': {},
          'typeB': {},
          'typeC': {},
          'typeD': {},
          'typeE': {
            'fulfills': ['typeA', 'typeB'],
          },
          'typeF': {
            'fulfills': ['typeA', 'typeB', 'typeC'],
          },
          'typeG': {
            'fulfills': ['typeB', 'typeC', 'typeD'],
          },
          'typeH': {
            'fulfills': ['typeC', 'typeD'],
          },
          'typeI': {
            'fulfills': ['typeE', 'typeF'],
          },
          'typeJ': {
            'fulfills': ['typeE', 'typeF', 'typeG'],
          },
          'typeK': {
            'fulfills': ['typeF', 'typeG'],
          },
          'typeL': {
            'fulfills': ['typeI', 'typeJ'],
          },
          'typeM': {
            'fulfills': ['typeI', 'typeJ'],
          },
        });

        test('L and M', function() {
          const union = hierarchy.getNearestCommonParents('typeL', 'typeM');
          chai.assert.deepEqual(union, ['typei', 'typej']);
        });

        test('L, M and K', function() {
          const union = hierarchy.getNearestCommonParents(
              'typeL', 'typeM', 'typeK');
          chai.assert.deepEqual(union, ['typef', 'typeg']);
        });

        test('L, M, K and H', function() {
          const union = hierarchy.getNearestCommonParents(
              'typeL', 'typeM', 'typeK', 'typeH');
          chai.assert.deepEqual(union, ['typec', 'typed']);
        });
      });
    });
  });

  suite('getTypeStructure', function() {
    setup(function() {
      const hierarchy = new TypeHierarchy({
        'typeA': { },
      });

      this.assertStructure = function(str, struct) {
        chai.assert.deepEqual(hierarchy.parseType_(str), struct);
      };
    });

    test('Just type', function() {
      this.assertStructure(
          'typeA',
          {
            name: 'typea',
            params: [],
          });
    });

    test('Single param', function() {
      this.assertStructure(
          'typeA[typeA]',
          {
            name: 'typea',
            params: [
              {
                name: 'typea',
                params: [],
              },
            ],
          });
    });

    test('Multiple params, commas and spaces', function() {
      this.assertStructure(
          'typeA[typeA, typeA]',
          {
            name: 'typea',
            params: [
              {
                name: 'typea',
                params: [],
              },
              {
                name: 'typea',
                params: [],
              },
            ],
          });
    });

    test('Multiple params, commas', function() {
      this.assertStructure(
          'typeA[typeA,typeA]',
          {
            name: 'typea',
            params: [
              {
                name: 'typea',
                params: [],
              },
              {
                name: 'typea',
                params: [],
              },
            ],
          });
    });

    test('Multiple params, spaces', function() {
      this.assertStructure(
          'typeA[typeA typeA]',
          {
            name: 'typea',
            params: [
              {
                name: 'typea',
                params: [],
              },
              {
                name: 'typea',
                params: [],
              },
            ],
          });
    });

    test('Nested params', function() {
      this.assertStructure(
          'typeA[typeA[typeA]]',
          {
            name: 'typea',
            params: [
              {
                name: 'typea',
                params: [
                  {
                    name: 'typea',
                    params: [],
                  },
                ],
              },
            ],
          });
    });

    test('Nested params with following, comma and space', function() {
      this.assertStructure(
          'typeA[typeA[typeA], typeA]',
          {
            name: 'typea',
            params: [
              {
                name: 'typea',
                params: [
                  {
                    name: 'typea',
                    params: [],
                  },
                ],
              },
              {
                name: 'typea',
                params: [],
              },
            ],
          });
    });

    test('Nested params with following, comma', function() {
      this.assertStructure(
          'typeA[typeA[typeA],typeA]',
          {
            name: 'typea',
            params: [
              {
                name: 'typea',
                params: [
                  {
                    name: 'typea',
                    params: [],
                  },
                ],
              },
              {
                name: 'typea',
                params: [],
              },
            ],
          });
    });

    test('Nested params with following, space', function() {
      this.assertStructure(
          'typeA[typeA[typeA] typeA]',
          {
            name: 'typea',
            params: [
              {
                name: 'typea',
                params: [
                  {
                    name: 'typea',
                    params: [],
                  },
                ],
              },
              {
                name: 'typea',
                params: [],
              },
            ],
          });
    });

    test('Nested params with following, nothing', function() {
      this.assertStructure(
          'typeA[typeA[typeA]typeA]',
          {
            name: 'typea',
            params: [
              {
                name: 'typea',
                params: [
                  {
                    name: 'typea',
                    params: [],
                  },
                ],
              },
              {
                name: 'typea',
                params: [],
              },
            ],
          });
    });

    test('Deep nesting', function() {
      this.assertStructure(
          'typeA[typeA[typeA[typeA[typeA]]]]',
          {
            name: 'typea',
            params: [
              {
                name: 'typea',
                params: [
                  {
                    name: 'typea',
                    params: [
                      {
                        name: 'typea',
                        params: [
                          {
                            name: 'typea',
                            params: [],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          });
    });

    test('Generic param', function() {
      this.assertStructure(
          'typeA[B]',
          {
            name: 'typea',
            params: [
              {
                name: 'b',
                params: [],
              },
            ],
          },
      );

      test('Nested generic param', function() {
        this.assertStructure(
            'typeA[typeA[B]]',
            {
              name: 'typea',
              params: [
                {
                  name: 'typea',
                  params: [
                    {
                      name: 'b',
                      params: [],
                    },
                  ],
                },
              ],
            },
        );
      });
    });
  });
});
