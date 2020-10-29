/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Unit tests for utils.
 */

const chai = require('chai');

const {getCheck, isGeneric, isExplicit,
  isGenericConnection, isExplicitConnection} = require('../src/utils');

suite('Utils tests', function() {
  /**
   * Creates a mock connection with a getCheck function that returns the given
   * check.
   * @param {!Array} check The check the mock connection should have.
   * @return {{getCheck: function():!Array}} The new mock connection.
   */
  function createMockConnection(check) {
    return {
      getCheck: function() {
        return check;
      },
    };
  }

  suite('getCheck', function() {
    test('Empty', function() {
      const mock = createMockConnection([]);
      chai.assert.equal(getCheck(mock), '');
    });

    test('"a"', function() {
      const mock = createMockConnection(['a']);
      chai.assert.isTrue(isGenericConnection(mock));
      chai.assert.equal(getCheck(mock), 'a');
    });

    test('"A"', function() {
      const mock = createMockConnection(['A']);
      chai.assert.equal(getCheck(mock), 'a');
    });

    test('"*"', function() {
      const mock = createMockConnection(['*']);
      chai.assert.equal(getCheck(mock), '*');
    });

    test('"1"', function() {
      const mock = createMockConnection(['1']);
      chai.assert.equal(getCheck(mock), '1');
    });

    test('1', function() {
      const mock = createMockConnection([1]);
      chai.assert.equal(getCheck(mock), '');
    });

    test('"LongCheck"', function() {
      const mock = createMockConnection(['LongCheck']);
      chai.assert.equal(getCheck(mock), 'longcheck');
    });

    test('"\uD83D\uDE00" (emoji)', function() {
      const mock = createMockConnection(['\uD83D\uDE00']);
      chai.assert.isFalse(isGenericConnection(mock));
      chai.assert.equal(getCheck(mock), '\uD83D\uDE00');
    });

    test('Nested', function() {
      const mock = createMockConnection([['a']]);
      chai.assert.equal(getCheck(mock), '');
    });
  });

  suite('isGeneric', function() {
    test('"a"', function() {
      chai.assert.isTrue(isGeneric('a'));
    });

    test('"A"', function() {
      chai.assert.isTrue(isGeneric('A'));
    });

    test('"*"', function() {
      chai.assert.isTrue(isGeneric('*'));
    });

    test('"1"', function() {
      chai.assert.isTrue(isGeneric('1'));
    });

    test('"LongCheck"', function() {
      chai.assert.isFalse(isGeneric('LongCheck'));
    });

    test('"\uD83D\uDE00" (emoji)', function() {
      chai.assert.isFalse(isGeneric('\uD83D\uDE00'));
    });
  });

  suite('isExplicit', function() {
    test('"a"', function() {
      chai.assert.isFalse(isExplicit('a'));
    });

    test('"A"', function() {
      chai.assert.isFalse(isExplicit('A'));
    });

    test('"*"', function() {
      chai.assert.isFalse(isExplicit('*'));
    });

    test('"1"', function() {
      chai.assert.isFalse(isExplicit('1'));
    });

    test('"LongCheck"', function() {
      chai.assert.isTrue(isExplicit('LongCheck'));
    });

    test('"\uD83D\uDE00" (emoji)', function() {
      chai.assert.isTrue(isExplicit('\uD83D\uDE00'));
    });
  });

  suite('isGenericConnection', function() {
    test('Empty', function() {
      const mock = createMockConnection([]);
      chai.assert.isFalse(isGenericConnection(mock));
    });

    test('"a"', function() {
      const mock = createMockConnection(['a']);
      chai.assert.isTrue(isGenericConnection(mock));
    });

    test('"A"', function() {
      const mock = createMockConnection(['A']);
      chai.assert.isTrue(isGenericConnection(mock));
    });

    test('"*"', function() {
      const mock = createMockConnection(['*']);
      chai.assert.isTrue(isGenericConnection(mock));
    });

    test('"1"', function() {
      const mock = createMockConnection(['1']);
      chai.assert.isTrue(isGenericConnection(mock));
    });

    test('1', function() {
      const mock = createMockConnection([1]);
      chai.assert.isFalse(isGenericConnection(mock));
    });

    test('"LongCheck"', function() {
      const mock = createMockConnection(['LongCheck']);
      chai.assert.isFalse(isGenericConnection(mock));
    });

    test('"\uD83D\uDE00" (emoji)', function() {
      const mock = createMockConnection(['\uD83D\uDE00']);
      chai.assert.isFalse(isGenericConnection(mock));
    });

    test('Nested', function() {
      const mock = createMockConnection([['a']]);
      chai.assert.isFalse(isGenericConnection(mock));
    });
  });

  suite('isExplicitConnection', function() {
    test('Empty', function() {
      const mock = createMockConnection([]);
      chai.assert.isFalse(isExplicitConnection(mock));
    });

    test('"a"', function() {
      const mock = createMockConnection(['a']);
      chai.assert.isFalse(isExplicitConnection(mock));
    });

    test('"A"', function() {
      const mock = createMockConnection(['A']);
      chai.assert.isFalse(isExplicitConnection(mock));
    });

    test('"*"', function() {
      const mock = createMockConnection(['*']);
      chai.assert.isFalse(isExplicitConnection(mock));
    });

    test('"1"', function() {
      const mock = createMockConnection(['1']);
      chai.assert.isFalse(isExplicitConnection(mock));
    });

    test('1', function() {
      const mock = createMockConnection([1]);
      chai.assert.isFalse(isExplicitConnection(mock));
    });

    test('"LongCheck"', function() {
      const mock = createMockConnection(['LongCheck']);
      chai.assert.isTrue(isExplicitConnection(mock));
    });

    test('"\uD83D\uDE00" (emoji)', function() {
      const mock = createMockConnection(['\uD83D\uDE00']);
      chai.assert.isTrue(isExplicitConnection(mock));
    });

    test('Nested', function() {
      const mock = createMockConnection([['a']]);
      chai.assert.isFalse(isExplicitConnection(mock));
    });
  });
});

