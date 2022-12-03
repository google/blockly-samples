/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Defines a renderer that renders dummy inputs like line breaks.
 */

import * as Blockly from 'blockly/core';

/**
 * A subclass of the geras RenderInfo that renders all dummy inputs like line
 * breaks, forcing any following input to be rendered on a separate row, even
 * when the block type definition has `"inputsInline": true`.
 */
export class RenderInfo extends Blockly.geras.RenderInfo {
  /* eslint-disable @typescript-eslint/naming-convention */
  /**
   * Decide whether to start a new row between the two Blockly.Inputs.
   *
   * @param input The first input to consider
   * @param lastInput The input that follows.
   * @return True if the next input should be rendered on a new row.
   */
  protected override shouldStartNewRow_(
      input: Blockly.Input, lastInput?: Blockly.Input): boolean {
    /* eslint-enable @typescript-eslint/naming-convention */
    if (lastInput?.type === Blockly.inputTypes.DUMMY) {
      return true;
    }
    return super.shouldStartNewRow_(input, lastInput);
  }
}

/**
 * A subclass of the geras Renderer that provides the custom RenderInfo object.
 */
export class Renderer extends Blockly.geras.Renderer {
  /* eslint-disable @typescript-eslint/naming-convention */
  /**
   * Create a new instance of the renderer's render info object.
   *
   * @param block The block to measure.
   * @return The render info object.
   */
  protected override makeRenderInfo_(block: Blockly.BlockSvg): RenderInfo {
    /* eslint-enable @typescript-eslint/naming-convention */
    return new RenderInfo(this, block);
  }
}

Blockly.blockRendering.register('inline-row-separators', Renderer);
