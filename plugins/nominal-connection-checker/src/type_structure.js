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

// The below can be turned into a factory pattern if we ever want to allow for
// different ways of writing type strings.

/**
 * Parses a string into a TypeStructure.
 * @param {string} str The string to parse.
 * @param {boolean=} caseless Whether we should convert names to lowercase
 *     (caseless).
 * @return {!TypeStructure} The created TypeStructure.
 */
export function parseType(str, caseless = true) {
  validateBrackets(str);
  return parseType_(str, caseless);
}

/**
 * Validates that the string's brackets represent a parsable type.
 * @param {string} str The string to parse.
 * @throws {LeftBracketError|RightBracketError|ExtraCharactersError}
 */
function validateBrackets(str) {
  let left = 0;
  let right = 0;

  [...str].forEach((c, i) => {
    if (c == '[') {
      left++;
    } else if (c == ']') {
      right++;
    }
    if (right > left) {
      throw new RightBracketError(str, i);
    }
    if (right != 0 && right == left && i != str.length - 1) {
      throw new ExtraCharactersError(str, i + 1);
    }
  });

  if (left > right) {
    throw new LeftBracketError(str, str.indexOf('['));
  }
}

/**
 * Parses a string into a type structure. This is the internal implementation.
 * @param {string} str The string to parse.
 * @param {boolean} caseless Whether we should convert names to lowercase
 *     (caseless).
 * @return {!TypeStructure} The created TypeStructure.
 * @private
 * @throws {MissingTypeNameError}
 */
function parseType_(str, caseless) {
  if (str[0] == '[') {
    throw new MissingTypeNameError(str, 0);
  }

  // Split the string into before brackets (type name), and inside (params).
  const tokens = str.match(/([^[]+)(?:\[(.+)])?/);
  const name = caseless ? tokens[1].toLowerCase() : tokens[1];
  const typeStruct = new TypeStructure(name);
  if (tokens[2]) {
    try {
      typeStruct.params = parseParams_(tokens[2], caseless);
    } catch (e) {
      if (e instanceof MissingTypeNameError) {
        throw new MissingTypeNameError(str, tokens[1].length + 1 + e.index);
      }
    }
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
          params.push(parseType_(str.slice(latestIndex, i + 1), caseless));
          latestIndex = -1;
        }
        break;
      case ',':
      case ' ':
        if (!openBraceCount && latestIndex != -1) {
          params.push(parseType_(str.slice(latestIndex, i), caseless));
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
    params.push(parseType_(str.slice(latestIndex), caseless));
  }
  return params;
}

/**
 * Represents an error in parsing a type string. Includes a pointer to where
 * the problem might be.
 */
export class TypeParseError extends Error {
  /**
   * Constructs a type parse error.
   * @param {string} type The type string that caused the error.
   * @param {number} index The index where the error is likely to be.
   * @param {string} message A preamble explaining the nature of the error.
   */
  constructor(type, index, message) {
    super(message);

    this.name = this.constructor.name;

    this.customMessage = this.message;

    this.type = type;

    this.index = index;

    this.message = this.customMessage + '\n    ' + this.type + '\n' +
        ' '.repeat(4 + this.index) + '^';
  }
}

/**
 * Represents a problem with an unmatched right bracket.
 */
export class RightBracketError extends TypeParseError {
  /**
   * Constructs the right bracket error.
   * @param {string} type The type string that caused the error.
   * @param {number} index The index where the error is likely to be.
   */
  constructor(type, index) {
    super(type, index, 'The type ' + type + ' has an unmatched right bracket.');
  }
}

/**
 * Represents a problem with an unmatched left bracket.
 */
export class LeftBracketError extends TypeParseError {
  /**
   * Constructs the left bracket error.
   * @param {string} type The type string that caused the error.
   * @param {number} index The index where the error is likely to be.
   */
  constructor(type, index) {
    super(type, index, 'The type ' + type + ' has an unmatched left bracket.');
  }
}

/**
 * Represents a problem where the type string's parameters have been closed in
 * brackets, but the string still contains more characters.
 */
export class ExtraCharactersError extends TypeParseError {
  /**
   * Constructs the extra characters error.
   * @param {string} type The type string that caused the error.
   * @param {number} index The index where the error is likely to be.
   */
  constructor(type, index) {
    super(type, index, 'The type ' + type + ' has extra characters after the ' +
        'parameter list.');
  }
}

/**
 * Represents a problem where a parameters list is missing a type name.
 */
export class MissingTypeNameError extends TypeParseError {
  /**
   * Constructs the missing type name error.
   * @param {string} type The type string that caused the error.
   * @param {number} index The index where the error is likely to be.
   */
  constructor(type, index) {
    super(type, index, 'Parameterized type ' + type + ' does not include a ' +
      'type name.');
  }
}
