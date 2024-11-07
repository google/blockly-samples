/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';

/**
 * A block inflater that caches and reuses blocks to improve performance.
 */
export class RecyclableBlockFlyoutInflater extends Blockly.BlockFlyoutInflater {
  /**
   * Whether or not block recycling is enabled.
   */
  private recyclingEnabled = true;

  /**
   * Map from block type to block instance.
   */
  private recycledBlocks = new Map<string, Blockly.BlockSvg>();

  private recycleEligibilityChecker?: (block: Blockly.Block) => boolean;

  /**
   * Toggles whether or not recycling is enabled.
   *
   * @param enabled True if recycling should be enabled.
   */
  setRecyclingEnabled(enabled: boolean) {
    this.recyclingEnabled = enabled;
  }

  /**
   * Sets a function to use to determine a block's ability to be recycled.
   *
   * @param checker The eligibility check function to use, or undefined to
   *     revert to the built-in default.
   */
  setRecyclingEligibilityChecker(checker?: (block: Blockly.Block) => boolean) {
    this.recycleEligibilityChecker = checker;
  }

  /**
   * Creates a new block from the given block definition.
   *
   * @param blockDefinition The definition to create a block from.
   * @param workspace The workspace to create the block on.
   * @returns The newly created block.
   */
  override createBlock(
    blockDefinition: Blockly.utils.toolbox.BlockInfo,
    workspace: Blockly.WorkspaceSvg,
  ): Blockly.BlockSvg {
    const blockType = this.getTypeFromDefinition(blockDefinition);
    return (
      this.getRecycledBlock(blockType) ??
      super.createBlock(blockDefinition, workspace)
    );
  }

  /**
   * Returns the type of a block from an XML or JSON block definition.
   *
   * @param blockDefinition The block definition to parse.
   * @returns The block type.
   */
  getTypeFromDefinition(
    blockDefinition: Blockly.utils.toolbox.BlockInfo,
  ): string {
    let type: string | null | undefined;
    if (blockDefinition['blockxml']) {
      const xml =
        typeof blockDefinition['blockxml'] === 'string'
          ? Blockly.utils.xml.textToDom(blockDefinition['blockxml'])
          : (blockDefinition['blockxml'] as Element);
      type = xml.getAttribute('type');
    } else {
      type = blockDefinition['type'];
    }

    if (!type) {
      throw new Error(
        `Block type is not specified in block definition: ${JSON.stringify(
          blockDefinition,
        )}`,
      );
    }
    return type;
  }

  /**
   * Puts a previously created block into the recycle bin and moves it to the
   * top of the workspace. Used during large workspace swaps to limit the number
   * of new DOM elements we need to create.
   *
   * @param block The block to recycle.
   */
  recycleBlock(block: Blockly.BlockSvg) {
    const xy = block.getRelativeToSurfaceXY();
    block.moveBy(-xy.x, -xy.y);
    this.recycledBlocks.set(block.type, block);
  }

  /**
   * Returns a block from the cache of recycled blocks with the given type, or
   * undefined if one cannot be found.
   *
   * @param blockType The type of the block to try to recycle.
   * @returns The recycled block, or undefined if one could not be recycled.
   */
  getRecycledBlock(blockType: string): Blockly.BlockSvg | undefined {
    const block = this.recycledBlocks.get(blockType);
    this.recycledBlocks.delete(blockType);
    return block;
  }

  /**
   * Returns whether the given block can be recycled or not.
   *
   * @param block The block to check for recyclability.
   * @returns True if the block can be recycled. False otherwise.
   */
  blockIsRecyclable(block: Blockly.Block): boolean {
    if (!this.recyclingEnabled) {
      return false;
    }

    // If the block needs to parse mutations, never recycle.
    if (block.mutationToDom && block.domToMutation) {
      return false;
    }

    if (!block.isEnabled()) {
      return false;
    }

    for (const input of block.inputList) {
      for (const field of input.fieldRow) {
        // No variables.
        if (field.referencesVariables()) {
          return false;
        }
        if (field instanceof Blockly.FieldDropdown) {
          if (field.isOptionListDynamic()) {
            return false;
          }
        }
      }
      // Check children.
      if (input.connection) {
        const targetBlock = input.connection.targetBlock();
        if (targetBlock && !this.blockIsRecyclable(targetBlock)) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Disposes of the provided block.
   *
   * @param element The block to dispose of.
   */
  override disposeElement(element: Blockly.BlockSvg) {
    if (this.blockIsRecyclable(element)) {
      this.removeListeners(element.id);
      this.recycleBlock(element);
    } else {
      super.disposeElement(element);
    }
  }

  /**
   * Clears the cache of recycled blocks.
   */
  emptyRecycledBlocks() {
    this.recycledBlocks.forEach((block) => block.dispose(false, false));
    this.recycledBlocks.clear();
  }
}

/**
 * Registers the recyclable block flyout inflater, replacing the standard
 * block flyout inflater.
 */
export function registerRecyclableBlockFlyoutInflater() {
  Blockly.registry.unregister(Blockly.registry.Type.FLYOUT_INFLATER, 'block');
  Blockly.registry.register(
    Blockly.registry.Type.FLYOUT_INFLATER,
    'block',
    RecyclableBlockFlyoutInflater,
  );
}
