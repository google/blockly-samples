/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Adds blocks that replace the built-in mutator UI with a +/- UI.
 */


import * as Blockly from 'blockly/core';
import {FieldPlus} from './field_plus.js';
import {FieldMinus} from './field_minus.js';


/* eslint-disable quotes */
Blockly.defineBlocksWithJsonArray([
  {
    "type": "lists_create_with",
    "message0": "%1 %{BKY_LISTS_CREATE_EMPTY_TITLE} %2",
    "args0": [
      {
        "type": "field_plus",
        "name": "PLUS",
      },
      {
        "type": "input_dummy",
        "name": "EMPTY",
      },
    ],
    "output": "Array",
    "style": "list_blocks",
    "helpUrl": "%{BKY_LISTS_CREATE_WITH_HELPURL}",
    "tooltip": "%{BKY_LISTS_CREATE_WITH_TOOLTIP}",
    "mutator": "new_list_create_with_mutator",
  },
  {
    "type": "procedures_defnoreturn",
    "message0": "%1 %{BKY_PROCEDURES_DEFNORETURN_TITLE} %2 %3",
    "message1": "%{BKY_PROCEDURES_DEFNORETURN_DO} %1",
    "args0": [
      {
        "type": "field_plus",
        "name": "PLUS",
      },
      {
        "type": "field_input",
        "name": "NAME",
        "text": "",
      },
      {
        "type": "input_dummy",
        "name": "TOP",
      },
    ],
    "args1": [
      {
        "type": "input_statement",
        "name": "STACK",
      },
    ],
    "style": "procedure_blocks",
    "helpUrl": "%{BKY_PROCEDURES_DEFNORETURN_HELPURL}",
    "tooltip": "%{BKY_PROCEDURES_DEFNORETURN_TOOLTIP}",
    "extensions": [
      "get_procedure_def_no_return",
      "procedure_context_menu",
      "procedure_rename",
      "procedure_vars",
    ],
    "mutator": "procedure_def_mutator",
  },
  {
    "type": "procedures_defreturn",
    "message0": "%1 %{BKY_PROCEDURES_DEFRETURN_TITLE} %2 %3",
    "message1": "%{BKY_PROCEDURES_DEFRETURN_DO} %1",
    "message2": "%{BKY_PROCEDURES_DEFRETURN_RETURN} %1",
    "args0": [
      {
        "type": "field_plus",
        "name": "PLUS",
      },
      {
        "type": "field_input",
        "name": "NAME",
        "text": "",
      },
      {
        "type": "input_dummy",
        "name": "TOP",
      },
    ],
    "args1": [
      {
        "type": "input_statement",
        "name": "STACK",
      },
    ],
    "args2": [
      {
        "type": "input_value",
        "align": "right",
        "name": "RETURN",
      },
    ],
    "style": "procedure_blocks",
    "helpUrl": "%{BKY_PROCEDURES_DEFRETURN_HELPURL}",
    "tooltip": "%{BKY_PROCEDURES_DEFRETURN_TOOLTIP}",
    "extensions": [
      "get_procedure_def_return",
      "procedure_context_menu",
      "procedure_rename",
      "procedure_vars",
    ],
    "mutator": "procedure_def_mutator",
  },
]);
/* eslint-enable quotes */

