/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Defines functions for validating a type hierarchy definition.
 */
'use strict';

import {isGeneric} from './utils';
import {Variance, stringToVariance, VarianceError} from './type_hierarchy';
import {TypeStructure, parseType,
  structureToString, TypeParseError} from './type_structure';

/**
 * Validates the given hierarchy definition. Does checks for duplicate types,
 * circular dependencies, etc. Errors are logged to the console (not thrown).
 * @param {!Object} hierarchyDef The definition of the type hierarchy.
 */
export function validateHierarchy(hierarchyDef) {
  if (!hierarchyDef ||
      typeof hierarchyDef != 'object' ||
      Array.isArray(hierarchyDef)) {
    console.error('The hierarchy definition should be an object.');
    return;
  }

  checkCharacters(hierarchyDef, [
    [',', 'comma'],
    [' ', 'space'],
    ['[', 'left bracket'],
    [']', 'right bracket'],
  ]);
  checkGenerics(hierarchyDef);
  checkConflictingTypes(hierarchyDef);
  checkParamsIsArray(hierarchyDef);
  checkParamNames(hierarchyDef);
  checkConflictingParams(hierarchyDef);
  checkParamVariances(hierarchyDef);
  checkFulfillsIsArray(hierarchyDef);
  checkSupersParsing(hierarchyDef);
  checkSupersDefined(hierarchyDef);
  checkDupeSupers(hierarchyDef);
  checkSuperParamsDefined(hierarchyDef);
  checkSuperNumParamsCorrect(hierarchyDef);
  checkSuperParamVariancesCompatible(hierarchyDef);
  checkCircularDependencies(hierarchyDef);
}

/**
 * Checks the hierarchyDef for conflicting types.
 * @param {!Object} hierarchyDef The definition of the type hierarchy.
 */
function checkConflictingTypes(hierarchyDef) {
  const conflictMsg =
      `The type name '%s' conflicts with the type name(s) [%s]`;

  // Map of caseless names to cased names.
  const definedTypes = new Map();
  // Map of original names to arrays of conflicting names.
  const conflictingTypes = new Map();

  for (const type of Object.keys(hierarchyDef)) {
    const caselessType = type.toLowerCase();
    if (definedTypes.has(caselessType)) {
      const originalType = definedTypes.get(caselessType);
      if (!conflictingTypes.has(originalType)) {
        conflictingTypes.set(originalType, [type]);
      } else {
        conflictingTypes.get(originalType).push(type);
      }
    } else {
      definedTypes.set(caselessType, type);
    }
  }

  for (const [type, conflicts] of conflictingTypes) {
    console.error(conflictMsg, type, conflicts.join(', '));
  }
}

/**
 * Checks the hierarchy definition for any parameters which do not have names,
 * or have names which are not generic.
 * @param {!Object} hierarchyDef The definition of the type hierarchy.
 */
function checkParamNames(hierarchyDef) {
  const noNameMsg = 'Parameter #%s of %s does not declare a name, which is ' +
      'required.';
  const errorMsg = 'The parameter name %s of %s is invalid. Parameter names ' +
      'must be a single character.';

  for (const type of Object.keys(hierarchyDef)) {
    const typeDef = hierarchyDef[type];
    if (!typeDef.params || !Array.isArray(typeDef.params)) {
      continue;
    }

    for (let i = 0; i < typeDef.params.length; i++) {
      const param = typeDef.params[i];
      if (!param.name) {
        console.error(noNameMsg, i + 1, type);
        continue;
      }
      if (!isGeneric(param.name)) {
        console.error(errorMsg, param.name, type);
      }
    }
  }
}

/**
 * Checks the hierarchy definition for any type parameters with conflicting
 * names.
 * @param {!Object} hierarchyDef The definition of the type hierarchy.
 */
