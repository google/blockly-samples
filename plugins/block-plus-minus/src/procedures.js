/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Changes the procedure blocks to use a +/- mutator UI.
 */

import Blockly from 'blockly/core';
import {createMinusField} from './field_minus';
import {createPlusField} from './field_plus';

Blockly.Msg['PROCEDURE_VARIABLE'] = 'variable:';

/* eslint-disable quotes */
Blockly.defineBlocksWithJsonArray([
  {
    "type": "procedures_defnoreturn",
    "message0": "%{BKY_PROCEDURES_DEFNORETURN_TITLE} %1 %2",
    "message1": "%{BKY_PROCEDURES_DEFNORETURN_DO} %1",
    "args0": [
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
    "message0": "%{BKY_PROCEDURES_DEFRETURN_TITLE} %1 %2",
    "message1": "%{BKY_PROCEDURES_DEFRETURN_DO} %1",
    "message2": "%{BKY_PROCEDURES_DEFRETURN_RETURN} %1",
    "args0": [
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
    const argNames = this.argData_.map((elem) => elem.model.name);
    return [this.getFieldValue('NAME'), argNames, false];
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
    const argNames = this.argData_.map((elem) => elem.model.name);
    return [this.getFieldValue('NAME'), argNames, true];
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
    const varModels = this.getVarModels();
    for (let i = 0, model; (model = varModels); i++) {
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
    this.argData_.forEach((element) => {
      const argument = Blockly.utils.xml.createElement('arg');
      const argModel = element.model;
      argument.setAttribute('name', argModel.name);
      argument.setAttribute('varid', argModel.getId());
      if (opt_isForCaller) {
        argument.setAttribute('paramid', element.argId);
      }
      container.appendChild(argument);
    });

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
    // as removeArg_ modifies our array.
    for (let i = this.argData_.length - 1; i >= 0; i--) {
      this.removeArg_(this.argData_[i].argId);
    }
    this.argData_ = [];
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
    if (!this.argData_.length) {
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
    if (!this.argData_.length) {
      const withField = new Blockly.FieldLabel(
          Blockly.Msg['PROCEDURES_BEFORE_PARAMS']);
      this.getInput('TOP')
          .appendField(withField, 'WITH');
    }

    const argNames = this.argData_.map((elem) => elem.model.name);
    const name = opt_name || Blockly.Variables.generateUniqueNameFromOptions(
        Blockly.Procedures.DEFAULT_ARG, argNames);
    const variable = Blockly.Variables.getOrCreateVariablePackage(
        this.workspace, opt_varId, name, '');
    const argId = Blockly.utils.genUid();

    this.addVarInput_(name, argId);
    if (this.getInput('STACK')) {
      this.moveInputBefore(argId, 'STACK');
    } else {
      this.moveInputBefore(argId, 'RETURN');
    }

    this.argData_.push({
      model: variable,
      argId: argId,
    });
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
    if (this.argData_.length == 1) { // Becoming argumentless.
      this.getInput('TOP').removeField('WITH');
    }

    this.argData_ = this.argData_.filter((element) => element.argId != argId);
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
        .appendField(createMinusField(argId))
        .appendField(Blockly.Msg['PROCEDURE_VARIABLE']) // Untranslated!
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

    /**
     * Checks that all of the args (that aren't this arg) have a different
     * name than this arg.
     * @param {{model: Blockly.VariableModel, argId:string}} element
     * @return {boolean} True if the other name is not a match.
     * @this Blockly.FieldTextInput
     */
    const hasDifName = (element) => {
      // The field name (aka id) is always equal to the arg id.
      return element.argId == this.name ||
          caselessName != element.model.name.toLowerCase();
    };
    const caselessName = newName.toLowerCase();
    if (!sourceBlock.argData_.every(hasDifName, this)) {
      return null;
    }

    const workspace = sourceBlock.workspace;
    const argData = sourceBlock.argData_.find(
        (element) => element.argId == this.name);
    const id = argData.model.getId();

    /**
     * Checks that every block is either this block (the def) or a caller of
     * this procedure.
     * @param {Blockly.Block} element The block to check.
     * @return {boolean} Whether the block is associated with this procedure.
     */
    const isThisProcedure = (element) => {
      return element.id == sourceBlock.id ||
          (element.getProcedureCall &&
              element.getProcedureCall() == sourceBlock.getProcedureDef()[0]);
    };
    if (!this.createdVarIds_.length &&
        workspace.getVariableUsesById(id).every(isThisProcedure)) {
      // If this is our first edit and the pre-edit var is only used here.
      this.createdVarIds_.push(id);
    }

    // We want to create new vars instead of renaming the old ones, so that
    // users don't accidentally rename/coalesce vars they don't want to.
    let model = workspace.getVariable(newName, '');
    if (!model) {
      model = workspace.createVariable(newName, '');
      this.createdVarIds_.push(model.getId());
    } else if (model.name != newName) {
      // Ideally we would create a new var. But Blockly is case-insensitive so
      // we update the var to reflect the latest case instead.
      workspace.renameVariableById(model.getId(), newName);
    }
    if (model.getId() != id) {
      argData.model = model;
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
    const argData = source.argData_.find(
        (element) => element.argId == this.name);

    const currentVarId = argData.model.getId();
    this.createdVarIds_.forEach((id) => {
      if (id != currentVarId) {
        source.workspace.deleteVariableById(id);
      }
    });
    this.createdVarIds_.length = 0;
  },
};

/**
 * Initializes some private variables for procedure blocks.
 * @this Blockly.Block
 */
const procedureDefHelper = function() {
  /**
   * An array of objects containing data about the args belonging to the
   * procedure definition.
   * @type {{
   *          model:Blockly.VariableModel,
   *          argId: string
   *       }}
   * @private
   */
  this.argData_ = [];
  /**
   * Does this block have a 'STACK' input for statements?
   * @type {boolean}
   * @private
   */
  this.hasStatements_ = true;

  this.getInput('TOP').insertFieldAt(0, createPlusField(), 'PLUS');
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
      return this.argData_.map((elem) => elem.model.name);
    },

    /**
     * Return all variables referenced by this block.
     * @return {!Array.<!Blockly.VariableModel>} List of variable models.
     * @this Blockly.Block
     */
    getVarModels: function() {
      return this.argData_.map((elem) => elem.model);
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
      const argData = this.argData_.find(
          (element) => element.model.getId() == oldId);
      if (!argData) {
        return; // Not on this block.
      }

      const newVar = this.workspace.getVariableById(newId);
      const newName = newVar.name;
      this.addVarInput_(newName, newId);
      this.moveInputBefore(newId, oldId);
      this.removeInput(oldId);
      argData.model = newVar;
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
      const argData = this.argData_.find(
          (element) => element.model.getId() == id);
      if (!argData) {
        return; // Not on this block.
      }
      this.setFieldValue(variable.name, argData.argId);
      argData.model = variable;
    },
  };

  this.mixin(mixin, true);
};

Blockly.Extensions.register('procedure_vars', procedureVars);