const controlsIfMutator = {
  // TODO: This should be its own extension. But that requires core changes.
  suppressPrefixSuffix: true,

  /**
   * Number of else-if inputs on this block.
   * @type {number}
   */
  elseIfCount_: 0,
  /**
   * Whether this block has an else input or not.
   * @type {boolean}
   */
  hasElse_: false,

  /**
   * Creates XML to represent the number of else-if and else inputs.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    if (!this.elseIfCount_ && !this.hasElse_) {
      return null;
    }
    const container = Blockly.utils.xml.createElement('mutation');
    container.setAttribute('elseif', this.elseIfCount_);
    if (this.hasElse_) {
      // Has to be stored as an int for backwards compat.
      container.setAttribute('else', 1);
    }
    return container;
  },

  /**
   * Parses XML to restore the else-if and else inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    const targetCount = parseInt(xmlElement.getAttribute('elseif'), 10) || 0;
    this.hasElse_ = !!parseInt(xmlElement.getAttribute('else'), 10) || 0;
    if (this.hasElse_ && !this.getInput('ELSE')) {
      this.appendStatementInput('ELSE')
          .appendField(Blockly.Msg['CONTROLS_IF_MSG_ELSE']);
    }
    this.updateShape_(targetCount);
  },

  /**
   * Adds else-if and do inputs to the block until the block matches the
   * target else-if count.
   * @param {number} targetCount The target number of else-if inputs.
   * @this Blockly.Block
   * @private
   */
  updateShape_: function(targetCount) {
    while (this.elseIfCount_ < targetCount) {
      this.addElseIf_();
    }
    while (this.elseIfCount_ > targetCount) {
      this.removeElseIf_();
    }
  },

  /**
   * Callback for the plus field. Adds an else-if input to the block.
   */
  plus: function() {
    this.addElseIf_();
  },

  /**
   * Callback for the minus field. Triggers "removing" the input at the specific
   * index.
   * @see removeInput_
   * @param {number} index The index of the else-if input to "remove".
   * @this Blockly.Block
   */
  minus: function(index) {
    if (this.elseIfCount_ == 0) {
      return;
    }
    this.removeElseIf_(index);
  },

  /**
   * Adds an else-if and a do input to the bottom of the block.
   * @this Blockly.Block
   * @private
   */
  addElseIf_: function() {
    // Because else-if inputs are 1-indexed we increment first, decrement last.
    this.elseIfCount_++;
    this.appendValueInput('IF' + this.elseIfCount_)
        .setCheck('Boolean')
        .appendField(Blockly.Msg['CONTROLS_IF_MSG_ELSEIF'])
        .appendField(
            new FieldMinus(this.elseIfCount_), 'MINUS' + this.elseIfCount_);
    this.appendStatementInput('DO' + this.elseIfCount_)
        .appendField(Blockly.Msg['CONTROLS_IF_MSG_THEN']);

    // Handle if-elseif-else block.
    if (this.getInput('ELSE')) {
      this.moveInputBefore('ELSE', /* put at end */ null);
    }
  },

  /**
   * Appears to remove the input at the given index. Actually shifts attached
   * blocks and then removes the input at the bottom of the block. This is to
   * make sure the inputs are always IF0, IF1, etc. with no gaps.
   * @param {number?} opt_index The index of the input to "remove", or undefined
   *     to remove the last input.
   * @this Blockly.Block
   * @private
   */
  removeElseIf_: function(opt_index) {
    // The strategy for removing a part at an index is to:
    //  - Kick any blocks connected to the relevant inputs.
    //  - Move all connect blocks from the other inputs up.
    //  - Remove the last input.
    // This makes sure all of our indices are correct.

    if (opt_index !== undefined && opt_index!= this.elseIfCount_) {
      // Each else-if is two inputs on the block:
      // the else-if input and the do input.
      const elseIfIndex = opt_index * 2;
      const inputs = this.inputList;
      let connection = inputs[elseIfIndex].connection; // If connection.
      if (connection.isConnected()) {
        connection.disconnect();
      }
      connection = inputs[elseIfIndex + 1].connection; // Do connection.
      if (connection.isConnected()) {
        connection.disconnect();
      }
      this.bumpNeighbours();
      for (let i = elseIfIndex + 2, input; (input = this.inputList[i]); i++) {
        if (input.name == 'ELSE') {
          break; // Should be last, so break.
        }
        const targetConnection = input.connection.targetConnection;
        if (targetConnection) {
          this.inputList[i - 2].connection.connect(targetConnection);
        }
      }
    }

    this.removeInput('IF' + this.elseIfCount_);
    this.removeInput('DO' + this.elseIfCount_);
    // Because else-if inputs are 1-indexed we increment first, decrement last.
    this.elseIfCount_--;
  },
};

/**
 * Adds the initial plus button to the if block.
 * @this Blockly.Block
 */
const controlsIfHelper = function() {
  this.topInput_ = this.getInput('IF0');
  this.topInput_.insertFieldAt(0, new FieldPlus(), 'PLUS');
};

Blockly.Extensions.unregister('controls_if_mutator');
Blockly.Extensions.registerMutator('controls_if_mutator',
    controlsIfMutator, controlsIfHelper);

