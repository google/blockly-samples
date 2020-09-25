/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Defines the PriorityQueueMap and its helper prototypes.
 */
'use strict';

/**
 * A map where keys can be bound to multiple values, which are given a priority.
 * When you get the value of a key it returns all of the values with the highest
 * priority.
 */
export class PriorityQueueMap {
  /**
   * Constructs the PriorityQueueMap.
   */
  constructor() {
    /**
     * Maps the keys to an array of Bindings.
     * @type {!Map<*, !Array<Binding>>}
     * @private
     */
    this.map_ = new Map();
  }

  /**
   * Returns the highest priority values for the given key. Or undefined if the
   * key is not bound.
   * @param {*} key The key to find the value of.
   * @return {undefined|!Array<*>} The highest priority values for the given
   *     key. Or undefined if the key is not bound.
   */
  getValues(key) {
    const bindings = this.getBindings(key);
    return bindings && bindings.map((binding) => binding.value);
  }

  /**
   * Returns the highest priority Bindings for the given key. Or undefined if
   * the key is not bound.
   * @param {*} key The key to find the binding of.
   * @return {undefined|!Array<!Binding>} The highest priority Bindings for the
   *     given key. Or undefined if the key is not bound.
   */
  getBindings(key) {
    const bindings = this.map_.get(key);
    if (!bindings || !bindings.length) {
      return undefined;
    }
    let highestBindings = [bindings[0]];
    let highestPriority = bindings[0].priority;
    for (let i = 1, binding; (binding = bindings[i]); i++) {
      if (binding.priority > highestPriority) {
        highestPriority = binding.priority;
        highestBindings = [binding];
      } else if (binding.priority == highestPriority) {
        highestBindings.push(binding);
      }
    }
    return highestBindings;
  }

  /**
   * Returns all values associated with the given key, or undefined if the key
   * is not bound. Order is not guaranteed.
   * @param {*} key The key to return the values of.
   * @return {undefined|!Array<*>} An array of all of the values associated with
   *     the given key.
   */
  getAllValues(key) {
    const bindings = this.getAllBindings();
    return bindings && bindings.map((binding) => binding.value);
  }

  /**
   * Returns all Bindings associated with the given key, or undefined if the
   * key is not bound.
   * @param {*} key The key to return the bindings of.
   * @return {undefined|!Array<!Binding>} An array of all of the bindings
   *     associated with the given key.
   */
  getAllBindings(key) {
    const bindings = this.map_.get(key);
    return (!bindings || !bindings.length) ? undefined : bindings;
  }

  /**
   * Adds the given value with the associated priority to the key's priority
   * queue of values.
   * @param {*} key The key to bind the value to.
   * @param {*} value The value to bind to the key.
   * @param {number} priority The priority of the binding.
   */
  bind(key, value, priority) {
    let bindings = this.map_.get(key);
    if (!bindings) {
      bindings = [];
      this.map_.set(key, bindings);
    }
    bindings.push(new Binding(value, priority));
  }

  /**
   * Removes the first instance of the given value from the key's priority queue
   * of values. If a priority is provided a value will only be removed if it has
   * a matching priority.
   * @param {*} key The key to unbind the value from.
   * @param {*} value The value to unbind from the key.
   * @param {number=} opt_priority The priority of the binding.
   * @return {boolean} True if the binding existed, false otherwise.
   */
  unbind(key, value, opt_priority) {
    return this.unbindMatching(
        key, this.createSimpleMatcher_(value, opt_priority));
  }

  /**
   * Removes all instances of the given value from the key's priority queue of
   * values. If a priority is provided a value will only be removed if it has a
   * matching priority.
   * @param {*} key The key to remove bindings from.
   * @param {*} value The value to unbind from the key.
   * @param {number=} opt_priority The priority of the bindings.
   */
  unbindAll(key, value, opt_priority) {
    this.unbindAllMatching(
        key, this.createSimpleMatcher_(value, opt_priority));
  }

  /**
   * Removes the first binding associated with the given key that has the given
   * priority, and that will make the matcher return true from the key's
   * priority queue of values.
   * @param {*} key The key to unbind a value from.
   * @param {function(*, number):boolean} matcher The callback function used to
   *     test each binding. Takes in the binding's value and priority.
   * @return {boolean} True if a matching binding existed, false otherwise.
   */
  unbindMatching(key, matcher) {
    const bindings = this.getAllBindings(key);
    if (!bindings) {
      return false;
    }
    const index = bindings.findIndex((binding) => {
      return matcher(binding.value, binding.priority);
    });
    if (index != -1) {
      bindings.splice(index, 1);
    }
    return index != -1;
  }

