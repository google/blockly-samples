/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The toolbox category built during the custom toolbox codelab, in es5.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */

/**
 * Constructor for a custom category.
 * @override
 */
CustomCategory = function(categoryDef, toolbox, opt_parent) {
  CustomCategory.superClass_.constructor.call(this, categoryDef, toolbox, opt_parent);
};
Blockly.utils.object.inherits(CustomCategory, Blockly.ToolboxCategory);
/**
 * Adds the colour to the toolbox.
 * This is called on category creation and whenever the theme changes.
 * @override
 */
CustomCategory.prototype.addColourBorder_ = function(colour) {
  this.rowDiv_.style.backgroundColor = colour;
};

/**
 * Sets the style for the category when it is selected or deselected.
 * @param {boolean} isSelected True if the category has been selected, false otherwise.
 * @override
 */
CustomCategory.prototype.setSelected = function(isSelected) {
  // We do not store the label span on the category, so use getElementsByClassName.
  var labelDom = this.rowDiv_.getElementsByClassName('blocklyTreeLabel')[0];
  if (isSelected) {
    // Change the background color of the div to white.
    this.rowDiv_.style.backgroundColor = 'white';
    // Set the colour of the text to the colour of the category.
    labelDom.style.color = this.colour_;
    this.iconDom_.style.color = this.colour_;
  } else {
    // Set the background back to the original colour.
    this.rowDiv_.style.backgroundColor = this.colour_;
    // Set the text back to white.
    labelDom.style.color = 'white';
    this.iconDom_.style.color = 'white';
  }
  // This is used for accessibility purposes.
  Blockly.utils.aria.setState(/** @type {!Element} */ (this.htmlDiv_),
      Blockly.utils.aria.State.SELECTED, isSelected);
};

/**
 * Creates the dom used for the icon.
 * @return {HTMLElement} The element for the icon.
 * @override
 */
CustomCategory.prototype.createIconDom_ = function() {
  var iconImg = document.createElement('img');
  iconImg.src = './logo_only.svg';
  iconImg.alt = 'Blockly Logo';
  iconImg.width = '25';
  iconImg.height = '25';
  return iconImg;
};

Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX_ITEM,
    Blockly.ToolboxCategory.registrationName,
    CustomCategory, true);