const textJoinMutator = {
  /**
   * Number of text inputs on this block.
   * @type {number}
   */
  itemCount_: 0,

  /**
   * Creates XML to represent number of inputs.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    const container = Blockly.utils.xml.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    return container;
  },
  /**
   * Parses XML to restore the inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    const targetCount = parseInt(xmlElement.getAttribute('items'), 10);
    this.updateShape_(targetCount);
  },

  /**
   * Adds inputs to the block until the block reaches the target input count.
   * @param {number} targetCount The number of inputs the block should have.
   * @this Blockly.Block
   * @private
   */
  updateShape_: function(targetCount) {
    while (this.itemCount_ < targetCount) {
      this.addPart_();
    }
    while (this.itemCount_ > targetCount) {
      this.removePart_();
    }
    this.updateMinus_();
  },

  /**
   * Callback for the plus image. Adds an input to the block and updates the
   * state of the minus.
   * @this Blockly.Block
   */
  plus: function() {
    this.addPart_();
    this.updateMinus_();
  },

  /**
   * Callback for the minus image. Removes the input at the end of the block and
   * updates the state of the minus.
   * @this Blockly.Block
   */
  minus: function() {
    if (this.itemCount_ == 0) {
      return;
    }
    this.removePart_();
    this.updateMinus_();
  },

  /**
   * Adds an input to the end of the block. If the block currently has no
   * inputs it updates the top 'EMPTY' input to receive a block.
   * @this Blockly.Block
   * @private
   */
  addPart_: function() {
    if (this.itemCount_ == 0) {
      if (this.getInput('EMPTY')) {
        this.removeInput('EMPTY');
      }
      this.topInput_ = this.appendValueInput('ADD' + this.itemCount_)
          .appendField(new FieldPlus(), 'PLUS')
          .appendField(Blockly.Msg['TEXT_JOIN_TITLE_CREATEWITH']);
    } else {
      this.appendValueInput('ADD' + this.itemCount_);
    }
    // Because item inputs are 0-index we decrement first, increment last.
    this.itemCount_++;
  },

  /**
   * Removes an input from the end of the block. If we are removing the last
   * input this updates the block to have an 'EMPTY' top input.
   * @this Blockly.Block
   * @private
   */
  removePart_: function() {
    this.itemCount_--;
    this.removeInput('ADD' + this.itemCount_);
    if (this.itemCount_ == 0) {
      this.topInput_ = this.appendDummyInput('EMPTY')
          .appendField(new FieldPlus(), 'PLUS')
          .appendField(this.newQuote_(true))
          .appendField(this.newQuote_(false));
    }
  },

  /**
   * Makes it so the minus is visible iff there is an input available to remove.
   * @private
   */
  updateMinus_: function() {
    const minusField = this.getField('MINUS');
    if (!minusField && this.itemCount_ > 0) {
      this.topInput_.insertFieldAt(1, new FieldMinus(), 'MINUS');
    } else if (minusField && this.itemCount_ < 1) {
      this.topInput_.removeField('MINUS');
    }
  },
};

/**
 * Adds the quotes mixin to the block. Also updates the shape so that if no
 * mutator is provided the block has two inputs.
 * @this Blockly.Block
 */
const textJoinHelper = function() {
  this.mixin(Blockly.Constants.Text.QUOTE_IMAGE_MIXIN);
  this.updateShape_(2);
};

Blockly.Extensions.unregister('text_join_mutator');
Blockly.Extensions.registerMutator('text_join_mutator',
    textJoinMutator, textJoinHelper);

