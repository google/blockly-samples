/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Unit tests for PriorityQueueMap.
 */

const chai = require('chai');
const sinon = require('sinon');

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

    test('Different Priorities', function() {
      this.priorityQueueMap.bind('test', 'test', 10);
      this.priorityQueueMap.bind('test', 'test2', 0);
      this.assertValues('test', 'test');
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

    test('Different priorities', function() {
      this.priorityQueueMap.bind('test', 'test', 10);
      this.priorityQueueMap.bind('test', 'test2', 0);
      this.assertBindings('test',
          {value: 'test', priority: 10});
    });
  });

  suite('getAllValues', function() {
    setup(function() {
      this.assertAllValues = function(key, ...values) {
        chai.assert.deepEqual(this.priorityQueueMap.getAllValues(key), values);
      };
    });

    test('Same priorities', function() {
      this.priorityQueueMap.bind('test', 'test1', 0);
      this.priorityQueueMap.bind('test', 'test2', 0);
      this.priorityQueueMap.bind('test', 'test3', 0);
      this.assertAllValues('test', 'test1', 'test2', 'test3');
    });

    test('Different priorities', function() {
      this.priorityQueueMap.bind('test', 'test1', 10);
      this.priorityQueueMap.bind('test', 'test2', 20);
      this.priorityQueueMap.bind('test', 'test3', 30);
      this.assertAllValues('test', 'test1', 'test2', 'test3');
    });
  });

  suite('getAllBindings', function() {
    setup(function() {
      this.assertAllBindings = function(key, ...bindings) {
        chai.assert.deepEqual(
            this.priorityQueueMap.getAllBindings(key), bindings);
      };
    });

    test('Same priorities', function() {
      this.priorityQueueMap.bind('test', 'test1', 0);
      this.priorityQueueMap.bind('test', 'test2', 0);
      this.priorityQueueMap.bind('test', 'test3', 0);
      this.assertAllBindings('test',
          {value: 'test1', priority: 0},
          {value: 'test2', priority: 0},
          {value: 'test3', priority: 0});
    });

    test('Different priorities', function() {
      this.priorityQueueMap.bind('test', 'test1', 10);
      this.priorityQueueMap.bind('test', 'test2', 20);
      this.priorityQueueMap.bind('test', 'test3', 30);
      this.assertAllBindings('test',
          {value: 'test1', priority: 10},
          {value: 'test2', priority: 20},
          {value: 'test3', priority: 30});
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

    test('No bindings', function() {
      this.priorityQueueMap.unbind('test', 'test', 0);
      chai.assert.isUndefined(this.priorityQueueMap.getBindings('test'));
    });

    test('Priority not provided', function() {
      this.priorityQueueMap.bind('test', 'test', 10);
      this.priorityQueueMap.unbind('test', 'test');
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

    test('Same object, priority not provided', function() {
      const value = {test: 'test'};
      this.priorityQueueMap.bind('test', value, 0);
      this.priorityQueueMap.unbind('test', value);
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

  suite('unbindAll', function() {
    test('Same priorities, provided', function() {
      this.priorityQueueMap.bind('test', 'test1', 10);
      this.priorityQueueMap.bind('test', 'test1', 10);
      this.priorityQueueMap.unbindAll('test', 'test1', 10);
      chai.assert.isUndefined(this.priorityQueueMap.getBindings('test'));
    });

    test('Same priorities, not provided', function() {
      this.priorityQueueMap.bind('test', 'test1', 10);
      this.priorityQueueMap.bind('test', 'test1', 10);
      this.priorityQueueMap.unbindAll('test', 'test1');
      chai.assert.isUndefined(this.priorityQueueMap.getBindings('test'));
    });

    test('Different priorities, provided', function() {
      this.priorityQueueMap.bind('test', 'test1', 10);
      this.priorityQueueMap.bind('test', 'test1', 10);
      this.priorityQueueMap.bind('test', 'test1', 0);
      this.priorityQueueMap.unbindAll('test', 'test1', 10);
      this.assertBindings('test', {value: 'test1', priority: 0});
    });

    test('Different priorities, not provided', function() {
      this.priorityQueueMap.bind('test', 'test1', 10);
      this.priorityQueueMap.bind('test', 'test1', 10);
      this.priorityQueueMap.bind('test', 'test1', 0);
      this.priorityQueueMap.unbindAll('test', 'test1');
      chai.assert.isUndefined(this.priorityQueueMap.getBindings('test'));
    });
  });

  suite('unbindMatching', function() {
    test('Simple', function() {
      this.priorityQueueMap.bind('test', 'test1', 10);
      this.priorityQueueMap.unbindMatching('test', () => true);
      chai.assert.isUndefined(this.priorityQueueMap.getBindings('test'));
    });

    test('With priority X', function() {
      this.priorityQueueMap.bind('test', 'test1', 10);
      this.priorityQueueMap.bind('test', 'test2', 20);
      this.priorityQueueMap.bind('test', 'test3', 30);
      this.priorityQueueMap.unbindMatching(
          'test', (value, priority) => priority == 30);
      this.assertBindings('test', {value: 'test2', priority: 20});
    });

    test('With falsey value', function() {
      this.priorityQueueMap.bind('test', 'test1', 10);
      this.priorityQueueMap.bind('test', false, 20);
      this.priorityQueueMap.unbindMatching(
          'test', (value, priority) => !value);
      this.assertBindings('test', {value: 'test1', priority: 10});
    });

    test('Similar object', function() {
      this.priorityQueueMap.bind('test', 'test1', 10);
      this.priorityQueueMap.bind('test', {objKey: 'value', test: 'stuff'}, 20);
      this.priorityQueueMap.unbindMatching(
          'test', (value, priority) => value.objKey == 'value');
      this.assertBindings('test', {value: 'test1', priority: 10});
    });
  });

  suite('unbindAllMatching', function() {
    test('Simple', function() {
      this.priorityQueueMap.bind('test', 'test1', 10);
      this.priorityQueueMap.bind('test', 'test1', 10);
      this.priorityQueueMap.unbindAllMatching('test', () => true);
      chai.assert.isUndefined(this.priorityQueueMap.getBindings('test'));
    });

    test('All with priority X', function() {
      this.priorityQueueMap.bind('test', 'test1', 10);
      this.priorityQueueMap.bind('test', 'test2', 20);
      this.priorityQueueMap.bind('test', 'test3', 30);
      this.priorityQueueMap.bind('test', 'test4', 30);
      this.priorityQueueMap.unbindAllMatching(
          'test', (value, priority) => priority == 30);
      this.assertBindings('test', {value: 'test2', priority: 20});
    });

    test('All with falsey value', function() {
      this.priorityQueueMap.bind('test', 'test1', 10);
      this.priorityQueueMap.bind('test', false, 20);
      this.priorityQueueMap.bind('test', 0, 30);
      this.priorityQueueMap.unbindAllMatching(
          'test', (value, priority) => !value);
      this.assertBindings('test', {value: 'test1', priority: 10});
    });

    test('All similar objects', function() {
      this.priorityQueueMap.bind('test', 'test1', 10);
      this.priorityQueueMap.bind('test', {objKey: 'value', test: 'stuff'}, 20);
      this.priorityQueueMap.bind('test', {objKey: 'value', stuff: 'test'}, 30);
      this.priorityQueueMap.unbindAllMatching(
          'test', (value, priority) => value.objKey == 'value');
      this.assertBindings('test', {value: 'test1', priority: 10});
    });
  });

  suite('has', function() {
    test('Does have', function() {
      this.priorityQueueMap.bind('test', 'test', 10);
      chai.assert.isTrue(
          this.priorityQueueMap.has('test'),
          `Expected the priority queue map to have the key 'test'`);
    });

    test(`Doesn't have`, function() {
      chai.assert.isFalse(
          this.priorityQueueMap.has('test'),
          `Expected the priority queue map to not have the key 'test'`);
    });
  });

  suite('hasValue', function() {
    setup(function() {
      this.assertHasValue = function(key, value, priority = undefined) {
        chai.assert.isTrue(
            this.priorityQueueMap.hasValue(key, value, priority),
            `Expected the priority queue map to have the binding {key: ${key},
value: ${value}, priority: ${priority !== undefined ? priority : 'any'}}.`);
      };

      this.assertNotHasValue = function(key, value, priority = undefined) {
        chai.assert.isFalse(
            this.priorityQueueMap.hasValue(key, value, priority),
            `Expected the priority queue map to not have the binding
{key: ${key}, value: ${value}, priority:
${priority !== undefined ? priority : 'any'}}.`);
      };
    });

    test('Simple', function() {
      this.priorityQueueMap.bind('test', 'test', 0);
      this.assertHasValue('test', 'test', 0);
    });

    test('No bindings', function() {
      this.assertNotHasValue('test', 'test', 0);
    });

    test('Priority not provided', function() {
      this.priorityQueueMap.bind('test', 'test', 0);
      this.assertHasValue('test', 'test');
    });

    test('Stringified value', function() {
      this.priorityQueueMap.bind('test', 1, 0);
      this.assertNotHasValue('test', '1', 0);
    });

    test('Similar object value', function() {
      this.priorityQueueMap.bind('test', {test: 'test'}, 0);
      this.assertNotHasValue('test', {test: 'test'}, 0);
    });

    test('Same object value', function() {
      const value = {test: 'test'};
      this.priorityQueueMap.bind('test', value, 0);
      this.assertHasValue('test', value, 0);
    });

    test('Same object, priority not provided', function() {
      const value = {test: 'test'};
      this.priorityQueueMap.bind('test', value, 0);
      this.assertHasValue('test', value);
    });

    test('Different priority', function() {
      this.priorityQueueMap.bind('test', 'test', 0);
      this.assertNotHasValue('test', 'test', 10);
    });

    test('Stringified priority', function() {
      this.priorityQueueMap.bind('test', 'test', 0);
      this.assertNotHasValue('test', 'test', '0');
    });
  });

  suite('hasMatchingValue', function() {
    test('Simple', function() {
      this.priorityQueueMap.bind('test', 'test1', 10);
      chai.assert.isTrue(this.priorityQueueMap.hasMatchingValue(
          'test', () => true));
    });

    test('With priority X', function() {
      this.priorityQueueMap.bind('test', 'test1', 10);
      chai.assert.isTrue(this.priorityQueueMap.hasMatchingValue(
          'test', (value, priority) => priority == 10));
    });

    test('Falsey value', function() {
      this.priorityQueueMap.bind('test', false, 10);
      chai.assert.isTrue(this.priorityQueueMap.hasMatchingValue(
          'test', (value, priority) => !value));
    });

    test('Similar object', function() {
      this.priorityQueueMap.bind('test', {objKey: 'value'}, 10);
      chai.assert.isTrue(this.priorityQueueMap.hasMatchingValue(
          'test', (value, priority) => value.objKey == 'value'));
    });
  });

  suite('filter', function() {
    setup(function() {
      this.assertFilter = function(key, filterFn, ...values) {
        chai.assert.deepEqual(
            this.priorityQueueMap.filter(key, filterFn), values);
      };
    });

    test('Simple', function() {
      this.priorityQueueMap.bind('test', 'test1', 10);
      this.assertFilter('test', () => true, {value: 'test1', priority: 10});
    });

    test('With priority X', function() {
      this.priorityQueueMap.bind('test', 'test1', 10);
      this.priorityQueueMap.bind('test', 'test2', 20);
      this.assertFilter('test', (value, priority) => priority == 10,
          {value: 'test1', priority: 10});
    });

    test('Falsey value', function() {
      this.priorityQueueMap.bind('test', 'test1', 10);
      this.priorityQueueMap.bind('test', false, 20);
      this.assertFilter('test', (value, priority) => !value,
          {value: false, priority: 20});
    });

    test('Similar objects', function() {
      this.priorityQueueMap.bind('test', 'test1', 10);
      this.priorityQueueMap.bind('test', {objKey: 'value'}, 20);
      this.assertFilter('test', (value, priority) => value.objKey == 'value',
          {value: {objKey: 'value'}, priority: 20});
    });
  });

  suite('forEach', function() {
    test('Simple', function() {
      this.priorityQueueMap.bind('test1', 'test1', 0);
      this.priorityQueueMap.bind('test2', 'test2', 10);
      this.priorityQueueMap.bind('test3', 'test3', 20);
      const spy = sinon.spy();
      this.priorityQueueMap.forEach(spy);

      chai.assert.isTrue(spy.calledThrice, 'Expected 3 callbacks');
      chai.assert.isTrue(
          spy.calledWith('test1', 'test1', 0),
          `Expected callback to be called with 'test1', 'test1', and 0`);
      chai.assert.isTrue(
          spy.calledWith('test2', 'test2', 10),
          `Expected callback to be called with 'test2', 'test2', and 10`);
      chai.assert.isTrue(
          spy.calledWith('test3', 'test3', 20),
          `Expected callback to be called with 'test3', 'test3', and 20`);
    });

    test('No keys', function() {
      const spy = sinon.spy();
      this.priorityQueueMap.forEach(spy);
      chai.assert.isTrue(spy.notCalled);
    });

    test('No bindings', function() {
      this.priorityQueueMap.bind('test', 'test1', 0);
      this.priorityQueueMap.unbind('test', 'test1', 0);
      const spy = sinon.spy();
      this.priorityQueueMap.forEach(spy);
      chai.assert.isTrue(spy.notCalled);
    });
  });

  suite('forEachBinding', function() {
    test('Simple', function() {
      this.priorityQueueMap.bind('test', 'test1', 0);
      this.priorityQueueMap.bind('test', 'test2', 10);
      this.priorityQueueMap.bind('test', 'test3', 20);
      const spy = sinon.spy();
      this.priorityQueueMap.forEachBinding('test', spy);

      chai.assert.isTrue(spy.calledThrice, 'Expected 3 callbacks');
      chai.assert.isTrue(
          spy.calledWith('test1', 0),
          `Expected callback to be called with  'test1', and 0`);
      chai.assert.isTrue(
          spy.calledWith('test2', 10),
          `Expected callback to be called with 'test2', and 10`);
      chai.assert.isTrue(
          spy.calledWith('test3', 20),
          `Expected callback to be called with 'test3', and 20`);
    });

    test('Bad key', function() {
      const spy = sinon.spy();
      this.priorityQueueMap.forEachBinding('test', spy);
      chai.assert.isTrue(spy.notCalled);
    });

    test('No bindings', function() {
      this.priorityQueueMap.bind('test', 'test1', 0);
      this.priorityQueueMap.unbind('test', 'test1', 0);
      const spy = sinon.spy();
      this.priorityQueueMap.forEachBinding('test', spy);
      chai.assert.isTrue(spy.notCalled);
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