function checkConflictingParams(hierarchyDef) {
  const conflictMsg = 'The param name %s in %s conflicts with the ' +
      'param(s) [%s]';

  for (const type of Object.keys(hierarchyDef)) {
    const typeDef = hierarchyDef[type];
    if (!typeDef.params || !Array.isArray(typeDef.params)) {
      continue;
    }

    // Map of caseless names to cased names.
    const definedParamNames = new Map();
    // Map of original names to arrays of [position, conflicting name].
    const conflictingParamNames = new Map();
    for (let i = 0; i < typeDef.params.length; i++) {
      const param = typeDef.params[i];
      if (!param.name) {
        continue;
      }
      const caselessName = param.name.toLowerCase();
      if (definedParamNames.has(caselessName)) {
        const originalParam = definedParamNames.get(caselessName);
        if (!conflictingParamNames.has(originalParam)) {
          conflictingParamNames.set(originalParam, [[i + 1, param.name]]);
        } else {
          conflictingParamNames.get(originalParam).push([i + 1, param.name]);
        }
      } else {
        definedParamNames.set(caselessName, param.name);
      }
    }

    for (let [param, conflicts] of conflictingParamNames) {
      conflicts = conflicts.map((tuple) =>
        '#' + tuple[0] + ' (' + tuple[1] + ')');
      console.error(conflictMsg, param, type, conflicts.join(', '));
    }
  }
}

/**
 * Checks that the variances of all parameters in the hierarchy are provided and
 * valid.
 * @param {!Object} hierarchyDef The definition of the type hierarchy.
 */
function checkParamVariances(hierarchyDef) {
  const noVarianceMsg = 'The parameter %s of %s does not declare a variance, ' +
      'which is required.';
  const errorMsg = 'The parameter %s of %s threw the following error: %s';

  for (const type of Object.keys(hierarchyDef)) {
    const typeDef = hierarchyDef[type];
    if (!typeDef.params || !Array.isArray(typeDef.params)) {
      continue;
    }
    for (const param of typeDef.params) {
      if (!param.variance) {
        console.error(noVarianceMsg, param.name, type);
        continue;
      }
      try {
        stringToVariance(param.variance);
      } catch (e) {
        if (e instanceof VarianceError) {
          console.error(errorMsg, param.name, type, e);
        } else {
          throw e;
        }
      }
    }
  }
}

/**
 * Checks the hierarchy def for any super types (eg 'fulfills': ['type']) which
 * are not defined as top-level types.
 * @param {!Object} hierarchyDef The definition of the type hierarchy.
 */
function checkSupersDefined(hierarchyDef) {
  const errorMsg = 'The type %s says it fulfills the type %s, but that type' +
      ' is not defined.';
  const genericMsg = 'The type %s says it fulfills the type %s, but that type' +
      ' appears to be generic, which is not allowed.';

  const types = new Set();
  const keys = Object.keys(hierarchyDef);
  for (const type of keys) {
    types.add(type.toLowerCase());
  }
  for (const type of keys) {
    const typeInfo = hierarchyDef[type];
    if (!typeInfo.fulfills || !Array.isArray(typeInfo.fulfills)) {
      continue;
    }
    for (const superType of typeInfo.fulfills) {
      try {
        const superName = parseType(superType, false).name;
        if (!types.has(superName.toLowerCase())) {
          if (isGeneric(superName)) {
            console.error(genericMsg, type, superName);
          } else {
            console.error(errorMsg, type, superName);
          }
        }
      } catch (e) {
        if (!(e instanceof TypeParseError)) {
          throw e;
        } // Otherwise it will have been handled by our specific check.
      }
    }
  }
}

/**
 * Checks the hierarchy def for any types which include the same type multiple
 * times in their fulfills array. Logs an error to the console if found.
 * @param {!Object} hierarchyDef The definition of the type hierarchy.
 */
function checkDupeSupers(hierarchyDef) {
  const errorMsg = 'The type %s fulfills the type %s multiple times.';

  for (const type of Object.keys(hierarchyDef)) {
    const typeInfo = hierarchyDef[type];
    if (!typeInfo.fulfills || !Array.isArray(typeInfo.fulfills)) {
      continue;
    }
    const supersSeen = new Set();
    const supersSeenMultiple = new Map();
    for (const superType of typeInfo.fulfills) {
      try {
        const superName = parseType(superType, false).name;
        const lowerCaseName = superName.toLowerCase();
        if (supersSeen.has(lowerCaseName)) {
          supersSeenMultiple.set(lowerCaseName, superName);
        } else {
          supersSeen.add(lowerCaseName);
        }
      } catch (e) {
        if (!(e instanceof TypeParseError)) {
          throw e;
        } // Otherwise it will have been handled by our specific check.
      }
    }
    for (const [, casedName] of supersSeenMultiple) {
      console.error(errorMsg, type, casedName);
    }
  }
}

