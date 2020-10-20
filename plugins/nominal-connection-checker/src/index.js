/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A Blockly plugin that allows you to create more advanced
 * connection checks.
 */

import * as Blockly from 'blockly/core';
import {TypeHierarchy} from './type_hierarchy';
import {getCheck, isExplicitConnection} from './utils';
import {PriorityQueueMap} from './priority_queue_map';

// TODO: Fix the version of Blockly being required in package.json.

/**
 * A connection checker that is targeted at helping Blockly model languages with
 * complex nominal typing systems, like C++, Java, or Rust.
 * @implements {Blockly.IConnectionChecker}
 */
export class NominalConnectionChecker extends Blockly.ConnectionChecker {
  /**
   * Constructs the connection checker.
   * @param {!Blockly.Workspace} workspace The workspace this connection checker
   *     belongs to.
   */
  constructor(workspace) {
    super();

    /**
     * The workspace this connection checker belongs to.
     * @type {!Blockly.Workspace}
     * @private
     */
    this.workspace_ = workspace;

    /**
     * The type hierarchy used by this connection checker. Defines which types
     * are subtypes of which other types.
     * @type {?TypeHierarchy}
     * @private
     */
    this.typeHierarchy_ = null;

    /**
     * A map of block ids to priority queue maps that associated generic types
     * with explicit types.
     * @type {Map<string, PriorityQueueMap<string, string>>}
     * @private
     */
    this.explicitBindings_ = new Map();
  }

  /**
   * Initializes the connection checker with the given hierarchy def.
   * @param {!Object} hierarchyDef The definition of our type hierarchy.
   * TODO: Add some sort of JSON schema for the hierarchy.
   */
  init(hierarchyDef) {
    this.typeHierarchy_ = new TypeHierarchy(hierarchyDef);
  }

  /**
   * @override
   */
  doTypeChecks(a, b) {
    const {parent, child} = this.getParentAndChildConnections_(a, b);
    const parentType = this.getExplicitTypeOfConnection(parent);
    const childType = this.getExplicitTypeOfConnection(child);
    const typeHierarchy = this.getTypeHierarchy_();

    if (!parentType || !childType) {
      // At least one is an unbound generic.
      return true;
    }
    return typeHierarchy.typeFulfillsType(childType, parentType);
  }

  /**
   * Returns the explicit type of the block generic type pair, if an explicit
   * type can be found. If one cannot be found, this returns undefined.
   * @param {!Blockly.Block} block The block that provides the context for the
   *     genericType.
   * @param {string} genericType The generic type we want to get the explicit
   *     type of.
   * @return {undefined|string} The explicit type bound to the generic type, if
   *     one can be found. Undefined otherwise.
   */
  getExplicitType(block, genericType) {
    genericType = genericType.toLowerCase();
    return this.getBoundType_(block, genericType);
  }

  /**
   * Returns the explicit type of the given connection. If the connection is
   * itself explicit, this just returns that type. If the connection is generic
   * it attempts to find an explicit type bound to it. If one cannot be found,
   * this returns undefined.
   * @param {!Blockly.Connection} connection The connection to find the explicit
   *     type of.
   * @return {undefined|string} The explicit type of the connection, or
   *     undefined if one cannot be found.
   */
  getExplicitTypeOfConnection(connection) {
    const check = getCheck(connection);
    return isExplicitConnection(connection) ? check:
        this.getBoundType_(connection.getSourceBlock(), check);
  }

  /**
   * Binds the genericType to the explicitType in the context of the given
   * block. Higher priority explicit types override lower priority types.
   * @param {!Blockly.Block} block The block that provides context for the
   *     generic type binding.
   * @param {string} genericType The generic type that we want to bind.
   * @param {string} explicitType The explicit type we want to bind the generic
   *     type to.
   * @param {number} priority The priority of the binding.
   */
  bindType(block, genericType, explicitType, priority) {
    genericType = genericType.toLowerCase();
    explicitType = explicitType.toLowerCase();
    let queueMap = this.explicitBindings_.get(block.id);
    if (!queueMap) {
      queueMap = new PriorityQueueMap();
      this.explicitBindings_.set(block.id, queueMap);
    }
    queueMap.bind(genericType, explicitType, priority);
    // TODO: Add checking that connections are still valid.
  }

  /**
   * Unbinds the genericType from the explicitType in the context of the given
   * block. Only unbinds if the priority of the binding associated with the
   * given explicitType is the same as the provided priority.
   * @param {!Blockly.Block} block The block that provides context for the
   *     generic type binding.
   * @param {string} genericType The generic type that we want to unbind.
   * @param {string} explicitType The explicit type that we want to unbind the
   *     genericType from.
   * @param {number} priority The priority of the binding to unbind.
   * @return {boolean} True if the binding existed previously, false if it did
   *     not.
   */
  unbindType(block, genericType, explicitType, priority) {
    genericType = genericType.toLowerCase();
    explicitType = explicitType.toLowerCase();
    if (this.explicitBindings_.has(block.id)) {
      return this.explicitBindings_.get(block.id).unbind(
          genericType, explicitType, priority);
    }
    return false;
    // TODO: Add checking that connections are still valid.
  }