const listCreateMutator = {
  /**
   * Number of item inputs the block has.
   * @type {number}
   */
  itemCount_: 0,

  /**
   * Creates XML to represent number of text inputs.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    const container = Blockly.utils.xml.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    return container;
  },
  /**
   * Parses XML to restore the text inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    const targetCount = parseInt(xmlElement.getAttribute('items'), 10);
    this.updateShape_(targetCount);
  },

  /**
   * Adds inputs to the block until it reaches the target number of inputs.
   * @param {number} targetCount The target number of inputs for the block.
   * @this Blockly.Block
   * @private
   */
  updateShape_: function(targetCount) {
    while (this.itemCount_ < targetCount) {
      this.addPart_();
    }
    while (this.itemCount_ > targetCount) {
      this.removePart_();
    }
    this.updateMinus_();
  },

  /**
   * Callback for the plus image. Adds an input to the end of the block and
   * updates the state of the minus.
   */
  plus: function() {
    this.addPart_();
    this.updateMinus_();
  },

  /**
   * Callback for the minus image. Removes an input from the end of the block
   * and updates the state of the minus.
   */
  minus: function() {
    if (this.itemCount_ == 0) {
      return;
    }
    this.removePart_();
    this.updateMinus_();
  },

  // To properly keep track of indices we have to increment before/after adding
  // the inputs, and decrement the opposite.
  // Because we want our first input to be ADD0 (not ADD1) we increment after.

  /**
   * Adds an input to the end of the block. If the block currently has no
   * inputs it updates the top 'EMPTY' input to receive a block.
   * @this Blockly.Block
   * @private
   */
  addPart_: function() {
    if (this.itemCount_ == 0) {
      this.removeInput('EMPTY');
      this.topInput_ = this.appendValueInput('ADD' + this.itemCount_)
          .appendField(new FieldPlus(), 'PLUS')
          .appendField(Blockly.Msg['LISTS_CREATE_WITH_INPUT_WITH']);
    } else {
      this.appendValueInput('ADD' + this.itemCount_);
    }
    this.itemCount_++;
  },

  /**
   * Removes an input from the end of the block. If we are removing the last
   * input this updates the block to have an 'EMPTY' top input.
   * @this Blockly.Block
   * @private
   */
  removePart_: function() {
    this.itemCount_--;
    this.removeInput('ADD' + this.itemCount_);
    if (this.itemCount_ == 0) {
      this.topInput_ = this.appendDummyInput('EMPTY')
          .appendField(new FieldPlus(), 'PLUS')
          .appendField(Blockly.Msg['LISTS_CREATE_EMPTY_TITLE']);
    }
  },

  /**
   * Makes it so the minus is visible iff there is an input available to remove.
   * @private
   */
  updateMinus_: function() {
    const minusField = this.getField('MINUS');
    if (!minusField && this.itemCount_ > 0) {
      this.topInput_.insertFieldAt(1, new FieldMinus(), 'MINUS');
    } else if (minusField && this.itemCount_ < 1) {
      this.topInput_.removeField('MINUS');
    }
  },
};

/**
 * Updates the shape of the block to have 3 inputs if no mutation is provided.
 * @this Blockly.Block
 */
const listCreateHelper = function() {
  this.updateShape_(3);
};

Blockly.Extensions.registerMutator('new_list_create_with_mutator',
    listCreateMutator, listCreateHelper);

/**
 * Defines the what are essentially info-getters for the procedures_defnoreturn
 * block.
 * @type {{callType_: string, getProcedureDef: (function(): *[])}}
 */
const getDefNoReturn = {
  /**
   * Returns info about this block to be used by the Blockly.Procedures.
   * @return {Array} An array of info.
   * @this Blockly.Block
   */
  getProcedureDef: function() {
    return [this.getFieldValue('NAME'), this.arguments_, false];
  },

  /**
   * Used by the context menu to create a caller block.
   * @type {string}
   */
  callType_: 'procedures_callnoreturn',
};

Blockly.Extensions.registerMixin('get_procedure_def_no_return', getDefNoReturn);

/**
 * Defines what are essentially info-getters for the procedures_def_return
 * block.
 * @type {{callType_: string, getProcedureDef: (function(): *[])}}
 */
const getDefReturn = {
  /**
   * Returns info about this block to be used by the Blockly.Procedures.
   * @return {Array} An array of info.
   * @this Blockly.Block
   */
  getProcedureDef: function() {
    return [this.getFieldValue('NAME'), this.arguments_, true];
  },
  /**
   * Used by the context menu to create a caller block.
   * @type {string}
   */
  callType_: 'procedures_callreturn',
};

Blockly.Extensions.registerMixin('get_procedure_def_return', getDefReturn);

const procedureContextMenu = {
  /**
   * Adds an option to create a caller block.
   * Adds an option to create a variable getter for each variable included in
   * the procedure definition.
   * @this Blockly.Block
   * @param {!Array} options The current options for the context menu.
   */
  customContextMenu: function(options) {
    if (this.isInFlyout) {
      return;
    }

    // Add option to create caller.
    const name = this.getFieldValue('NAME');
    const text = Blockly.Msg['PROCEDURES_CREATE_DO'].replace('%1', name);

    const xml = Blockly.utils.xml.createElement('block');
    xml.setAttribute('type', this.callType_);
    xml.appendChild(this.mutationToDom(true));
    const callback = Blockly.ContextMenu.callbackFactory(this, xml);

    options.push({
      enabled: true,
      text: text,
      callback: callback,
    });

    if (this.isCollapsed()) {
      return;
    }

    // Add options to create getters for each parameter.
    for (let i = 0, model; (model = this.argumentVarModels_[i]); i++) {
      const text = Blockly.Msg['VARIABLES_SET_CREATE_GET']
          .replace('%1', model.name);

      const xml = Blockly.utils.xml.createElement('block');
      xml.setAttribute('type', 'variables_get');
      xml.appendChild(Blockly.Variables.generateVariableFieldDom(model));
      const callback = Blockly.ContextMenu.callbackFactory(this, xml);

      options.push({
        enabled: true,
        text: text,
        callback: callback,
      });
    }
  },
};

