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
  /** @override */
  constructor(workspace) {
    super(workspace);
  }

  /** @override */
  init() {
    super.init();

    // Populate the flyout with all blocks and show it immediately.
    const flyout = this.getFlyout();
    flyout.show(this.getInitialFlyoutContents_());
    flyout.recordScrollPositions();

    // Replace workspace.getMetrics with a version that measures the flyout.
    // Ideally this would be set using the workspace options struct but that
    // is not currently possible.
    // TODO(https://github.com/google/blockly/issues/4377): Replace via
    // options struct when possible.
    this.workspace_.getMetrics =
        this.workspaceGetMetrics_.bind(this.workspace_);
  }

  /** @override */
  getFlyout() {
    return /** @type {ContinuousFlyout} */ (super.getFlyout());
  }

  /**
   * Gets the contents that should be shown in the flyout immediately.
   * This includes all blocks and labels for each category of block.
   * @return {!Blockly.utils.toolbox.FlyoutItemInfoArray} Flyout contents.
   * @private
   */
  getInitialFlyoutContents_() {
    /** @type {!Blockly.utils.toolbox.FlyoutItemInfoArray} */
    let contents = [];
    for (const toolboxItem of this.contents_) {
      if (toolboxItem instanceof Blockly.ToolboxCategory) {
        // Create a label node to go at the top of the category
        contents.push({kind: 'LABEL', text: toolboxItem.getName()});
        /**
         * @type {string|Blockly.utils.toolbox.FlyoutItemInfoArray|
         *    Blockly.utils.toolbox.FlyoutItemInfo}
         * */
        let itemContents = toolboxItem.getContents();

        // Handle cutom categories (e.g. variables and functions)
        if (typeof itemContents === 'string') {
          itemContents =
            /** @type {!Blockly.utils.toolbox.DynamicCategoryInfo} */ ({
              custom: itemContents,
              kind: 'CATEGORY',
            });
        }
        contents = contents.concat(itemContents);
      }
    }
    return contents;
  }

  /** @override */
  refreshSelection() {
    this.getFlyout().show(this.getInitialFlyoutContents_());
  }

  /** @override */
  updateFlyout_(_oldItem, newItem) {
    if (newItem) {
      const target = this.getFlyout()
          .getCategoryScrollPosition(newItem.name_).y;
      this.getFlyout().scrollTo(target);
    }
  }

  /** @override */
  shouldDeselectItem_(oldItem, newItem) {
    // Should not deselect if the same category is clicked again.
    return (oldItem && oldItem !== newItem);
  }

  /**
   * Gets a category by name.
   * @param {string} name Name of category to get.
   * @return {?Blockly.ToolboxCategory} Category, or null if not
   *    found.
   * @package
   */
  getCategoryByName(name) {
    const category = this.contents_.find(
        (item) => item instanceof Blockly.ToolboxCategory &&
            item.isSelectable() && name === item.getName());
    if (category) {
      return /** @type {!Blockly.ToolboxCategory} */ (category);
    }
    return null;
  }

  /**
   * Selects the category with the given name.
   * Similar to setSelectedItem, but importantly, does not call updateFlyout
   * because this is called while the flyout is being scrolled.
   * @param {string} name Name of category to select.
   * @package
   */
  selectCategoryByName(name) {
    const newItem = this.getCategoryByName(name);
    if (!newItem) {
      return;
    }
    const oldItem = this.selectedItem_;

    if (this.shouldDeselectItem_(oldItem, newItem)) {
      this.deselectItem_(oldItem);
    }

    if (this.shouldSelectItem_(oldItem, newItem)) {
      this.selectItem_(oldItem, newItem);
    }
  }

  /** @override */
  getClientRect() {
    // If the flyout never closes, it should be the deletable area.
    const flyout = this.getFlyout();
    if (flyout && !flyout.autoClose) {
      return flyout.getClientRect();
    }
    return super.getClientRect();
  }

  /**
   * Gets adjusted metrics for the workspace, accounting for the flyout width.
   * This will be set as the WorkspaceSvg's getMetrics function, as there
   * is currently no way to set this using the options struct.
   * TODO(https://github.com/google/blockly/issues/4377): Replace via options.
   * @return {!Blockly.utils.Metrics} Contains size and position metrics of a
   *     top level workspace.
   * @private
   * @this {Blockly.WorkspaceSvg}
   */
  workspaceGetMetrics_() {
    const toolboxDimensions =
      Blockly.WorkspaceSvg.getDimensionsPx_(this.toolbox_);
    const flyoutDimensions =
      Blockly.WorkspaceSvg.getDimensionsPx_(this.toolbox_.getFlyout());


    // Contains height and width in CSS pixels.
    // svgSize is equivalent to the size of the injectionDiv at this point.
    const svgSize = Blockly.svgSize(this.getParentSvg());
    const viewSize = {height: svgSize.height, width: svgSize.width};
    if (this.toolbox_) {
    // Note: Not actually supported at this time due to ContinunousToolbox
    // only supporting a vertical flyout. But included for completeness.
      if (this.toolboxPosition == Blockly.TOOLBOX_AT_TOP ||
          this.toolboxPosition == Blockly.TOOLBOX_AT_BOTTOM) {
        viewSize.height -= (toolboxDimensions.height + flyoutDimensions.height);
      } else if (this.toolboxPosition == Blockly.TOOLBOX_AT_LEFT ||
          this.toolboxPosition == Blockly.TOOLBOX_AT_RIGHT) {
        viewSize.width -= (toolboxDimensions.width + flyoutDimensions.width);
      }
    }

    // svgSize is now the space taken up by the Blockly workspace, not including
    // the toolbox.
    const contentDimensions =
      Blockly.WorkspaceSvg.getContentDimensions_(this, viewSize);

    let absoluteLeft = 0;
    if (this.toolbox_ && this.toolboxPosition == Blockly.TOOLBOX_AT_LEFT) {
      absoluteLeft = toolboxDimensions.width + flyoutDimensions.width;
    }
    let absoluteTop = 0;
    if (this.toolbox_ && this.toolboxPosition == Blockly.TOOLBOX_AT_TOP) {
      absoluteTop = toolboxDimensions.height + flyoutDimensions.height;
    }

    const metrics = {
      contentHeight: contentDimensions.height,
      contentWidth: contentDimensions.width,
      contentTop: contentDimensions.top,
      contentLeft: contentDimensions.left,

      viewHeight: viewSize.height,
      viewWidth: viewSize.width,
      viewTop: -this.scrollY,
      viewLeft: -this.scrollX,

      absoluteTop: absoluteTop,
      absoluteLeft: absoluteLeft,

      svgHeight: svgSize.height,
      svgWidth: svgSize.width,

      toolboxWidth: toolboxDimensions.width,
      toolboxHeight: toolboxDimensions.height,
      toolboxPosition: this.toolboxPosition,

      flyoutWidth: flyoutDimensions.width,
      flyoutHeight: flyoutDimensions.height,
    };
    return metrics;
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
