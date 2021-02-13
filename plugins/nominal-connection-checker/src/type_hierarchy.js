/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Defines the TypeHierarchy and all of its private helper
 * prototypes.
 */
'use strict';

import {
  TypeStructure,
  parseType,
  duplicateStructure,
} from './type_structure';
import {isGeneric} from './utils';


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
     * Map of type names to maps of type names to arrays of type names that are
     * the nearest common ancestors of the two types. You can think of it like
     * a two-dimensional array where both axes contain all of the type names.
     *
     * A nearest common ancestor of two types u and v is defined as:
     * A super type of both u and v that has no descendant which is also an
     * ancestor of both u and v.
     * @type {!Map<string, !Map<string, Array<string>>>}
     * @private
     */
    this.nearestCommonAncestors_ = new Map();

    /**
     * Map of type names to maps of type names to arrays of type names that are
     * the nearest common descendants of the two types. You can think of it like
     * a two-dimensional array where both axes contain all of the type names.
     *
     * A nearest common descendant of two types u and v is defined as:
     * A sub type of both U and v that has no ancestor which is also a
     * descendant of both u and v.
     * @type {!Map<string, !Map<string, Array<string>>>}
     * @private
     */
    this.nearestCommonDescendants_ = new Map();

    this.initTypes_(hierarchyDef);
    this.initNearestCommonAncestors_();
    this.initNearestCommonDescendants_();
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
            (superType) => type.addSuper(parseType(superType)));
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
        superType.addSub(type);
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
            subType.descendants().forEach((descendantName) =>
              type.addDescendant(this.types_.get(descendantName), subType));
          });
          unvisitedTypes.delete(typeName);
        }
      }
    }
  }

  /**
   * Initializes the nearestCommonAncestors_ graph so the nearest common
   * ancestors of two types can be accessed in constant time.
   * @private
   */
  initNearestCommonAncestors_() {
    this.initNearest_(
        this.nearestCommonAncestors_,
        (type) => type.supers(),
        (type, otherTypeName) => type.hasDescendant(otherTypeName));
  }

  /**
   * Initializes the nearestCommonDesendants_ graph so that the nearest common
   * descendants of two types can be accessed in constant time.
   * @private
   */
  initNearestCommonDescendants_() {
    this.initNearest_(
        this.nearestCommonDescendants_,
        (type) => type.subs(),
        (type, otherTypeName) => type.hasAncestor(otherTypeName));
  }

  /**
   * Initializes the given nearestCommonMap so that the nearest common
   * ancestors/descendants of two types can be accessed in constant type.
   *
   * Implements the pre-processing algorithm defined
   * in: Czumaj, Artur, Miroslaw Kowaluk and and Andrzej Lingas.
   * "Faster algorithms for finding lowest common ancestors in directed acyclic
   * graphs".
   * Theoretical Computer Science, 380.1-2 (2007): 37-46.
   * Link: https://bit.ly/2SrCRs5 .
   *
   * But the above has been slightly modified to work for both ancestors and
   * descendants.
   *
   * Operates in O(nm) where n is the number of nodes and m is the number of
   * edges.
   *
   * @param {!Map<string, !Map<string, Array<string>>>} nearestCommonMap The
   *      map of nearest common types (either ancestors or descendants) that we
   *     are initializing.
   * @param {function(TypeDef):!Array<string>} relevantRelatives Returns the
   *     relatives that are relevant to this procedure. In the case of
   *     ancestors, returns supertypes, and in the case of descendants, returns
   *     subtypes.
   * @param {function(TypeDef, string):boolean} isNearest Returns true if the
   *     type associated with the string name is the nearest common X of the
   *     type associated with the string name and the given type def.
   * @private
   */
  initNearest_(nearestCommonMap, relevantRelatives, isNearest) {
    const unvisitedTypes = new Set(this.types_.keys());
    while (unvisitedTypes.size) {
      for (const typeName of unvisitedTypes) {
        const type = this.types_.get(typeName);
        const hasUnvisited = !!relevantRelatives(type).filter(
            unvisitedTypes.has, unvisitedTypes).length;
        if (hasUnvisited) {
          continue;
        }
        unvisitedTypes.delete(typeName);

        const map = new Map();
        nearestCommonMap.set(typeName, map);
        for (const [otherTypeName] of this.types_) {
          let nearestCommon = [];
          if (isNearest(type, otherTypeName)) {
            nearestCommon.push(typeName);
          } else {
            // Get all the nearest common types this type's relevant relatives
            // have with the otherType.
            relevantRelatives(type).forEach((relTypeName) => {
              nearestCommon.push(
                  ...nearestCommonMap.get(relTypeName)
                      .get(otherTypeName));
            });
            // Remove types that have a nearer relative in the array.
            nearestCommon = nearestCommon.filter(
                (typeName, i, array) => {
                  return !array.some((otherTypeName) => {
                    // Don't match the type against itself, but do match against
                    // duplicates.
                    if (array.indexOf(otherTypeName) == i) {
                      return false;
                    }
                    return isNearest(this.types_.get(typeName), otherTypeName);
                  });
                });
          }
          map.set(otherTypeName, nearestCommon);
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
   * @param {!TypeStructure} type1 The structure of the first type.
   * @param {!TypeStructure} type2 The structure of the second type.
   * @return {boolean} True if the types are exactly the same type. False
   *     otherwise.
   */
  typeIsExactlyType(type1, type2) {
    this.validateTypeStructure_(type1);
    this.validateTypeStructure_(type2);
    return type1.equals(type2);
  }

  /**
   * Returns true if the types are identical, or if the first type fulfills the
   * second type (directly or via one of its supertypes), as specified in the
   * type hierarchy definition. False otherwise.
   * @param {!TypeStructure} subType The structure of the subtype.
   * @param {!TypeStructure} superType The structure of the supertype.
   * @return {boolean} True if the types are identical, or if the first type
   *     fulfills the second type (directly or via its supertypes) as specified
   *     in the type hierarchy definition. False otherwise.
   */
  typeFulfillsType(subType, superType) {
    this.validateTypeStructure_(subType);
    this.validateTypeStructure_(superType);

    const subDef = this.types_.get(subType.name);
    const superDef = this.types_.get(superType.name);

    if (!subDef.hasAncestor(superType.name)) {
      // Not compatible.
      return false;
    }

    // TODO: We need to add checks to make sure the number of actual params for
    //  the subtype is correct. Here and in typeIsExactlyType.

    const orderedSubParams = subDef.getParamsForAncestor(
        superType.name, subType.params);
    return superType.params.every((actualSuper, i) => {
      const actualSub = orderedSubParams[i];
      const paramDef = superDef.getParamForIndex(i);

      switch (paramDef.variance) {
        case Variance.CO:
          return this.typeFulfillsType(actualSub, actualSuper);
        case Variance.CONTRA:
          return this.typeFulfillsType(actualSuper, actualSub);
        case Variance.INV:
          return this.typeIsExactlyType(actualSub, actualSuper);
      }
    });
  }

  /**
   * Returns an array of all the nearest common ancestors of the given types.
   * A nearest common ancestor of a set of types A is defined as:
   * A super type of all types in A that has no descendant which is also an
   * ancestor of all types in A.
   * @param {...TypeStructure} types A variable number of types that we want to
   *     find the nearest common ancestors of.
   * @return {!Array<!TypeStructure>} An array of all the nearest common
   *     ancestors of the given types.
   */
  getNearestCommonParents(...types) {
    if (!types.length) {
      return [];
    }

    // Get the nearest common types for the "outer" types.
    const commonTypes = this.getNearestCommon_(
        types.map((type) => type.name), this.nearestCommonAncestors_);

    // Cannot use .map() because we append to the commonTypes array.
    const mappedTypes = [];
    for (let i = 0; i < commonTypes.length; i++) {
      const commonType = commonTypes[i];
      let paramsLists = this.getParamsListsFor_(
          types,
          commonType,
          (type, ancestorName, actualTypes) =>
            type.getParamsForAncestor(ancestorName, actualTypes));
      if (!paramsLists.length) {
        mappedTypes[i] = [new TypeStructure(commonType)];
        continue;
      }
      const commonDef = this.types_.get(commonType);
      paramsLists = this.unifyParamsLists(
          paramsLists,
          commonDef,
          this.getNearestCommonParents.bind(this),
          this.getNearestCommonDescendants.bind(this));
      paramsLists[0] = paramsLists[0].map((val) => [val]);
      const combinations = this.combine_(paramsLists);
      if (!combinations.length) {
        // If this commonType didn't unify, maybe the parents of that type will.
        commonTypes.push(...commonDef.supers());
      }
      mappedTypes[i] = combinations.map((combo) => {
        const struct = new TypeStructure(commonType);
        struct.params = combo;
        return struct;
      });
    }

    return mappedTypes
        // Remove empty arrays.
        .filter((typeStructs) => !!typeStructs.length)
        // Remove duplicates.
        .filter((typeStructs, i, arrays) => {
          const typeName = typeStructs[0].name;
          return arrays.findIndex(
              (typeStructs2) => typeStructs2[0].name == typeName) == i;
        })
        // Remove non-nearest types.
        .filter((typeStructs, i, arrays) => {
          const typeName = typeStructs[0].name;
          return !arrays.some((typeStructs2, j) => {
            if (i == j) {
              return false;
            }
            const typeName2 = typeStructs2[0].name;
            return this.types_.get(typeName)
                .hasDescendant(typeName2);
          });
        })
        .reduce((flat, toFlatten) => {
          return [...flat, ...toFlatten];
        }, []);
  }

  /**
   * Returns an array of all the nearest common descendants of the given types.
   * A nearest common descendant of a set of types A is defined as:
   * A subtype of all types in A that has no ancestor which is also a descendant
   * of all types in A.
   * @param {...TypeStructure} types A variable number of types that we want to
   *     find the nearest common descendants of.
   * @return {!Array<!TypeStructure>} An array of all the nearest common
   *     descendants of the given types.
   */
  getNearestCommonDescendants(...types) {
    if (!types.length) {
      return [];
    }

    const commonOuterTypes = this.getNearestCommon_(
        types.map((type) => type.name), this.nearestCommonDescendants_);
    // TODO: Filter out any types that do not work for the actual params,
    //  because the types include explicit types in their fulfills. To get this
    //  working first we need to be able to evaluate generic parameters.

    return commonOuterTypes
        .map((commonType) => {
          let paramsLists = this.getParamsListsFor_(
              types, commonType, this.getParamsForDescendant_.bind(this));
          if (!paramsLists.length) {
            return [new TypeStructure(commonType)];
          }
          paramsLists = this.unifyParamsLists(
              paramsLists,
              this.types_.get(commonType),
              this.getNearestCommonDescendants.bind(this),
              this.getNearestCommonParents.bind(this));
          paramsLists[0] = paramsLists[0].map((val) => [val]);
          const combinations = this.combine_(paramsLists);
          return combinations.map((combo) => {
            const struct = new TypeStructure(commonType);
            struct.params = combo;
            return struct;
          });
        })
        .reduce((flat, toFlatten) => {
          return [...flat, ...toFlatten];
        }, []);
  }

  /**
   * Validates that the given type structure conforms to a definition known
   * to the type hierarchy. Note that this *only* validates the "top level"
   * type. It does *not* recursively validate parameters.
   * @param {!TypeStructure} struct The type structure to validate.
   * @private
   */
  validateTypeStructure_(struct) {
    const def = this.types_.get(struct.name);

    // TODO: Add throwing error if the def is not found. Note that there are
    //   some tests that need to be unskipped after this is added.

    if (struct.params.length != def.params().length) {
      throw new ActualParamsCountError(
          struct.name, struct.params.length, def.params().length);
    }
  }

  /**
   * Returns the names of the nearest common types of the types associated with
   * the given type names, as defined by the passed type map. Does not handle
   * parameterized types! That is handled by getNearestCommonParents and
   * getNearestCommonAncestors.
   * @param {!Array<string>} typeNames The types to find the nearest common
   *     type of.
   * @param {!Map<string, !Map<string, Array<string>>>} nearestCommon A map
   *     defining the nearest common types of each pair of types.
   * @return {!Array<string>} The names of the nearest common types of the types
   *     associated with the given type names.
   * @private
   */
  getNearestCommon_(typeNames, nearestCommon) {
    return typeNames.reduce((accumulator, currType) => {
      const commonMap = nearestCommon.get(currType);
      // Note: neither flatMap() nor flat() work on Node 10. See #431.
      return accumulator
          .map((type) => {
            return [...commonMap.get(type)]; // Create copy to avoid corruption.
          })
          .reduce((flat, toFlatten) => {
            return [...flat, ...toFlatten];
          }, [])
          .filter((type, i, array) => { // Get rid of duplicates.
            return array.every((type2, i2) => {
              return i <= i2 || type != type2;
            });
          });
    }, [typeNames[0]]);
  }

  /**
   * Returns an array of arrays where each subarray is a list of actual type
   * parameters of the actualTypes that are associated with the given parameter
   * at that index for the common type.
   * @param {!Array<!TypeStructure>} actualTypes The actual types we are mapping
   *     the paramters of to the common type.
   * @param {string} commonType The name of the common type we are getting the
   *     params in the order of.
   * @param {function(!TypeDef, string, !Array<!TypeStructure>)
   * :!Array<!TypeStructure>}
   *     getParamsForCommon A function that takes in the definition of a type
   *     and maps the given actual params to the parameters of the common type.
   * @return {!Array<!Array<TypeStructure>>} An array of arrays where each sub
   *     array is a list of actual type parameters of the actualTypes that are
   *     associated with the given parameter at that index for the common type.
   * @private
   */
  getParamsListsFor_(actualTypes, commonType, getParamsForCommon) {
    const paramsLists = [];
    actualTypes.forEach((typeStruct) => {
      const mappedParams = getParamsForCommon(
          this.types_.get(typeStruct.name), commonType, typeStruct.params);
      mappedParams.forEach((param, i) => {
        // TODO: This doesn't work if they all evaluate to null!
        if (!param) {
          // Just ignore nulls, we don't have type info for these params.
          return;
        }
        if (!paramsLists[i]) {
          paramsLists[i] = [];
        }
        paramsLists[i].push(param);
      });
    });
    return paramsLists;
  }

  /**
   * Returns an array of arrays of common types for each of the lists of actual
   * types for a given parameter of the commonDef. Parameter lists are unified
   * based on the variance of the formal parameter of the common type definition
   * at that index.
   * @param {!Array<!Array<TypeStructure>>} paramsLists A list of lists of
   *     params to unify for a given param of the common def.
   * @param {!TypeDef} commonDef The common type definition that determines
   *     the variance of the different parameters.
   * @param {function(...!TypeStructure):!Array<!TypeStructure>}
   *     covariantRecursion The function to call in the case of a
   *     covariant parameter.
   * @param {function(...!TypeStructure):!Array<!TypeStructure>}
   *     contravariantRecursion The function to call in the case of a
   *     contravariant parameter.
   * @return {!Array<!Array<!TypeStructure>>} An array of arrays of common types
   *     for each of the lists of actual types for a given parameter of the
   *     commonDef. An empty subarray means a common type could not be found.
   */
  unifyParamsLists(
      paramsLists,
      commonDef,
      covariantRecursion,
      contravariantRecursion
  ) {
    return paramsLists.map((paramList, i) => {
      switch (commonDef.getParamForIndex(i).variance) {
        case Variance.CO:
          return covariantRecursion(...paramList);
        case Variance.CONTRA:
          return contravariantRecursion(...paramList);
        case Variance.INV:
          // eslint-disable-next-line no-case-declarations
          const [first, ...rest] = paramList;
          if (rest.every((typeStruct) => typeStruct.equals(first))) {
            return [first];
          }
          return []; // Empty array means the types do not unify.
      }
    });
  }

  /**
   * Creates all combinations of elements in the subarrays as arrays. If any
   * subarray is an empty array, this evaluates to an empty array.
   * @param {!Array<!Array<*>>} firstArray The first array to add the items
   *     of the second array onto. Should be an array of arrays for proper
   *     combinating.
   * @param {!Array<*>} secondArray An array of elements used to create
   *     combinations.
   * @param {!Array<!Array<*>>} rest The rest of the arrays of elements.
   * @return {!Array<!Array<*>>} All combinations of elements in all of the
   *     subarrays.
   * @private
   */
  combine_([firstArray, ...[secondArray, ...rest]]) {
    if (!secondArray) {
      return firstArray;
    }
    const combined = firstArray.flatMap((a) =>
      secondArray.map((b) => [].concat(a, b)));
    return this.combine_([combined, ...rest]);
  }

  /**
   * Returns the parameters for the given type mapped to the parameters of the
   * descendant, or null if the actual types do not map in a valid way. If the
   * type does not have a parameter for a parameter of the descendant, the
   * element at that parameter's index will be null.
   * @param {!TypeDef} type The type we want to put the params in the
   *     order of the descendant for.
   * @param {string} descendantName The name of the descendant type we want
   *     to get the params in the order of.
   * @param {!Array<!TypeStructure>} actualParams The actual parameters to the
   *     type.
   * @return {Array<TypeStructure?>} The actualParams put in the order of the
   *     descendant's params, or null if no valid mapping can be found. If
   *     the given type does not have a parameter for a parameter of the
   *     descendant, the element at that parameter's index will be null.
   * @private
   */
  getParamsForDescendant_(type, descendantName, actualParams) {
    const descendantDef = this.types_.get(descendantName);
    const descendantToThis = descendantDef.getParamsForAncestor(type.name);
    const replacedParams = descendantDef.params().map((_) => null);

    const mapTypes = (formalParams, actualParams) => {
      // formalParams and actualParams should always have the same length due
      // to hierarchy validation.
      return formalParams.every((formalParam, i) => {
        const actualParam = actualParams[i];
        if (isGeneric(formalParam.name)) {
          const descParamInd = descendantDef.getIndexOfParam(formalParam.name);
          const currParam = replacedParams[descParamInd];
          if (currParam != null && !currParam.equals(actualParam)) {
            return false;
          }
          replacedParams[descParamInd] = duplicateStructure(actualParam);
          return true;
        }
        // TODO: This is assuming that the explicit types are compatible, but
        //  they may not be because we're not doing any filtering. See TODO in
        //  getNearestCommonDescedants.
        return mapTypes(formalParam.params, actualParam.params);
      });
    };

    return mapTypes(descendantToThis, actualParams) ? replacedParams : null;
  }
}

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
    this.descendants_ = new Set();
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
     * @type {!Map<string, !Array<!TypeStructure>>}
     * @private
     */
    this.ancestorParamsMap_ = new Map();
  }

  // TODO: Make all of the adding more consistent (always take def)

  /**
   * Adds the given type to the list of direct superTypes of this type.
   * @param {!TypeStructure} superType The type structure representing the type
   *     that is the supertype of this type.
   */
  addSuper(superType) {
    this.supers_.add(superType.name);
    this.ancestorParamsMap_.set(superType.name, superType.params);
  }

  /**
   * Adds the given type to the list of direct subtypes of this type.
   * @param {!TypeDef} subDef The type definition that defines the subtype.
   */
  addSub(subDef) {
    this.subs_.add(subDef.name);
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
      if (isGeneric(typeStruct.name)) {
        thisToAncestor.push(
            thisToSuper[superType.getIndexOfParam(typeStruct.name)]);
      } else {
        thisToAncestor.push(typeStruct);
      }
    });
    this.ancestorParamsMap_.set(ancestorName, thisToAncestor);
  }

  /**
   * Adds the given type to the list of descendants of this type.
   * @param {!TypeDef} descendantDef The type definition that defines the
   *     descendant.
   * @param {!TypeDef} subType The subtype that we get this descendant from.
   */
  addDescendant(descendantDef, subType) {
    this.descendants_.add(descendantDef.name);
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
      this.params_.splice(index, 0, param);
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
   * Returns a new set of all the parameter definitions of this type.
   * @return {!Array<ParamDef>} A new set of all the parameter definitions of
   *     this type.
   */
  params() {
    return [...this.params_];
  }

  /**
   * Returns an array of this type's parameters, in the order for its superType.
   * @param {string} ancestorName The caseless name of the ancestor to get the
   *     parameters for.
   * @param {!Array<!TypeStructure>=} actualTypes Optional actual types to
   *     substitute for parameters. These types may be generic.
   * @return {!Array<!TypeStructure>} This type's parameters, in the order for
   *     its superType.
   */
  getParamsForAncestor(ancestorName, actualTypes = undefined) {
    if (ancestorName == this.name && !this.ancestorParamsMap_.has(this.name)) {
      // Convert this type's params to a type structure.
      this.ancestorParamsMap_.set(
          this.name,
          this.params_.map((param) => {
            return new TypeStructure(param.name);
          }));
    }

    // Deep copy structure so that we don't have to worry about corruption.
    const params = this.paramsMap_.get(ancestorName)
        .map((param) => duplicateStructure(param));
    if (actualTypes) {
      const replaceFn = (param, i, array) => {
        if (!param) {
          return;
        }
        const paramIndex = this.getIndexOfParam(param.name);
        if (paramIndex != -1) {
          array[i] = actualTypes[paramIndex];
        } else {
          param.params.forEach(replaceFn, this);
        }
      };
      params.forEach(replaceFn, this);
    }
    return params;
  }

  /**
   * Returns true if this type has any parameters. False otherwise.
   * @return {boolean} True if this type has any parameters. False otherwise.
   */
  hasParameters() {
    return !!this.params_.length;
  }

  /**
   * Returns true if this type has a parameter with the given name.
   * False otherwise.
   * @param {string} paramName The caseless name of the possible parameter.
   * @return {boolean} True if this type has a parameter with the given name.
   *     False otherwise.
   */
  hasParameter(paramName) {
    return this.params_.some((param) => param.name == paramName);
  }

  /**
   * Returns the index of the parameter with the given name, or -1 if the
   * parameter does not exist..
   * @param {string} paramName The name of the parameter.
   * @return {number} The index of the parameter.
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

  /**
   * Returns the ParamDef with the given name, or undefined if not found.
   * @param {string} paramName The name of the parameter to find
   *     the ParamDef of.
   * @return {!ParamDef|undefined} The parameter with the given name, or
   *     undefined if not found.
   */
  getParamWithName(paramName) {
    return this.params_.find((param) => param.name == paramName);
  }
}

