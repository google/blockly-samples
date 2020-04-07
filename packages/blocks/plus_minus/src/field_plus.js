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
    super('media/plus.svg', 15, 15, undefined, FieldPlus.onClick_);

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

Blockly.fieldRegistry.register('field_plus', FieldPlus);
