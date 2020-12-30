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
  checkSupersParsing(hierarchyDef);
  checkSupersDefined(hierarchyDef);
  checkCircularDependencies(hierarchyDef);
}

/**
 * Checks the hierarchyDef for conflicting types.
 * @param {!Object} hierarchyDef The definition of the type hierarchy.
 */
function checkConflictingTypes(hierarchyDef) {
  const conflictMsg = 'The type name \'%s\' conflicts with the type name(s) %s';

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
    console.error(conflictMsg, type, conflicts);
  }
}

/**
 * Checks the hierarchy def for any super types (eg 'fulfills': ['type]) which
 * are not defined as top-level types.
 * @param {!Object} hierarchyDef The definition of the type hierarchy.
 */
function checkSupersDefined(hierarchyDef) {
  const errorMsg = 'The type %s says it fulfills the type %s, but that type' +
      ' is not defined';

  const types = new Set();
  const keys = Object.keys(hierarchyDef);
  for (const type of keys) {
    types.add(type.toLowerCase());
  }
  for (const type of keys) {
    const typeInfo = hierarchyDef[type];
    if (!typeInfo.fulfills) {
      continue;
    }
    for (const superType of typeInfo.fulfills) {
      try {
        const superName = parseType(superType, false).name;
        if (!types.has(superName.toLowerCase())) {
          console.error(errorMsg, type, superName);
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
   * @param {string} typeName The name of the current type being examined.
   * @param {!Array<!TypeStructure>} currentTraversal An array of all the types
   *     that have been visited since our entry node.
   */
  function searchForCyclesRec(typeName, currentTraversal) {
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

      if (typeInfo.fulfills) {
        for (const superType of typeInfo.fulfills) {
          searchForCyclesRec(superType, currentTraversal);
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
      searchForCyclesRec(type, []);
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
    if (!type.fulfills) {
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
