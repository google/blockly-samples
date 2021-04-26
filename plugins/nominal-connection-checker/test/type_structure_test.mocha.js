/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * @fileoverview Unit tests for TypeStructure.
 */

const chai = require('chai');

const {parseType, MissingTypeNameError,
  RightBracketError, LeftBracketError,
  ExtraCharactersError, structureToString} = require('../src/type_structure');

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

  suite('Invalid type strings', function() {
    setup(function() {
      this.assertThrows = function(fn, testFn) {
        let throws = false;
        try {
          fn();
        } catch (e) {
          throws = true;
          chai.assert.isTrue(testFn(e), 'Got error: ' + e.message);
        }
        if (!throws) {
          chai.assert.fail('Expected function to throw an error.');
        }
      };
    });

    suite('Missing type name', function() {
      test('[type]', function() {
        this.assertThrows(() => {
          parseType('[type]');
        }, (e) => {
          return e instanceof MissingTypeNameError && e.index == 0;
        });
      });

      test('type[[type]]', function() {
        this.assertThrows(() => {
          parseType('type[[type]]');
        }, (e) => {
          return e instanceof MissingTypeNameError && e.index == 5;
        });
      });

      test('type[type[type[[type]]]]', function() {
        this.assertThrows(() => {
          parseType('type[type[type[[type]]]]');
        }, (e) => {
          return e instanceof MissingTypeNameError && e.index == 15;
        });
      });
    });

    suite('Unmatched left', function() {
      test('type[', function() {
        this.assertThrows(() => {
          parseType('type[');
        }, (e) => {
          return e instanceof LeftBracketError && e.index == 4;
        });
      });

      test('type[type', function() {
        this.assertThrows(() => {
          parseType('type[type');
        }, (e) => {
          return e instanceof LeftBracketError && e.index == 4;
        });
      });

      test('type[type[type]', function() {
        this.assertThrows(() => {
          parseType('type[type[type]');
        }, (e) => {
          return e instanceof LeftBracketError && e.index == 4;
        });
      });
    });

    suite('Unmatched right', function() {
      test('type]', function() {
        this.assertThrows(() => {
          parseType('type]');
        }, (e) => {
          return e instanceof RightBracketError && e.index == 4;
        });
      });

      test('type]type[type]]', function() {
        this.assertThrows(() => {
          parseType('type]type[type]]');
        }, (e) => {
          return e instanceof RightBracketError && e.index == 4;
        });
      });
    });

    suite('Extra characters', function() {
      test('type[type], type', function() {
        this.assertThrows(() => {
          parseType('type[type], type');
        }, (e) => {
          return e instanceof ExtraCharactersError && e.index == 10;
        });
      });

      test('type[type], type]', function() {
        this.assertThrows(() => {
          parseType('type[type], type');
        }, (e) => {
          return e instanceof ExtraCharactersError && e.index == 10;
        });
      });

      test('type[type]]', function() {
        this.assertThrows(() => {
          parseType('type[type]]');
        }, (e) => {
          return e instanceof ExtraCharactersError && e.index == 10;
        });
      });
    });
  });

  suite('structureToString', function() {
    setup(function() {
      this.assertString = function(struct, str) {
        chai.assert.equal(structureToString(struct), str);
      };
    });

    test('Just type', function() {
      this.assertString({
        name: 'type',
        params: [],
      }, 'type');
    });

    test('Single param', function() {
      this.assertString(
          {
            name: 'typeA',
            params: [
              {
                name: 'typeA',
                params: [],
              },
            ],
          },
          'typeA[typeA]');
    });

    test('Multiple params', function() {
      this.assertString(
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
          'typeA[typeA, typeA]');
    });

    test('Deep nesting', function() {
      this.assertString(
          {
            name: 'typeA',
            params: [
              {
                name: 'typeA',
                params: [
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
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          'typeA[typeA[typeA[typeA[typeA]]]]');
    });
  });
});
