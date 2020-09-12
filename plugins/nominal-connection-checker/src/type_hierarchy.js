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
     * @type {!Object<!string, !TypeDef>}
     * @private
     */
    this.types_ = Object.create(null);

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
    const typeNames = Object.keys(hierarchyDef);
    for (let i = 0, typeName; (typeName = typeNames[i]); i++) {
      this.types_[typeName] = new TypeDef(typeName, hierarchyDef[typeName]);
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
    return !!this.types_[name];
  }

  /**
   * Returns true if the types are exactly the same type. False otherwise.
   * @param {string} name1 The name of the first type.
   * @param {string} name2 The name of the second type.
   * @return {boolean} True if the types are exactly the same type. False
   *     otherwise.
   */
  typeIsExactlyType(name1, name2) {
    return name1 == name2;
  }

  /**
   * Returns true if the first type is a super type of the second type. False
   * otherwise.
   * @param {string} superName The name of the possible super type.
   * @param {string} subName The name of the possible sub type.
   * @return {boolean} True if the first type is a super type of the second
   *     type. False otherwise.
   */
  typeIsSuperOfType(superName, subName) {
    if (this.typeIsExactlyType(superName, subName)) {
      return true;
    }
    const subType = this.types_[subName];
    if (subType.hasDirectSuper(superName)) {
      return true;
    }
    return subType.someSuper(function(name) {
      return this.typeIsSuperOfType(superName, name);
    }, this);
  }

  /**
   * Returns true if the first type is a subt type of the second type. False
   * otherwise.
   * @param {string} subName The name of the possible sub type.
   * @param {string} superName The name of the possible super type.
   * @return {boolean} True if the first type is a sub type of the second type.
   *     False otherwise.
   */
  typeIsSubOfType(subName, superName) {
    return this.typeIsSuperOfType(superName, subName);
  }
}

/**
 * Represents a type.
 */
class TypeDef {
  /**
   * Constructs a TypeDef with the given name. Uses the given info for further
   * initialization (eg defining super types).
   * @param {!string} name The name of the type.
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
      // Shallow copy should be fine since it just holds strings.
      this.fulfills_ = info.fulfills.slice();
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
