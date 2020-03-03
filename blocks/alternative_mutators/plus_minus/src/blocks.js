/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blocks for demonstrating using +/- icons for manipulating
 *    the shape of a block.
 */

Blockly.defineBlocksWithJsonArray([
  {
    "type": "controls_if",
    "message0": "%1 %{BKY_CONTROLS_IF_MSG_IF} %2" +
        "%{BKY_CONTROLS_IF_MSG_THEN} %3",
    "args0": [
      {
        "type": "field_plus",
        "name": "PLUS"
      },
      {
        "type": "input_value",
        "name": "IF0",
        "check": "Boolean"
      },
      {
        "type": "input_statement",
        "name": "DO0"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "style": "logic_blocks",
    "helpUrl": "%{BKY_CONTROLS_IF_HELPURL}",
    "mutator": "new_controls_if_mutator",
    "extensions": [
      "controls_if_tooltip",
      "suppress_prefix_suffix"
    ]
  },
  {
    "type": "controls_ifelse",
    "message0": " %1 %{BKY_CONTROLS_IF_MSG_IF} %2" +
        "%{BKY_CONTROLS_IF_MSG_THEN} %3" +
        "%{BKY_CONTROLS_IF_MSG_ELSE} %4",
    "args0": [
      {
        "type": "field_plus",
        "name": "PLUS"
      },
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
    "mutator": "new_controls_if_mutator",
    "extensions": [
      "controls_if_tooltip",
      "suppress_prefix_suffix"
    ]
  },
  {
    "type": "text_join",
    "message0": "%1 %{BKY_TEXT_JOIN_TITLE_CREATEWITH} %2 %3",
    "args0": [
      {
        "type": "field_plus",
        "name": "PLUS"
      },
      {
        "type": "input_value",
        "name": "ADD0"
      },
      {
        "type": "input_value",
        "name": "ADD1"
      }
    ],
    "output": "String",
    "style": "text_blocks",
    "helpUrl": "%{BKY_TEXT_JOIN_HELPURL}",
    "tooltip": "%{BKY_TEXT_JOIN_TOOLTIP}",
    "mutator": "new_text_join_mutator"
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
      "procedure_display_renamed"
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
      "procedure_display_renamed"
    ],
    "mutator": "procedure_def_mutator"
  }
]);

Blockly.Constants.SUPPRESS_PREFIX_SUFFIX = {
  /**
   * Don't automatically add STATEMENT_PREFIX and STATEMENT_SUFFIX to generated
   * code.  These will be handled manually in this block's generators.
   */
  suppressPrefixSuffix: true,
};
Blockly.Extensions.registerMixin(
    'suppress_prefix_suffix', Blockly.Constants.SUPPRESS_PREFIX_SUFFIX);

Blockly.Constants.Logic.NEW_CONTROLS_IF_MUTATOR_MIXIN =  {
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
      this.topInput_.insertFieldAt(1, new plusMinus.FieldMinus(), 'MINUS');
    } else if (!this.elseIfCount_) {
      this.topInput_.removeField('MINUS');
    }
  },
};

/**
 * @this {Blockly.Block}
 * @constructor
 */
Blockly.Constants.Logic.NEW_CONTROLS_IF_HELPER_FN = function() {
  this.topInput_ = this.getInput('IF0');
};

Blockly.Extensions.registerMutator('new_controls_if_mutator',
    Blockly.Constants.Logic.NEW_CONTROLS_IF_MUTATOR_MIXIN,
    Blockly.Constants.Logic.NEW_CONTROLS_IF_HELPER_FN);

Blockly.Constants.Text.NEW_TEXT_JOIN_MUTATOR_MIXIN = {
  itemCount_: 1,

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

  addPart_: function() {
    this.itemCount_++;
    this.appendValueInput('ADD' + this.itemCount_);
  },

  removePart_: function() {
    this.removeInput('ADD' + this.itemCount_);
    this.itemCount_--;
  },

  updateMinus_: function() {
    var minusField = this.getField('MINUS');
    if (!minusField) {
      this.topInput_.insertFieldAt(1, new plusMinus.FieldMinus(), 'MINUS');
    } else if (this.itemCount_ <= 1) {
      this.topInput_.removeField('MINUS');
    }
  },
};

