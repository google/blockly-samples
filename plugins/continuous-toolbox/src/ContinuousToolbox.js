/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Toolbox that uses a continuous scrolling flyout.
 */

import * as Blockly from 'blockly/core';

/**
 * Class for continuous toolbox.
 */
export class ContinuousToolbox extends Blockly.Toolbox {
  /** @override */
  constructor(workspace) {
    super(workspace);
  }

  /** @override */
  init() {
    super.init();

    // Populate the flyout with all blocks and show it immediately.
    this.flyout_.show(this.getInitialFlyoutContents());
    this.flyout_.recordScrollPositions();
  }

  /**
   * Gets the contents that should be shown in the flyout immediately.
   * This includes all blocks and labels for each category of block.
   * @return {!Array<!Blockly.utils.toolbox.FlyoutItem>} Flyout contents.
   */
  getInitialFlyoutContents() {
    let contents = [];
    for (const toolboxItem of this.contents_) {
      if (toolboxItem.isSelectable()) {
        // Create a label node to go at the top of the category
        contents.push({kind: 'LABEL', text: toolboxItem.name_});
        let itemContents = /** @type {!Blockly.SelectableToolboxItem} */
            (toolboxItem).getContents();

        // Handle cutom categories (e.g. variables and functions)
        if (typeof itemContents === 'string') {
          itemContents = {
            custom: itemContents,
            kind: 'CATEGORY',
          };
        }
        contents = contents.concat(itemContents);
      }
    }
    return contents;
  }

  /** @override */
  updateFlyout_(_oldItem, newItem) {
    if (newItem) {
      const target = this.flyout_.getCategoryScrollPosition(newItem.name_).y;
      this.flyout_.scrollTarget = target;
      this.flyout_.stepScrollAnimation();
    }
  }
}

Blockly.Css.register([
  `.categoryBubble {
      margin: 0 auto 0.125rem;
      border-radius: 100%;
      border: 1px solid;
      width: 1.25rem;
      height: 1.25rem;
    }
    .blocklyTreeRow {
      height: initial;
      padding: 3px 0;
    }
    .blocklyTreeRowContentContainer {
      display: flex;
      flex-direction: column;
    }
    .blocklyTreeLabel {
      margin: auto;
    }`,
]);
