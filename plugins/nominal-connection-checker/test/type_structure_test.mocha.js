/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Unit tests for TypeStructure.
 */

const chai = require('chai');

const {parseType} = require('../src/type_structure');

suite('TypeStructure', function() {
  suite('parseType', function() {
    setup(function() {
      this.assertStructure = function(str, struct, caseless = true) {
        chai.assert.deepEqual(parseType(str, caseless), struct);
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
    });

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

    test('Keep case', function() {
      this.assertStructure(
          'typeA[typeA[typeA, typeA], typeA]',
          {
            name: 'typeA',
            params: [
              {
                name: 'typeA',
                params: [
                  {
                    name: 'typeA',
                    params: [],
                  },
                  {
                    name: 'typeA',
                    params: [],
                  },
                ],
              },
              {
                name: 'typeA',
                params: [],
              },
            ],
          },
          false
      );
    });
  });
});