/**
 * @this {Blockly.Block}
 * @constructor
 */
Blockly.Constants.Text.NEW_TEXT_JOIN_HELPER_FN = function() {
  this.topInput_ = this.getInput('ADD0');
};

Blockly.Extensions.registerMutator('new_text_join_mutator',
    Blockly.Constants.Text.NEW_TEXT_JOIN_MUTATOR_MIXIN,
    Blockly.Constants.Text.NEW_TEXT_JOIN_HELPER_FN);

Blockly.Constants.Lists.NEW_LIST_CREATE_WITH_MUTATOR_MIXIN = {
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

  plus: function() {
    this.addPart_();
    this.updateMinus_();
  },

  minus: function() {
    this.itemCount_--;
    this.removePart_();
    this.updateMinus_();
  },

  addPart_: function() {
    if (this.itemCount_ == 0) {
      this.removeInput('EMPTY');
      this.topInput_ = this.appendValueInput('ADD0')
          .appendField(new plusMinus.FieldPlus(), 'PLUS')
          .appendField(Blockly.Msg['LISTS_CREATE_WITH_INPUT_WITH']);
    } else {
      this.appendValueInput('ADD' + this.itemCount_);
    }
    this.itemCount_++;
  },

  removePart_: function() {
    if (this.itemCount_ == 1) {  // We are becoming empty.
      this.topInput_ = this.appendDummyInput('EMPTY')
          .appendField(new plusMinus.FieldPlus(), 'PLUS')
          .appendField(Blockly.Msg['LISTS_CREATE_EMPTY_TITLE']);
    } else {
      this.removeInput('ADD' + this.itemCount_);
    }
    this.itemCount_--;
  },

  updateMinus_: function() {
    var minusField = this.getField('MINUS');
    if (!minusField && this.itemCount_ > 0) {
      this.topInput_.insertFieldAt(1, new plusMinus.FieldMinus(), 'MINUS');
    } else if (minusField && this.itemCount_< 1) {
      this.topInput_.removeField('MINUS');
    }
  },

  updateShape_: function(targetCount) {
    console.trace(this.itemCount_, targetCount);
    while (this.itemCount_ < targetCount) {
      this.addPart_();
    }
    while(this.itemCount_ > targetCount) {
      this.removePart_();
    }
    this.updateMinus_();
  }
};

/**
 * @this {Blockly.Block}
 * @constructor
 */
Blockly.Constants.Lists.NEW_LIST_CREATE_WITH_HELPER_FN = function() {
  this.updateShape_(3);
};

Blockly.Extensions.registerMutator('new_list_create_with_mutator',
    Blockly.Constants.Lists.NEW_LIST_CREATE_WITH_MUTATOR_MIXIN,
    Blockly.Constants.Lists.NEW_LIST_CREATE_WITH_HELPER_FN);

Blockly.Constants.Procedures = Object.create(null);

Blockly.Constants.Procedures.PROCEDURE_GET_DEF_NO_RETURN_MIXIN = {
  getProcedureDef: function() {
    return [this.getFieldValue('NAME'), this.arguments_, false];
  },
  callType_: 'procedures_callnoreturn'
};

Blockly.Extensions.registerMixin('get_procedure_def_no_return',
    Blockly.Constants.Procedures.PROCEDURE_GET_DEF_NO_RETURN_MIXIN);

Blockly.Constants.Procedures.PROCEDURE_GET_DEF_RETURN_MIXIN = {
  getProcedureDef: function() {
    return [this.getFieldValue('NAME'), this.arguments_, false];
  },
  callType_: 'procedures_callreturn'
};

Blockly.Extensions.registerMixin('get_procedure_def_return',
    Blockly.Constants.Procedures.PROCEDURE_GET_DEF_RETURN_MIXIN);