Blockly.Extensions.registerMixin(
    'procedure_context_menu', procedureContextMenu);

const procedureDefMutator = {
  /**
   * Create XML to represent the argument inputs.
   * @param {boolean=} opt_isForCaller If true include the procedure name and
   *     argument IDs. Used by Blockly.Procedures.mutateCallers for
   *     reconnection.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function(opt_isForCaller) {
    const container = Blockly.utils.xml.createElement('mutation');
    if (opt_isForCaller) {
      container.setAttribute('name', this.getFieldValue('NAME'));
    }
    for (let i = 0; i < this.argumentVarModels_.length; i++) {
      const argument = Blockly.utils.xml.createElement('arg');
      const argModel = this.argumentVarModels_[i];
      argument.setAttribute('name', argModel.name);
      argument.setAttribute('varid', argModel.getId());
      if (opt_isForCaller) {
        argument.setAttribute('paramid', this.argIds_[i]);
      }
      container.appendChild(argument);
    }

    // Not used by this block, but necessary if switching back and forth
    // between this mutator UI and the default UI.
    if (!this.hasStatements_) {
      container.setAttribute('statements', 'false');
    }

    return container;
  },

  /**
   * Parse XML to restore the argument inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    // We have to handle this so that the user doesn't add blocks to the stack,
    // in which case it would be impossible to return to the old mutators.
    this.hasStatements_ = xmlElement.getAttribute('statements') !== 'false';
    if (!this.hasStatements_) {
      this.removeInput('STACK');
    }

    const names = [];
    const ids = [];
    for (let i = 0, childNode; (childNode = xmlElement.childNodes[i]); i++) {
      if (childNode.nodeName.toLowerCase() == 'arg') {
        names.push(childNode.getAttribute('name'));
        ids.push(childNode.getAttribute('varid') ||
            childNode.getAttribute('varId'));
      }
    }
    this.updateShape_(names, ids);
  },

  /**
   * Adds arguments to the block until it matches the targets.
   * @param {!Array<string>} names An array of argument names to display.
   * @param {!Array<string>} varIds An array of variable IDs associated with
   *     those names.
   * @this Blockly.Block
   * @private
   */
  updateShape_: function(names, varIds) {
    if (names.length != varIds.length) {
      throw Error('names and varIds must have the same length.');
    }

    // Usually it's more efficient to modify the block, rather than tearing it
    // down and rebuilding (less render calls), but in this case it's easier
    // to just work from scratch.

    // We need to remove args in reverse order so that it doesn't mess up
    // as removeArg_ modifies our arrays.
    for (let i = this.argIds_.length - 1; i >= 0; i--) {
      this.removeArg_(this.argIds_[i]);
    }

    this.arguments_ = [];
    this.varIds_ = [];
    this.argumentVarModels_ = [];
    this.argIds_ = [];

    const length = varIds.length;
    for (let i = 0; i < length; i++) {
      this.addArg_(names[i], varIds[i]);
    }

    Blockly.Procedures.mutateCallers(this);
  },

  /**
   * Callback for the plus image. Adds an argument to the block and mutates
   * callers to match.
   */
  plus: function() {
    this.addArg_();
    Blockly.Procedures.mutateCallers(this);
  },

  /**
   * Callback for the minus image. Removes the argument associated with the
   * given argument ID and mutates the callers to match.
   * @param {string} argId The argId of the argument to remove.
   * @this Blockly.Block
   */
  minus: function(argId) {
    if (!this.argIds_.length) {
      return;
    }
    this.removeArg_(argId);
    Blockly.Procedures.mutateCallers(this);
  },

  /**
   * Adds an argument to the block and updates the block's parallel tracking
   * arrays as appropriate.
   * @param {string} opt_name An optional name for the argument.
   * @param {string} opt_varId An optional variable ID for the argument.
   * @this Blockly.Block
   * @private
   */
  addArg_: function(opt_name, opt_varId) {
    if (!this.arguments_.length) {
      const withField = new Blockly.FieldLabel(
          Blockly.Msg['PROCEDURES_BEFORE_PARAMS']);
      this.getInput('TOP')
          .appendField(withField, 'WITH');
    }

    const name = opt_name || Blockly.Variables.generateUniqueNameFromOptions(
        Blockly.Procedures.DEFAULT_ARG, this.arguments_);
    const variable = Blockly.Variables.getOrCreateVariablePackage(
        this.workspace, opt_varId, name, '');
    const argId = Blockly.utils.genUid();

    this.addVarInput_(name, argId);
    if (this.getInput('STACK')) {
      this.moveInputBefore(argId, 'STACK');
    } else {
      this.moveInputBefore(argId, 'RETURN');
    }

    this.arguments_.push(name);
    this.varIds_.push(variable.getId());
    this.argumentVarModels_.push(variable);
    this.argIds_.push(argId);
  },

  /**
   * Removes the argument associated with the given argument ID from the block.
   * @param {string} argId An ID used to track arguments on the block.
   * @private
   */
  removeArg_: function(argId) {
    // TODO: Refactor after blockly/#3803 is completed.
    if (!this.getInput(argId)) {
      return;
    }
    this.removeInput(argId);
    if (this.arguments_.length == 1) { // Becoming argumentless.
      this.getInput('TOP').removeField('WITH');
    }

    const index = this.argIds_.indexOf(argId);
    this.arguments_.splice(index, 1);
    this.varIds_.splice(index, 1);
    this.argumentVarModels_.splice(index, 1);
    this.argIds_.splice(index, 1);
  },

  /**
   * Appends the actual inputs and fields associated with an argument to the
   * block.
   * @param {string} name The name of the argument.
   * @param {string} argId The UUID of the argument (different from var ID).
   * @this Blockly.Block
   * @private
   */
  addVarInput_: function(name, argId) {
    const nameField = new Blockly.FieldTextInput(name, this.validator_);
    nameField.onFinishEditing_ = this.finishEditing_.bind(nameField);
    nameField.createdVarIds_ = [];

    this.appendDummyInput(argId)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(new FieldMinus(argId))
        .appendField('variable:') // Untranslated!
        .appendField(nameField, argId); // The name of the field is the arg id.
  },

  /**
   * Validates text entered into the argument name field.
   * @param {string} newName The new text entered into the field.
   * @return {?string} The field's new value.
   * @this Blockly.FieldTextInput
   */
  validator_: function(newName) {
    const sourceBlock = this.getSourceBlock();
    // Replaces all whitespace (including non-breaking) with normal spaces.
    // Then removes spaces at the beginning or end of the string.
    newName = newName.replace(/[\s\xa0]+/g, ' ').replace(/^ | $/g, '');
    if (!newName) {
      return null;
    }

    // The field name (aka id) is always equal to the arg id.
    const index = sourceBlock.argIds_.indexOf(this.name);
    const caselessName = newName.toLowerCase();
    for (let i = 0, name; (name = sourceBlock.arguments_[i]); i++) {
      // Don't check self because if we just added whitespace this breaks.
      if (i != index) {
        if (caselessName == name.toLowerCase()) {
          return null; // It matches, so it is invalid.
        }
      }
    }

    sourceBlock.arguments_[index] = newName;

    // TODO: Maybe delete the pre-edit variable if it has no other uses.
    //  Currently unaccomplishable as the workspace var map is private.

    // We want to create new vars instead of renaming the old ones, so that
    // users don't accidentally rename/coalesce vars they don't want to.
    const workspace = sourceBlock.workspace;
    let model = workspace.getVariable(newName, '');
    if (!model) {
      model = workspace.createVariable(newName, '');
      this.createdVarIds_.push(model.getId());
    } else if (model.name != newName) {
      // Ideally we would create a new var. But Blockly is case-insensitive so
      // we update the var to reflect the latest case instead.
      workspace.renameVariableById(model.getId(), newName);
    }
    if (model.getId() != sourceBlock.varIds_[index]) {
      sourceBlock.varIds_[index] = model.getId();
      sourceBlock.argumentVarModels_[index] = model;
    }
    Blockly.Procedures.mutateCallers(sourceBlock);
    return newName;
  },

  /**
   * Removes any unused vars that were created as a result of editing.
   * @param {string} _finalName The final value of the field.
   * @this Blockly.FieldTextInput
   */
  finishEditing_: function(_finalName) {
    const source = this.getSourceBlock();
    const currentVarId = source.varIds_[source.argIds_.indexOf(this.name)];
    for (let i = 0, varId; (varId = this.createdVarIds_[i]); i++) {
      if (varId != currentVarId) {
        source.workspace.deleteVariableById(varId);
      }
    }
    this.createdVarIds_.length = 0;
  },
};

