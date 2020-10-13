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
import {GenericMap, INPUT_PRIORITY, OUTPUT_PRIORITY} from './generic_map';
import {getCheck, isGenericConnection, isExplicitConnection} from './utils';

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
     * The generic map used by this connection checker. Used to bind generic
     * types to explicit types within the context of blocks.
     * @type {!GenericMap}
     * @private
     */
    this.genericMap_ = new GenericMap(workspace);
  }

  /**
   * Initializes the connection checker with the given hierarchy def.
   * @param {!Object} hierarchyDef The definition of our type hierarchy.
   * TODO: Add some sort of JSON schema for the hierarchy.
   */
  init(hierarchyDef) {
    this.typeHierarchy_ = new TypeHierarchy(hierarchyDef);
    this.workspace_.addChangeListener(this.onChangeListener_.bind(this));
  }

  /**
   * @override
   */
  doTypeChecks(a, b) {
    const {parent, child} = this.getParentAndChildConnections_(a, b);
    const parentType = this.getExplicitType_(parent);
    const childType = this.getExplicitType_(child);
    const typeHierarchy = this.getTypeHierarchy_();

    if (!parentType || !childType) {
      // At least one is an unbound generic.
      return true;
    }
    return typeHierarchy.typeFulfillsType(childType, parentType);
  }

  /**
   * Listens to changes on the workspace, and handles things like binding and
   * unbinding generic types to explicit types.
   * @param {!Blockly.Event} e The current event.
   * @private
   */
  onChangeListener_(e) {
    if (e.type != Blockly.Events.BLOCK_MOVE) {
      return;
    }

    const childBlock = this.workspace_.getBlockById(e.blockId);
    const childCon = childBlock.outputConnection;
    if (!childCon) {
      // Ignore statement blocks for now;
      return;
    }

    const genericMap = this.getGenericMap();
    let parentBlock;
    let parentCon;
    let explicitFn;
    let genericFn;
    if (e.newParentId) {
      parentBlock = this.workspace_.getBlockById(e.newParentId);
      parentCon = parentBlock.getInput(e.newInputName).connection;
      explicitFn = GenericMap.prototype.bindTypeToExplicit.bind(genericMap);
      genericFn = GenericMap.prototype.bindTypeToGeneric.bind(genericMap);
    } else if (e.oldParentId) {
      parentBlock = this.workspace_.getBlockById(e.oldParentId);
      parentCon = parentBlock.getInput(e.oldInputName).connection;
      explicitFn = GenericMap.prototype.unbindTypeFromExplicit.bind(genericMap);
      genericFn = GenericMap.prototype.unbindTypeFromGeneric.bind(genericMap);
    } else {
      return;
    }

    const childCheck = getCheck(childCon);
    const parentCheck = getCheck(parentCon);
    if (isExplicitConnection(parentCon)) {
      if (isGenericConnection(childCon)) {
        explicitFn(childBlock.id, childCheck, parentCheck, OUTPUT_PRIORITY);
      }
    } else if (isExplicitConnection(childCon)) {
      explicitFn(parentBlock.id, parentCheck, childCheck, INPUT_PRIORITY);
    } else {
      const parentIsBound = !!this.getBoundType_(parentCon);
      const childIsBound = !!this.getBoundType_(childCon);
      if (parentIsBound) {
        genericFn(
            childBlock.id,
            childCheck,
            parentBlock.id,
            parentCheck,
            OUTPUT_PRIORITY);
      }
      if (childIsBound) {
        genericFn(
            parentBlock.id,
            parentCheck,
            childBlock.id,
            childCheck,
            INPUT_PRIORITY);
      }
    }
  }

  /**
   * Returns the GenericMap of this connection checker.
   * @return {!GenericMap} The GenericMap of this connection checker.
   */
  getGenericMap() {
    return this.genericMap_;
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
   * Returns the explicit type bound to the connection's connection check if one
   * exists. This will return undefined if the connection's connection check is
   * explicit, or if it is generic and not bound.
   * @param {!Blockly.Connection} connection The connection to get the bound
   *     type of.
   * @return {undefined|string} The explicit type bound to the connection's
   *     connection check if one exists.
   * @private
   */
  getBoundType_(connection) {
    return this.getGenericMap().getExplicitType(
        connection.getSourceBlock().id, getCheck(connection));
  }

  /**
   * Returns the explicit type of the connection. If the connection's check is
   * explicit, this just returns that. If the connection's check is generic it
   * returns the type bound to its generic check, if it exists. If it does not
   * exist this returns undefined.
   * @param {!Blockly.Connection} connection The connection to get the explicit
   *     type of.
   * @return {undefined|string} The explicit type, if one exists.
   * @private
   */
  getExplicitType_(connection) {
    const typeName = getCheck(connection);
    return isExplicitConnection(connection) ? typeName :
        this.getGenericMap().getExplicitType(
            connection.getSourceBlock().id, typeName);
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
