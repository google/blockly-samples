/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A field for a minus button used for mutation.
 */
'use strict';


/**
 * Class for a minus button used for mutation.
 * @param opt_args Arguments to pass to the 'plus' function when the button
 *    is clicked.
 * @constructor
 */
plusMinus.FieldMinus = function(opt_args) {
  this.args_ = opt_args;
  return plusMinus.FieldMinus.superClass_.constructor.call(
      this, 'media/minus.svg', 15, 15, '');
};
Blockly.utils.object.inherits(plusMinus.FieldMinus, Blockly.FieldImage);

plusMinus.FieldMinus.fromJson = function(options) {
  return new plusMinus.FieldMinus(options['args']);
};

plusMinus.FieldMinus.prototype.showEditor_ = function() {
  // TODO: This is a dupe of the mutator code, anyway to unify?
  var block = this.getSourceBlock();

  Blockly.Events.setGroup(true);

  var oldMutationDom = block.mutationToDom();
  var oldMutation = oldMutationDom && Blockly.Xml.domToText(oldMutationDom);

  // TODO: Add try catch for better logging.
  block.minus(this.args_);

  var newMutationDom = block.mutationToDom();
  var newMutation = newMutationDom && Blockly.Xml.domToText(newMutationDom);

  if (oldMutation != newMutation) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(
        block, 'mutation', null, oldMutation, newMutation));
    // Ensure that any bump is part of this mutation's event group.
    var group = Blockly.Events.getGroup();
    setTimeout(function() {
      Blockly.Events.setGroup(group);
      block.bumpNeighbours();
      Blockly.Events.setGroup(false);
    }, Blockly.BUMP_DELAY);
  }
};

Blockly.fieldRegistry.register('field_minus', plusMinus.FieldMinus);
