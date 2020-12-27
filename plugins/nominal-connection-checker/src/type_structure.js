/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Defines the TypeStructure.
 */
'use strict';


/**
 * Represents the structure of a type, include type name, parameters, etc.
 */
export class TypeStructure {
  /**
   * Constructs the TypeStructure.
   * @param {string} name The name of the type.
   */
  constructor(name) {
    /**
     * The name of the type.
     * @type {string}
     */
    this.name = name;

    /**
     * The parameters of the type.
     * @type {!Array<!TypeStructure>}
     */
    this.params = [];
  }
}

// The below can be turned into a factory pattern if we want to allow for
// different ways of writing type strings.

/**
 * Parses a string into a TypeStructure.
 * @param {string} str The string to parse.
 * @param {boolean=} caseless Whether we should convert names to lowercase
 *     (caseless).
 * @return {TypeStructure} The created TypeStructure.
 */
export function parseType(str, caseless = true) {
  const tokens = str.match(/([^[]+)(?:\[(.+)])?/);
  const name = caseless ? tokens[1].toLowerCase() : tokens[1];
  const typeStruct = new TypeStructure(name);
  if (tokens[2]) {
    typeStruct.params = parseParams_(tokens[2], caseless);
  }
  return typeStruct;
}

/**
 * Parses a string into an array of type structures.
 * @param {string} str The string to parse into an array of type structures.
 *     The string is expected to not be surrounded by brackets.
 * @param {boolean=} caseless Whether we should convert names to lowercase
 *     (caseless).
 * @return {!Array<!TypeStructure>} The created TypeStructure array.
 * @private
 */
function parseParams_(str, caseless) {
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
          params.push(parseType(str.slice(latestIndex, i + 1), caseless));
          latestIndex = -1;
        }
        break;
      case ',':
      case ' ':
        if (!openBraceCount && latestIndex != -1) {
          params.push(parseType(str.slice(latestIndex, i), caseless));
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
    params.push(parseType(str.slice(latestIndex), caseless));
  }
  return params;
}
