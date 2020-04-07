/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A field for a minus button used for mutation.
 */
'use strict';

import * as Blockly from 'blockly/core';

/**
 * Minus button used for mutation.
 */
export class FieldMinus extends Blockly.FieldImage {
  /**
   * Minus button used for mutation.
   * @param {Object} opt_args Arguments to pass to the 'plus' function when the
   *    button is clicked.
   * @constructor
   */
  constructor(opt_args) {
    super(minusImage, 15, 15, undefined, FieldMinus.onClick_);

    /**
     * Untyped args passed to block.minus when the field is clicked.
     * @type {Object}
     * @private
     */
    this.args_ = opt_args;
  }

  /**
   * Constructs a FieldMinus from a JSON arg object.
   * @param {!Object} options A JSON object with an optional arg value.
   * @return {FieldMinus} The new field instance.
   * @package
   * @nocollapse
   */
  static fromJson(options) {
    return new FieldMinus(options['args']);
  }

  /**
   * Calls block.minus(args) when the minus field is clicked.
   * @param {!FieldMinus} minusField The field being clicked.
   * @private
   */
  static onClick_(minusField) {
    // TODO: This is a dupe of the mutator code, anyway to unify?
    const block = minusField.getSourceBlock();

    Blockly.Events.setGroup(true);

    const oldMutationDom = block.mutationToDom();
    const oldMutation = oldMutationDom && Blockly.Xml.domToText(oldMutationDom);

    block.minus(minusField.args_);

    const newMutationDom = block.mutationToDom();
    const newMutation = newMutationDom && Blockly.Xml.domToText(newMutationDom);

    if (oldMutation != newMutation) {
      Blockly.Events.fire(new Blockly.Events.BlockChange(
          block, 'mutation', null, oldMutation, newMutation));
    }
    Blockly.Events.setGroup(false);
  }
}

const minusImage =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAw' +
    'MC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPS' +
    'JNMTggMTFoLTEyYy0xLjEwNCAwLTIgLjg5Ni0yIDJzLjg5NiAyIDIgMmgxMmMxLjEwNCAw' +
    'IDItLjg5NiAyLTJzLS44OTYtMi0yLTJ6IiBmaWxsPSJ3aGl0ZSIgLz48L3N2Zz4K';

Blockly.fieldRegistry.register('field_minus', FieldMinus);
