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

    /**
     * Map of type names to maps of type names to sets of type names that are
     * the least common ancestors of the two types. You can think of it like
     * a two-dimensional array where both axes contain all of the type names.
     *
     * A least common ancestor of two types u and v is defined as:
     * A super type of both u and v that has no descendant which is also an
     * ancestor of both u and v.
     * @type {!Map<!Map<Set<string>>>}
     * @private
     */
    this.leastCommonAncestors_ = new Map();

    this.initTypes_(hierarchyDef);
    this.initLeastCommonAncestors_();
  }

  /**
   * Initializes the TypeHierarchy's types_.
   * @param {!Object} hierarchyDef The definition of the type hierarchy.
   * @private
   */
  initTypes_(hierarchyDef) {
    // NOTE: This does not do anything to stop a developer from creating a
    // cyclic type hierarchy (eg Dog <: Mammal <: Dog). They are expected to
    // not do that.
    for (const typeName of Object.keys(hierarchyDef)) {
      const lowerCaseName = typeName.toLowerCase();
      this.types_.set(lowerCaseName,
          new TypeDef(lowerCaseName, hierarchyDef[typeName]));
    }
    for (const [typeName, type] of this.types_) {
      type.forEachSuper((superName) => {
        const superType = this.types_.get(superName);
        if (!superType) {
          throw Error('The type ' + typeName + ' says it fulfills the type ' +
              superName + ', but that type is not defined');
        }
        superType.addSub(typeName);
      });
    }
  }

  /**
   * Initializes the leastCommonAncestors_ graph so the least common ancestors
   * of two types can be accessed in constant time.
   *
   * Implements the pre-processing algorithm defined in:
   * Czumaj, Artur, Miroslaw Kowaluk and and Andrzej Lingas. "Faster algorithms
   * for finding lowest common ancestors in directed acyclic graphs."
   * Theoretical Computer Science, 380.1-2 (2007): 37-46.
   *https://bit.ly/2SrCRs5
   *
   * Operates in O(nm) where n is the number of nodes and m is the number of
   * edges.
   * @private
   */
  initLeastCommonAncestors_() {
    // Maps each type to a set of all of the descendants of that type.
    const descendantsMap = new Map();
    let unvisitedTypes = new Set(this.types_.keys());

    while (unvisitedTypes.size) {
      for (const [typeName, type] of this.types_) {
        const unvisitedSubs = type.subs().filter(
            unvisitedTypes.has, unvisitedTypes);
        if (!unvisitedSubs.length) {
          const descendants = new Set([typeName]);
          type.forEachSub((subName) => {
            descendantsMap.get(subName).forEach(descendants.add, descendants);
          });
          descendantsMap.set(typeName, descendants);
          unvisitedTypes.delete(typeName);
        }
      }
    }

    unvisitedTypes = new Set(this.types_.keys());
    while(unvisitedTypes.size) {
      for (const [typeName, type] of this.types_) {
        const unvisitedSupers = type.supers().filter(
            unvisitedTypes.has, unvisitedTypes);
        if (!unvisitedSupers.length) {

        }
      }
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
   * second type (directly or via one of its supertypes), as specified in the
   * type hierarchy definition. False otherwise.
   * @param {string} subName The name of the possible subtype.
   * @param {string} superName The name of the possible supertype.
   * @return {boolean} True if the types are identical, or if the first type
   *     fulfills the second type (directly or via its supertypes) as specified
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

  /**
   * Finds the nearest common parent of the two type names.
   * @param {string} type1 The first type to try to find the nearest common
   *     parent of.
   * @param {string} type2 The second type to try to find the nearest common
   *     parent of.
   * @private
   */
  findNearestCommonParent_(type1, type2) {

  }
}

/**
 * Represents a type.
 */
class TypeDef {
  /**
   * Constructs a TypeDef with the given name. Uses the given info for further
   * initialization (eg defining supertypes).
   * @param {string} name The name of the type.
   * @param {!Object} info The info about the type.
   */
  constructor(name, info) {
    /**
     * The name of this type.
     * @type {string}
     * @public
     */
    this.name = name;

    /**
     * The caseless names of the direct supertypes of this type.
     * @type {!Array<string>}
     * @private
     */
    this.fulfills_ = [];

    /**
     * The caseless names of the direct subtypes of this type.
     * @type {!Array<string>}
     * @private
     */
    this.fulfillsThis_ = [];

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
   * Adds the given type to the list of direct subtypes of this type.
   * @param {string} subType The name of the type to add to the list of subtypes
   *     of this type.
   */
  addSub(subType) {
    this.fulfillsThis_.push(subType.toLowerCase());
  }

  /**
   * Returns a new set of all types that are direct supertypes of this type.
   * @return {!Array<string>} A new set of all types that are direct supertypes
   *     of this type.
   */
  supers() {
    return [...this.fulfills_];
  }

  /**
   * Returns true if this type has any supertypes. False otherwise.
   * @return {boolean} True if this type has any supertypes. False otherwise.
   */
  hasSupers() {
    return !!this.fulfills_.length;
  }

  /**
   * Returns true if this type has a direct supertype with the given name.
   * False otherwise.
   * @param {string} superName The caseless name of the possible direct super
   *     type.
   * @return {boolean} True if this type has a direct supertype with the given
   *     name. False otherwise.
   */
  hasDirectSuper(superName) {
    return this.fulfills_.includes(superName);
  }

  /**
   * Returns true if the given function returns a truthy value for at least one
   * supertype of this type. False otherwise.
   * @param {function(string, number=, !Array=):boolean} callback A function
   *     used to test each supertype.
   * @param {!Object=} thisArg A value to use as `this` when executing callback.
   * @return {boolean} True if the given function returns a truthy value for
   *     at least one supertype of this type. False otherwise.
   */
  someSuper(callback, thisArg) {
    return this.fulfills_.some(callback, thisArg);
  }

  /**
   * Executes the provided function once for each direct supertype of this
   * type.
   * @param {function(string)} callback The function to execute on each direct
   *     supertype of this type.
   * @param {!Object=} thisArg Value to use as `this` when executing callback.
   */
  forEachSuper(callback, thisArg) {
    this.fulfills_.forEach(callback, thisArg);
  }

  /**
   * Returns a new set of all types that are direct subtypes of this type.
   * @return {!Array<string>} A new set of all types that are direct subtypes of
   *     this type.
   */
  subs() {
    return [...this.fulfillsThis_];
  }

  /**
   * Returns true if this type has any subtypes. False otherwise.
   * @return {boolean} True if this type has any subtypes. False otherwise.
   */
  hasSubs() {
    return !!this.fulfillsThis_.length;
  }

  /**
   * Returns true if this type has a direct subtype with the given name. False
   * otherwise.
   * @param {string} subName The caseless name of the possible direct subtype.
   * @return {boolean} True if this type has a direct subtype with the given
   *     name. False otherwise.
   */
  hasDirectSub(subName) {
    return this.fulfillsThis_.includes(subName);
  }

  /**
   * Returns true if the given function returns a truthy value for at least one
   * subtype of this type. False otherwise.
   * @param {function(string, number=, !Array=):boolean} callback A function
   *     used to test each subtype.
   * @param {!Object=} thisArg A value to use as `this` when executing callback.
   * @return {boolean} True if the given function returns a truthy value for
   *     at least one subtype of this type. False otherwise.
   */
  someSub(callback, thisArg) {
    return this.fulfillsThis_.some(callback, thisArg);
  }

  /**
   * Executes the provided function once for each direct subtype of this
   * type.
   * @param {function(string)} callback The function to execute on each direct
   *     subtype of this type.
   * @param {!Object=} thisArg Value to use as `this` when executing callback.
   */
  forEachSub(callback, thisArg) {
    this.fulfillsThis_.forEach(callback, thisArg);
  }
}
