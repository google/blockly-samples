/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Defines the GenericMap.
 */
'use strict';

import {PriorityQueueMap} from './priority_queue_map';

/**
 * The priority for binding an explicit type to a generic type based on an input
 * of the block with the generic type.
 * @type {number}
 */
export const INPUT_PRIORITY = 100;

/**
 * The priority for binding an explicit type to a generic type based on the
 * output of the block with the generic type.
 * @type {number}
 */
export const OUTPUT_PRIORITY = 200;

/**
 * The minimum priority that can/should be passed to the GenericMap.
 * @type {number}
 */
export const MIN_PRIORITY = 0;

/**
 * The maximum priority that can/should be passed to the GenericMap.
 * @type {number}
 */
export const MAX_PRIORITY = Number.MAX_SAFE_INTEGER;

/**
 * Defines a map where generic types can be bound to explicit types in
 * a given environment.
 */
export class GenericMap {
  /**
   * Constructs the GenericMap.
   * @param {!Blockly.Workspace} workspace The workspace this GenericMap belongs
   *     to.
   */
  constructor(workspace) {
    /**
     * The workspace this GenericMap belongs to.
     * @type {!Blockly.Workspace}
     * @private
     */
    this.workspace_ = workspace;

    /**
     * Map of block ids to PriorityQueMaps that define what the generic types
     * of the block are bound to.
     * @type {!Map<string, !PriorityQueueMap>}
     * @private
     */
    this.dependenciesMap_ = new Map();

    /**
     * Map of block ids to objects that map generic type names to arrays of
     * DependerInfo specifying what other blocks and generic types on those
     * blocks depend on the generic type of the lookup block.
     * @type {!Map<string, !Map<string, !Array<DependerInfo>>>}
     * @private
     */
    this.dependersMap_ = new Map();
  }

  /**
   * Returns the name of the explicit type bound to the generic type in the
   * context of the given block, or undefined if the type is not bound.
   * @param {string} blockId The block id that the generic type is
   *     possibly bound in.
   * @param {string} genericType The generic type to find the explicit binding
   *     of.
   * @return {undefined|string} The name of the explicit type bound to the
   *     generic type in the context of the given block, or undefined if the
   *     type is not bound.
   */
  getExplicitType(blockId, genericType) {
    genericType = genericType.toLowerCase();
    const priorityMap = this.dependenciesMap_.get(blockId);
    if (!priorityMap) {
      return undefined;
    }
    const types = priorityMap.getValues(genericType);
    if (!types) {
      return undefined;
    }
    // In the future we might add logic to figure out what the super type of all
    // of the types is. But for now there should only be one type bound anyway.
    return types[0];
  }

  /**
   * Binds the given dependerType name to the dependencyType's explicit type in
   * the context of the dependerId. Should only be called if the dependencyType
   * is currently bound to an explicit type in the context of its block.
   * Also associates info about the depender with the dependency so that
   * dependers can be easily removed if the dependency block ever looses its
   * explicit type.
   * @param {string} dependerId The id of the block that is depending on the
   *     dependency block.
   * @param {string} dependerType The name of the generic type in the depender
   *     block that we want to bind to the other type in the dependency block.
   * @param {string} dependencyId The id of the block that the depender block
   *     is depending on.
   * @param {string} dependencyType The name of the generic type in the
   *     dependency block that we want to bind the dependerType to.
   * @param {number} priority The priority of the binding. Higher priority
   *     bindings override lower priority bindings.
   */
  bindTypeToGeneric(
      dependerId, dependerType, dependencyId, dependencyType, priority) {
    if (!this.workspace_.getBlockById(dependerId)) {
      throw Error(
          'The depender id (' + dependerId + ') is not a valid block id');
    }
    if (!this.workspace_.getBlockById(dependencyId)) {
      throw Error(
          'The dependency id (' + dependencyId + ') is not a valid block id');
    }

    const explicitType = this.getExplicitType(dependencyId, dependencyType);
    if (!explicitType) {
      throw Error('The type ' + dependencyType + ' on block ' + dependencyId +
          ' is not bound to an explicit type. The generic type must be bound' +
          ' before another generic type can bind to it.');
    }
    this.bindTypeToExplicit(dependerId, dependerType, explicitType, priority);

    let types = this.dependersMap_.get(dependencyId);
    if (!types) {
      types = new Map();
      this.dependersMap_.set(dependencyId, types);
    }
    let dependers = types.get(dependencyType);
    if (!dependers) {
      dependers = [];
      types.set(dependencyType, dependers);
    }
    dependers.push(new DependerInfo(dependerId, dependerType, dependencyType));
  }

