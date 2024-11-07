/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Toolbox category with styling for continuous toolbox.
 */

import * as Blockly from 'blockly/core';

/** Toolbox category for continuous toolbox. */
export class ContinuousCategory extends Blockly.ToolboxCategory {
  /**
   * Constructor for ContinuousCategory which is used in ContinuousToolbox.
   * @override
   */
  constructor(categoryDef, toolbox) {
    super(categoryDef, toolbox);
  }

  /** @override */
  createLabelDom_(name) {
    const label = document.createElement('div');
    label.setAttribute('id', this.getId() + '.label');
    label.textContent = name;
    label.classList.add(this.cssConfig_['label']);
    return label;
  }

  /** @override */
  createIconDom_() {
    const icon = document.createElement('div');
    icon.classList.add('categoryBubble');
    icon.style.backgroundColor = this.colour_;
    return icon;
  }

  /** @override */
  addColourBorder_() {
    // No-op
  }

  /** @override */
  setSelected(isSelected) {
    if (isSelected) {
      this.rowDiv_.style.backgroundColor = 'gray';
      Blockly.utils.dom.addClass(this.rowDiv_, this.cssConfig_['selected']);
    } else {
      this.rowDiv_.style.backgroundColor = '';
      Blockly.utils.dom.removeClass(this.rowDiv_, this.cssConfig_['selected']);
    }
    Blockly.utils.aria.setState(
      /** @type {!Element} */ (this.htmlDiv_),
      Blockly.utils.aria.State.SELECTED,
      isSelected,
    );
  }
}

Blockly.registry.register(
  Blockly.registry.Type.TOOLBOX_ITEM,
  Blockly.ToolboxCategory.registrationName,
  ContinuousCategory,
  true,
);
