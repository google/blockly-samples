/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Defines functions for validation a type hierarchy definition.
 */
'use strict';

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

  checkConflictingTypes(hierarchyDef);
  checkSupersDefined(hierarchyDef);
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
      if (!types.has(superType.toLowerCase())) {
        console.error(errorMsg, type, superType);
      }
    }
  }
}
