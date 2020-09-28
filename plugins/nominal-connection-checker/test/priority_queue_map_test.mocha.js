/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Unit tests for PriorityQueueMap.
 */

const chai = require('chai');

const {PriorityQueueMap} = require('../src/priority_queue_map.js');

suite('PriorityQueueMap', function() {
  setup(function() {
    this.priorityQueueMap = new PriorityQueueMap();

    this.assertBindings = function(key, ...bindings) {
      chai.assert.deepEqual(this.priorityQueueMap.getBindings(key), bindings);
    };
  });

  suite('getValues', function() {
    setup(function() {
      this.assertValues = function(key, ...values) {
        chai.assert.deepEqual(this.priorityQueueMap.getValues(key), values);
      };
    });

    test('Single value', function() {
      this.priorityQueueMap.bind('test', 'test', 0);
      this.assertValues('test', 'test');
    });

    test('Multiple values', function() {
      this.priorityQueueMap.bind('test', 'test', 0);
      this.priorityQueueMap.bind('test', 'test2', 0);
      this.assertValues('test', 'test', 'test2');
    });

    test('Bad key', function() {
      chai.assert.isUndefined(this.priorityQueueMap.getValues('test'));
    });

    test('No values', function() {
      this.priorityQueueMap.bind('test', 'test', 0);
      this.priorityQueueMap.unbind('test', 'test', 0);
      chai.assert.isUndefined(this.priorityQueueMap.getValues('test'));
    });
  });

  suite('getBindings', function() {
    test('Single binding', function() {
      this.priorityQueueMap.bind('test', 'test', 0);
      this.assertBindings('test', {value: 'test', priority: 0});
    });

    test('Multiple bindings', function() {
      this.priorityQueueMap.bind('test', 'test', 0);
      this.priorityQueueMap.bind('test', 'test2', 0);
      this.assertBindings('test',
          {value: 'test', priority: 0},
          {value: 'test2', priority: 0});
    });

    test('Bad key', function() {
      chai.assert.isUndefined(this.priorityQueueMap.getBindings('test'));
    });

    test('No values', function() {
      this.priorityQueueMap.bind('test', 'test', 0);
      this.priorityQueueMap.unbind('test', 'test', 0);
      chai.assert.isUndefined(this.priorityQueueMap.getBindings('test'));
    });
  });

  suite('bind', function() {
    setup(function() {
      this.assertThrows = function(fn) {
        chai.assert.throws(
            fn.bind(this),
            'A binding\'s priority must be a number.');
      };
    });

    test('Simple', function() {
      this.priorityQueueMap.bind('test', 'test', 0);
      this.assertBindings('test', {value: 'test', priority: 0});
    });

    test('Undefined key', function() {
      this.priorityQueueMap.bind(undefined, 'test', 0);
      this.assertBindings(undefined, {value: 'test', priority: 0});
    });

    test('Null key', function() {
      this.priorityQueueMap.bind(null, 'test', 0);
      this.assertBindings(null, {value: 'test', priority: 0});
    });

    test('NaN key', function() {
      this.priorityQueueMap.bind(NaN, 'test', 0);
      this.assertBindings(NaN, {value: 'test', priority: 0});
    });

    test('Undefined value', function() {
      this.priorityQueueMap.bind('test', undefined, 0);
      this.assertBindings('test', {value: undefined, priority: 0});
    });

    test('Null value', function() {
      this.priorityQueueMap.bind('test', null, 0);
      this.assertBindings('test', {value: null, priority: 0});
    });

    test('Undefined priority', function() {
      this.assertThrows(() => {
        this.priorityQueueMap.bind('test', 'test', undefined);
      });
    });

    test('Null priority', function() {
      this.assertThrows(() => {
        this.priorityQueueMap.bind('test', 'test', null);
      });
    });

    test('NaN priority', function() {
      this.assertThrows(() => {
        this.priorityQueueMap.bind('test', 'test', NaN);
      });
    });

    test('Stringified number priority', function() {
      // We cannot allow stringified numbers because we do comparison tests.
      this.assertThrows(() => {
        this.priorityQueueMap.bind('test', 'test', '1');
      });
    });
  });

  suite('unbind', function() {
    test('Simple', function() {
      this.priorityQueueMap.bind('test', 'test', 0);
      this.priorityQueueMap.unbind('test', 'test', 0);
      chai.assert.isUndefined(this.priorityQueueMap.getBindings('test'));
    });

    test('Stringified value', function() {
      this.priorityQueueMap.bind('test', 1, 0);
      this.priorityQueueMap.unbind('test', '1', 0);
      this.assertBindings('test', {value: 1, priority: 0});
    });

    test('Similar object value', function() {
      this.priorityQueueMap.bind('test', {test: 'test'}, 0);
      this.priorityQueueMap.unbind('test', {test: 'test'}, 0);
      this.assertBindings('test', {value: {test: 'test'}, priority: 0});
    });

    test('Same object value', function() {
      const value = {test: 'test'};
      this.priorityQueueMap.bind('test', value, 0);
      this.priorityQueueMap.unbind('test', value, 0);
      chai.assert.isUndefined(this.priorityQueueMap.getBindings('test'));
    });

    test('Different priority', function() {
      this.priorityQueueMap.bind('test', 'test', 0);
      this.priorityQueueMap.unbind('test', 'test', 10);
      this.assertBindings('test', {value: 'test', priority: 0});
    });

    test('Stringified priority', function() {
      this.priorityQueueMap.bind('test', 'test', 0);
      this.priorityQueueMap.unbind('test', 'test', '0');
      this.assertBindings('test', {value: 'test', priority: 0});
    });
  });

  suite('Priority', function() {
    test('Single', function() {
      this.priorityQueueMap.bind('test', 'test', 1);
      this.assertBindings('test', {value: 'test', priority: 1});
    });

    test('Multiple', function() {
      this.priorityQueueMap.bind('test', 'test', 1);
      this.priorityQueueMap.bind('test', 'test2', 1);
      this.priorityQueueMap.bind('test', 'test3', 1);
      this.assertBindings('test',
          {value: 'test', priority: 1},
          {value: 'test2', priority: 1},
          {value: 'test3', priority: 1});
    });

    test('Increasing', function() {
      this.priorityQueueMap.bind('test', 'test', 1);
      this.priorityQueueMap.bind('test', 'test2', 2);
      this.priorityQueueMap.bind('test', 'test3', 3);
      this.priorityQueueMap.bind('test', 'test4', 3);
      this.assertBindings('test',
          {value: 'test3', priority: 3},
          {value: 'test4', priority: 3});
    });

    test('Decreasing', function() {
      this.priorityQueueMap.bind('test', 'test', 3);
      this.priorityQueueMap.bind('test', 'test2', 3);
      this.priorityQueueMap.bind('test', 'test3', 2);
      this.priorityQueueMap.bind('test', 'test4', 1);
      this.assertBindings('test',
          {value: 'test', priority: 3},
          {value: 'test2', priority: 3});
    });

    test('Negatives', function() {
      this.priorityQueueMap.bind('test', 'test', -2);
      this.priorityQueueMap.bind('test', 'test2', -2);
      this.priorityQueueMap.bind('test', 'test3', -1);
      this.priorityQueueMap.bind('test', 'test4', 0);
      this.assertBindings('test', {value: 'test4', priority: 0});
    });

    test('Floats', function() {
      this.priorityQueueMap.bind('test', 'test', 0);
      this.priorityQueueMap.bind('test', 'test2', 0.0001);
      this.priorityQueueMap.bind('test', 'test3', 0.2);
      this.priorityQueueMap.bind('test', 'test4', -0.3);
      this.assertBindings('test', {value: 'test3', priority: 0.2});
    });
  });
});