/**
 * Checks the hierarchy def for any parameterized super types
 * (eg 'fulfills': ['typeA[A]', 'typeB[typeC]']) which are not defined as
 * top-level types, or which are generic, and not defined in the type's params.
 * @param {!Object} hierarchyDef The definition of the type hierarchy.
 */
function checkSuperParamsDefined(hierarchyDef) {
  const errorMsg = 'The type %s says it fulfills the type %s, but %s ' +
      'is not defined.';
  const genericErrorMsg = errorMsg + ' It appears to be generic, it should ' +
      'probably be defined as part of the type\'s params array.';

  /**
   * Checks that all parameter names are defined. In the case of explicit types,
   * they must be defined in the type hierarchy. In the case of generic types,
   * they must be defined in the type's params array.
   * @param {string} typeName The name of the type we are checking the
   *     supers of.
   * @param {!Object} typeDef The definition of the type we are checking the
   *     supers of.
   * @param {string} superType The stringified super type structure we are
   *     checking the parameters of.
   * @param {!TypeStructure} superStructure The structure of the super type
   *     we are checking the parameters of. May not match the superType, because
   *     this function works recursively.
   */
  function checkParamsRec(typeName, typeDef, superType, superStructure) {
    for (const superParam of superStructure.params) {
      if (isGeneric(superParam.name)) {
        const defined = typeDef.params && typeDef.params.some((defParam) => {
          return defParam.name.toLowerCase() == superParam.name.toLowerCase();
        });
        if (!defined) {
          console.error(genericErrorMsg, typeName, superType, superParam.name);
        }
      } else {
        if (!types.has(superParam.name.toLowerCase())) {
          console.error(errorMsg, typeName, superType, superParam.name);
        }
      }
      checkParamsRec(typeName, typeDef, superType, superParam);
    }
  }

  const types = new Set();
  const keys = Object.keys(hierarchyDef);
  for (const type of keys) {
    types.add(type.toLowerCase());
  }
  for (const type of keys) {
    const typeInfo = hierarchyDef[type];
    if (!typeInfo.fulfills || !Array.isArray(typeInfo.fulfills)) {
      continue;
    }
    for (const superType of typeInfo.fulfills) {
      try {
        const superStructure = parseType(superType, false);
        checkParamsRec(type, typeInfo, superType, superStructure);
      } catch (e) {
        if (!(e instanceof TypeParseError)) {
          throw e;
        } // Otherwise it will have been handled by our specific check.
      }
    }
  }
}

/**
 * Checks the hierarchy def for any parameterized super types that are not
 * provided the correct number of types. Also checks for cases where generic
 * parameters are given type lists, which is not allowed.
 * @param {!Object} hierarchyDef The definition of the type hierarchy.
 */
