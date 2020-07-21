/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// TODO: Edit plugin overview.
/**
 * @fileoverview Plugin overview.
 */

import * as Blockly from 'blockly/core';
// TODO: Rename plugin and edit plugin description.
/**
 * Plugin description.
 */
export class StrictTypeChecker extends Blockly.ConnectionChecker {
  /**
   * Constructor for TODO.
   */
  constructor() {
    super();
  }

  /**
   * Initialize.
   */
  init() { }

  /**
   * Type check arrays must either intersect or both be null.
   * @override
   */
  doTypeChecks(a, b) {
    const checkArrayOne = a.getCheck();
    const checkArrayTwo = b.getCheck();

    if (!checkArrayOne || !checkArrayTwo) {
      // Null arrays can only connect to other null arrays.
      return checkArrayOne == checkArrayTwo;
    }

    // Find any intersection in the check lists.
    for (let i = 0; i < checkArrayOne.length; i++) {
      if (checkArrayTwo.indexOf(checkArrayOne[i]) != -1) {
        return true;
      }
    }
    // No intersection.
    return false;
  }
}