/**
 * Initializes some private variables for procedure blocks.
 * @this Blockly.Block
 */
const procedureDefHelper = function() {
  /**
   * Names of all arg-models (vars) associated with this block.
   * @type {!Array<string>}
   */
  this.arguments_ = [];
  /**
   * Ids of all the arg-models (vars) associated with this block.
   * @type {!Array<string>}
   */
  this.varIds_ = [];
  /**
   * Arg-models (vars) associated with this block.
   * @type {!Array<Blockly.VariableModel>}
   */
  this.argumentVarModels_ = [];
  // Note because the order is static this we could use the index as the argId.
  // But if we ever add the ability to reorder the args that will break and each
  // arg will need an ID. Currently we can't reorder because of #3725.
  /**
   * Ids associated with each argument. These are separate from the var Ids
   * and are used to keep track of an arg when its variable is changing. E.g
   * as the name is being edited.
   * @type {!Array<string>}
   */
  this.argIds_ = [];
  /**
   * Does this block have a 'STACK' input for statements?
   * @type {boolean}
   * @private
   */
  this.hasStatements_ = true;
};

Blockly.Extensions.registerMutator('procedure_def_mutator',
    procedureDefMutator, procedureDefHelper);

/**
 * Sets the validator for the procedure's name field.
 * @this Blockly.Block
 */
