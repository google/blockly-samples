/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {Generators} from './blocks/generatorsType';
import * as textMultiline from './blocks/textMultiline';

export * from './field_multilineinput';

// Re-export all parts of the block definition.
export * as textMultiline from './blocks/textMultiline';

/**
 * Install all of the blocks defined in this file and all of their
 * dependencies.
 *
 * @param generators The CodeGenerators to install per-block
 *     generators on.
 */
export function installAllBlocks(generators: Generators = {}) {
  textMultiline.installBlock(generators);
}