  /**
   * Removes all bindings associate with the given key that make the matcher
   * return true.
   * @param {string} key The key to remove bindings from.
   * @param {function(*, number):boolean} matcher The callback function used to
   *     test each element.
   */
  unbindAllMatching(key, matcher) {
    if (this.unbindMatching(key, matcher)) {
      this.unbindAllMatching(key, matcher);
    }
  }

  /**
   * Returns true if the key's priority queue contains the given value. If a
   * priority is provided this will only return true if the value also has the
   * given priority.
   * @param {*} key The key we want to examine the values of.
   * @param {*} value The value to search for.
   * @param {number=} opt_priority The priority the value should have.
   * @return {boolean} True if key's priority queue contains the given value,
   *     and in the case that a priority is provided the priority matches. False
   *     otherwise.
   */
  has(key, value, opt_priority) {
    return this.hasMatching(
        key, this.createSimpleMatcher_(value, opt_priority));
  }

  /**
   * Returns true if there is at least one binding associated with the given key
   * that will make the matcher return true.
   * @param {*} key The key we want to examine the bindings of.
   * @param {function(*, number):boolean} matcher The callback function used to
   *     test each element.
   * @return {boolean} True if there is at least one binding associated with the
   *     given key that will make the the matcher return true. False otherwise.
   */
  hasMatching(key, matcher) {
    const bindings = this.getAllBindings(key);
    if (!bindings) {
      return false;
    }
    return bindings.some((binding) => {
      return matcher(binding.value, binding.priority);
    });
  }

  /**
   * Returns an array of all bindings that pass the test implemented by the
   * matcher function.
   * @param {string} key The key to filter the bindings of.
   * @param {function(*, number):boolean} matcher The callback function used to
   *     test each element.
   * @return {!Array<!Binding>} An array of matching bindings. If no bindings
   *     match an empty array will be returned.
   */
  filter(key, matcher) {
    const array = [];
    const bindings = this.getAllBindings(key);
    if (bindings) {
      bindings.forEach((binding) => {
        if (matcher(binding.value, binding.priority)) {
          array.push(binding);
        }
      });
    }
    return array;
  }

  /**
   * Executes the callback once for each binding on each key. Order is not
   * guaranteed.
   * @param {function(string, *, number)} callback The callback to execute on
   *     each binding of each key. Takes in the key, and the value, and the
   *     priority of the binding.
   */
  forEach(callback) {
    this.map_.forEach((key, bindings) => {
      bindings.forEach((binding) => {
        callback(key, binding.value, binding.priority);
      });
    });
  }

  /**
   * Executes the callback once for each binding associated with the given key.
   * Order is not guaranteed.
   * @param {string} key The key to enumerate over the bindings of.
   * @param {function(*, number)} callback The callback to execute on each
   *     binding associated with the given key. Tkaes in the value and the
   *     priority of the binding.
   */
  forEachBinding(key, callback) {
    const bindings = this.getAllBindings(key);
    if (!bindings) {
      return;
    }
    bindings.forEach((binding) => {
      callback(binding.value, binding.priority);
    });
  }

  /**
   * Returns a basic matcher that returns true if the values match. If a
   * priority is also provided it only returns true if the priority matches as
   * well.
   * @param {*} value The value to match.
   * @param {number} opt_priority The priority to match.
   * @return {function(*, number): boolean} A simple matcher function.
   * @private
   */
  createSimpleMatcher_(value, opt_priority) {
    return (val, priority) => {
      return (opt_priority === undefined || priority === opt_priority) &&
          val === value;
    };
  }
}

/**
 * Represents a value with the given priority for use in the PriorityQueueMap.
 */
class Binding {
  /**
   * Constructs the binding object.
   * @param {*} value The value of the binding.
   * @param {number} priority The priority of the binding.
   */
  constructor(value, priority) {
    // We cannot allow stringified numbers because we do comparison tests.
    if (isNaN(priority) || typeof priority != 'number') {
      throw Error('A binding\'s priority must be a number.');
    }
    this.value = value;
    this.priority = priority;
  }
}
