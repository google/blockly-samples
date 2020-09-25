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
   * Removes the given value with the associated priority from the key's
   * priority queue of values.
   * @param {*} key The key to unbind the value from.
   * @param {*} value The value to unbind from the key.
   * @param {number} priority The priority of the binding.
   */
  unbind(key, value, priority) {
    const bindings = this.map_.get(key);
    if (!bindings) {
      return;
    }
    const index = bindings.findIndex((binding) =>
      binding.value === value && binding.priority === priority);
    if (index != -1) {
      bindings.splice(index, 1);
    }
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
