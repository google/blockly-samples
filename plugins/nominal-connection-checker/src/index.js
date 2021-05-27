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
import {parseType, structureToString, TypeStructure} from './type_structure';
import {getCheck, isExplicitConnection, isGenericConnection} from './utils';


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
     * A map of blocks to maps that associated generic types with explicit
     * types.
     * @type {WeakMap<!Blockly.Block, Map<string, string>>}
     * @private
     */
    this.explicitBindings_ = new WeakMap();
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
    try {
      return this.doTypeChecksInternal_(a, b);
    } catch (e) {
      throw new ConnectionCheckError(
          'Checking the compatibility of the ' + this.getInputName_(a) +
          ' and ' + this.getInputName_(b) + ' connections on blocks ' +
          a.getSourceBlock().toDevString() + ' and ' +
          b.getSourceBlock().toDevString() + ' threw an error. ' +
          'Error: ' + e.message, e);
    }
  }

  /**
   * Checks the compatibility of the two connections. This function is called
   * from doTypeChecks, and its purpose is to separate business logic from
   * error handling logic.
   * @param {!Blockly.Connection} a The first connection.
   * @param {!Blockly.Connection} b The second connection.
   * @return {boolean} True if the connections are compatible, false otherwise.
   * @private
   */
  doTypeChecksInternal_(a, b) {
    const {parent, child} = this.getParentAndChildConnections_(a, b);
    const parentTypes = this.getExplicitTypesOfConnectionInternal_(parent);
    const childTypes = this.getExplicitTypesOfConnectionInternal_(child);
    const typeHierarchy = this.getTypeHierarchy_();

    if (!parentTypes.length || !childTypes.length) {
      // At least one is an unbound generic.
      return true;
    }

    // If the parent is only bound by parameters, allow the child block to
    // connect if any of its types share a common ancestor with any of the
    // parent types.
    const parentSource = parent.getSourceBlock();
    const parentCheck = getCheck(parent);
    if (isGenericConnection(parent) &&
        this.typeIsOnlyBoundByParams_(parentSource, parentCheck)) {
      return childTypes.some((childType) => {
        return parentTypes.some((parentType) => {
          return typeHierarchy.getNearestCommonParents(
              parseType(childType), parseType(parentType)).length;
        });
      });
    }

    return childTypes.some((childType) => {
      return parentTypes.some((parentType) => {
        return typeHierarchy.typeFulfillsType(
            parseType(childType), parseType(parentType));
      });
    });
  }

  /**
   * Returns the explicit type(s) of the block generic type pair, if an explicit
   * type can be found.
   *
   * Note that we only get multiple types via type unification of types that
   * are externally bound, or associated with input connections.
   * @param {!Blockly.Block} block The block that provides the context for the
   *     genericType.
   * @param {string} genericType The generic type we want to get the explicit
   *     type of.
   * @return {!Array<string>} The explicit type bound to the generic type, if
   *     one can be found. Undefined otherwise.
   */
  getExplicitTypes(block, genericType) {
    try {
      return this.getBoundTypes_(block, genericType.toLowerCase());
    } catch (e) {
      throw new ConnectionCheckError(
          'Trying to find the explicit types of ' + genericType + ' on block ' +
          block.toDevString() + ' threw an error. ' + 'Error: ' + e.mesage, e);
    }
  }

  /**
   * Returns the explicit type(s) of the given connection. If the connection is
   * itself explicit, this just returns that type. If the connection is generic
   * it attempts to find the explicit type(s) bound to it.
   *
   * Note that we only get multiple types via type unification of types that
   * are externally bound to generic types, or associated with generic
   * input connections.
   * @param {!Blockly.Connection} connection The connection to find the explicit
   *     type of.
   * @return {!Array<string>} The explicit type(s) of the connection.
   */
  getExplicitTypesOfConnection(connection) {
    try {
      return this.getExplicitTypesOfConnectionInternal_(connection);
    } catch (e) {
      throw new ConnectionCheckError(
          'Trying to find the explicit types of the ' +
          this.getInputName_(connection) + ' on block ' +
          connection.getSourceBlock().toDevString() + 'threw an error. ' +
          'Error: ' + e.message, e);
    }
  }

  /**
   * Returns the explicit type(s) of the given connection. This function is
   * called from getExplicitTypesOfConnection, and its purpose is to separate
   * business logic from error handling logic. See getExplicitTypeOfConnection
   * for more information.
   * @param {!Blockly.Connection} connection The connection to find the explicit
   *     type of.
   * @return {!Array<string>} The explicit type(s) of the connection.
   * @private
   */
  getExplicitTypesOfConnectionInternal_(connection) {
    const check = getCheck(connection);
    return isExplicitConnection(connection) ? [check]:
        this.getBoundTypes_(connection.getSourceBlock(), check);
  }

  /**
   * Binds the genericType to the explicitType in the context of the given
   * block.
   * @param {!Blockly.Block} block The block that provides context for the
   *     generic type binding.
   * @param {string} genericType The generic type that we want to bind.
   * @param {string} explicitType The explicit type we want to bind the generic
   *     type to.
   */
  bindType(block, genericType, explicitType) {
    genericType = genericType.toLowerCase();
    explicitType = explicitType.toLowerCase();
    let map = this.explicitBindings_.get(block);
    if (!map) {
      map = new Map();
      this.explicitBindings_.set(block, map);
    }
    map.set(genericType, explicitType);

    const connectionMap = [];
    /**
     * If the given connection exists and it has a target connection, saves
     * the connection and its target connection to the connectionMap and then
     * disconnects the connections.
     * @param {!Blockly.Connection} conn The connection to save and disconnect.
     */
    function saveAndDisconnect(conn) {
      if (conn && conn.targetConnection) {
        connectionMap.push([conn, conn.targetConnection]);
        conn.disconnect();
      }
    }

    saveAndDisconnect(block.outputConnection);
    saveAndDisconnect(block.previousConnection);
    for (const input of block.inputList) {
      saveAndDisconnect(input.connection);
    }
    saveAndDisconnect(block.nextConnection);

    for (const [parent, child] of connectionMap) {
      parent.connect(child);
    }

    // Note: Using .rendered may cause issues. See blockly/#1676.
    if (block.rendered) {
      block.bumpNeighbours();
    }
  }

  /**
   * Unbinds the genericType from its explicit type in the context of the given
   * block.
   * @param {!Blockly.Block} block The block that provides context for the
   *     generic type binding.
   * @param {string} genericType The generic type that we want to unbind.
   * @return {boolean} True if the binding existed previously, false if it did
   *     not.
   */
  unbindType(block, genericType) {
    genericType = genericType.toLowerCase();
    if (this.explicitBindings_.has(block)) {
      return this.explicitBindings_.get(block).delete(genericType);
    }
    return false;
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
   * Returns the explicit type(s) bound to the block generic type pair if one
   * exists.
   *
   * Note that we only get multiple types via type unification of types that
   * are externally bound, or associated with input connections.
   * @param {!Blockly.Block} block The block that provides the context for the
   *     explicit binding.
   * @param {string} genericType The generic type we want to get the bound
   *     explicit type of.
   * @param {!Blockly.Connection=} connectionToSkip The connection to skip. If
   *     the connection matches this connection, it will be ignored.
   * @return {!Array<string>} The explicit type(s) bound to the generic type
   *     if one exists.
   * @private
   */
  getBoundTypes_(block, genericType, connectionToSkip = undefined) {
    genericType = genericType.toLowerCase();
    const types = [];

    const type = this.getExternalBinding_(block, genericType);
    if (type) {
      return [type];
    }

    types.push(...this.getConnectionTypes_(
        block.outputConnection, genericType, connectionToSkip));
    types.push(...this.getConnectionTypes_(
        block.previousConnection, genericType, connectionToSkip));
    for (const input of block.inputList) {
      types.push(...this.getConnectionTypes_(
          input.connection, genericType, connectionToSkip));
    }
    types.push(...this.getConnectionTypes_(
        block.nextConnection, genericType, connectionToSkip));

    if (types.length) {
      return this.getTypeHierarchy_()
          .getNearestCommonParents(...types.map((type) => parseType(type)))
          .map((typeStruct) => structureToString(typeStruct));
    }
    return [];
  }

  /**
   * Returns the externally bound explicit type associated with the given
   * genericType in the context of the given block, if one exists.
   * @param {!Blockly.Block} block The block that provides context for the
   *     explicit binding.
   * @param {string} genericType The generic type we want to get the externally
   *     bound explicit type of.
   * @return {string} The externally bound explicit type, if one exists.
   * @private
   */
  getExternalBinding_(block, genericType) {
    if (this.explicitBindings_.has(block)) {
      return this.explicitBindings_.get(block).get(genericType);
    }
    return '';
  }

  /**
   * Acts as a helper for the getBoundTypes_ function *and should only be used
   * as such*. Only operates on the connection if its check matches the passed
   * genericType, it is an input or output connection, and it is not the
   * connectionToSkip. Returns the bound type(s) associated with this
   * connection.
   * @param {!Blockly.Connection} connection The connection to get the bound
   *     type of.
   * @param {string} genericType The generic type to find the bound type of.
   * @param {!Blockly.Connection=} connectionToSkip The connection to skip. If
   *     the connection matches this connection, it will be ignored.
   * @return {!Array<string>} The bound type(s) associated with the passed
   *     connection.
   * @private
   */
  getConnectionTypes_(connection, genericType, connectionToSkip) {
    if (!connection ||
        connection == connectionToSkip ||
        getCheck(connection) != genericType ||
        !connection.targetConnection) {
      return [];
    }

    const target = connection.targetConnection;
    const check = getCheck(target);
    if (isExplicitConnection(target)) {
      return [check];
    }
    return this.getBoundTypes_(
        target.getSourceBlock(), check, target);
  }

  /**
   * Returns true if the given block generic type pair is only bound by input
   * next connections. Returns false if it is bound by an explicit binding, or
   * connections to the output or previous connections.
   * @param {!Blockly.Block} block The block that provides the context for the
   *     generic type.
   * @param {string} genericType The generic type that we want to check the
   *     state of.
   * @return {boolean} True if the type is only bound by inputs, false
   *     otherwise.
   * @private
   */
  typeIsOnlyBoundByParams_(block, genericType) {
    const typeisBoundByOther =
        this.getExternalBinding_(block, genericType) ||
        this.getConnectionTypes_(block.outputConnection, genericType).length ||
        this.getConnectionTypes_(block.previousConnection, genericType).length;
    return !typeisBoundByOther;
  }

  /**
   * Returns the input name or location (output, prev, next) of the given
   * connection. Used for informing developers of errors.
   * @param {!Blockly.Connection} connection The connection to get the input
   *     name of.
   * @return {string} The input name or location of the connection.
   * @private
   */
  getInputName_(connection) {
    if (connection.getParentInput()) {
      return connection.getParentInput().name;
    } else {
      switch (connection.type) {
        case Blockly.OUTPUT_VALUE:
          return 'output';
        case Blockly.PREVIOUS_STATEMENT:
          return 'previous';
        case Blockly.NEXT_STATEMENT:
          return 'next';
      }
    }
  }
}

/**
 * An error representing something going wrong with a connection check, or
 * another public connection-check-y function.
 */
export class ConnectionCheckError extends Error {
  /**
   * Constructs a ConnectionCheckError.
   * @param {string} msg The error message.
   * @param {Error=} error The optional error being wrapped.
   */
  constructor(msg, error = undefined) {
    super(msg);

    /**
     * The error this error is wrapping, or undefined.
     * @type {Error}
     */
    this.wrappedError = error;
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