Blockly.Constants.Procedures.PROCEDURE_CONTEXT_MENU_MIXIN = {
  customContextMenu: function(options) {
    if (this.isInFlyout) {
      return;
    }
    // Add option to create caller.
    var option = {enabled: true};
    var name = this.getFieldValue('NAME');
    option.text = Blockly.Msg['PROCEDURES_CREATE_DO'].replace('%1', name);
    var xmlMutation = Blockly.utils.xml.createElement('mutation');
    xmlMutation.setAttribute('name', name);
    for (var i = 0; i < this.arguments_.length; i++) {
      var xmlArg = Blockly.utils.xml.createElement('arg');
      xmlArg.setAttribute('name', this.arguments_[i]);
      xmlMutation.appendChild(xmlArg);
    }
    var xmlBlock = Blockly.utils.xml.createElement('block');
    xmlBlock.setAttribute('type', this.callType_);
    xmlBlock.appendChild(xmlMutation);
    option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
    options.push(option);

    // Add options to create getters for each parameter.
    if (!this.isCollapsed()) {
      for (var i = 0; i < this.argumentVarModels_.length; i++) {
        var argOption = {enabled: true};
        var argVar = this.argumentVarModels_[i];
        argOption.text = Blockly.Msg['VARIABLES_SET_CREATE_GET']
            .replace('%1', argVar.name);

        var argXmlField = Blockly.Variables.generateVariableFieldDom(argVar);
        var argXmlBlock = Blockly.utils.xml.createElement('block');
        argXmlBlock.setAttribute('type', 'variables_get');
        argXmlBlock.appendChild(argXmlField);
        argOption.callback =
            Blockly.ContextMenu.callbackFactory(this, argXmlBlock);
        options.push(argOption);
      }
    }
  }
};

Blockly.Extensions.registerMixin('procedure_context_menu',
    Blockly.Constants.Procedures.PROCEDURE_CONTEXT_MENU_MIXIN);

Blockly.Constants.Procedures.PROCEDURE_DEF_MUTATOR_MIXIN = {
  // Parallel arrays.
  arguments_: [],
  paramIds_: [],
  argumentVarModels_: [],

  mutationToDom: function() {
    var container = Blockly.utils.xml.createElement('mutation');
    container.setAttribute('name', this.getFieldValue('NAME'));
    for (var i = 0; i < this.argumentVarModels_.length; i++) {
      var parameter = Blockly.utils.xml.createElement('arg');
      var argModel = this.argumentVarModels_[i];
      parameter.setAttribute('name', argModel.name);
      parameter.setAttribute('varid', argModel.getId());
      parameter.setAttribute('paramId', this.paramIds_[i]);
      container.appendChild(parameter);
    }
    return container;
  },

  domToMutation: function(xmlElement) {
    this.paramIds_ = [];
    this.arguments_ = [];
    this.argumentVarModels_ = [];

    for (var i = 0, childNode; (childNode = xmlElement.childNodes[i]); i++) {
      if (childNode.nodeName.toLowerCase() != 'arg') {
        continue;
      }
      var varName = childNode.getAttribute('name');
      var varId = childNode.getAttribute('varid') ||
          childNode.getAttribute('varId');
      var paramId = childNode.getAttribute('paramId');
      this.addParam_(varName, paramId);
    }
    Blockly.Procedures.mutateCallers(this);
  },

  plus: function() {
    this.addParam_();
    Blockly.Procedures.mutateCallers(this);
  },

  minus: function(id) {
    this.removeParam_(id);
    Blockly.Procedures.mutateCallers(this);
  },

  addParam_: function(opt_name, opt_id) {
    if (!this.arguments_.length) {
      var withField = new Blockly.FieldLabel(
          Blockly.Msg['PROCEDURES_BEFORE_PARAMS']);
      this.getInput('TOP')
          .appendField(withField, 'WITH');
    }

    var name = opt_name || Blockly.Variables.generateUniqueNameFromOptions(
        Blockly.Procedures.DEFAULT_ARG, this.arguments_);
    var id = opt_id || Blockly.utils.genUid();

    var nameField = new Blockly.FieldTextInput(name, this.validator_);
    nameField.onFinishEditing_ = this.onFinish.bind(nameField);
    var input = this.appendDummyInput(id)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(new plusMinus.FieldMinus(id))
        .appendField('variable:')  // Untranslated!
        .appendField(nameField,  id);  // The name of the field is the var id.
    this.moveInputBefore(id, 'STACK');

    this.arguments_.push(name);
    this.paramIds_.push(id);
    this.argumentVarModels_.push(Blockly.Variables.getOrCreateVariablePackage(
        this.workspace, id, name, ''));
  },

  removeParam_: function(id) {
    this.removeInput(id);
    if (this.arguments_.length == 1) {
      this.getInput('TOP').removeField('WITH');
    }

    var index = this.paramIds_.indexOf(id);
    this.arguments_.splice(index, 1);
    this.paramIds_.splice(index, 1);
    this.argumentVarModels_.splice(index, 1);
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

    for (var i = 0, input; (input = sourceBlock.inputList[i]); i++) {
      for (var j = 0, field; (field = input.fieldRow[j]); j++) {
        if (field.name == this.name) {
          continue;
        }
        if (field.getValue() == newName) {
          return null;  // It matches, so it is invalid.
        }
      }
    }

    // The field name (aka id) is always equal to the var id.
    var index = sourceBlock.paramIds_.indexOf(this.name);
    sourceBlock.arguments_[index] = newName;

    // These may already match if this gets triggered by the variable being
    // renamed somewhere else.
    var variable = sourceBlock.workspace.getVariableById(this.name);
    if (variable.name != newName) {
      sourceBlock.workspace.renameVariableById(this.name, newName);
      Blockly.Procedures.mutateCallers(sourceBlock);
    }
  },

  /**
   * @this {Blockly.FieldTextInput}
   */
  onFinish: function(finalName) {
    var sourceBlock = this.getSourceBlock();
    // The field name (aka id) is always equal to the var id.
    var index = sourceBlock.paramIds_.indexOf(this.name);
    sourceBlock.arguments_[index] = finalName;
    sourceBlock.workspace.renameVariableById(this.name, finalName);
    Blockly.Procedures.mutateCallers(sourceBlock);
  },
};

