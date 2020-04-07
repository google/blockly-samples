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

export class FieldMinus extends Blockly.FieldImage {
  /**
   * Class for a minus button used for mutation.
   * @param opt_args Arguments to pass to the 'plus' function when the button
   *    is clicked.
   * @constructor
   */
  constructor(opt_args) {
    super('media/minus.svg', 15, 15, undefined, FieldMinus.onClick_);
    this.args_ = opt_args;
  }

  static fromJson(options) {
    return new FieldMinus(options['args']);
  }

  static onClick_(minusField) {
    // TODO: This is a dupe of the mutator code, anyway to unify?
    var block = minusField.getSourceBlock();

    Blockly.Events.setGroup(true);

    var oldMutationDom = block.mutationToDom();
    var oldMutation = oldMutationDom && Blockly.Xml.domToText(oldMutationDom);

    block.minus(minusField.args_);

    var newMutationDom = block.mutationToDom();
    var newMutation = newMutationDom && Blockly.Xml.domToText(newMutationDom);

    if (oldMutation != newMutation) {
      Blockly.Events.fire(new Blockly.Events.BlockChange(
          block, 'mutation', null, oldMutation, newMutation));
    }
    Blockly.Events.setGroup(false);
  };
}

Blockly.fieldRegistry.register('field_minus', FieldMinus);
