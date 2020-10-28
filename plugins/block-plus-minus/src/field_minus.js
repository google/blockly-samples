/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A function that creates a minus button used for mutation.
 */
'use strict';

import * as Blockly from 'blockly/core';

/**
 * Creates a minus image field used for mutation.
 * @param {Object=} opt_args Untyped args passed to block.minus when the field
 *     is clicked.
 * @return {Blockly.FieldImage} The minus field.
 */
export function createMinusField(opt_args) {
  const minus = new Blockly.FieldImage(minusImage, 15, 15, undefined, onClick_);
  /**
   * Untyped args passed to block.minus when the field is clicked.
   * @type {Object}
   * @private
   */
  minus.args_ = opt_args;
  return minus;
}

/**
 * Calls block.minus(args) when the minus field is clicked.
 * @param {Blockly.FieldImage} minusField The field being clicked.
 * @private
 */
function onClick_(minusField) {
  // TODO: This is a dupe of the mutator code, anyway to unify?
  const block = minusField.getSourceBlock();

  if (block.isInFlyout) {
    return;
  }

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

const minusImage =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAw' +
    'MC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPS' +
    'JNMTggMTFoLTEyYy0xLjEwNCAwLTIgLjg5Ni0yIDJzLjg5NiAyIDIgMmgxMmMxLjEwNCAw' +
    'IDItLjg5NiAyLTJzLS44OTYtMi0yLTJ6IiBmaWxsPSJ3aGl0ZSIgLz48L3N2Zz4K';
