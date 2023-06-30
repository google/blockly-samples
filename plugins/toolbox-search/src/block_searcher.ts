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
   * @param blockIds A list of block IDs to index.
   */
  indexBlocks(blockIds: string[]) {
    blockIds.forEach((blockId) => {
      const block = this.blockCreationWorkspace.newBlock(blockId);
      this.indexBlockText(blockId.replaceAll('_', ' '), blockId);
      block.inputList.forEach((input) => {
        input.fieldRow.forEach((field) => {
          this.indexBlockText(field.getText(), blockId);
        });
      });
    });
    // Clean up the temporary blocks that were created for indexing.
    this.blockCreationWorkspace.clear();
  }

  /**
   * Filters the available blocks based on the current query string.
   * @param query The text to use to match blocks against.
   * @returns A list of IDs of blocks matching the query.
   */
  blockIdsMatching(query: string): string[] {
    return [...this.generateTrigrams(query).map((trigram) => {
      return this.trigramsToBlocks.get(trigram) ?? new Set<string>();
    }).reduce((matches, current) => {
      return this.getIntersection(matches, current);
    }).values()];
  }

  /**
   * Generates trigrams for the given text and associates them with the given
   * block ID.
   * @param text The text to generate trigrams of.
   * @param blockId The block ID to associate the trigrams with.
   */
  private indexBlockText(text: string, blockId: string) {
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
}
