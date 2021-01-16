/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Unit tests for TypeHierarchy.
 */

const chai = require('chai');

const {TypeHierarchy, ActualParamsCountError} =
    require('../src/type_hierarchy');
const {parseType} = require('../src/type_structure');

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
  suite('getParamsForAncestor', function() {
    suite('No substitution', function() {
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

    suite('With substitution', function() {
      setup(function() {
        this.assertParams = function(hierarchy, sub, sup, explicit, structure) {
          const type = hierarchy.types_.get(sub);
          const params = type.getParamsForAncestor(sup, explicit);
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
        this.assertParams(hierarchy, 'typea', 'typea',
            [
              {
                'name': 'typea',
                'params': [],
              },
            ],
            [
              {
                'name': 'typea',
                'params': [],
              },
            ]);
      });

      test('Self params with generic', function() {
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
        this.assertParams(hierarchy, 'typea', 'typea',
            [
              {
                'name': 'a',
                'params': [],
              },
            ],
            [
              {
                'name': 'a',
                'params': [],
              },
            ]);
      });

      test('Self params with nested generic', function() {
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
        this.assertParams(hierarchy, 'typea', 'typea',
            [
              {
                'name': 'typea',
                'params': [
                  {
                    'name': 'a',
                    'params': [],
                  },
                ],
              },
            ],
            [
              {
                'name': 'typea',
                'params': [
                  {
                    'name': 'a',
                    'params': [],
                  },
                ],
              },
            ]);
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
        this.assertParams(hierarchy, 'typeb', 'typea',
            [
              {
                'name': 'typeb',
                'params': [],
              },
            ],
            [
              {
                'name': 'typeb',
                'params': [],
              },
            ]);
      });

      test('Single param with generic', function() {
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
        this.assertParams(hierarchy, 'typeb', 'typea',
            [
              {
                'name': 'b',
                'params': [],
              },
            ],
            [
              {
                'name': 'b',
                'params': [],
              },
            ]);
      });

      test('Single param with nested generic', function() {
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
        this.assertParams(hierarchy, 'typeb', 'typea',
            [
              {
                'name': 'typeb',
                'params': [
                  {
                    'name': 'a',
                    'params': [],
                  },
                ],
              },
            ],
            [
              {
                'name': 'typeb',
                'params': [
                  {
                    'name': 'a',
                    'params': [],
                  },
                ],
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
        this.assertParams(hierarchy, 'typeb', 'typea',
            [
              {
                'name': 'typea',
                'params': [],
              },
              {
                'name': 'typeb',
                'params': [],
              },
            ],
            [
              {
                'name': 'typeb',
                'params': [],
              },
              {
                'name': 'typea',
                'params': [],
              },
            ]);
      });

      test('Swapped params with generic', function() {
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
        this.assertParams(hierarchy, 'typeb', 'typea',
            [
              {
                'name': 'a',
                'params': [],
              },
              {
                'name': 'b',
                'params': [],
              },
            ],
            [
              {
                'name': 'b',
                'params': [],
              },
              {
                'name': 'a',
                'params': [],
              },
            ]);
      });

      test('Swapped params with nested generic', function() {
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
        this.assertParams(hierarchy, 'typeb', 'typea',
            [
              {
                'name': 'typea',
                'params': [
                  {
                    'name': 'a',
                    'params': [],
                  },
                ],
              },
              {
                'name': 'typeb',
                'params': [
                  {
                    'name': 'b',
                    'params': [],
                  },
                ],
              },
            ],
            [
              {
                'name': 'typeb',
                'params': [
                  {
                    'name': 'b',
                    'params': [],
                  },
                ],
              },
              {
                'name': 'typea',
                'params': [
                  {
                    'name': 'a',
                    'params': [],
                  },
                ],
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
        this.assertParams(hierarchy, 'typec', 'typea',
            [
              {
                'name': 'typea',
                'params': [],
              },
              {
                'name': 'typeb',
                'params': [],
              },
            ],
            [
              {
                'name': 'typeb',
                'params': [],
              },
            ]);
      });

      test('Deep subtype with generic', function() {
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
        this.assertParams(hierarchy, 'typec', 'typea',
            [
              {
                'name': 'a',
                'params': [],
              },
              {
                'name': 'b',
                'params': [],
              },
            ],
            [
              {
                'name': 'b',
                'params': [],
              },
            ]);
      });

      test('Deep subtype with nested generic', function() {
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
        this.assertParams(hierarchy, 'typec', 'typea',
            [
              {
                'name': 'typea',
                'params': [
                  {
                    'name': 'c',
                    'params': [],
                  },
                ],
              },
              {
                'name': 'typeb',
                'params': [
                  {
                    'name': 'a',
                    'params': [],
                  },
                  {
                    'name': 'b',
                    'params': [],
                  },
                ],
              },
            ],
            [
              {
                'name': 'typeb',
                'params': [
                  {
                    'name': 'a',
                    'params': [],
                  },
                  {
                    'name': 'b',
                    'params': [],
                  },
                ],
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
        this.assertParams(hierarchy, 'typec', 'typea',
            [
              {
                'name': 'typeb',
                'params': [],
              },
            ],
            [
              {
                'name': 'typeb',
                'params': [
                  {
                    'name': 'typeb',
                    'params': [],
                  },
                ],
              },
            ]);
      });

      test('Explicit nested params with generic', function() {
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
        this.assertParams(hierarchy, 'typec', 'typea',
            [
              {
                'name': 'b',
                'params': [],
              },
            ],
            [
              {
                'name': 'typeb',
                'params': [
                  {
                    'name': 'b',
                    'params': [],
                  },
                ],
              },
            ]);
      });

      test('Explicit nested params with nested generic', function() {
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
        this.assertParams(hierarchy, 'typec', 'typea',
            [
              {
                'name': 'typeb',
                'params': [
                  {
                    'name': 'a',
                    'params': [],
                  },
                ],
              },
            ],
            [
              {
                'name': 'typeb',
                'params': [
                  {
                    'name': 'typeb',
                    'params': [
                      {
                        'name': 'a',
                        'params': [],
                      },
                    ],
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
    setup(function() {
      this.assertMatch = function(hierarchy, sub, sup, msg) {
        chai.assert.isTrue(
            hierarchy.typeIsExactlyType(parseType(sub), parseType(sup)), msg);
      };
      this.assertNoMatch = function(hierarchy, sub, sup, msg) {
        chai.assert.isFalse(
            hierarchy.typeIsExactlyType(parseType(sub), parseType(sup)), msg);
      };
    });

    test('Simple', function() {
      const hierarchy = new TypeHierarchy({
        'typeA': { },
      });
      this.assertMatch(hierarchy, 'typeA', 'typeA');
    });

    test('Case', function() {
      const hierarchy = new TypeHierarchy({
        'typeA': { },
      });
      this.assertMatch(hierarchy, 'typeA', 'typea',
          'Expected TypeHierarchy to be case-insensitive.');
      this.assertMatch(hierarchy, 'typea', 'typeA',
          'Expected TypeHierarchy to be case-insensitive.');
    });

    // TODO: Fix and unskip this after we add an error for undefined types.
    test.skip('Padding', function() {
      const hierarchy = new TypeHierarchy({
        'typeA': { },
      });
      this.assertNoMatch(hierarchy, 'typeA', ' typeA ',
          'Expected TypeHierarchy to respect padding.');
    });

    test('Parent and Child', function() {
      const hierarchy = new TypeHierarchy({
        'typeA': {
          'fulfills': ['typeB'],
        },
        'typeB': { },
      });
      this.assertNoMatch(hierarchy, 'typeA', 'typeB');
      this.assertNoMatch(hierarchy, 'typeB', 'typeA');
    });

    test('Simple params', function() {
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
      });
      this.assertMatch(hierarchy, 'typeA[typeB]', 'typeA[typeB]');
    });

    test('Case params', function() {
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
      });
      this.assertMatch(hierarchy, 'typeA[typeB]', 'typea[typeB]');
      this.assertMatch(hierarchy, 'typea[typeB]', 'typeA[typeB]');
      this.assertMatch(hierarchy, 'typeA[typeB]', 'typeA[typeb]');
      this.assertMatch(hierarchy, 'typeA[typeb]', 'typeA[typeB]');
    });

    test('Parent and child params', function() {
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
          'fulfills': ['typeC'],
        },
        'typeC': { },
      });
      this.assertNoMatch(hierarchy, 'typeA[typeC]', 'typeA[typeB]');
      this.assertNoMatch(hierarchy, 'typeA[typeB]', 'typeA[typeC]');
    });

    suite('Correct number of params', function() {
      setup(function() {
        this.hierarchy = new TypeHierarchy({
          'typeA': {
            'params': [
              {
                'name': 'A',
                'variance': 'co',
              },
            ],
          },
          'typeB': { },
        });

        this.assertThrows = function(hierarchy, sub, sup) {
          chai.assert.throws(() => {
            hierarchy.typeFulfillsType(parseType(sub), parseType(sup));
          }, ActualParamsCountError);
        };
      });

      test('First missing params', function() {
        this.assertThrows(this.hierarchy, 'typeA', 'typeA[typeB]');
      });

      test('Second missing params', function() {
        this.assertThrows(this.hierarchy, 'typeA[typeB]', 'typeA');
      });

      test('First extra params', function() {
        this.assertThrows(
            this.hierarchy, 'typeA[typeB, typeB]', 'typeA[typeB]');
      });

      test('Second extra params', function() {
        this.assertThrows(
            this.hierarchy, 'typeA[typeB]', 'typeA[typeB, typeB]');
      });
    });
  });

  suite('typeFulfillsType', function() {
    setup(function() {
      this.assertFulfills = function(hierarchy, sub, sup, msg) {
        chai.assert.isTrue(
            hierarchy.typeFulfillsType(parseType(sub), parseType(sup)), msg);
      };
      this.assertDoesNotFulfill = function(hierarchy, sub, sup, msg) {
        chai.assert.isFalse(
            hierarchy.typeFulfillsType(parseType(sub), parseType(sup)), msg);
      };
    });

    test('Empty fulfills', function() {
      const hierarchy = new TypeHierarchy({
        'typeA': {
          'fulfills': [],
        },
        'typeB': { },
      });
      this.assertDoesNotFulfill(hierarchy, 'typeA', 'typeB');
    });

    test('Undefined fulfills', function() {
      const hierarchy = new TypeHierarchy({
        'typeA': { },
        'typeB': { },
      });
      this.assertDoesNotFulfill(hierarchy, 'typeA', 'typeB');
    });

    test('Super defined first', function() {
      const hierarchy = new TypeHierarchy({
        'typeB': { },
        'typeA': {
          'fulfills': ['typeB'],
        },
      });
      this.assertFulfills(hierarchy, 'typeA', 'typeB');
    });

    test('Super defined second', function() {
      const hierarchy = new TypeHierarchy({
        'typeA': {
          'fulfills': ['typeB'],
        },
        'typeB': { },
      });
      this.assertFulfills(hierarchy, 'typeA', 'typeB');
    });

    test('Backwards', function() {
      const hierarchy = new TypeHierarchy({
        'typeB': { },
        'typeA': {
          'fulfills': ['typeB'],
        },
      });
      this.assertDoesNotFulfill(hierarchy, 'typeB', 'typeA');
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
      this.assertFulfills(hierarchy, 'typeA', 'typeB');
      this.assertFulfills(hierarchy, 'typeA', 'typeC');
      this.assertFulfills(hierarchy, 'typeA', 'typeD');
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
      this.assertFulfills(hierarchy, 'typeA', 'typeB');
      this.assertFulfills(hierarchy, 'typeA', 'typeC');
      this.assertFulfills(hierarchy, 'typeA', 'typeD');
    });

    test('Case', function() {
      const hierarchy = new TypeHierarchy({
        'typeA': {
          'fulfills': ['typeB'],
        },
        'typeb': { },
      });
      this.assertFulfills(hierarchy, 'typeA', 'typeb');
      this.assertFulfills(hierarchy, 'typeA', 'typeB');
      this.assertFulfills(hierarchy, 'typea', 'typeb');
      this.assertFulfills(hierarchy, 'typea', 'typeB');
    });

    suite('Params', function() {
      suite('Single params', function() {
        suite('Covariant', function() {
          setup(function() {
            this.hierarchy = new TypeHierarchy({
              'typeA': {
                'params': [
                  {
                    'name': 'A',
                    'variance': 'co',
                  },
                ],
              },
              'typeB': {
                'fulfills': ['typeC'],
              },
              'typeC': { },
            });
          });

          test('Same', function() {
            this.assertFulfills(this.hierarchy, 'typeA[typeB]', 'typeA[typeB]');
          });

          test('Sub', function() {
            this.assertDoesNotFulfill(
                this.hierarchy, 'typeA[typeC]', 'typeA[typeB]');
          });

          test('Super', function() {
            this.assertFulfills(this.hierarchy, 'typeA[typeB]', 'typeA[typeC]');
          });
        });

        suite('Contravariant', function() {
          setup(function() {
            this.hierarchy = new TypeHierarchy({
              'typeA': {
                'params': [
                  {
                    'name': 'A',
                    'variance': 'contra',
                  },
                ],
              },
              'typeB': {
                'fulfills': ['typeC'],
              },
              'typeC': { },
            });
          });

          test('Same', function() {
            this.assertFulfills(this.hierarchy, 'typeA[typeB]', 'typeA[typeB]');
          });

          test('Sub', function() {
            this.assertFulfills(this.hierarchy, 'typeA[typeC]', 'typeA[typeB]');
          });

          test('Super', function() {
            this.assertDoesNotFulfill(
                this.hierarchy, 'typeA[typeB]', 'typeA[typeC]');
          });
        });

        suite('Invariant', function() {
          setup(function() {
            this.hierarchy = new TypeHierarchy({
              'typeA': {
                'params': [
                  {
                    'name': 'A',
                    'variance': 'inv',
                  },
                ],
              },
              'typeB': {
                'fulfills': ['typeC'],
              },
              'typeC': { },
            });
          });

          test('Same', function() {
            this.assertFulfills(this.hierarchy, 'typeA[typeB]', 'typeA[typeB]');
          });

          test('Sub', function() {
            this.assertDoesNotFulfill(
                this.hierarchy, 'typeA[typeC]', 'typeA[typeB]');
          });

          test('Super', function() {
            this.assertDoesNotFulfill(
                this.hierarchy, 'typeA[typeB]', 'typeA[typeC]');
          });
        });
      });

      suite('Multiple params', function() {
        suite('Covariant, Covariant', function() {
          setup(function() {
            this.hierarchy = new TypeHierarchy({
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
                'fulfills': ['typeC'],
              },
              'typeC': { },
            });
          });

          test('Both good', function() {
            this.assertFulfills(
                this.hierarchy, 'typeA[typeB, typeB]', 'typeA[typeC, typeC]');
          });

          test('First bad', function() {
            this.assertDoesNotFulfill(
                this.hierarchy, 'typeA[typeC, typeB]', 'typeA[typeB, typeC]');
          });

          test('Second bad', function() {
            this.assertDoesNotFulfill(
                this.hierarchy, 'typeA[typeB, typeC]', 'typeA[typeC, typeB]');
          });
        });

        suite('Covariant, Contravariant', function() {
          setup(function() {
            this.hierarchy = new TypeHierarchy({
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
                ],
              },
              'typeB': {
                'fulfills': ['typeC'],
              },
              'typeC': { },
            });
          });

          test('Both good', function() {
            this.assertFulfills(
                this.hierarchy, 'typeA[typeB, typeC]', 'typeA[typeC, typeB]');
          });

          test('First bad', function() {
            this.assertDoesNotFulfill(
                this.hierarchy, 'typeA[typeC, typeC]', 'typeA[typeB, typeB]');
          });

          test('Second bad', function() {
            this.assertDoesNotFulfill(
                this.hierarchy, 'typeA[typeB, typeB]', 'typeA[typeC, typeC]');
          });
        });

        suite('Covariant, Invariant', function() {
          setup(function() {
            this.hierarchy = new TypeHierarchy({
              'typeA': {
                'params': [
                  {
                    'name': 'A',
                    'variance': 'co',
                  },
                  {
                    'name': 'B',
                    'variance': 'inv',
                  },
                ],
              },
              'typeB': {
                'fulfills': ['typeC'],
              },
              'typeC': { },
            });
          });

          test('Both good', function() {
            this.assertFulfills(
                this.hierarchy, 'typeA[typeB, typeC]', 'typeA[typeC, typeC]');
          });

          test('First bad', function() {
            this.assertDoesNotFulfill(
                this.hierarchy, 'typeA[typeC, typeC]', 'typeA[typeB, typeC]');
          });

          test('Second bad', function() {
            this.assertDoesNotFulfill(
                this.hierarchy, 'typeA[typeB, typeB]', 'typeA[typeC, typeC]');
          });
        });

        suite('Contravariant, Contravariant', function() {
          setup(function() {
            this.hierarchy = new TypeHierarchy({
              'typeA': {
                'params': [
                  {
                    'name': 'A',
                    'variance': 'contra',
                  },
                  {
                    'name': 'B',
                    'variance': 'contra',
                  },
                ],
              },
              'typeB': {
                'fulfills': ['typeC'],
              },
              'typeC': { },
            });
          });

          test('Both good', function() {
            this.assertFulfills(
                this.hierarchy, 'typeA[typeB, typeC]', 'typeA[typeB, typeB]');
          });

          test('First bad', function() {
            this.assertDoesNotFulfill(
                this.hierarchy, 'typeA[typeB, typeC]', 'typeA[typeC, typeB]');
          });

          test('Second bad', function() {
            this.assertDoesNotFulfill(
                this.hierarchy, 'typeA[typeC, typeB]', 'typeA[typeB, typeC]');
          });
        });

        suite('Contravariant, Invariant', function() {
          setup(function() {
            this.hierarchy = new TypeHierarchy({
              'typeA': {
                'params': [
                  {
                    'name': 'A',
                    'variance': 'contra',
                  },
                  {
                    'name': 'B',
                    'variance': 'inv',
                  },
                ],
              },
              'typeB': {
                'fulfills': ['typeC'],
              },
              'typeC': { },
            });
          });

          test('Both good', function() {
            this.assertFulfills(
                this.hierarchy, 'typeA[typeC, typeC]', 'typeA[typeB, typeC]');
          });

          test('First bad', function() {
            this.assertDoesNotFulfill(
                this.hierarchy, 'typeA[typeB, typeC]', 'typeA[typeC, typeC]');
          });

          test('Second bad', function() {
            this.assertDoesNotFulfill(
                this.hierarchy, 'typeA[typeC, typeB]', 'typeA[typeB, typeC]');
          });
        });

        test('Mixed up params', function() {
          const hierarchy = new TypeHierarchy({
            'typeA': {
              'params': [
                {
                  'name': 'A',
                  'variance': 'inv',
                },
                {
                  'name': 'B',
                  'variance': 'inv',
                },
              ],
            },
            'typeB': {
              'fulfills': ['typeA[B, A]'],
              'params': [
                {
                  'name': 'A',
                  'variance': 'inv',
                },
                {
                  'name': 'B',
                  'variance': 'inv',
                },
              ],
            },
            'typeC': { },
            'typeD': { },
          });
          this.assertFulfills(
              hierarchy, 'typeB[typeD, typeC]', 'typeA[typeC, typeD]');
          this.assertDoesNotFulfill(
              hierarchy, 'typeB[typeC, typeD]', 'typeA[typeC, typeD]');
        });

        test('Fulfill super with less params', function() {
          const hierarchy = new TypeHierarchy({
            'typeA': {
              'params': [
                {
                  'name': 'A',
                  'variance': 'inv',
                },
              ],
            },
            'typeB': {
              'fulfills': ['typeA[A]'],
              'params': [
                {
                  'name': 'A',
                  'variance': 'inv',
                },
                {
                  'name': 'B',
                  'variance': 'inv',
                },
              ],
            },
            'typeC': { },
          });
          this.assertFulfills(hierarchy, 'typeB[typeC, typeC]', 'typeA[typeC]');
        });
      });

      suite('Nested params', function() {
        suite('Invariant, Invariant', function() {
          setup(function() {
            this.hierarchy = new TypeHierarchy({
              'typeA': {
                'params': [
                  {
                    'name': 'A',
                    'variance': 'inv',
                  },
                  {
                    'name': 'B',
                    'variance': 'inv',
                  },
                ],
              },
              'typeB': {
                'fulfills': ['typeC'],
              },
              'typeC': { },
            });
          });

          test('Both good', function() {
            this.assertFulfills(
                this.hierarchy, 'typeA[typeC, typeC]', 'typeA[typeC, typeC]');
          });

          test('First bad', function() {
            this.assertDoesNotFulfill(
                this.hierarchy, 'typeA[typeB, typeC]', 'typeA[typeC, typeC]');
          });

          test('Second bad', function() {
            this.assertDoesNotFulfill(
                this.hierarchy, 'typeA[typeC, typeB]', 'typeA[typeC, typeC]');
          });
        });

        suite('Covariant -> Covariant', function() {
          setup(function() {
            this.hierarchy = new TypeHierarchy({
              'typeA': {
                'params': [
                  {
                    'name': 'A',
                    'variance': 'co',
                  },
                ],
              },
              'typeB': {
                'fulfills': ['typeA[A]'],
                'params': [
                  {
                    'name': 'A',
                    'variance': 'co',
                  },
                ],
              },
              'typeC': { },
              'typeD': {
                'fulfills': ['typeC'],
              },
            });
          });

          test('Both good', function() {
            this.assertFulfills(
                this.hierarchy, 'typeA[typeB[typeD]]', 'typeA[typeB[typeC]]');
          });

          test('Outer bad', function() {
            this.assertDoesNotFulfill(
                this.hierarchy, 'typeA[typeA[typeD]]', 'typeA[typeB[typeC]]');
          });

          test('Inner bad', function() {
            this.assertDoesNotFulfill(
                this.hierarchy, 'typeA[typeB[typeC]]', 'typeA[typeB[typeD]]');
          });
        });

        suite('Covariant -> Contravariant', function() {
          setup(function() {
            this.hierarchy = new TypeHierarchy({
              'typeA': {
                'params': [
                  {
                    'name': 'A',
                    'variance': 'co',
                  },
                ],
              },
              'typeB': {
                'fulfills': ['typeA[A]'],
                'params': [
                  {
                    'name': 'A',
                    'variance': 'contravariant',
                  },
                ],
              },
              'typeC': { },
              'typeD': {
                'fulfills': ['typeC'],
              },
            });
          });

          test('Both good', function() {
            this.assertFulfills(
                this.hierarchy, 'typeA[typeB[typeC]]', 'typeA[typeB[typeD]]');
          });

          test('Outer bad', function() {
            this.assertDoesNotFulfill(
                this.hierarchy, 'typeA[typeA[typeC]]', 'typeA[typeB[typeD]]');
          });

          test('Inner bad', function() {
            this.assertDoesNotFulfill(
                this.hierarchy, 'typeA[typeB[typeD]]', 'typeA[typeB[typeC]]');
          });
        });

        suite('Covariant -> Invariant', function() {
          setup(function() {
            this.hierarchy = new TypeHierarchy({
              'typeA': {
                'params': [
                  {
                    'name': 'A',
                    'variance': 'co',
                  },
                ],
              },
              'typeB': {
                'fulfills': ['typeA[A]'],
                'params': [
                  {
                    'name': 'A',
                    'variance': 'inv',
                  },
                ],
              },
              'typeC': { },
              'typeD': {
                'fulfills': ['typeC'],
              },
            });
          });

          test('Both good', function() {
            this.assertFulfills(
                this.hierarchy, 'typeA[typeB[typeD]]', 'typeA[typeB[typeD]]');
          });

          test('Outer bad', function() {
            this.assertDoesNotFulfill(
                this.hierarchy, 'typeA[typeA[typeD]]', 'typeA[typeB[typeD]]');
          });

          test('Inner bad', function() {
            this.assertDoesNotFulfill(
                this.hierarchy, 'typeA[typeB[typeD]]', 'typeA[typeB[typeC]]');
          });
        });

        suite('Contravariant -> Covariant', function() {
          setup(function() {
            this.hierarchy = new TypeHierarchy({
              'typeA': {
                'params': [
                  {
                    'name': 'A',
                    'variance': 'contra',
                  },
                ],
              },
              'typeB': {
                'fulfills': ['typeA[A]'],
                'params': [
                  {
                    'name': 'A',
                    'variance': 'co',
                  },
                ],
              },
              'typeC': {
                'fulfills': ['typeB[A]'],
                'params': [
                  {
                    'name': 'A',
                    'variance': 'co',
                  },
                ],
              },
              'typeD': { },
              'typeE': {
                'fulfills': ['typeD'],
              },
            });
          });

          test('Both good', function() {
            // This may not look correct, but remember we evalulate the *whole*
            // parameter when checking variance. So b/c typeA is contravariant
            // typeC[typeE] must be a subtype of typeB[typeD], which it is
            // because typeC and typeB are both covariant and typeE <: typeD
            this.assertFulfills(
                this.hierarchy, 'typeA[typeB[typeD]]', 'typeA[typeC[typeE]]');
          });

          test('Outer bad', function() {
            this.assertDoesNotFulfill(
                this.hierarchy, 'typeA[typeC[typeE]]', 'typeA[typeB[typeD]]');
          });

          test('Inner bad', function() {
            this.assertDoesNotFulfill(
                this.hierarchy, 'typeA[typeB[typeE]]', 'typeA[typeC[typeD]]');
          });
        });

        suite('Contravariant -> Contravariant', function() {
          setup(function() {
            this.hierarchy = new TypeHierarchy({
              'typeA': {
                'params': [
                  {
                    'name': 'A',
                    'variance': 'contra',
                  },
                ],
              },
              'typeB': {
                'fulfills': ['typeA[A]'],
                'params': [
                  {
                    'name': 'A',
                    'variance': 'contravariant',
                  },
                ],
              },
              'typeC': {
                'fulfills': ['typeB[A]'],
                'params': [
                  {
                    'name': 'A',
                    'variance': 'contravariant',
                  },
                ],
              },
              'typeD': { },
              'typeE': {
                'fulfills': ['typeD'],
              },
            });
          });

          test('Both good', function() {
            this.assertFulfills(
                this.hierarchy, 'typeA[typeB[typeE]]', 'typeA[typeC[typeD]]');
          });

          test('Outer bad', function() {
            this.assertDoesNotFulfill(
                this.hierarchy, 'typeA[typeC[typeD]]', 'typeA[typeB[typeE]]');
          });

          test('Inner bad', function() {
            this.assertDoesNotFulfill(
                this.hierarchy, 'typeA[typeB[typeD]]', 'typeA[typeC[typeE]]');
          });
        });

        suite('Contravariant -> Invariant', function() {
          setup(function() {
            this.hierarchy = new TypeHierarchy({
              'typeA': {
                'params': [
                  {
                    'name': 'A',
                    'variance': 'contra',
                  },
                ],
              },
              'typeB': {
                'fulfills': ['typeA[A]'],
                'params': [
                  {
                    'name': 'A',
                    'variance': 'inv',
                  },
                ],
              },
              'typeC': {
                'fulfills': ['typeB[A]'],
                'params': [
                  {
                    'name': 'A',
                    'variance': 'inv',
                  },
                ],
              },
              'typeD': { },
              'typeE': {
                'fulfills': ['typeD'],
              },
            });
          });

          test('Both good', function() {
            this.assertFulfills(
                this.hierarchy, 'typeA[typeB[typeD]]', 'typeA[typeC[typeD]]');
          });

          test('Outer bad', function() {
            this.assertDoesNotFulfill(
                this.hierarchy, 'typeA[typeC[typeD]]', 'typeA[typeB[typeD]]');
          });

          test('Inner bad', function() {
            this.assertDoesNotFulfill(
                this.hierarchy, 'typeA[typeB[typeE]]', 'typeA[typeC[typeD]]');
          });
        });

        suite('Invariant -> Covariant', function() {
          setup(function() {
            this.hierarchy = new TypeHierarchy({
              'typeA': {
                'params': [
                  {
                    'name': 'A',
                    'variance': 'inv',
                  },
                ],
              },
              'typeB': {
                'fulfills': ['typeA[A]'],
                'params': [
                  {
                    'name': 'A',
                    'variance': 'co',
                  },
                ],
              },
              'typeC': {
                'fulfills': ['typeB[A]'],
                'params': [
                  {
                    'name': 'A',
                    'variance': 'co',
                  },
                ],
              },
              'typeD': { },
              'typeE': {
                'fulfills': ['typeD'],
              },
            });
          });

          test('Both good', function() {
            this.assertFulfills(
                this.hierarchy, 'typeA[typeB[typeD]]', 'typeA[typeB[typeD]]');
          });

          test('Outer bad', function() {
            this.assertDoesNotFulfill(
                this.hierarchy, 'typeA[typeC[typeD]]', 'typeA[typeB[typeD]]');
          });

          test('Inner bad', function() {
            // This may look like it should be valid since typeE <: typeD and
            // typeB is covariant, but remember that because typeA is invariant
            // the *whole* parameter (including *its* parameters) needs to be
            // identical.
            this.assertDoesNotFulfill(
                this.hierarchy, 'typeA[typeB[typeE]]', 'typeA[typeB[typeD]]');
          });
        });

        suite('Invariant -> Contravariant', function() {
          setup(function() {
            this.hierarchy = new TypeHierarchy({
              'typeA': {
                'params': [
                  {
                    'name': 'A',
                    'variance': 'inv',
                  },
                ],
              },
              'typeB': {
                'fulfills': ['typeA[A]'],
                'params': [
                  {
                    'name': 'A',
                    'variance': 'contra',
                  },
                ],
              },
              'typeC': {
                'fulfills': ['typeB[A]'],
                'params': [
                  {
                    'name': 'A',
                    'variance': 'contra',
                  },
                ],
              },
              'typeD': { },
              'typeE': {
                'fulfills': ['typeD'],
              },
            });
          });

          test('Both good', function() {
            this.assertFulfills(
                this.hierarchy, 'typeA[typeB[typeD]]', 'typeA[typeB[typeD]]');
          });

          test('Outer bad', function() {
            this.assertDoesNotFulfill(
                this.hierarchy, 'typeA[typeB[typeD]]', 'typeA[typeC[typeD]]');
          });

          test('Inner bad', function() {
            this.assertDoesNotFulfill(
                this.hierarchy, 'typeA[typeB[typeD]]', 'typeA[typeB[typeE]]');
          });
        });

        suite('Invariant -> Invariant', function() {
          setup(function() {
            this.hierarchy = new TypeHierarchy({
              'typeA': {
                'params': [
                  {
                    'name': 'A',
                    'variance': 'inv',
                  },
                ],
              },
              'typeB': {
                'fulfills': ['typeA[A]'],
                'params': [
                  {
                    'name': 'A',
                    'variance': 'inv',
                  },
                ],
              },
              'typeC': {
                'fulfills': ['typeB[A]'],
                'params': [
                  {
                    'name': 'A',
                    'variance': 'inv',
                  },
                ],
              },
              'typeD': { },
              'typeE': {
                'fulfills': ['typeD'],
              },
            });
          });

          test('Both good', function() {
            this.assertFulfills(
                this.hierarchy, 'typeA[typeB[typeD]]', 'typeA[typeB[typeD]]');
          });

          test('Outer bad', function() {
            this.assertDoesNotFulfill(
                this.hierarchy, 'typeA[typeC[typeD]]', 'typeA[typeB[typeD]]');
          });

          test('Inner bad', function() {
            this.assertDoesNotFulfill(
                this.hierarchy, 'typeA[typeB[typeE]]', 'typeA[typeB[typeD]]');
          });
        });
      });

      suite('Explicit params in def', function() {
        test('Single explicit, covariant', function() {
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
              'fulfills': ['typeA[typeD]'],
            },
            'typeC': { },
            'typeD': {
              'fulfills': ['typeC'],
            },
            'typeE': {
              'fulfills': ['typeD'],
            },
          });
          this.assertFulfills(hierarchy, 'typeB', 'typeA[typeD]');
          this.assertFulfills(hierarchy, 'typeB', 'typeA[typeC]');
          this.assertDoesNotFulfill(hierarchy, 'typeB', 'typeA[typeE]');
        });

        test('Single explicit, contravariant', function() {
          const hierarchy = new TypeHierarchy({
            'typeA': {
              'params': [
                {
                  'name': 'A',
                  'variance': 'contra',
                },
              ],
            },
            'typeB': {
              'fulfills': ['typeA[typeD]'],
            },
            'typeC': { },
            'typeD': {
              'fulfills': ['typeC'],
            },
            'typeE': {
              'fulfills': ['typeD'],
            },
          });
          this.assertFulfills(hierarchy, 'typeB', 'typeA[typeD]');
          this.assertFulfills(hierarchy, 'typeB', 'typeA[typeE]');
          this.assertDoesNotFulfill(hierarchy, 'typeB', 'typeA[typeC]');
        });

        test('Single explicit, invariant', function() {
          const hierarchy = new TypeHierarchy({
            'typeA': {
              'params': [
                {
                  'name': 'A',
                  'variance': 'inv',
                },
              ],
            },
            'typeB': {
              'fulfills': ['typeA[typeD]'],
            },
            'typeC': { },
            'typeD': {
              'fulfills': ['typeC'],
            },
            'typeE': {
              'fulfills': ['typeD'],
            },
          });
          this.assertFulfills(hierarchy, 'typeB', 'typeA[typeD]');
          this.assertDoesNotFulfill(hierarchy, 'typeB', 'typeA[typeC]');
          this.assertDoesNotFulfill(hierarchy, 'typeB', 'typeA[typeE]');
        });

        test('Multiple explicit', function() {
          const hierarchy = new TypeHierarchy({
            'typeA': {
              'params': [
                {
                  'name': 'A',
                  'variance': 'inv',
                },
                {
                  'name': 'B',
                  'variance': 'inv',
                },
              ],
            },
            'typeB': {
              'fulfills': ['typeA[typeC, typeC]'],
            },
            'typeC': { },
          });
          this.assertFulfills(hierarchy, 'typeB', 'typeA[typeC, typeC]');
        });

        test('Explicit and generic', function() {
          const hierarchy = new TypeHierarchy({
            'typeA': {
              'params': [
                {
                  'name': 'A',
                  'variance': 'inv',
                },
                {
                  'name': 'B',
                  'variance': 'inv',
                },
              ],
            },
            'typeB': {
              'params': [
                {
                  'name': 'A',
                  'variance': 'inv',
                },
              ],
              'fulfills': ['typeA[A, typeC]'],
            },
            'typeC': { },
          });
          this.assertFulfills(hierarchy, 'typeB[typeC]', 'typeA[typeC, typeC]');
        });

        test('Explicit with generic', function() {
          const hierarchy = new TypeHierarchy({
            'typeA': {
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
                  'name': 'A',
                  'variance': 'inv',
                },
              ],
              'fulfills': ['typeA[typeC[A]]'],
            },
            'typeC': {
              'params': [
                {
                  'name': 'A',
                  'variance': 'inv',
                },
              ],
            },
            'typeD': { },
          });
          this.assertFulfills(hierarchy, 'typeB[typeD]', 'typeA[typeC[typeD]]');
        });
      });

      suite('Variance inheritance', function() {
        // This suite documents that it is the variance of the parent's
        // parameters that matter, not the child's.
        test('Covariant -> Invariant', function() {
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
              'fulfills': ['typeA[A]'],
              'params': [
                {
                  'name': 'A',
                  'variance': 'inv',
                },
              ],
            },
            'typeC': { },
            'typeD': {
              'fulfills': ['typeC'],
            },
          });
          this.assertFulfills(hierarchy, 'typeB[typeD]', 'typeA[typeC]');
        });

        test('Contravariant -> Invariant', function() {
          const hierarchy = new TypeHierarchy({
            'typeA': {
              'params': [
                {
                  'name': 'A',
                  'variance': 'contra',
                },
              ],
            },
            'typeB': {
              'fulfills': ['typeA[A]'],
              'params': [
                {
                  'name': 'A',
                  'variance': 'inv',
                },
              ],
            },
            'typeC': { },
            'typeD': {
              'fulfills': ['typeC'],
            },
          });
          this.assertFulfills(hierarchy, 'typeB[typeC]', 'typeA[typeD]');
        });
      });

      suite('Correct number of params', function() {
        setup(function() {
          this.hierarchy = new TypeHierarchy({
            'typeA': {
              'params': [
                {
                  'name': 'A',
                  'variance': 'inv',
                },
              ],
            },
            'typeB': {
              'fulfills': ['typeA[A]'],
              'params': [
                {
                  'name': 'A',
                  'variance': 'inv',
                },
              ],
            },
            'typeC': { },
          });

          this.assertThrows = function(hierarchy, sub, sup) {
            chai.assert.throws(() => {
              hierarchy.typeFulfillsType(parseType(sub), parseType(sup));
            }, ActualParamsCountError);
          };
        });

        test('Sub missing params', function() {
          this.assertThrows(this.hierarchy, 'typeB', 'typeA[typeC]');
        });

        test('Super missing params', function() {
          this.assertThrows(this.hierarchy, 'typeB[typeC]', 'typeA');
        });

        test('Sub extra params', function() {
          this.assertThrows(
              this.hierarchy, 'typeB[typeC, typeC]', 'typeA[typeC]');
        });

        test('Super extra params', function() {
          this.assertThrows(
              this.hierarchy, 'typeB[typeC, typeC]', 'typeA[typeC]');
        });
      });
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
});
