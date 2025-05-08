/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {utils, browserEvents, MenuOption, FieldDropdown} from 'blockly/core';
import {GridItem} from './grid_item';

/**
 * Class for managing a group of items displayed in a grid.
 */
export class Grid {
  /** Mapping from grid item ID to index in the items list. */
  private itemIndices = new Map<string, number>();

  /** List of items displayed in this grid. */
  private items = new Array<GridItem>();

  /** Root DOM element of this grid. */
  private root: HTMLDivElement;

  /** Identifier for keydown handler to be unregistered in dispose(). */
  private keyDownHandler: browserEvents.Data | null = null;

  /** Identifier for pointermove handler to be unregistered in dispose(). */
  private pointerMoveHandler: browserEvents.Data | null = null;

  /** Function to be called when an item in this grid is selected. */
  private selectionCallback?: (selectedItem: GridItem) => void;

  /**
   * Creates a new Grid instance.
   *
   * @param container The parent element of this grid in the DOM.
   * @param options A list of MenuOption objects representing the items to be
   *     shown in this grid.
   * @param columns The number of columns to display items in.
   * @param rtl True if this grid is being shown in a right-to-left environment.
   * @param selectionCallback Function to be called when an item in the grid is
   *     selected.
   */
  constructor(
    container: HTMLElement,
    options: MenuOption[],
    private readonly columns: number,
    private readonly rtl: boolean,
    selectionCallback: (selectedItem: GridItem) => void,
  ) {
    this.selectionCallback = selectionCallback;

    this.root = document.createElement('div');
    this.root.className = 'blocklyFieldGrid';
    this.root.tabIndex = 0;
    utils.aria.setRole(this.root, utils.aria.Role.GRID);
    container.appendChild(this.root);

    this.populateItems(options);

    this.keyDownHandler = browserEvents.conditionalBind(
      this.root,
      'keydown',
      this,
      this.onKeyDown,
    );

    this.pointerMoveHandler = browserEvents.conditionalBind(
      this.root,
      'pointermove',
      this,
      this.onPointerMove,
      true,
    );

    if (columns >= 1) {
      this.columns = columns;
      this.root.style.setProperty('--grid-columns', `${this.columns}`);
    } else {
      throw new Error(`Number of columns must be >= 1; got ${columns}`);
    }
  }

  /**
   * Creates grid items in the DOM given a list of model objects.
   *
   * @param options A list of grid item model objects.
   */
  private populateItems(options: MenuOption[]) {
    let row = document.createElement('div');
    for (const [index, item] of options.entries()) {
      // TODO(#2507): Don't just ignore separators.
      if (item === FieldDropdown.SEPARATOR) continue;

      if (index % this.columns === 0) {
        row = document.createElement('div');
        row.className = 'blocklyFieldGridRow';
        utils.aria.setRole(row, utils.aria.Role.ROW);
        this.root.appendChild(row);
      }

      const [label, value] = item;
      const content = (() => {
        if (typeof label === 'object') {
          // Convert ImageProperties to an HTMLImageElement.
          const image = new Image(label['width'], label['height']);
          image.src = label['src'];
          image.alt = label['alt'] || '';
          return image;
        }
        return label;
      })();

      const gridItem = new GridItem(
        row,
        content,
        value,
        (selectedItem: GridItem) => {
          this.setSelectedValue(selectedItem.getValue());
          this.selectionCallback?.(selectedItem);
        },
      );
      this.itemIndices.set(gridItem.getId(), this.itemIndices.size);
      this.items.push(gridItem);
    }
  }

  /**
   * Disposes of this grid.
   */
  dispose() {
    this.selectionCallback = undefined;
    for (const item of this.items) {
      item.dispose();
    }
    this.itemIndices.clear();
    this.items.length = 0;
    if (this.keyDownHandler) {
      browserEvents.unbind(this.keyDownHandler);
      this.keyDownHandler = null;
    }

    if (this.pointerMoveHandler) {
      browserEvents.unbind(this.pointerMoveHandler);
      this.pointerMoveHandler = null;
    }
    this.root.remove();
  }

