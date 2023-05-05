/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * A toolbox category that provides a search field and displays matching blocks
 * in its flyout.
 */
import * as Blockly from 'blockly/core';

/* eslint-disable @typescript-eslint/naming-convention */

/**
 * A toolbox category that provides a search field and displays matching blocks
 * in its flyout.
 */
export class ToolboxSearchCategory extends Blockly.ToolboxCategory {
  private searchField?: HTMLInputElement;

  protected override createDom_(): HTMLDivElement {
    const dom = super.createDom_();
    
    this.searchField = document.createElement('input');
    this.searchField.type = 'search';
    this.searchField.placeholder = 'Search';
    this.searchField.addEventListener('keyup', this.matchBlocks.bind(this));
    this.searchField.addEventListener('search', this.matchBlocks.bind(this));
    this.rowContents_.replaceChildren(this.searchField);

    return dom;
  }

  override onClick(e: Event) {
    this.searchField.focus();
    e.preventDefault();
    e.stopPropagation();
  }
  
  private matchBlocks() {
    const query = this.searchField.value;
    const blocks = Object.keys(Blockly.Blocks);
    this.flyoutItems_ = blocks.filter(b => b.includes(query)).map(b => {
      return {
        kind: 'block',
        type: b,
      };
    });

    if (!this.flyoutItems_.length) {
      this.flyoutItems_.push({
        kind: 'label',
        text: 'No matching blocks found',
      });
    }
    this.parentToolbox_.refreshSelection();
  }
}

// TODO: Keyboard shortcut to focus
// Dismiss on escape
// better filtering on actual name
// verify rtl
// Only search blocks from installed categories
// fix styling
// Optimize search (only search matches so far if query is longer than previous query)
// Localization

Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX_ITEM, 'search', ToolboxSearchCategory);
