/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Defines the TypeHierarchy and all of its private helper
 * prototypes.
 */
'use strict';

/**
 * Defines a type hierarchy. Used for doing operations like telling if one type
 * is a subtype of another type.
 */
export class TypeHierarchy {
  /**
   * Constructs the TypeHierarchy, initializing it with the given hierarchyDef.
   * @param {!Object} hierarchyDef The definition of the type hierarchy.
   */
  constructor(hierarchyDef) {
    /**
     * Map of type names to TypeDefs.
     * @type {!Map<string, !TypeDef>}
     * @private
     */
    this.types_ = new Map();

    this.init_(hierarchyDef);
  }

  /**
   * Initializes the TypeHierarchy's types_.
   * @param {!Object} hierarchyDef The definition of the type hierarchy.
   * @private
   */
  init_(hierarchyDef) {
    // NOTE: This does not do anything to stop a developer from creating a
    // cyclic type hierarchy (eg Dog <: Mammal <: Dog). They are expected to
    // not do that.
    for (const typeName of Object.keys(hierarchyDef)) {
      const lowerCaseName = typeName.toLowerCase();
      this.types_.set(lowerCaseName,
          new TypeDef(lowerCaseName, hierarchyDef[typeName]));
    }
  }

  /**
   * Returns true if the given type name exists in the hierarchy. False
   * otherwise.
   * @param {string} name The name of the type.
   * @return {boolean} True if the given type exists in the hierarchy. False
   * otherwise.
   */
  typeExists(name) {
    return this.types_.has(name.toLowerCase());
  }

  /**
   * Returns true if the types are exactly the same type. False otherwise.
   * @param {string} name1 The name of the first type.
   * @param {string} name2 The name of the second type.
   * @return {boolean} True if the types are exactly the same type. False
   *     otherwise.
   */
  typeIsExactlyType(name1, name2) {
    return name1.toLowerCase() == name2.toLowerCase();
  }

  /**
   * Returns true if the types are identical, or if the first type fulfills the
   * second type (directly or via one of its super types), as specified in the
   * type hierarchy definition. False otherwise.
   * @param {string} subName The name of the possible sub type.
   * @param {string} superName The name of the possible super type.
   * @return {boolean} True if the types are identical, or if the first type
   *     fulfills the second type (directly or via its super types) as specified
   *     in the type hierarchy definition. False otherwise.
   */
  typeFulfillsType(subName, superName) {
    const caselessSub = subName.toLowerCase();
    const caselessSup = superName.toLowerCase();
    if (this.typeIsExactlyType(caselessSub, caselessSup)) {
      return true;
    }
    const subType = this.types_.get(caselessSub);
    if (subType.hasDirectSuper(caselessSup)) {
      return true;
    }
    return subType.someSuper(
        (name) => this.typeFulfillsType(name, caselessSup), this);
  }
}

/**
 * Represents a type.
 */
class TypeDef {
  /**
   * Constructs a TypeDef with the given name. Uses the given info for further
   * initialization (eg defining super types).
   * @param {string} name The name of the type.
   * @param {!Object} info The info about the type.
   */
  constructor(name, info) {
    /**
     * The name of this type.
     * @type {string}
     * @private
     */
    this.name_ = name;

    /**
     * The names of the super types of this type.
     * @type {!Array<string>}
     * @private
     */
    this.fulfills_ = [];

    this.init_(info);
  }

  /**
   * Initializes the TypeDef's data.
   * @param {!Object} info The info about the type.
   * @private
   */
  init_(info) {
    if (info.fulfills && info.fulfills.length) {
      this.fulfills_ = info.fulfills.map((val) => val.toLowerCase());
    }
  }

  /**
   * Returns true if this type has a direct super type with the given name.
   * False otherwise.
   * @param {string} superName The name of the possible direct super type.
   * @return {boolean} True if this type has a direct super type with the given
   *     name. False otherwise.
   */
  hasDirectSuper(superName) {
    return this.fulfills_.includes(superName);
  }

  /**
   * Returns true if the given function returns a truthy value for at least one
   * super type of this type. False otherwise.
   * @param {function(string, number=, !Array=):boolean} callback A function
   *     used to test each super type.
   * @param {!Object=} thisArg A value to use as `this` when executing callback.
   * @return {boolean} True if the given function returns a truthy value for
   *     at least one super type of this type. False otherwise.
   */
  someSuper(callback, thisArg) {
    return this.fulfills_.some(callback, thisArg);
  }
}
