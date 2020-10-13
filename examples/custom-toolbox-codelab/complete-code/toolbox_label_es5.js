/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The toolbox label built during the custom toolbox codelab, in es5.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */

/**
 * Constructor for a label in the toolbox.
 * @param {!Blockly.utils.toolbox.ToolboxItemInfo} toolboxItemDef The toolbox
 *    item definition. This comes directly from the toolbox definition.
 * @param {!Blockly.IToolbox} parentToolbox The toolbox that holds this
 *    toolbox item.
 * @override
 */
ToolboxLabel = function(toolboxItemDef, parentToolbox) {
  ToolboxLabel.superClass_.constructor.call(this, toolboxItemDef, parentToolbox);

  /**
   * The button element.
   * @type {?HTMLLabelElement}
   */
  this.label = null;
};
Blockly.utils.object.inherits(ToolboxLabel, Blockly.ToolboxItem);

/**
 * Init method for the label.
 * @override
 */
ToolboxLabel.prototype.init = function(colour) {
  // Create the label.
  this.label = document.createElement('label');
  // Set the name.
  this.label.textContent = this.toolboxItemDef_['name'];
  // Set the color.
  this.label.style.color = this.toolboxItemDef_['colour'];
  // Any attributes that begin with css- will get added to a cssconfig.
  const cssConfig = this.toolboxItemDef_['cssconfig'];
  // Add the class.
  if (cssConfig) {
    this.label.classList.add(cssConfig['label']);
  }
};

/**
 * Gets the div for the toolbox item.
 * @return {HTMLLabelElement} The label element.
 * @override
 */
ToolboxLabel.prototype.getDiv = function() {
  return this.label;
};

Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX_ITEM,
    'toolboxlabel',
    ToolboxLabel);
