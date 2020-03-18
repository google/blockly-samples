/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blocks for demonstrating using +/- icons for manipulating
 *    the shape of a block.
 */


import * as Blockly from 'blockly/core';
import FieldPlus from './field_plus.js';
import FieldMinus from './field_minus.js';


Blockly.defineBlocksWithJsonArray([
  // TODO: It's annoying that we have to redefine the whole controls_ifelse
  //  block. It would be nice if the default block had an empty mutator
  //  we could override.
  {
    "type": "controls_ifelse",
    "message0": "%{BKY_CONTROLS_IF_MSG_IF} %1" +
        "%{BKY_CONTROLS_IF_MSG_THEN} %2" +
        "%{BKY_CONTROLS_IF_MSG_ELSE} %3",
    "args0": [
      {
        "type": "input_value",
        "name": "IF0",
        "check": "Boolean"
      },
      {
        "type": "input_statement",
        "name": "DO0"
      },
      {
        "type": "input_statement",
        "name": "ELSE"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "style": "logic_blocks",
    "tooltip": "%{BKYCONTROLS_IF_TOOLTIP_2}",
    "helpUrl": "%{BKY_CONTROLS_IF_HELPURL}",
    "mutator": "controls_if_mutator",
    "extensions": [
      "controls_if_tooltip",
    ]
  },
  {
    "type": "lists_create_with",
    "message0": "%1 %{BKY_LISTS_CREATE_EMPTY_TITLE} %2",
    "args0": [
      {
        "type": "field_plus",
        "name": "PLUS"
      },
      {
        "type": "input_dummy",
        "name": "EMPTY"
      },
    ],
    "output": "Array",
    "style": "list_blocks",
    "helpUrl": "%{BKY_LISTS_CREATE_WITH_HELPURL}",
    "tooltip": "%{BKY_LISTS_CREATE_WITH_TOOLTIP}",
    "mutator": "new_list_create_with_mutator"
  },
  {
    "type": "procedures_defnoreturn",
    "message0": "%1 %{BKY_PROCEDURES_DEFNORETURN_TITLE} %2 %3",
    "message1": "%{BKY_PROCEDURES_DEFNORETURN_DO} %1",
    "args0": [
      {
        "type": "field_plus",
        "name": "PLUS"
      },
      {
        "type": "field_input",
        "name": "NAME",
        "text": ""
      },
      {
        "type": "input_dummy",
        "name": "TOP"
      },
    ],
    "args1": [
      {
        "type": "input_statement",
        "name": "STACK"
      }
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
    "mutator": "procedure_def_mutator"
  },
  {
    "type": "procedures_defreturn",
    "message0": "%1 %{BKY_PROCEDURES_DEFRETURN_TITLE} %2 %3",
    "message1": "%{BKY_PROCEDURES_DEFRETURN_DO} %1",
    "message2": "%{BKY_PROCEDURES_DEFRETURN_RETURN} %1",
    "args0": [
      {
        "type": "field_plus",
        "name": "PLUS"
      },
      {
        "type": "field_input",
        "name": "NAME",
        "text": ""
      },
      {
        "type": "input_dummy",
        "name": "TOP"
      },
    ],
    "args1": [
      {
        "type": "input_statement",
        "name": "STACK"
      }
    ],
    "args2": [
      {
        "type": "input_value",
        "align": "right",
        "name": "RETURN"
      }
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
    "mutator": "procedure_def_mutator"
  }
]);

const controlsIfMutator =  {
  // TODO: This should be its own extension. But that requires core changes.
  suppressPrefixSuffix: true,

  elseIfCount_: 0,

  /**
   * Create XML to represent the number of else-if and else inputs.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    if (!this.elseIfCount_) {
      return null;
    }
    var container = Blockly.utils.xml.createElement('mutation');
    container.setAttribute('elseif', this.elseIfCount_);
    return container;
  },

  /**
   * Parse XML to restore the else-if and else inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    var targetCount = parseInt(xmlElement.getAttribute('elseif'), 10) || 0;
    this.updateShape_(targetCount);
  },

  updateShape_: function(targetCount) {
    while (this.elseIfCount_ < targetCount) {
      this.addPart_();
    }
    while(this.elseIfCount_ > targetCount) {
      this.removePart_();
    }
    this.updateMinus_();
  },

  plus: function() {
    this.addPart_();
    this.updateMinus_();
  },

  minus: function() {
    this.removePart_();
    this.updateMinus_();
  },

  // To properly keep track of indices we have to increment before/after adding
  // the inputs, and decrement the opposite.
  // Because we want our first elseif to be IF1 (not IF0) we increment first.
  addPart_: function() {
    this.elseIfCount_++;
    this.appendValueInput('IF' + this.elseIfCount_)
        .setCheck('Boolean')
        .appendField(Blockly.Msg['CONTROLS_IF_MSG_ELSEIF']);
    this.appendStatementInput('DO' + this.elseIfCount_)
        .appendField(Blockly.Msg['CONTROLS_IF_MSG_THEN']);

    // Handle if-elseif-else block.
    if (this.getInput('ELSE')) {
      this.moveInputBefore('ELSE', /* put at end */ null);
    }
  },

  removePart_: function() {
    this.removeInput('IF' + this.elseIfCount_);
    this.removeInput('DO' + this.elseIfCount_);
    this.elseIfCount_--;
  },

  updateMinus_: function() {
    var minusField = this.getField('MINUS');
    if (!minusField) {
      this.topInput_.insertFieldAt(1, new FieldMinus(), 'MINUS');
    } else if (!this.elseIfCount_) {
      this.topInput_.removeField('MINUS');
    }
  }
};

/**
 * @this {Blockly.Block}
 * @constructor
 */
const controlsIfHelper = function() {
  this.topInput_ = this.getInput('IF0');
  this.topInput_.insertFieldAt(0, new FieldPlus(), 'PLUS');
};

Blockly.Extensions.unregister('controls_if_mutator');
Blockly.Extensions.registerMutator('controls_if_mutator',
    controlsIfMutator, controlsIfHelper);

const textJoinMutator = {
  itemCount_: 0,

  /**
   * Create XML to represent number of text inputs.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function () {
    var container = Blockly.utils.xml.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    return container;
  },
  /**
   * Parse XML to restore the text inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function (xmlElement) {
    var targetCount = parseInt(xmlElement.getAttribute('items'), 10);
    this.updateShape_(targetCount);
  },

  updateShape_: function(targetCount) {
    while (this.itemCount_ < targetCount) {
      this.addPart_();
    }
    while(this.itemCount_ > targetCount) {
      this.removePart_();
    }
    this.updateMinus_();
  },

  plus: function() {
    this.addPart_();
    this.updateMinus_();
  },

  minus: function() {
    this.removePart_();
    this.updateMinus_();
  },

  // To properly keep track of indices we have to increment before/after adding
  // the inputs, and decrement the opposite.
  // Because we want our first item to be ADD0 (not ADD1) we increment after.
  addPart_: function() {
    if (this.itemCount_ == 0) {
      if (this.getInput('EMPTY')) {
        // TODO: I don't think this should throw errors. It would be nice if
        //   It returned a boolean instead.
        this.removeInput('EMPTY');
      }
      this.topInput_ = this.appendValueInput('ADD' + this.itemCount_)
          .appendField(new FieldPlus(), 'PLUS')
          .appendField(Blockly.Msg['TEXT_JOIN_TITLE_CREATEWITH']);
    } else {
      this.appendValueInput('ADD' + this.itemCount_);
    }
    this.itemCount_++;
  },

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

  updateMinus_: function() {
    var minusField = this.getField('MINUS');
    if (!minusField && this.itemCount_ > 0) {
      this.topInput_.insertFieldAt(1, new FieldMinus(), 'MINUS');
    } else if (minusField && this.itemCount_ < 1) {
      this.topInput_.removeField('MINUS');
    }
  },
};

/**
 * @this {Blockly.Block}
 * @constructor
 */
const textJoinHelper = function() {
  this.mixin(Blockly.Constants.Text.QUOTE_IMAGE_MIXIN);
  this.updateShape_(2);
};

Blockly.Extensions.unregister('text_join_mutator');
Blockly.Extensions.registerMutator('text_join_mutator',
    textJoinMutator, textJoinHelper);

const listCreateMutator = {
  itemCount_: 0,

  /**
   * Create XML to represent number of text inputs.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function () {
    var container = Blockly.utils.xml.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    return container;
  },
  /**
   * Parse XML to restore the text inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function (xmlElement) {
    var targetCount = parseInt(xmlElement.getAttribute('items'), 10);
    this.updateShape_(targetCount);
  },

  updateShape_: function(targetCount) {
    while (this.itemCount_ < targetCount) {
      this.addPart_();
    }
    while(this.itemCount_ > targetCount) {
      this.removePart_();
    }
    this.updateMinus_();
  },

  plus: function() {
    this.addPart_();
    this.updateMinus_();
  },

  minus: function() {
    this.removePart_();
    this.updateMinus_();
  },

  // To properly keep track of indices we have to increment before/after adding
  // the inputs, and decrement the opposite.
  // Because we want our first input to be ADD0 (not ADD1) we increment after.
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

  removePart_: function() {
    this.itemCount_--;
    this.removeInput('ADD' + this.itemCount_);
    if (this.itemCount_ == 0) {
      this.topInput_ = this.appendDummyInput('EMPTY')
          .appendField(new FieldPlus(), 'PLUS')
          .appendField(Blockly.Msg['LISTS_CREATE_EMPTY_TITLE']);
    }
  },

  updateMinus_: function() {
    var minusField = this.getField('MINUS');
    if (!minusField && this.itemCount_ > 0) {
      this.topInput_.insertFieldAt(1, new FieldMinus(), 'MINUS');
    } else if (minusField && this.itemCount_ < 1) {
      this.topInput_.removeField('MINUS');
    }
  }
};

/**
 * @this {Blockly.Block}
 * @constructor
 */
const listCreateHelper = function() {
  this.updateShape_(3);
};

Blockly.Extensions.registerMutator('new_list_create_with_mutator',
    listCreateMutator, listCreateHelper);

const getDefNoReturn = {
  getProcedureDef: function() {
    return [this.getFieldValue('NAME'), this.arguments_, false];
  },
  callType_: 'procedures_callnoreturn'
};

Blockly.Extensions.registerMixin('get_procedure_def_no_return', getDefNoReturn);

const getDefReturn = {
  getProcedureDef: function() {
    return [this.getFieldValue('NAME'), this.arguments_, true];
  },
  callType_: 'procedures_callreturn'
};

Blockly.Extensions.registerMixin('get_procedure_def_return', getDefReturn);

const procedureContextMenu = {
  customContextMenu: function(options) {
    if (this.isInFlyout) {
      return;
    }

    // Add option to create caller.
    var name = this.getFieldValue('NAME');
    var text = Blockly.Msg['PROCEDURES_CREATE_DO'].replace('%1', name);

    var xml = Blockly.utils.xml.createElement('block');
    xml.setAttribute('type', this.callType_);
    xml.appendChild(this.mutationToDom());
    var callback = Blockly.ContextMenu.callbackFactory(this, xml);

    options.push({
      enabled: true,
      text: text,
      callback: callback
    });

    if (this.isCollapsed()) {
      return;
    }

    // Add options to create getters for each parameter.
    for (var i = 0, model; (model = this.argumentVarModels_[i]); i++) {
      var text = Blockly.Msg['VARIABLES_SET_CREATE_GET']
          .replace('%1', model.name);

      var xml = Blockly.utils.xml.createElement('block');
      xml.setAttribute('type', 'variables_get');
      xml.appendChild(Blockly.Variables.generateVariableFieldDom(model));
      var callback = Blockly.ContextMenu.callbackFactory(this, xml);

      options.push({
        enabled: true,
        text: text,
        callback: callback
      });
    }
  }
};

Blockly.Extensions.registerMixin('procedure_context_menu', procedureContextMenu);

const procedureDefMutator = {
  /**
   * Names of all arg-models (vars) associated with this block.
   * @type {!Array<string>}
   */
  arguments_: [],
  /**
   * Ids of all the arg-models (vars) associated with this block.
   * @type {!Array<string>}
   */
  varIds_: [],
  /**
   * Arg-models (vars) associated with this block.
   * @type {!Array<Blockly.VariableModel>}
   */
  argumentVarModels_: [],
  // Note because the order is static this we could use the index as the argId.
  // But if we ever add the ability to reorder the args that will break and each
  // arg will need an ID. Currently we can't reorder because of #3725.
  /**
   * Ids associated with each argument. These are separate from the var Ids
   * and are used to keep track of an arg when its variable is changing. E.g
   * as the name is being edited.
   * @type {!Array<string>}
   */
  argIds_: [],

  mutationToDom: function(opt_isForCaller) {
    var container = Blockly.utils.xml.createElement('mutation');
    if (opt_isForCaller) {
      container.setAttribute('name', this.getFieldValue('NAME'));
    }
    for (var i = 0; i < this.argumentVarModels_.length; i++) {
      var argument = Blockly.utils.xml.createElement('arg');
      var argModel = this.argumentVarModels_[i];
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

  domToMutation: function(xmlElement) {
    // Not used by this block, but necessary if switching back and forth
    // between this mutator UI and the default UI.
    this.hasStatements_ = xmlElement.getAttribute('statements') !== 'false';

    var names = [];
    var ids = [];
    for (var i = 0, childNode; (childNode = xmlElement.childNodes[i]); i++) {
      if (childNode.nodeName.toLowerCase() != 'arg') {
        continue;
      }
      names.push(childNode.getAttribute('name'));
      ids.push(childNode.getAttribute('varid') ||
          childNode.getAttribute('varId'));
    }
    this.updateShape_(names, ids);
  },

  updateShape_: function(names, varIds) {
    // In this case it is easiest to just reset and build from scratch.

    // We need to remove args in reverse order so that it doesn't mess up
    // as removeArg_ modifies our arrays.
    for (var i = this.argIds_.length - 1; i >= 0; i--) {
      this.removeArg_(this.argIds_[i]);
    }

    this.arguments_ = [];
    this.varIds_ = [];
    this.argumentVarModels_ = [];
    this.argIds_ = [];

    var length = varIds.length;
    for (i = 0; i < length; i++) {
      this.addArg_(names[i], varIds[i]);
    }

    Blockly.Procedures.mutateCallers(this);
  },

  plus: function() {
    this.addArg_();
    Blockly.Procedures.mutateCallers(this);
  },

  minus: function(argId) {
    this.removeArg_(argId);
    Blockly.Procedures.mutateCallers(this);
  },

  addArg_: function(opt_name, opt_varId) {
    if (!this.arguments_.length) {
      var withField = new Blockly.FieldLabel(
          Blockly.Msg['PROCEDURES_BEFORE_PARAMS']);
      this.getInput('TOP')
          .appendField(withField, 'WITH');
    }

    var name = opt_name || Blockly.Variables.generateUniqueNameFromOptions(
        Blockly.Procedures.DEFAULT_ARG, this.arguments_);
    var variable = Blockly.Variables.getOrCreateVariablePackage(
        this.workspace, opt_varId, name, '');
    var argId = Blockly.utils.genUid();

    this.addVarInput_(name, argId);
    this.moveInputBefore(argId, 'STACK');

    this.arguments_.push(name);
    this.varIds_.push(variable.getId());
    this.argumentVarModels_.push(variable);
    this.argIds_.push(argId);
  },

  removeArg_: function(argId) {
    this.removeInput(argId);
    if (this.arguments_.length == 1) {  // Becoming argumentless.
      this.getInput('TOP').removeField('WITH');
    }

    var index = this.argIds_.indexOf(argId);
    this.arguments_.splice(index, 1);
    this.varIds_.splice(index, 1);
    this.argumentVarModels_.splice(index, 1);
    this.argIds_.splice(index, 1);
  },

  addVarInput_: function(name, argId) {
    var nameField = new Blockly.FieldTextInput(name, this.validator_);
    nameField.onFinishEditing_ = this.finishEditing_.bind(nameField);
    nameField.createdVarIds_ = [];

    this.appendDummyInput(argId)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(new FieldMinus(argId))
        .appendField('variable:')  // Untranslated!
        .appendField(nameField, argId);  // The name of the field is the arg id.
  },

  /**
   * @this {Blockly.FieldTextInput}
   */
  validator_: function(newName) {
    var sourceBlock = this.getSourceBlock();
    newName = newName.replace(/[\s\xa0]+/g, ' ').replace(/^ | $/g, '');
    if (!newName) {
      return null;
    }

    for (var i = 0, name; (name = sourceBlock.arguments_[i]); i++) {
      if (newName == name) {
        return null;  // It matches, so it is invalid.
      }
    }

    // The field name (aka id) is always equal to the arg id.
    var index = sourceBlock.argIds_.indexOf(this.name);
    sourceBlock.arguments_[index] = newName;

    // TODO: Maybe delete the pre-edit variable if it has no other uses.
    //  Currently unaccomplishable as the workspace var map is private.

    // We want to create new vars instead of renaming the old ones, so that
    // users don't accidentally rename/coalesce vars they don't want to.
    var workspace = sourceBlock.workspace;
    var model = workspace.getVariable(newName, '');
    if (!model) {
      model = workspace.createVariable(newName, '');
      this.createdVarIds_.push(model.getId());
      sourceBlock.varIds_[index] = model.getId();
      sourceBlock.argumentVarModels_[index] = model;
    } else if (model.name != newName) {
      // Ideally we would create a new var. But Blockly is case-insensitive so
      // we update the var to reflect the latest case instead.
      workspace.renameVariableById(model.getId(), newName);
    }
  },

  /**
   * @this {Blockly.FieldTextInput}
   */
  finishEditing_: function(finalName) {
    var source = this.getSourceBlock();
    var currentVarId = source.varIds_[source.argIds_.indexOf(this.name)];
    for (var i = 0, varId; (varId = this.createdVarIds_[i]); i++) {
      if (varId != currentVarId) {
        source.workspace.deleteVariableById(varId);
      }
    }
    this.createdVarIds_.length = 0;
  },
};

Blockly.Extensions.registerMutator('procedure_def_mutator', procedureDefMutator);

const procedureRename = function() {
  this.getField('NAME').setValidator(Blockly.Procedures.rename);
};

Blockly.Extensions.register('procedure_rename', procedureRename);

const procedureVars = function() {
  // This is a hack to get around the don't-override-builtins check.
  var mixin = {
    getVars: function() {
      return this.arguments_;
    },

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
      var index = this.varIds_.indexOf(oldId);
      if (index == -1) {
        return;  // Not on this block.
      }

      var newVar = this.workspace.getVariableById(newId);
      var newName = newVar.name;
      this.addVarInput_(newName, newId);
      this.moveInputBefore(newId, oldId);
      this.removeInput(oldId);

      // No need to update argIds_ b/c it is constant.
      this.arguments_[index] = newName;
      this.varIds_[index] = newId;
      this.argumentVarModels_[index] = newVar;

      Blockly.Procedures.mutateCallers(this);
    },

    updateVarName: function(variable) {
      var id = variable.getId();
      var index = this.varIds_.indexOf(id);
      if (index == -1) {
        return;  // Not on this block.
      }
      var name = variable.name;
      if (variable.name == this.arguments_[index]) {
        return;  // No change. Occurs when field is being edited.
      }

      this.setFieldValue(name, this.argIds_[index]);
      this.arguments_[index] = name;
    },
  };

  this.mixin(mixin, true);
};

Blockly.Extensions.register('procedure_vars', procedureVars);

