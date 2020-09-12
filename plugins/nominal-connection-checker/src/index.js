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

// TODO: Fix the version of Blockly being required in package.json.

/**
 * A connection checker that is targeted at helping Blockly model languages with
 * complex nominal typing systems, like C++, Java, or Rust.
 * @implements {Blockly.IConnectionChecker}
 */
export class NominalConnectionChecker extends Blockly.ConnectionChecker {
  /**
   * Constructs the connection checker.
   */
  constructor() {
    super();

    /**
     * The type hierarchy used by this connection checker. Defines which types
     * are subtypes of which other types.
     * @type {?TypeHierarchy}
     * @private
     */
    this.typeHierarchy_ = null;
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
    const {superior, inferior} = this.getSupAndSubConnections_(a, b);
    const supCheck = superior.getCheck();
    const subCheck = inferior.getCheck();
    const typeHierarchy = this.getTypeHierarchy_();

    return supCheck.some((supType) => {
      return subCheck.some((subType) => {
        return typeHierarchy.typeIsSuperOfType(supType, subType);
      });
    });
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
   * to either 'superior' or 'inferior' depending on which is superior and
   * which is inferior.
   * @param {!Blockly.Connection} a The first connection.
   * @param {!Blockly.Connection} b The second connection.
   * @return {{superior: !Blockly.Connection, inferior: !Blockly.Connection}} An
   *     object containing the connections, which are now correctly assigned to
   *     either 'superior' or 'inferior'.
   * @private
   */
  getSupAndSubConnections_(a, b) {
    if (a.isSuperior()) {
      return {
        superior: a,
        inferior: b,
      };
    } else {
      return {
        superior: b,
        inferior: a,
      };
    }
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
