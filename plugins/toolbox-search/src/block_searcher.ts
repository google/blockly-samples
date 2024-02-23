/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';

/**
 * A class that provides methods for indexing and searching blocks.
 */
export class BlockSearcher {
  private blockCreationWorkspace = new Blockly.Workspace();
  private trigramsToBlocks = new Map<string, Set<string>>();

  /**
   * Populates the cached map of trigrams to the blocks they correspond to.
   *
   * This method must be called before blockTypesMatching(). Behind the
   * scenes, it creates a workspace, loads the specified block types on it,
   * indexes their types and human-readable text, and cleans up after
   * itself.
   *
   * @param blockTypes A list of block types to index.
   */
  indexBlocks(blockTypes: string[]) {
    const blockCreationWorkspace = new Blockly.Workspace();
    blockTypes.forEach((blockType) => {
      const block = blockCreationWorkspace.newBlock(blockType);
      const blockState = Blockly.serialization.blocks.save(block);
      if (blockState != null) {
        this.indexBlockText(blockType.replaceAll('_', ' '), blockState);
        block.inputList.forEach((input) => {
          input.fieldRow.forEach((field) => {
            this.indexDropdownOption(field, blockState);
            this.indexBlockText(field.getText(), blockState);
          });
        });
      }
    });
  }

  /**
   * Check if the field is a dropdown, and index every text in the option
   *
   * @param field We need to check the type of field
   * @param blockState The block state to associate the trigrams with.
   */
  private indexDropdownOption(
    field: Blockly.Field,
    blockState: Blockly.serialization.blocks.State,
  ) {
    if (field instanceof Blockly.FieldDropdown) {
      field.getOptions(true).forEach((option) => {
        const state = {...blockState};
        state.fields = {...blockState.fields};
        if (typeof option[0] === 'string') {
          if (state.fields == undefined) {
            state.fields = {};
          }
          if (field.name) {
            state.fields[field.name] = option[1];
          }
          this.indexBlockText(option[0], state);
          this.indexBlockText(option[1], state);
        } else if ('alt' in option[0]) {
          this.indexBlockText(option[0].alt, state);
        }
      });
    }
  }

  /**
   * Filters the available blocks based on the current query string.
   *
   * @param query The text to use to match blocks against.
   * @returns A list of block states matching the query.
   */
  blockTypesMatching(query: string): Blockly.serialization.blocks.State[] {
    const result = [
      ...this.generateTrigrams(query)
        .map((trigram) => {
          return this.trigramsToBlocks.get(trigram) ?? new Set<string>();
        })
        .reduce((matches, current) => {
          return this.getIntersection(matches, current);
        })
        .values(),
    ];
    const resultState = result.map((item) => JSON.parse(item));
    return resultState;
  }

  private addBlockTrigram(trigram: string, blockState: string) {
    const blockSet = this.trigramsToBlocks.get(trigram) ?? new Set<string>();
    blockSet.add(blockState);
    this.trigramsToBlocks.set(trigram, blockSet);
  }

  /**
   * Generates trigrams for the given text and associates them with the given
   * block state.
   *
   * @param text The text to generate trigrams of.
   * @param blockState The block state to associate the trigrams with.
   */
  private indexBlockText(
    text: string,
    blockState: Blockly.serialization.blocks.State,
  ) {
    blockState.id = undefined;
    blockState.extraState = undefined;
    blockState.data = undefined;
    const stateString = JSON.stringify(blockState);
    this.generateTrigrams(text).forEach((trigram) => {
      this.addBlockTrigram(trigram, stateString);
    });
  }

  /**
   * Generates a list of trigrams for a given string.
   *
   * @param input The string to generate trigrams of.
   * @returns A list of trigrams of the given string.
   */
  private generateTrigrams(input: string): string[] {
    const normalizedInput = input.toLowerCase();
    if (!normalizedInput) return [];
    if (normalizedInput.length <= 3) return [normalizedInput];

    const trigrams: string[] = [];
    for (let start = 0; start <= normalizedInput.length - 3; start++) {
      trigrams.push(normalizedInput.substring(start, start + 3));
    }

    return trigrams;
  }

  /**
   * Returns the intersection of two sets.
   *
   * @param a The first set.
   * @param b The second set.
   * @returns The intersection of the two sets.
   */
  private getIntersection(a: Set<string>, b: Set<string>): Set<string> {
    return new Set([...a].filter((value) => b.has(value)));
  }
}