Blockly.Extensions.registerMutator('procedure_def_mutator',
    Blockly.Constants.Procedures.PROCEDURE_DEF_MUTATOR_MIXIN);

Blockly.Constants.Procedures.PROCEDURE_RENAME_EXTENSION = function() {
  this.getField('NAME').setValidator(Blockly.Procedures.rename);
};

Blockly.Extensions.register('procedure_rename',
    Blockly.Constants.Procedures.PROCEDURE_RENAME_EXTENSION);

Blockly.Constants.Procedures.PROCEDURE_VARS_MIXIN = function() {
  // This is a hack to get around the don't-override-builtins check.
  var mixin = {
    getVars: function() {
      return this.arguments_;
    },

    getVarModels: function() {
      return this.argumentVarModels_;
    },

    renameVarById: function(oldId, newId) {
      var index = this.paramIds_.indexOf(oldId);
      if (index == -1) {
        return;  // Not on this block.
      }

      var oldName = this.workspace.getVariableById(oldId).name;
      var newVar = this.workspace.getVariableById(newId);
      var newName = newVar.name;

      // Don't update paramIds until displayRenamedVar_
      this.arguments_[index] = newName;
      this.argumentVarModels_[index] = newVar;

      this.displayRenamedVar_(oldName, newName);
      Blockly.Procedures.mutateCallers(this);
    },

    updateVarName: function(variable) {
      var id = variable.getId();
      var index = this.paramIds_.indexOf(id);
      if (index == -1) {
        return;  // Not on this block.
      }

      var oldName = this.arguments_[index];
      var newName = variable.name;
      this.arguments_[index] = newName;

      this.displayRenamedVar_(oldName, newName);
    },
  };

  this.mixin(mixin, true);
};

Blockly.Extensions.register('procedure_vars',
    Blockly.Constants.Procedures.PROCEDURE_VARS_MIXIN);

Blockly.Constants.Procedures.PROCEDURE_DISPLAY_RENAMED = {
  displayRenamedVar_: function(oldName, newName) {
    var index = this.arguments_.indexOf(newName);
    var id = this.paramIds_[index];
    this.setFieldValue(newName, id);
  }
};

Blockly.Extensions.registerMixin('procedure_display_renamed',
    Blockly.Constants.Procedures.PROCEDURE_DISPLAY_RENAMED);