/**
 * Represents different parameter variances.
 * @enum {string}
 */
export const Variance = {
  CO: 'covariant',
  CONTRA: 'contravariant',
  INV: 'invariant',
};

/**
 * Converts a variance string to an actual variance.
 * @param {string} str The string to convert to a variance.
 * @return {!Variance} The converted variance value.
 */
export function stringToVariance(str) {
  str = str.toLowerCase();
  if (str.startsWith('inv')) {
    return Variance.INV;
  } else if (str.startsWith('contra')) {
    return Variance.CONTRA;
  } else if (str.startsWith('co')) {
    return Variance.CO;
  } else {
    throw new VarianceError('The variance "' + str + '" is not a valid ' +
        'variance. Valid variances are: "co", "contra", and "inv".');
  }
}

/**
 * Represents an error related to variances.
 */
export class VarianceError extends Error {
  /**
   * Constructs a VarianceError.
   * @param {string} message The message that goes with this error.
   */
  constructor(message) {
    super(message);

    this.name = this.constructor.name;
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

/**
 * Represents an error where the number of params on an actual type does not
 * match the number of types expected by the type definition.
 */
export class ActualParamsCountError extends Error {
  /**
   * Constructs an ActualParamsCountError.
   * @param {string} type The type the parameters are associated with.
   * @param {number} actualCount The number of parameters that were given.
   * @param {number} expectedCount The number of parameters that were expected,
   *     as defined by the type hierarchy definition.
   */
  constructor(type, actualCount, expectedCount) {
    super('The number of parameters to ' + type + ' did not match the ' +
        'expected number of parameters (as defined in the type hierarchy). ' +
        'Expected: ' + expectedCount + ', Actual: ', actualCount);

    /**
     * The type the parameters were associated with.
     * @type {string}
     */
    this.type = type;

    /**
     * The number of parameters that were given.
     * @type {number}
     */
    this.actualCount = actualCount;

    /**
     * The number of parameters that were expected.
     * @type {number}
     */
    this.expectedCount = expectedCount;

    this.name = this.constructor.name;
  }
}
