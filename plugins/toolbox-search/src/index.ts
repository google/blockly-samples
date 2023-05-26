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
  private static readonly START_SEARCH_SHORTCUT = 'startSearch';
  static readonly SEARCH_CATEGORY_KIND = 'search';
  private searchField?: HTMLInputElement;
  private blockCreationWorkspace = new Blockly.Workspace();
  private trigramsToBlocks = new Map<string, Set<string>>();

  /**
   * Initializes the search field toolbox category.
   * @returns The <div> that will be displayed in the toolbox.
   */
  protected override createDom_(): HTMLDivElement {
    this.generateBlockIndex();
    this.registerShortcut();

    const dom = super.createDom_();
    this.searchField = document.createElement('input');
    this.searchField.type = 'search';
    this.searchField.placeholder = 'Search';
    this.searchField.style.marginLeft = '8px';
    this.searchField.addEventListener('keyup', (event) => {
      if (event.key === 'Escape') {
        this.parentToolbox_.clearSelection();
        return true;
      }

      this.matchBlocks();
    });
    this.rowContents_.replaceChildren(this.searchField);
    return dom;
  }

  /**
   * Returns the numerical position of this category in its parent toolbox.
   * @returns The zero-based index of this category in its parent toolbox, or -1
   *    if it cannot be determined, e.g. if this is a nested category.
   */
  private getPosition() {
    const categories = this.workspace_.options.languageTree.contents;
    for (let i = 0; i < categories.length; i++) {
      if (categories[i].kind === ToolboxSearchCategory.SEARCH_CATEGORY_KIND) {
        return i;
      }
    }

    return -1;
  }

  /**
   * Registers a shortcut for displaying the toolbox search category.
   */
  private registerShortcut() {
    const shortcut = Blockly.ShortcutRegistry.registry.createSerializedKey(
        Blockly.utils.KeyCodes.B, [Blockly.utils.KeyCodes.CTRL]);
    Blockly.ShortcutRegistry.registry.register({
      name: ToolboxSearchCategory.START_SEARCH_SHORTCUT,
      callback: () => {
        const position = this.getPosition();
        if (position < 0) return false;
        this.parentToolbox_.selectItemByPosition(position);
        return true;
      },
      keyCodes: [shortcut],
    });
  }

  /**
   * Returns a list of block types that are present in the toolbox definition.
   * @param schema A toolbox item definition.
   * @param allBlocks The set of all available blocks that have been encountered
   *     so far.
   */
  private getAvailableBlocks(
      schema: Blockly.utils.toolbox.ToolboxItemInfo, allBlocks: Set<string>) {
    if ('contents' in schema) {
      schema.contents.forEach((contents) => {
        this.getAvailableBlocks(contents, allBlocks);
      });
    } else if (schema.kind === 'block') {
      if ('type' in schema && schema.type) {
        allBlocks.add(schema.type);
      }
    }
  }

  /**
   * Populates the cached map of trigrams to the blocks they correspond to.
   */
  private generateBlockIndex() {
    const availableBlocks = new Set<string>();
    this.workspace_.options.languageTree.contents.map(
        (item) => this.getAvailableBlocks(item, availableBlocks));

    availableBlocks.forEach((blockId) => {
      const block = this.blockCreationWorkspace.newBlock(blockId);
      this.indexBlockText(blockId.replaceAll('_', ' '), blockId);
      block.inputList.forEach((input) => {
        input.fieldRow.forEach((field) => {
          this.indexBlockText(field.getText(), blockId);
        });
      });
    });
  }

  /**
   * Generates trigrams for the given text and associates them with the given
   * block ID.
   * @param text The text to generate trigrams of.
   * @param blockId The block ID to associate the trigrams with.
   */
  private indexBlockText(text, blockId) {
    this.generateTrigrams(text).forEach((trigram) => {
      const blockSet = this.trigramsToBlocks.get(trigram) ?? new Set<string>();
      blockSet.add(blockId);
      this.trigramsToBlocks.set(trigram, blockSet);
    });
  }

  /**
   * Generates a list of trigrams for a given string.
   * @param input The string to generate trigrams of.
   * @returns A list of trigrams of the given string.
   */
  private generateTrigrams(input: string): string[] {
    const normalizedInput = input.toLowerCase();
    if (!normalizedInput) return [];
    if (normalizedInput.length <= 3) return [normalizedInput];

    const trigrams: string[] = [];
    for (let start = 0; start < normalizedInput.length - 3; start++) {
      trigrams.push(normalizedInput.substring(start, start + 3));
    }

    return trigrams;
  }

  /**
   * Returns the intersection of two sets.
   * @param a The first set.
   * @param b The second set.
   * @returns The intersection of the two sets.
   */
  private getIntersection(a: Set<string>, b: Set<string>): Set<string> {
    return new Set([...a].filter((value) => b.has(value)));
  }

  /**
   * Handles a click on this toolbox category.
   * @param e The click event.
   */
  override onClick(e: Event) {
    super.onClick(e);
    e.preventDefault();
    e.stopPropagation();
    this.setSelected(this.parentToolbox_.getSelectedItem() === this);
  }

  /**
   * Handles changes in the selection state of this category.
   * @param isSelected Whether or not the category is now selected.
   */
  override setSelected(isSelected: boolean) {
    super.setSelected(isSelected);
    if (isSelected) {
      this.searchField.focus();
      this.matchBlocks();
    } else {
      this.searchField.value = '';
      this.searchField.blur();
    }
  }

  /**
   * Filters the available blocks based on the current query string.
   */
  private matchBlocks() {
    const query = this.searchField.value;

    this.flyoutItems_ = query ? [...this.generateTrigrams(query).map(
        (trigram) => {
          return this.trigramsToBlocks.get(trigram) ?? new Set<string>();
        }).reduce((matches, current) => {
      return this.getIntersection(matches, current);
    }).values()].map((blockId) => {
      return {
        kind: 'block',
        type: blockId,
      };
    }) : [];

    if (!this.flyoutItems_.length) {
      this.flyoutItems_.push({
        kind: 'label',
        text: query.length < 3 ? 'Type to search for blocks' :
            'No matching blocks found',
      });
    }
    this.parentToolbox_.refreshSelection();
  }
}

// verify rtl
// Localization

Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX_ITEM,
    ToolboxSearchCategory.SEARCH_CATEGORY_KIND, ToolboxSearchCategory);
