/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A field for a plus button used for mutation.
 */
'use strict';

import * as Blockly from 'blockly/core';

/**
 * Plus button used for mutation.
 */
export class FieldPlus extends Blockly.FieldImage {
  /**
   * Plus button used for mutation.
   * @param {Object} opt_args Arguments to pass to the 'plus' function when the
   *    button is clicked.
   * @constructor
   */
  constructor(opt_args) {
    super(plusImage, 15, 15, undefined, FieldPlus.onClick_);

    /**
     * Untyped args passed to block.plus when the field is clicked.
     * @type {Object}
     * @private
     */
    this.args_ = opt_args;
  }

  /**
   * Constructs a FieldPlus from a JSON arg object.
   * @param {!Object} options A JSON object with an optional arg value.
   * @return {FieldPlus} The new field instance.
   * @package
   * @nocollapse
   */
  static fromJson(options) {
    return new FieldPlus(options['args']);
  }

  /**
   * Calls block.plus(args) when the plus field is clicked.
   * @param {!FieldPlus} plusField The field being clicked.
   * @private
   */
  static onClick_(plusField) {
    // TODO: This is a dupe of the mutator code, anyway to unify?
    const block = plusField.getSourceBlock();

    Blockly.Events.setGroup(true);

    const oldMutationDom = block.mutationToDom();
    const oldMutation = oldMutationDom && Blockly.Xml.domToText(oldMutationDom);

    block.plus(plusField.args_);

    const newMutationDom = block.mutationToDom();
    const newMutation = newMutationDom && Blockly.Xml.domToText(newMutationDom);

    if (oldMutation != newMutation) {
      Blockly.Events.fire(new Blockly.Events.BlockChange(
          block, 'mutation', null, oldMutation, newMutation));
    }
    Blockly.Events.setGroup(false);
  }
}

const plusImage =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC' +
    '9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPSJNMT' +
    'ggMTBoLTR2LTRjMC0xLjEwNC0uODk2LTItMi0ycy0yIC44OTYtMiAybC4wNzEgNGgtNC4wNz' +
    'FjLTEuMTA0IDAtMiAuODk2LTIgMnMuODk2IDIgMiAybDQuMDcxLS4wNzEtLjA3MSA0LjA3MW' +
    'MwIDEuMTA0Ljg5NiAyIDIgMnMyLS44OTYgMi0ydi00LjA3MWw0IC4wNzFjMS4xMDQgMCAyLS' +
    '44OTYgMi0ycy0uODk2LTItMi0yeiIgZmlsbD0id2hpdGUiIC8+PC9zdmc+Cg==';

Blockly.fieldRegistry.register('field_plus', FieldPlus);
