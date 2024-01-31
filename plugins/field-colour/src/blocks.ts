/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';

import { registerColourField } from './field_colour';
import * as colourPicker from './blocks/colourPicker';
import * as colourRandom from './blocks/colourRandom';
import * as colourRgb from './blocks/colourRgb';
import * as colourBlend from './blocks/colourBlend';
import { Generators } from './blocks/generatorUtils';

// Re-export all parts of the definition.
export * as colourPicker from './blocks/colourPicker';
export * as colourRandom from './blocks/colourRandom';
export * as colourRgb from './blocks/colourRgb';
export * as colourBlend from './blocks/colourBlend';

/**
 * Install all of the blocks defined in this file and all of their
 * dependencies.
 */
export function installAllBlocks(generators: Generators = {}) {
    colourPicker.installBlock(generators);
    colourRgb.installBlock(generators);
    colourRandom.installBlock(generators);
    colourBlend.installBlock(generators);
}

// Calling this installs blocks, which means it has side effects.
installAllBlocks();