const procedureRename = function() {
  this.getField('NAME').setValidator(Blockly.Procedures.rename);
};

Blockly.Extensions.register('procedure_rename', procedureRename);

/**
 * Defines functions for dealing with variables and renaming variables.
 * @this Blockly.Block
 */
const procedureVars = function() {
  // This is a hack to get around the don't-override-builtins check.
  const mixin = {
    /**
     * Return all variables referenced by this block.
     * @return {!Array.<string>} List of variable names.
     * @this Blockly.Block
     */
    getVars: function() {
      return this.arguments_;
    },

    /**
     * Return all variables referenced by this block.
     * @return {!Array.<!Blockly.VariableModel>} List of variable models.
     * @this Blockly.Block
     */
    getVarModels: function() {
      return this.argumentVarModels_;
    },

    /**
     * Notification that a variable was renamed to the same name as an existing
     * variable. These variables are coalescing into a single variable with the
     * ID of the variable that was already using the name.
     * @param {string} oldId The ID of the variable that was renamed.
     * @param {string} newId The ID of the variable that was already using
     *     the name.
     */
    renameVarById: function(oldId, newId) {
      const index = this.varIds_.indexOf(oldId);
      if (index == -1) {
        return; // Not on this block.
      }

      const newVar = this.workspace.getVariableById(newId);
      const newName = newVar.name;
      this.addVarInput_(newName, newId);
      this.moveInputBefore(newId, oldId);
      this.removeInput(oldId);

      // No need to update argIds_ b/c it is constant.
      this.arguments_[index] = newName;
      this.varIds_[index] = newId;
      this.argumentVarModels_[index] = newVar;

      Blockly.Procedures.mutateCallers(this);
    },

    /**
     * Notification that a variable is renaming but keeping the same ID.  If the
     * variable is in use on this block, rerender to show the new name.
     * @param {!Blockly.VariableModel} variable The variable being renamed.
     * @package
     * @override
     * @this Blockly.Block
     */
    updateVarName: function(variable) {
      const id = variable.getId();
      const index = this.varIds_.indexOf(id);
      if (index == -1) {
        return; // Not on this block.
      }
      const name = variable.name;
      if (variable.name == this.arguments_[index]) {
        return; // No change. Occurs when field is being edited.
      }

      this.setFieldValue(name, this.argIds_[index]);
      this.arguments_[index] = name;
    },
  };

  this.mixin(mixin, true);
};

Blockly.Extensions.register('procedure_vars', procedureVars);

