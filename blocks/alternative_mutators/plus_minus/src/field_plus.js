/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A field for a plus button used in mutation.
 */
'use strict';


/**
 * Class for a plus button used in mutation.
 * @param opt_args Arguements to pass to the 'plus' function when the button
 *    is clicked.
 * @constructor
 */
plusMinus.FieldPlus = function(opt_args) {
  this.args_ = opt_args;
  return plusMinus.FieldPlus.superClass_.constructor.call(
      this, 'media/plus.svg', 15, 15, '+');
};
Blockly.utils.object.inherits(plusMinus.FieldPlus, Blockly.FieldImage);

plusMinus.FieldPlus.fromJson = function(options) {
  return new plusMinus.FieldPlus(options['args']);
};

plusMinus.FieldPlus.prototype.showEditor_ = function() {
  // TODO: This is a dupe of the mutator code, anyway to unify?
  var block = this.getSourceBlock();

  Blockly.Events.setGroup(true);

  var oldMutationDom = block.mutationToDom();
  var oldMutation = oldMutationDom && Blockly.Xml.domToText(oldMutationDom);

  block.plus(this.args_);

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

Blockly.fieldRegistry.register('field_plus', plusMinus.FieldPlus);