  /**
   * Binds the given genericType name to the explicitType name in the context
   * of the blockId.
   * @param {string} blockId The id of the block to bind the genericType within.
   * @param {string} genericType The name of the generic type that we want to
   *     bind to the explicit type.
   * @param {string} explicitType The name of the explicit type we want to bind
   *     the generic type to.
   * @param {number} priority The priority of the binding. Higher priority
   *     bindings ovveride lower priority bindings.
   */
  bindTypeToExplicit(blockId, genericType, explicitType, priority) {
    genericType = genericType.toLowerCase();
    explicitType = explicitType.toLowerCase();
    let queueMap = this.dependenciesMap_.get(blockId);
    if (!queueMap) {
      queueMap = new PriorityQueueMap();
      this.dependenciesMap_.set(blockId, queueMap);
    }
    queueMap.bind(genericType, explicitType, priority);

    // TODO: Flow through all other connections if necessary.
    //   Make sure to update them if we get a higher priority binding.
  }

  /**
   * Unbinds the given dependerType name from the dependencyType's explicit type
   * in the context of the dependerId.
   * Also de-associates info about the depender from the dependency.
   * @param {string} dependerId The id of the block that is depending on the
   *     dependency block.
   * @param {string} dependerType The name of the generic type in the depender
   *     block that we want to unbind from the other type on in the dependency
   *     block.
   * @param {string} dependencyId The id of the block that the depender block
   *     was depending on.
   * @param {string} dependencyType The name of the generic type in the
   *     dependency block that we want to unbind the dependerType from.
   * @param {number} priority The priority of the binding to remove.
   */
  unbindTypeFromGeneric(
      dependerId, dependerType, dependencyId, dependencyType, priority) {
    const types = this.dependersMap_.get(dependencyId);
    if (!types) {
      return;
    }
    const dependers = types.get(dependencyType);
    if (!dependers) {
      return;
    }
    const index = dependers.findIndex((elem) => {
      return elem.blockId == dependerId &&
          elem.dependerType == dependerType &&
          elem.dependencyType == dependencyType;
    });
    if (index != -1) {
      const explicitType = this.getExplicitType(dependencyId, dependencyType);
      this.unbindTypeFromExplicit(
          dependerId, dependerType, explicitType, priority);
      dependers.splice(index, 1);
    }
  }

  /**
   * Unbinds the given generic type name from the explicit type name in the
   * context of the blockId.
   * @param {string} blockId The the block to unbind the types in.
   * @param {string} genericType The name of the generic type to unbind from the
   *     explicit type.
   * @param {string} explicitType The name of the explicit type to unbind from
   *     the generic type.
   * @param {number} priority The priority of the binding to remove.
   */
  unbindTypeFromExplicit(blockId, genericType, explicitType, priority) {
    genericType = genericType.toLowerCase();
    explicitType = explicitType.toLowerCase();
    if (this.dependenciesMap_.has(blockId)) {
      this.dependenciesMap_.get(blockId).unbind(
          genericType, explicitType, priority);
    }
    // TODO: Flow through all other connections.
  }
}

/**
 * A class containing info about a depender. Used to tell the depender to stop
 * depending on the block it is depending on.
 */
class DependerInfo {
  /**
   * Constructs a DependerInfo.
   * @param {string} blockId The id of the depender block.
   * @param {string} dependerType The type on the depender block that is
   *     depending on a generic type on another block.
   * @param {string} dependencyType The generic type on the other block that the
   *     dependerType is depending on.
   */
  constructor(blockId, dependerType, dependencyType) {
    this.blockId = blockId;
    this.dependerType = dependerType;
    this.dependencyType = dependencyType;
  }
}
