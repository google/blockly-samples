/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview A backpack that lives on top of the workspace.
 * @author kozbial@google.com (Monica Kozbial)
 */
import * as Blockly from 'blockly/core';
import {BackpackOptions} from './options';
/**
 * Class for backpack that can be used save blocks from the workspace for
 * future use.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace to sit in.
 * @implements {Blockly.IAutoHideable}
 * @implements {Blockly.IPositionable}
 * @extends {Blockly.DragTarget}
 */
export declare class Backpack extends Blockly.DragTarget {
  /**
   * Constructor for a backpack.
   * @param {!Blockly.WorkspaceSvg} targetWorkspace The target workspace that
   *     the backpack will be added to.
   * @param {!BackpackOptions=} backpackOptions The backpack options to use.
   */
  constructor(
    targetWorkspace: Blockly.WorkspaceSvg,
    backpackOptions?: BackpackOptions,
  );
  /**
   * Initializes the backpack.
   */
  init(): void;
  /**
   * Disposes of workspace search.
   * Unlink from all DOM elements and remove all event listeners
   * to prevent memory leaks.
   */
  dispose(): void;
  /**
   * Returns the backpack flyout.
   * @return {?Blockly.IFlyout} The backpack flyout.
   * @public
   */
  getFlyout(): Blockly.IFlyout | null;
  /**
   * Returns the bounding rectangle of the drag target area in pixel units
   * relative to viewport.
   * @return {?Blockly.utils.Rect} The component's bounding box. Null if drag
   *   target area should be ignored.
   */
  getClientRect(): Blockly.utils.Rect | null;
  /**
   * Returns the bounding rectangle of the UI element in pixel units relative to
   * the Blockly injection div.
   * @return {!Blockly.utils.Rect} The component’s bounding box.
   */
  getBoundingRectangle(): Blockly.utils.Rect;
  /**
   * Positions the backpack.
   * It is positioned in the opposite corner to the corner the
   * categories/toolbox starts at.
   * @param {!Blockly.MetricsManager.UiMetrics} metrics The workspace metrics.
   * @param {!Array<!Blockly.utils.Rect>} savedPositions List of rectangles that
   *     are already on the workspace.
   */
  position(
    metrics: Blockly.MetricsManager.UiMetrics,
    savedPositions: Blockly.utils.Rect[],
  ): void;
  /**
   * Returns the count of items in the backpack.
   * @return {number} The count of items.
   */
  getCount(): number;
  /**
   * Returns backpack contents.
   * @return {!Array<string>} The backpack contents.
   */
  getContents(): string[];
  /**
   * Handles when a block or bubble is dropped on this component.
   * Should not handle delete here.
   * @param {!Blockly.IDraggable} dragElement The block or bubble currently
   *   being dragged.
   */
  onDrop(dragElement: Blockly.IDraggable): void;
  /**
   * Returns whether the backpack contains a duplicate of the provided Block.
   * @param {!Blockly.Block} block The block to check.
   * @return {boolean} Whether the backpack contains a duplicate of the provided
   *     block.
   */
  containsBlock(block: Blockly.Block): boolean;
  /**
   * Adds the specified block to backpack.
   * @param {!Blockly.Block} block The block to be added to the backpack.
   */
  addBlock(block: Blockly.Block): void;
  /**
   * Adds the provided blocks to backpack.
   * @param {!Array<!Blockly.Block>} blocks The blocks to be added to the
   *     backpack.
   */
  addBlocks(blocks: Blockly.Block[]): void;
  /**
   * Removes the specified block from the backpack.
   * @param {!Blockly.Block} block The block to be removed from the backpack.
   */
  removeBlock(block: Blockly.Block): void;
  /**
   * Adds item to backpack.
   * @param {string} item Text representing the XML tree of a block to add,
   *     cleaned of all unnecessary attributes.
   */
  addItem(item: string): void;
  /**
   * Adds multiple items to the backpack.
   * @param {!Array<string>} items The backpack contents to add.
   */
  addItems(items: string[]): void;
  /**
   * Removes item from the backpack.
   * @param {string} item Text representing the XML tree of a block to remove,
   * cleaned of all unnecessary attributes.
   */
  removeItem(item: string): void;
  /**
   * Sets backpack contents.
   * @param {!Array<string>} contents The new backpack contents.
   */
  setContents(contents: string[]): void;
  /**
   * Empties the backpack's contents. If the contents-flyout is currently open
   * it will be closed.
   */
  empty(): void;
  /**
   * Returns whether the backpack is open.
   * @return {boolean} Whether the backpack is open.
   */
  isOpen(): boolean;
  /**
   * Opens the backpack flyout.
   */
  open(): void;
  /**
   * Closes the backpack flyout.
   */
  close(): void;
  /**
   * Hides the component. Called in Blockly.hideChaff.
   * @param {boolean} onlyClosePopups Whether only popups should be closed.
   *     Flyouts should not be closed if this is true.
   */
  autoHide(onlyClosePopups: boolean): void;
  /**
   * Handles when a cursor with a block or bubble enters this drag target.
   * @param {!Blockly.IDraggable} dragElement The block or bubble currently
   *   being dragged.
   */
  onDragEnter(dragElement: Blockly.IDraggable): void;
  /**
   * Handles when a cursor with a block or bubble exits this drag target.
   * @param {!Blockly.IDraggable} dragElement The block or bubble currently
   *   being dragged.
   */
  onDragExit(dragElement: Blockly.IDraggable): void;
  /**
   * Returns whether the provided block or bubble should not be moved after
   * being dropped on this component. If true, the element will return to where
   * it was when the drag started.
   * @param {!Blockly.IDraggable} dragElement The block or bubble currently
   *   being dragged.
   * @return {boolean} Whether the block or bubble provided should be returned
   *   to drag start.
   */
  shouldPreventMove(dragElement: Blockly.IDraggable): boolean;
}
