/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Toolbox that uses a continuous scrolling flyout.
 */

import * as Blockly from 'blockly/core';
import {ContinuousFlyout} from './ContinuousFlyout';

/**
 * Class for continuous toolbox.
 */
export class ContinuousToolbox extends Blockly.Toolbox {
  override init() {
    super.init();

    // Populate the flyout with all blocks and show it immediately.
    const flyout = this.getFlyout();
    flyout.show(this.getInitialFlyoutContents_());

    this.getWorkspace().addChangeListener((e: Blockly.Events.Abstract) => {
      if (
        e.type === Blockly.Events.BLOCK_CREATE ||
        e.type === Blockly.Events.BLOCK_DELETE
      ) {
        this.refreshSelection();
      }
    });
  }

  override getFlyout(): ContinuousFlyout {
    return super.getFlyout() as ContinuousFlyout;
  }

  /**
   * Gets the contents that should be shown in the flyout immediately.
   * This includes all blocks and labels for each category of block.
   * @returns Flyout contents.
   */
  private getInitialFlyoutContents_(): Blockly.utils.toolbox.FlyoutItemInfoArray {
    let contents: Blockly.utils.toolbox.FlyoutItemInfoArray = [];
    for (const toolboxItem of this.getToolboxItems()) {
      if (toolboxItem instanceof Blockly.ToolboxCategory) {
        // Create a label node to go at the top of the category
        contents.push({kind: 'LABEL', text: toolboxItem.getName()});
        let itemContents = toolboxItem.getContents();

        // Handle custom categories (e.g. variables and functions)
        if (typeof itemContents === 'string') {
          itemContents = [
            {
              custom: itemContents,
              kind: 'CATEGORY',
            },
          ];
        }
        contents = contents.concat(itemContents);
      }
    }
    return contents;
  }

  override refreshSelection() {
    this.getFlyout().show(this.getInitialFlyoutContents_());
  }

  override updateFlyout_(
    _oldItem: Blockly.ISelectableToolboxItem | null,
    newItem: Blockly.ISelectableToolboxItem | null,
  ) {
    if (newItem) {
      this.getFlyout().scrollToCategory(newItem);
    }
  }

  override shouldDeselectItem_(
    oldItem: Blockly.ISelectableToolboxItem | null,
    newItem: Blockly.ISelectableToolboxItem | null,
  ): boolean {
    // Should not deselect if the same category is clicked again.
    return !!(oldItem && oldItem !== newItem);
  }

  /**
   * Gets a category by name.
   * @param name Name of category to get.
   * @returns Category, or null if not found.
   * @package
   */
  getCategoryByName(name: string): Blockly.ISelectableToolboxItem | null {
    const category = this.getToolboxItems().find(
      (item) =>
        item instanceof Blockly.ToolboxCategory &&
        item.isSelectable() &&
        name === item.getName(),
    );
    if (category) {
      return category as Blockly.ISelectableToolboxItem;
    }
    return null;
  }

  /**
   * Selects the category with the given name.
   * Similar to setSelectedItem, but importantly, does not call updateFlyout
   * because this is called while the flyout is being scrolled.
   * @param name Name of category to select.
   * @package
   */
  selectCategoryByName(name: string) {
    const newItem = this.getCategoryByName(name);
    if (!newItem) {
      return;
    }
    const oldItem = this.selectedItem_;

    if (oldItem && this.shouldDeselectItem_(oldItem, newItem)) {
      this.deselectItem_(oldItem);
    }

    if (this.shouldSelectItem_(oldItem, newItem)) {
      this.selectItem_(oldItem, newItem);
    }
  }

  override getClientRect(): Blockly.utils.Rect | null {
    // If the flyout never closes, it should be the deletable area.
    const flyout = this.getFlyout();
    if (flyout && !flyout.autoClose) {
      return flyout.getClientRect();
    }
    return super.getClientRect();
  }
}

Blockly.Css.register(`
.categoryBubble {
  margin: 0 auto 0.125rem;
  border-radius: 100%;
  border: 1px solid;
  width: 1.25rem;
  height: 1.25rem;
}
.blocklyToolboxCategory {
  height: initial;
  padding: 3px 0;
}
.blocklyTreeRowContentContainer {
  display: flex;
  flex-direction: column;
}
.blocklyTreeLabel {
  margin: auto;
}
`);
