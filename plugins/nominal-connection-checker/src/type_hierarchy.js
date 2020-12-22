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
     * the nearest common parents of the two types. You can think of it like
     * a two-dimensional array where both axes contain all of the type names.
     *
     * A nearest common parent of two types u and v is defined as:
     * A super type of both u and v that has no descendant which is also an
     * ancestor of both u and v.
     * @type {!Map<string, !Map<string, Array<string>>>}
     * @private
     */
    this.nearestCommonParents_ = new Map();

    this.initTypes_(hierarchyDef);
    this.initNearestCommonParents_();
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

    // Init types, direct supers, and parameters.
    for (const typeName of Object.keys(hierarchyDef)) {
      const lowerCaseName = typeName.toLowerCase();
      const type = new TypeDef(lowerCaseName);
      const info = hierarchyDef[typeName];
      if (info.params && info.params.length) {
        info.params.forEach((param) => {
          type.addParam(
              param.name.toLowerCase(), stringToVariance(param.variance));
        });
      }
      if (info.fulfills && info.fulfills.length) {
        info.fulfills.forEach(
            (superType) => type.addSuper(this.parseType_(superType)));
      }
      this.types_.set(lowerCaseName, type);
    }

    // Init direct subs.
    for (const [typeName, type] of this.types_) {
      type.supers().forEach((superName) => {
        const superType = this.types_.get(superName);
        if (!superType) {
          throw Error('The type ' + typeName + ' says it fulfills the type ' +
              superName + ', but that type is not defined');
        }
        superType.addSub(typeName);
      });
    }

    // Init ancestors.
    let unvisitedTypes = new Set(this.types_.keys());
    while (unvisitedTypes.size) {
      for (const typeName of unvisitedTypes) {
        const type = this.types_.get(typeName);
        const unvisitedSupers = type.supers().filter(
            unvisitedTypes.has, unvisitedTypes);
        if (!unvisitedSupers.length) {
          type.supers().forEach((superName) => {
            const superType = this.types_.get(superName);
            superType.ancestors().forEach(
                (ancestor) => type.addAncestor(ancestor, superType));
          });
          unvisitedTypes.delete(typeName);
        }
      }
    }

    // Init descendants.
    unvisitedTypes = new Set(this.types_.keys());
    while (unvisitedTypes.size) {
      for (const typeName of unvisitedTypes) {
        const type = this.types_.get(typeName);
        const unvisitedSubs = type.subs().filter(
            unvisitedTypes.has, unvisitedTypes);
        if (!unvisitedSubs.length) {
          type.subs().forEach((subName) => {
            const subType = this.types_.get(subName);
            subType.descendants().forEach(type.addDescendant, type);
          });
          unvisitedTypes.delete(typeName);
        }
      }
    }
  }

  /**
   * Initializes the nearestCommonParents_ graph so the least common ancestors
   * of two types can be accessed in constant time.
   *
   * Implements the pre-processing algorithm defined in:
   * Czumaj, Artur, Miroslaw Kowaluk and and Andrzej Lingas. "Faster algorithms
   * for finding lowest common ancestors in directed acyclic graphs."
   * Theoretical Computer Science, 380.1-2 (2007): 37-46.
   * https://bit.ly/2SrCRs5.
   *
   * Operates in O(nm) where n is the number of nodes and m is the number of
   * edges.
   * @private
   */
  initNearestCommonParents_() {
    const unvisitedTypes = new Set(this.types_.keys());
    while (unvisitedTypes.size) {
      for (const typeName of unvisitedTypes) {
        const type = this.types_.get(typeName);
        const unvisitedSupers = type.supers().filter(
            unvisitedTypes.has, unvisitedTypes);
        if (unvisitedSupers.length) {
          continue;
        }
        unvisitedTypes.delete(typeName);

        const map = new Map();
        this.nearestCommonParents_.set(typeName, map);
        for (const [otherTypeName] of this.types_) {
          let leastCommonAncestors = [];
          if (type.hasDescendant(otherTypeName)) {
            leastCommonAncestors.push(typeName);
          } else {
            // Get all the least common ancestors this type's direct
            // ancestors have with the otherType.
            type.supers().forEach((superTypeName) => {
              leastCommonAncestors.push(
                  ...this.nearestCommonParents_.get(superTypeName)
                      .get(otherTypeName));
            });
            // Only include types that have no descendants in the array.
            leastCommonAncestors = leastCommonAncestors.filter(
                (typeName, i, array) => {
                  return !array.some((otherTypeName) => {
                    // Don't match the type against itself, but do match against
                    // duplicates.
                    if (array.indexOf(otherTypeName) == i) {
                      return false;
                    }
                    return this.types_.get(typeName)
                        .hasDescendant(otherTypeName);
                  });
                });
          }
          map.set(otherTypeName, leastCommonAncestors);
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
   * @param {string} subType The stringified possible subtype.
   * @param {string} superType The stringified possible supertype.
   * @return {boolean} True if the types are identical, or if the first type
   *     fulfills the second type (directly or via its supertypes) as specified
   *     in the type hierarchy definition. False otherwise.
   */
  typeFulfillsType(subType, superType) {
    const subStructure = this.parseType_(subType);
    const superStructure = this.parseType_(superType);

    return this.types_.get(subStructure.name).hasAncestor(superStructure.name);
  }

  /**
   * Returns an array of all the nearest common parents of the given types.
   * A nearest common parent of a set of types A is defined as:
   * A super type of all types in A that has no descendant which is also an
   * ancestor of all types in A.
   * @param {...string} types A variable number of types that we want to find
   *     the nearest common parents of.
   * @return {!Array<string>} An array of all the nearest common parents of the
   *     given types.
   */
  getNearestCommonParents(...types) {
    if (!types.length) {
      return [];
    }
    types = types.map((type) => type.toLowerCase());
    return types.reduce((accumulator, currType) => {
      const nearestCommonParentsMap = this.nearestCommonParents_.get(currType);
      // Note: neither flatMap() nor flat() work on Node 10. See #431.
      return accumulator
          .map((type) => {
            return nearestCommonParentsMap.get(type);
          })
          .reduce((flat, toFlatten) => {
            return [...flat, ...toFlatten];
          }, [])
          .filter((type, i, array) => {
            return array.indexOf(type) == i;
          });
    }, [types[0]]);
  }

  // TODO: Move all the TypeStructure stuff into its own file in the next PR.
  /**
   * Parses a string into a TypeStructure.
   * @param {string} str The string to parse into a TypeStructure.
   * @return {!TypeStructure} The created TypeStructure.
   * @private
   */
  parseType_(str) {
    const typeStruct = {};
    const bracketIndex = str.indexOf('[');
    if (bracketIndex != -1) {
      typeStruct.name = str.slice(0, bracketIndex);
      typeStruct.params = this.parseParamsArray_(
          str.slice(bracketIndex + 1, str.length - 1));
    } else {
      typeStruct.name = str;
      typeStruct.params = [];
    }
    typeStruct.name = typeStruct.name.toLowerCase().trim();
    return typeStruct;
  }

  /**
   * Parses a string into an array of type structures.
   * @param {string} str The string to parse into an array of type structures.
   *     The string is expected to not be surrounded by brackets.
   * @return {!Array<!TypeStructure>} The created TypeStructure array.
   * @private
   */
  parseParamsArray_(str) {
    const params = [];
    let latestIndex = 0;
    let openBraceCount = 0;
    [...str].forEach((c, i) => {
      switch (c) {
        case '[':
          openBraceCount++;
          break;
        case ']':
          openBraceCount--;
          if (!openBraceCount) {
            params.push(this.parseType_(str.slice(latestIndex, i + 1)));
            latestIndex = -1;
          }
          break;
        case ',':
        case ' ':
          if (!openBraceCount && latestIndex != -1) {
            params.push(this.parseType_(str.slice(latestIndex, i)));
            latestIndex = -1;
          }
          break;
        default:
          if (latestIndex == -1) {
            latestIndex = i;
          }
          break;
      }
    });
    if (latestIndex != -1) {
      params.push(this.parseType_(str.slice(latestIndex)));
    }
    return params;
  }
}

/**
 * Represents the structure of a type, eg in a "fulfills" array.
 * @typedef {{
 *   name: string,
 *   params: (!Array<!TypeStructure>)
 * }}
 */
let TypeStructure;

/**
 * Represents a type.
 */
class TypeDef {
  /**
   * Constructs a TypeDef with the given name. Uses the hierarchy for further
   * initialization (eg defining supertypes).
   * @param {string} name The name of the type.
   */
  constructor(name) {
    /**
     * The name of this type.
     * @type {string}
     * @public
     */
    this.name = name.toLowerCase();

    /**
     * The caseless names of the direct supertypes of this type.
     * @type {!Set<string>}
     * @private
     */
    this.supers_ = new Set();

    /**
     * The caseless names of the direct subtypes of this type.
     * @type {!Set<string>}
     * @private
     */
    this.subs_ = new Set();

    /**
     * The caseless names of the ancestors of this type.
     * @type {!Set<string>}
     * @private
     */
    this.ancestors_ = new Set();
    this.ancestors_.add(this.name);

    /**
     * The caseless names of the descendants of this type.
     * @type {!Set<string>}
     * @private
     */
    this.descendants_ = new Set(this.name);
    this.descendants_.add(this.name);

    /**
     * The caseless names of the parameters of this type.
     * @type {!Array<ParamDef>}
     * @private
     */
    this.params_ = [];

    /**
     * A map of ancestor names to arrays of this type's parameters for
     * that type.
     * @type {!Map<string, !Array<TypeStructure>>}
     * @private
     */
    this.paramsMap_ = new Map();
  }

  /**
   * Adds the given type to the list of direct superTypes of this type.
   * @param {!TypeStructure} superType The type structure representing the type
   *     that is the supertype of this type.
   */
  addSuper(superType) {
    this.supers_.add(superType.name);
    this.paramsMap_.set(superType.name, superType.params);
  }

  /**
   * Adds the given type to the list of direct subtypes of this type.
   * @param {string} subName The caseless name of the type to add to the list of
   *     subtypes of this type.
   */
  addSub(subName) {
    this.subs_.add(subName);
  }

  /**
   * Adds the given type to the list of ancestors of this type.
   * @param {string} ancestorName The caseless name of the type to add to the
   *     list of ancestors of this type.
   * @param {!TypeDef} superType The superType that we get this ancestor from.
   */
  addAncestor(ancestorName, superType) {
    this.ancestors_.add(ancestorName);
    const superToAncestor = superType.getParamsForAncestor(ancestorName);
    const thisToSuper = this.getParamsForAncestor(superType.name);
    const thisToAncestor = [];
    superToAncestor.forEach((typeStruct) => {
      thisToAncestor.push(
          thisToSuper[superType.getIndexOfParam(typeStruct.name)]);
    });
    this.paramsMap_.set(ancestorName, thisToAncestor);
  }

  /**
   * Adds the given type to the list of descendants of this type.
   * @param {string} descendantName The caseless name of the type to add to the
   *     list of descendants of this type.
   */
  addDescendant(descendantName) {
    this.descendants_.add(descendantName);
  }

  /**
   * Adds the given parameter info to the list of parameters of this type.
   * @param {string} paramName The caseless name of the parameter.
   * @param {!Variance} variance The variance of the parameter.
   * @param {number=} index The index to insert the parameter at. If undefined,
   *     the parameter will be added at the end.
   */
  addParam(paramName, variance, index = undefined) {
    const param = new ParamDef(paramName, variance);
    if (index != undefined) {
      this.params_.splice(index, param);
    } else {
      this.params_.push(param);
    }
  }

  /**
   * Returns a new array of all types that are direct supertypes of this type.
   * @return {!Array<string>} A new set of all types that are direct supertypes
   *     of this type.
   */
  supers() {
    return [...this.supers_];
  }

  /**
   * Returns true if this type has any direct supertypes. False otherwise.
   * @return {boolean} True if this type has any supertypes. False otherwise.
   */
  hasSupers() {
    return !!this.supers_.size;
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
    return this.supers_.has(superName);
  }

  /**
   * Returns a new set of all types that are direct subtypes of this type.
   * @return {!Array<string>} A new set of all types that are direct subtypes of
   *     this type.
   */
  subs() {
    return [...this.subs_];
  }

  /**
   * Returns true if this type has any direct subtypes. False otherwise.
   * @return {boolean} True if this type has any subtypes. False otherwise.
   */
  hasSubs() {
    return !!this.subs_.size;
  }

  /**
   * Returns true if this type has a direct subtype with the given name. False
   * otherwise.
   * @param {string} subName The caseless name of the possible direct subtype.
   * @return {boolean} True if this type has a direct subtype with the given
   *     name. False otherwise.
   */
  hasDirectSub(subName) {
    return this.subs_.has(subName);
  }

  /**
   * Returns a new set of all types that are ancestors of this type.
   * @return {!Array<string>} A new set of all types that are ancestors of this
   *     type.
   */
  ancestors() {
    return [...this.ancestors_];
  }

  /**
   * Returns true if this type has any ancestors. False otherwise.
   * @return {boolean} True if this type has any ancestors. False otherwise.
   */
  hasAncestors() {
    return !!this.ancestors_.size;
  }

  /**
   * Returns true if this type has an ancestor with the given name. False
   * otherwise.
   * @param {string} ancestorName The caseless name of the possible ancestor.
   * @return {boolean} True if this type has an ancestor with the given name.
   *     False otherwise.
   */
  hasAncestor(ancestorName) {
    return this.ancestors_.has(ancestorName);
  }

  /**
   * Returns a new set of all types that are descendants of this type.
   * @return {!Array<string>} A new set of all types that are descendants of
   *     this type.
   */
  descendants() {
    return [...this.descendants_];
  }

  /**
   * Returns true if this type has any descendants. False otherwise.
   * @return {boolean} True if this type has any descendants. False otherwise.
   */
  hasDescedants() {
    return !!this.descendants_.size;
  }

  /**
   * Returns true if this type has a descendant with the given name. False
   * otherwise.
   * @param {string} descendantName The caseless name of the possible
   *     descendant.
   * @return {boolean} True if this type has a descendant with the given name.
   *     False otherwise.
   */
  hasDescendant(descendantName) {
    return this.descendants_.has(descendantName);
  }

  /**
   * Returns an array of this type's parameters, in the order for its superType.
   * @param {string} ancestorName The caseless name of the ancestor to get the
   *     parameters for.
   * @param {!Array<!TypeStructure>=} explicitTypes Optional explicit types to
   *     substitute for parameters.
   * @return {!Array<!TypeStructure>} This type's parameters, in the order for
   *     its superType.
   */
  getParamsForAncestor(ancestorName, explicitTypes = undefined) {
    if (ancestorName == this.name && !this.paramsMap_.has(this.name)) {
      // Convert this type's params to a type structure.
      this.paramsMap_.set(
          this.name,
          this.params_.map((param) => {
            return {name: param.name, params: []};
          }));
    }
    // TODO: Add support for the explicit types.
    return this.paramsMap_.get(ancestorName);
  }

  /**
   * Returns the index of the parameter with the given name.
   * @param {string} paramName The name of the parameter.
   * @return {number} The index of hte parameter.
   */
  getIndexOfParam(paramName) {
    return this.params_.findIndex((param) => param.name == paramName);
  }

  /**
   * Returns the parameter definition for the parameter at the given index.
   * @param {number} index The index to get the parameter definition of.
   * @return {!ParamDef} The parameter definition for the parameter at the
   *     given index.
   */
  getParamForIndex(index) {
    return this.params_[index];
  }
}

/**
 * Represents different parameter variances.
 * @enum {string}
 */
const Variance = {
  CO: 'covariant',
  CONTRA: 'contravariant',
  INV: 'invariant',
};

/**
 * Converts a variance string to an actual variance.
 * @param {string} str The string to convert to a variance.
 * @return {!Variance} The converted variance value.
 */
function stringToVariance(str) {
  str = str.toLowerCase();
  if (str.startsWith('inv')) {
    return Variance.INV;
  } else if (str.startsWith('contra')) {
    return Variance.CONTRA;
  } else if (str.startsWith('co')) {
    return Variance.CO;
  } else {
    throw new Error('The variance "' + str + '" is not a valid variance. ' +
        'Valid variances are: "co", "contra", and "inv".');
  }
}

/**
 * Represents a type parameter.
 */
class ParamDef {
  /**
   * Constructs the type parameter given its name and variance.
   * @param {string} name The caseless name of the type parameter.
   * @param {!Variance} variance The variance of the type parameter.
   */
  constructor(name, variance) {
    /**
     * The caseless name of this type parameter.
     * @type {string}
     */
    this.name = name;

    /**
     * The variance of this type parameter.
     * @type {!Variance}
     */
    this.variance = variance;
  }
}
