/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as colourPicker from './colourPicker';
import * as colourRandom from './colourRandom';
import * as colourRgb from './colourRgb';
import * as colourBlend from './colourBlend';
import { Generators } from './generatorUtils';

// Re-export all parts of the definition.
export * as colourPicker from './colourPicker';
export * as colourRandom from './colourRandom';
export * as colourRgb from './colourRgb';
export * as colourBlend from './colourBlend';

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
