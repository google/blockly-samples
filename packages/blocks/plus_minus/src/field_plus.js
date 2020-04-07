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

export class FieldPlus extends Blockly.FieldImage {
  /**
   * Class for a plus button used for mutation.
   * @param opt_args Arguements to pass to the 'plus' function when the button
   *    is clicked.
   * @constructor
   */
  constructor(opt_args) {
    super('media/plus.svg', 15, 15, undefined, FieldPlus.onClick_);
    this.args_ = opt_args;
  }

  static fromJson(options) {
    return new FieldPlus(options['args']);
  }

  static onClick_(plusField) {
    // TODO: This is a dupe of the mutator code, anyway to unify?
    var block = plusField.getSourceBlock();

    Blockly.Events.setGroup(true);

    var oldMutationDom = block.mutationToDom();
    var oldMutation = oldMutationDom && Blockly.Xml.domToText(oldMutationDom);

    block.plus(plusField.args_);

    var newMutationDom = block.mutationToDom();
    var newMutation = newMutationDom && Blockly.Xml.domToText(newMutationDom);

    if (oldMutation != newMutation) {
      Blockly.Events.fire(new Blockly.Events.BlockChange(
          block, 'mutation', null, oldMutation, newMutation));
    }
    Blockly.Events.setGroup(false);
  }
}

Blockly.fieldRegistry.register('field_plus', FieldPlus);
