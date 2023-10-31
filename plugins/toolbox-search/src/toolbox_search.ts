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
import {BlockSearcher} from './block_searcher';

/* eslint-disable @typescript-eslint/naming-convention */

/**
 * A toolbox category that provides a search field and displays matching blocks
 * in its flyout.
 */

export class ToolboxSearchCategory extends Blockly.ToolboxCategory {
  private static readonly START_SEARCH_SHORTCUT = 'startSearch';
  static readonly SEARCH_CATEGORY_KIND = 'search';
  private searchField?: HTMLInputElement;
  private blockSearcher = new BlockSearcher();

  constructor(
    categoryDef: Blockly.utils.toolbox.CategoryInfo,
    parentToolbox: Blockly.IToolbox,
    opt_parent?: Blockly.ICollapsibleToolboxItem,
  ) {
    super(categoryDef, parentToolbox, opt_parent);
    this.initBlockSearcher();
    this.registerShortcut();
  }

  protected override createDom_(): HTMLDivElement {
    const dom = super.createDom_();
    this.searchField = document.createElement('input');
    this.searchField.type = 'search';
    this.searchField.placeholder = 'Search';
    this.workspace_.RTL
      ? (this.searchField.style.marginRight = '8px')
      : (this.searchField.style.marginLeft = '8px');
    this.searchField.addEventListener('keyup', (event) => {
      if (event.key === 'Escape') {
        this.parentToolbox_.clearSelection();
        return true;
      }

      this.matchBlocks();
    });
    this.rowContents_?.replaceChildren(this.searchField);
    return dom;
  }

  private getPosition() {
    const categories = this.workspace_.options.languageTree?.contents || [];
    for (let i = 0; i < categories.length; i++) {
      if (categories[i].kind === ToolboxSearchCategory.SEARCH_CATEGORY_KIND) {
        return i;
      }
    }

    return -1;
  }

  private registerShortcut() {
    const shortcut = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.B,
      [Blockly.utils.KeyCodes.CTRL],
    );
    Blockly.ShortcutRegistry.registry.register({
      name: ToolboxSearchCategory.START_SEARCH_SHORTCUT,
      callback: () => {
        const position = this.getPosition();
        if (position < 0) return false;
        this.parentToolbox_?.selectItemByPosition(position);
        return true;
      },
      keyCodes: [shortcut],
    });
  }

  private getAvailableBlocks(
    schema: Blockly.utils.toolbox.ToolboxItemInfo,
    allBlocks: Set<string>,
  ) {
    if ('contents' in schema) {
      schema.contents?.forEach((contents) => {
        this.getAvailableBlocks(contents, allBlocks);
      });
    } else if (schema.kind.toLowerCase() === 'block') {
      if ('type' in schema && schema.type) {
        allBlocks.add(schema.type);
      }
    }
  }

  private initBlockSearcher() {
    const availableBlocks = new Set<string>();
    this.workspace_.options.languageTree?.contents?.map((item) =>
      this.getAvailableBlocks(item, availableBlocks),
    );
    this.blockSearcher.indexBlocks([...availableBlocks]);
  }

  override onClick(e: Event) {
    super.onClick(e);
    e.preventDefault();
    e.stopPropagation();
    this.setSelected(this.parentToolbox_?.getSelectedItem() === this);
  }

  override setSelected(isSelected: boolean) {
    super.setSelected(isSelected);
    if (isSelected) {
      this.searchField?.focus();
      this.matchBlocks();
    } else {
      const searchFieldValue = this.searchField;
      if (searchFieldValue) {
        searchFieldValue.value = '';
      }
      this.searchField?.blur();
    }
  }

  private matchBlocks() {
    const query = this.searchField?.value || '';

    this.flyoutItems_ = query
      ? this.blockSearcher.blockTypesMatching(query).map((blockType) => {
          return {
            kind: 'block',
            type: blockType,
          };
        })
      : [];

    if (!this.flyoutItems_.length) {
      this.flyoutItems_.push({
        kind: 'label',
        text:
          query.length < 3
            ? 'Type to search for blocks'
            : 'No matching blocks found',
      });
    }
    this.parentToolbox_?.refreshSelection();
  }

  override dispose() {
    super.dispose();
    Blockly.ShortcutRegistry.registry.unregister(
      ToolboxSearchCategory.START_SEARCH_SHORTCUT,
    );
  }
}

Blockly.registry.register(
  Blockly.registry.Type.TOOLBOX_ITEM,
  ToolboxSearchCategory.SEARCH_CATEGORY_KIND,
  ToolboxSearchCategory,
);
