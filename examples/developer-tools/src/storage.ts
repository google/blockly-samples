/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const settingsKey = 'blockFactorySettings';
const lastEditedBlockKey = 'blockFactoryLastEditedBlock';
const allBlocksKey = 'blockFactoryAllBlocks';
const allBlocks: Set<string> = new Set(
  JSON.parse(window.localStorage?.getItem(allBlocksKey)) || [],
);
const prohibitedBlockNames = new Set([
  settingsKey,
  lastEditedBlockKey,
  allBlocksKey,
  'blockly_block_factory_preview_block',
]);

const localStorage = window.localStorage;
if (!localStorage) {
  window.alert(
    'Local Storage is disabled on this page. Saving and loading stored blocks is not possible. You may need to enable cookies or local storage on this domain.',
  );
  throw new Error('Local storage is unavailable');
}

/**
 * Adds or updates block in local storage.
 *
 * @param name Name of the block.
 * @param block Stringified JSON representing the block's state.
 */
export function updateBlock(name: string, block: string) {
  allBlocks.add(name);
  localStorage.setItem(allBlocksKey, JSON.stringify(Array.from(allBlocks)));
  localStorage.setItem(name, block);
  localStorage.setItem(lastEditedBlockKey, name);
}

/**
 * Gets the block data for the given block name from storage.
 *
 * @param name Name of the block to get.
 * @returns Stringified JSON representing the block's state, or null if not found.
 */
export function getBlock(name: string): string | null {
  const block = localStorage.getItem(name);
  if (block) {
    localStorage.setItem(lastEditedBlockKey, name);
  }
  return block;
}

/**
 * Removes block data for the given block name from storage.
 *
 * @param name Name of the block to remove.
 */
export function removeBlock(name: string) {
  allBlocks.delete(name);
  localStorage.setItem(allBlocksKey, JSON.stringify(Array.from(allBlocks)));

  localStorage.removeItem(name);

  if (localStorage.getItem(lastEditedBlockKey) === name) {
    localStorage.removeItem(lastEditedBlockKey);
  }
}

/**
 * Gets the name of the last edited block.
 * A block is set as the last edited block when its data is added, changed, or accessed.
 *
 * @returns Name of the last edited block.
 */
export function getLastEditedBlockName(): string {
  return localStorage.getItem(lastEditedBlockKey);
}

/**
 * Gets the block data for the last edited block.
 * If there is no last edited block found, it returns the
 * data for the last block saved in storage instead.
 *
 * @returns Stringified JSON reperesenting the block's state,
 *    or null if there are no blocks.
 */
export function getLastEditedBlock(): string {
  const lastEditedName = localStorage.getItem(lastEditedBlockKey);
  if (lastEditedName) {
    const lastEditedBlock = getBlock(lastEditedName);
    if (lastEditedBlock) {
      return lastEditedBlock;
    }
  }

  const allBlocksArr = Array.from(allBlocks);
  if (allBlocksArr.length > 0) {
    return getBlock(allBlocksArr[allBlocksArr.length - 1]);
  }

  return null;
}

/** Gets the names of all blocks saved in storage. */
export function getAllSavedBlockNames(): Set<string> {
  return allBlocks;
}

/**
 * Gets prohibited names for the blocks.
 * This includes keys that are already used by this application.
 */
export function getProhibitedBlockNames(): Set<string> {
  return prohibitedBlockNames;
}

/**
 * Finds a name for a block that isn't being used yet.
 *
 * @param startName Initial name to propose, or 'my_block' if not set.
 * @returns An unused name based on the proposed name.
 */
export function getNewUnusedName(startName = 'my_block'): string {
  let name = startName;
  let number = 0;
  while (getAllSavedBlockNames().has(name)) {
    number += 1;
    name = startName + number;
  }
  return name;
}

export interface BlockFactorySettings {
  blockDefinitionFormat: string;
  codeHeaderStyle: string;
  codeGeneratorLanguage: string;
}

/**
 * Saves block factory settings in local storage.
 *
 * @param settings Object with settings to save.
 */
export function saveBlockFactorySettings(settings: BlockFactorySettings) {
  localStorage.setItem(settingsKey, JSON.stringify(settings));
}

/** Returns block factory settings that were saved in local storage, or null if none. */
export function loadBlockFactorySettings(): BlockFactorySettings | null {
  const settings = localStorage.getItem(settingsKey);
  if (!settings) return null;
  return JSON.parse(settings);
}