function checkSuperNumParamsCorrect(hierarchyDef) {
  const errorMsg = 'The type %s says it fulfills the type %s, but %s requires' +
      ' %s type(s) while %s type(s) are provided.';
  const genericErrorMsg = 'The type %s says it fulfills the type %s, but %s ' +
      'appears to be generic and have parameters, which is not allowed.';
  const keys = Object.keys(hierarchyDef);

  // Maps caseless type names to their type info. Allows for case differences.
  const types = new Map();
  for (const type of keys) {
    types.set(type.toLowerCase(), hierarchyDef[type]);
  }

  /**
   * Checks that all parameterized types are given the correct number of
   * parameters. Also logs an error if a generic type is given any parameters.
   * @param {string} typeName The name of the type we are checking the
   *     supers of.
   * @param {string} superType The stringified super type structure we are
   *     checking the parameters of.
   * @param {!TypeStructure} superStructure The structure of the super type
   *     we are checking the parameters of. May not match the superType, because
   *     this function works recursively.
   */
  function checkNumParamsRec(typeName, superType, superStructure) {
    const superName = superStructure.name;
    if (isGeneric(superName)) {
      if (superStructure.params.length) {
        console.error(
            genericErrorMsg, typeName, superType, superName);
      }
      return;
    }

    const superDef = types.get(superName.toLowerCase());
    if (!superDef) {
      // Super is not defined, this is handled elsewhere.
      return;
    }
    const required = superDef.params && Array.isArray(superDef.params) ?
        superDef.params.length : 0;
    const provided = superStructure.params.length;
    if (required != provided) {
      console.error(
          errorMsg, typeName, superType, superName, required, provided);
    }

    superStructure.params.forEach((param) =>
      checkNumParamsRec(typeName, superType, param));
  }

  for (const type of keys) {
    const typeInfo = types.get(type.toLowerCase());
    if (!typeInfo.fulfills || !Array.isArray(typeInfo.fulfills)) {
      continue;
    }
    for (const superType of typeInfo.fulfills) {
      try {
        const superStructure = parseType(superType, false);
        checkNumParamsRec(type, superType, superStructure);
      } catch (e) {
        if (!(e instanceof TypeParseError)) {
          throw e;
        } // Otherwise it will have been handled by our specific check.
      }
    }
  }
}

/**
 * Checks the hierarchy def for any parameterized super types that are not
 * provided the correct variance of parameter.
 * @param {!Object} hierarchyDef The definition of the type hierarchy.
 */
function checkSuperParamVariancesCompatible(hierarchyDef) {
  const keys = Object.keys(hierarchyDef);

  // Maps caseless type names to their type info. Allows for case differences.
  const types = new Map();
  for (const type of keys) {
    types.set(type.toLowerCase(), hierarchyDef[type]);
  }

  for (const type of keys) {
    const typeInfo = types.get(type.toLowerCase());
    if (!typeInfo.fulfills || !Array.isArray(typeInfo.fulfills)) {
      continue;
    }
    for (const superType of typeInfo.fulfills) {
      try {
        const superStructure = parseType(superType, false);
        checkParamVariancesRec(types, type, superType, superStructure);
      } catch (e) {
        if (!(e instanceof TypeParseError)) {
          throw e;
        } // Otherwise it will have been handled by our specific check.
      }
    }
  }
}

/**
 * Checks that the variances of the parameters passed to the super type are
 * compatible with that type's definition of those parameters.
 * @param {!Map<string, Object>} types A map of lowercase type names to their
 *     definitions.
 * @param {string} typeName The name of the type we are checking the
 *     supers of.
 * @param {string} superType The stringified super type structure we are
 *     checking the parameters of.
 * @param {!TypeStructure} superStructure The structure of the super type
 *     we are checking the parameters of. May not match the superType, because
 *     this function works recursively.
 */
function checkParamVariancesRec(types, typeName, superType, superStructure) {
  const typeDef = types.get(typeName.toLowerCase());
  const superDef = types.get(superStructure.name.toLowerCase());
  if (!superDef || !superDef.params || !Array.isArray(superDef.params)) {
    return;
  }

  for (let i = 0; i < superDef.params.length; i++) {
    const superParam = superDef.params[i];
    const structureParam = superStructure.params[i];
    if (!structureParam) {
      continue;
    }
    const typeParam = typeDef.params && typeDef.params.find((param) =>
      param.name.toLowerCase() == structureParam.name.toLowerCase());
    if (!typeParam || !typeParam.variance || !superParam.variance) {
      continue;
    }
    const formalVariance = stringToVariance(superParam.variance);
    const actualVariance = stringToVariance(typeParam.variance);
    if (!variancesAreCompatible(formalVariance, actualVariance)) {
      console.error(constructVarianceErrorMsg(
          typeName, superStructure.name, superType, superParam.name,
          typeParam.name, formalVariance, actualVariance));
    }
  }

  superStructure.params.forEach((param) =>
    checkParamVariancesRec(types, typeName, superType, param));
}

