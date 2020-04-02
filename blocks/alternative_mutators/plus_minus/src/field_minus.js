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


// TODO: Refactor into class?
// TODO: Re-add plusMinus namespace prefix?
/**
 * Class for a minus button used for mutation.
 * @param opt_args Arguments to pass to the 'plus' function when the button
 *    is clicked.
 * @constructor
 */
export default function FieldMinus(opt_args) {
  this.args_ = opt_args;
  return FieldMinus.superClass_.constructor.call(
      this, 'media/minus.svg', 15, 15, undefined, this.onClick_);
};
Blockly.utils.object.inherits(FieldMinus, Blockly.FieldImage);

FieldMinus.fromJson = function(options) {
  return new FieldMinus(options['args']);
};

FieldMinus.prototype.onClick_ = function() {
  // TODO: This is a dupe of the mutator code, anyway to unify?
  var block = this.getSourceBlock();

  Blockly.Events.setGroup(true);

  var oldMutationDom = block.mutationToDom();
  var oldMutation = oldMutationDom && Blockly.Xml.domToText(oldMutationDom);

  block.minus(this.args_);

  var newMutationDom = block.mutationToDom();
  var newMutation = newMutationDom && Blockly.Xml.domToText(newMutationDom);

  if (oldMutation != newMutation) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(
        block, 'mutation', null, oldMutation, newMutation));
  }
  Blockly.Events.setGroup(false);
};

Blockly.fieldRegistry.register('field_minus', FieldMinus);