  /**
   * Returns the type hierarchy if this connection checker has been initialized.
   * Otherwise throws an error.
   * @return {!TypeHierarchy} The type hierarchy of this connection checker.
   * @throws {Error}
   * @private
   */
  getTypeHierarchy_() {
    if (!this.typeHierarchy_) {
      throw Error('The connection checker has not been initialized.');
    }
    return /** @type{!TypeHierarchy} */ (this.typeHierarchy_);
  }

  /**
   * Returns an object which has the two given connections correctly assigned
   * to either 'parent' or 'child' depending on which is the parent connection
   * and which is the child connection.
   * @param {!Blockly.Connection} a The first connection.
   * @param {!Blockly.Connection} b The second connection.
   * @return {{parent: !Blockly.Connection, child: !Blockly.Connection}} An
   *     object containing the connections, which are now correctly assigned to
   *     either 'parent' or 'child'.
   * @private
   */
  getParentAndChildConnections_(a, b) {
    if (a.isSuperior()) {
      return {
        parent: a,
        child: b,
      };
    } else {
      return {
        parent: b,
        child: a,
      };
    }
  }

  /**
   * Returns the explicit type bound to the block generic type pair if one
   * exists. Returns undefined otherwise.
   * @param {!Blockly.Block} block The block that provides the context for the
   *     explicit binding.
   * @param {string} genericType The generic type we want to get the bound
   *     explicit type of.
   * @param {!Blockly.Connection=} connectionToSkip The connection to skip. If
   *     the connection matches this connection, it will be ignored.
   * @return {undefined|string} The explicit type bound to the connection's
   *     connection check if one exists.
   * @private
   */
  getBoundType_(block, genericType, connectionToSkip = undefined) {
    let externalBinding = {priority: 0};
    if (this.explicitBindings_.has(block.id)) {
      // TODO: Do type unification.
      const externalBindings = this.explicitBindings_.get(block.id)
          .getBindings(genericType);
      if (externalBindings) {
        externalBinding = externalBindings[0];
      }
      if (externalBinding.priority > OUTPUT_PRIORITY) {
        return externalBinding.value;
      }
    }

    const boundType = this.getConnectionType_(
        block.outputConnection, genericType, connectionToSkip);
    if (boundType) {
      return boundType;
    }

    if (externalBinding && externalBinding.priority > INPUT_PRIORITY) {
      return externalBinding.value;
    }

    // Inputs have equal priority, so we need to unify them.
    const boundTypes = [];
    for (const input of block.inputList) {
      const boundType = this.getConnectionType_(
          input.connection, genericType, connectionToSkip);
      if (boundType) {
        boundTypes.push(boundType);
      }
    }

    if (boundTypes.length) {
      // TODO: Actually do unification.
      return boundTypes[0];
    }

    return externalBinding.priority ? externalBinding.value : undefined;
  }

  /**
   * Acts as a helper for the getBoundType_ function *and should only be used
   * as such*. Only operates on the connection if its check matches the passed
   * genericType, it is an input or output connection, and it is not the
   * connectionToSkip. Returns the bound type associated with this connection,
   * or undefined if one is not found.
   * @param {!Blockly.Connection} connection The connection to get the bound
   *     type of.
   * @param {string} genericType The generic type to find the bound type of.
   * @param {!Blockly.Connection} connectionToSkip The connection to skip. If
   *     the connection matches this connection, it will be ignored.
   * @return {undefined|string} The bound type associated with the passed
   *     connection, or undefined if one is not found.
   * @private
   */
  getConnectionType_(connection, genericType, connectionToSkip) {
    if (!connection ||
        connection == connectionToSkip ||
        connection.type == Blockly.NEXT_STATEMENT ||
        getCheck(connection) != genericType ||
        !connection.targetConnection) {
      return;
    }

    const target = connection.targetConnection;
    const check = getCheck(target);
    if (isExplicitConnection(target)) {
      return check;
    }
    return this.getBoundType_(
        target.getSourceBlock(), check, target);
  }
}

export const registrationType = Blockly.registry.Type.CONNECTION_CHECKER;
export const registrationName = 'NominalConnectionChecker';

// Register the checker so that it can be used by name.
Blockly.registry.register(
    registrationType, registrationName, NominalConnectionChecker);

export const pluginInfo = {
  [registrationType]: registrationName,
};

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
 * The minimum priority that can/should be passed to the bindType function.
 * @type {number}
 */
export const MIN_PRIORITY = 0;

/**
 * The maximum priority that can/should be passed to the bindType function.
 * @type {number}
 */
export const MAX_PRIORITY = Number.MAX_SAFE_INTEGER;