/**
 * Returns true if the actual variance is compatible with the formal
 * variance. False otherwise.
 * @param {!Variance} formalVariance The of the parameter in the super's
 *     definition.
 * @param {!Variance} actualVariance The variance of the parameter in the
 *     sub's definition.
 * @return {boolean} Whether the two variances are compatible or not.
 */
function variancesAreCompatible(formalVariance, actualVariance) {
  switch (formalVariance) {
    case Variance.CO:
      return actualVariance != Variance.CONTRA;
    case Variance.CONTRA:
      return actualVariance != Variance.CO;
    case Variance.INV:
      return actualVariance == Variance.INV;
  }
}

/**
 * Constructs an error message in the case that variances are not compatible.
 * @param {string} type The name of the type subtyping the super.
 * @param {string} superName The name of the specific super type that was
 *     passed an incompatible parameter.
 * @param {string} superType The full stringified super type structure the bad
 *     parameter is a part of.
 * @param {string} formalParam The parameter in the super type's definition
 *     that was passed an incompatible parameter.
 * @param {string} actualParam The parmater in the actual type's definition
 *     that was incompatible.
 * @param {!Variance} formalVariance The variance of the formal parameter.
 * @param {!Variance} actualVariance The variance of the actual paramter.
 * @return {string} An error message representing the given situation.
 */
function constructVarianceErrorMsg(type, superName, superType, formalParam,
    actualParam, formalVariance, actualVariance) {
  return 'The type ' + type + ' says it fulfills the type ' + superType +
      ', but the parameter ' + formalParam + ' of ' + superName + ' is ' +
      varianceToString(formalVariance) + ' (which is only compatible with ' +
      compatibleVariancesString(formalVariance) + ') while ' + actualParam +
      ' is ' + varianceToString(actualVariance) + '.';
}

/**
 * Returns a stringified version of the given variance.
 * @param {!Variance} variance The variance to stringify.
 * @return {string} The stringified variance.
 */
function varianceToString(variance) {
  switch (variance) {
    case Variance.CO:
      return 'covariant';
    case Variance.CONTRA:
      return 'contravariant';
    case Variance.INV:
      return 'invariant';
  }
}

/**
 * Returns a string of all of the variances that are compatible with this
 * variance.
 * @param {!Variance} variance The variance to return the compatible
 *     variances of.
 * @return {string} A string of the compatible variances.
 */
function compatibleVariancesString(variance) {
  switch (variance) {
    case Variance.CO:
      return 'covariant and invariant';
    case Variance.CONTRA:
      return 'contravariant and invariant';
    case Variance.INV:
      return 'invariant';
  }
}


/**
 * Checks for any circular dependencies between types. Eg:
 * 'typeA': {
 *   'fulfills': ['typeB']
 * },
 * 'typeB': {
 *   'fulfills': ['typeA']
 * }.
 * @param {!Object} hierarchyDef The definition of the type hierarchy.
 */
function checkCircularDependencies(hierarchyDef) {
  /**
   * Searches cycles in the type hierarchy recursively.
   * @param {!Map<string, Object>} types A map of lowercase type names to their
   *     definitions.
   * @param {string} typeName The name of the current type being examined.
   * @param {!Array<!TypeStructure>} currentTraversal An array of all the types
   *     that have been visited since our entry node.
   */
  function searchForCyclesRec(types, typeName, currentTraversal) {
    try {
      const typeStructure = parseType(typeName, false);
      const caselessName = typeStructure.name.toLowerCase();
      const typeInfo = types.get(caselessName);
      if (!typeInfo) {
        return;
      }
      visitedTypes.add(caselessName);
      if (currentTraversal.some(
          (type) => type.name.toLowerCase() == caselessName)) {
        logCircularDependency([...currentTraversal, typeStructure]);
        return;
      }

      currentTraversal.push(typeStructure);

      if (typeInfo.fulfills && Array.isArray(typeInfo.fulfills)) {
        for (const superType of typeInfo.fulfills) {
          searchForCyclesRec(types, superType, currentTraversal);
        }
      }

      currentTraversal.pop();
    } catch (e) {
      if (!(e instanceof TypeParseError)) {
        throw e;
      } // Otherwise it will have been handled by our specific check.
    }
  }

  const visitedTypes = new Set();

  // Maps caseless type names to their type info. Allows for case differences.
  const types = new Map();
  for (const type of Object.keys(hierarchyDef)) {
    types.set(type.toLowerCase(), hierarchyDef[type]);
  }

  for (const type of Object.keys(hierarchyDef)) {
    const caselessName = type.toLowerCase();
    if (!visitedTypes.has(caselessName)) {
      searchForCyclesRec(types, type, []);
    }
  }
}