  /**
   * Handles a keydown event in the grid, generally by moving focus.
   *
   * @param e The keydown event to handle.
   */
  private onKeyDown(e: KeyboardEvent) {
    if (
      !this.items.length ||
      e.shiftKey ||
      e.ctrlKey ||
      e.metaKey ||
      e.altKey
    ) {
      return;
    }

    switch (e.key) {
      case 'ArrowUp':
        this.moveFocus(-1 * this.columns, true);
        break;
      case 'ArrowDown':
        this.moveFocus(this.columns, true);
        break;
      case 'ArrowLeft':
        this.moveFocus(-1 * (this.rtl ? -1 : 1), true);
        break;
      case 'ArrowRight':
        this.moveFocus(1 * (this.rtl ? -1 : 1), true);
        break;
      case 'PageUp':
      case 'Home':
        this.moveFocus(0, false);
        break;
      case 'PageDown':
      case 'End':
        this.moveFocus(this.items.length - 1, false);
        break;
      default:
        // Not a key the grid is interested in.
        return;
    }
    // The grid used this key, don't let it have secondary effects.
    e.preventDefault();
    e.stopPropagation();
  }

  /**
   * Handles a pointermove event in the grid by focusing the hovered item.
   *
   * @param e The pointermove event to handle.
   */
  private onPointerMove(e: PointerEvent) {
    // Don't highlight grid items on "pointermove" if the pointer didn't
    // actually move (but the content under it did due to e.g. scrolling into
    // view), or if the target isn't an Element, which should never happen, but
    // TS needs to be reassured of that.
    if (!(e.movementX || e.movementY) || !(e.target instanceof Element)) return;

    const gridItem = e.target.closest('.blocklyFieldGridItem');
    if (!gridItem) return;

    const targetId = gridItem.id;
    const targetIndex = this.itemIndices.get(targetId);
    if (targetIndex === undefined) return;
    this.moveFocus(targetIndex, false);
  }

  /**
   * Selects the item with the given value in the grid.
   *
   * @param value The value of the grid item to select.
   */
  setSelectedValue(value: string) {
    for (const [index, item] of this.items.entries()) {
      const selected = item.getValue() === value;
      item.setSelected(selected);
      if (selected) {
        this.moveFocus(index, false);
      }
    }
  }

  /**
   * Moves browser focus to the grid item at the given index.
   *
   * @param index The index of the item to focus.
   * @param relative True to interpret the index as relative to the currently
   *     focused item, false to move focus to it as an absolute value.
   */
  private moveFocus(index: number, relative: boolean) {
    let targetIndex = index;

    if (relative) {
      const focusedItem = this.getFocusedItem();
      if (!focusedItem) return;
      targetIndex += this.indexOfItem(focusedItem);
    }

    const targetItem = this.itemAtIndex(targetIndex);
    if (!targetItem) return;

    targetItem.focus();
    utils.aria.setState(
      this.root,
      utils.aria.State.ACTIVEDESCENDANT,
      targetItem.getId(),
    );
  }

  /**
   * Returns the index of the given item within the grid.
   *
   * @param item The item to return the index of.
   * @returns The index of the given item within the grid.
   */
  private indexOfItem(item: GridItem): number {
    return this.itemIndices.get(item.getId()) ?? -1;
  }

  /**
   * Returns the GridItem object at the given index in the grid.
   *
   * @param index The index to retrieve the grid item at.
   * @returns The GridItem at the given index, or undefined if the index is
   *     invalid.
   */
  private itemAtIndex(index: number): GridItem | undefined {
    return this.items[index];
  }

  /**
   * Returns the currently focused grid item, if any.
   *
   * @returns The focused grid item, or undefined if no item is focused.
   */
  private getFocusedItem(): GridItem | undefined {
    const element =
      this.root.querySelector('.blocklyFieldGridItem:focus') ??
      this.root.querySelector('.blocklyFieldGridItem');
    if (!element || !element.id) return undefined;

    const index = this.itemIndices.get(element.id);
    if (index === undefined) return undefined;

    return this.itemAtIndex(index);
  }
}