/**
 * Logs an informative error about a cyclic dependency.
 * @param {!Array<!TypeStructure>} cycleArray An array of all the types that
 *     have been visited since our entry node.
 */
function logCircularDependency(cycleArray) {
  const lastType = cycleArray[cycleArray.length - 1].name.toLowerCase();
  const index = cycleArray.findIndex(
      (elem) => elem.name.toLowerCase() == lastType);
  const firstType = cycleArray[index].name;

  let errorMsg = 'The type ' + firstType + ' creates a circular dependency: ' +
      firstType;
  for (let i = index + 1; i < cycleArray.length; i++) {
    errorMsg += ' fulfills ' + structureToString(cycleArray[i]);
  }
  console.error(errorMsg);
}

/**
 * Checks for any type names that also fulfill the properties of being generic
 * type names. Eg 'A', 'a', '*', '1', etc.
 * @param {!Object} hierarchyDef The definition of the type hierarchy.
 */
function checkGenerics(hierarchyDef) {
  const error = 'The type %s will act like a generic type if used as a ' +
      'connection check, because it is a single character.';

  for (const type of Object.keys(hierarchyDef)) {
    if (isGeneric(type)) {
      console.error(error, type);
    }
  }
}

/**
 * Checks that none of the types in the hierarchy contain any of the given
 * characters.
 * @param {!Object} hierarchyDef The definition of the type hierarchy.
 * @param {!Array<!Array<string>>} chars An array of tuples containing
 *     characters and english character names. Eg [',', 'comma'].
 */
function checkCharacters(hierarchyDef, chars) {
  const error = 'The type %s includes an illegal %s character (\'%s\').';

  for (const type of Object.keys(hierarchyDef)) {
    for (const [char, charName] of chars) {
      if (type.includes(char)) {
        console.error(error, type, charName, char);
      }
    }
  }
}

/**
 * Checks that all of the super types of a type parse correctly.
 * @param {!Object} hierarchyDef The definition of the type hierarchy.
 */
function checkSupersParsing(hierarchyDef) {
  const error = 'The type %s fulfills the type %s, which threw the parsing ' +
      'error: %s';

  for (const typeName of Object.keys(hierarchyDef)) {
    const type = hierarchyDef[typeName];
    if (!type.fulfills || !Array.isArray(type.fulfills)) {
      continue;
    }
    for (const superType of type.fulfills) {
      try {
        parseType(superType);
      } catch (e) {
        console.error(error, typeName, superType, e);
      }
    }
  }
}

/**
 * Checks that if a fulfills property is provided, it is an array.
 * @param {!Object} hierarchyDef The definition of the type hierarchy.
 */
function checkFulfillsIsArray(hierarchyDef) {
  const error = 'The type %s provides a `fulfills` property, but it is not an' +
      ' array';

  for (const typeName of Object.keys(hierarchyDef)) {
    const type = hierarchyDef[typeName];
    if (type.fulfills && !Array.isArray(type.fulfills)) {
      console.error(error, typeName);
    }
  }
}

/**
 * Checks that if a params property is provided, it is an array.
 * @param {!Object} hierarchyDef The definition of the type hierarchy.
 */
function checkParamsIsArray(hierarchyDef) {
  const error = 'The type %s provides a `params` property, but it is not an' +
      ' array';

  for (const typeName of Object.keys(hierarchyDef)) {
    const type = hierarchyDef[typeName];
    if (type.params && !Array.isArray(type.params)) {
      console.error(error, typeName);
    }
  }
}
