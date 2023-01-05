/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Defines a renderer that renders dummy inputs like line breaks.
 */

import * as Blockly from 'blockly/core';

/* eslint-disable @typescript-eslint/no-explicit-any */
type RendererConstructor = new (...args: any[]) =>
    Blockly.blockRendering.Renderer;
type RenderInfoConstructor = new (...args: any[]) =>
    Blockly.blockRendering.RenderInfo;
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * This function creates a new Blockly Renderer that is based on the provided
 * Renderer but it always enforces that any input connector following a dummy
 * input will be rendered on a new row.
 *
 * @param rendererBase A class extending Blockly.blockRendering.Renderer that
 *     the new renderer will be derived from.
 * @param renderInfoBase A class extending Blockly.blockRendering.RenderInfo
 *     that should be compatible with the provided rendererBase.
 * @return The new renderer class. It's up to you to register it with Blockly.
 */
export function addInlineRowSeparators<
    RendererBase extends RendererConstructor,
    RenderInfoBase extends RenderInfoConstructor>(
    rendererBase: RendererBase,
    renderInfoBase: RenderInfoBase): RendererBase {
  /**
   * A subclass of the provided RenderInfo that renders all dummy inputs like
   * line breaks, forcing any following input to be rendered on a separate row,
   * even when the block type definition has `"inputsInline": true`.
   */
  class InlineRenderInfo extends renderInfoBase {
    /* eslint-disable @typescript-eslint/naming-convention */
    /**
     * Decide whether to start a new row between the two Blockly.Inputs.
     *
     * @param input The first input to consider
     * @param lastInput The input that follows.
     * @return True if the next input should be rendered on a new row.
     */
    protected shouldStartNewRow_(
        input: Blockly.Input, lastInput?: Blockly.Input): boolean {
      /* eslint-enable @typescript-eslint/naming-convention */
      if (lastInput?.type === Blockly.inputTypes.DUMMY) {
        return true;
      }
      return super.shouldStartNewRow_(input, lastInput);
    }
  }

  /**
   * A subclass of the provided Renderer that uses the new RenderInfo object.
   */
  return class InlineRenderer extends rendererBase {
    /* eslint-disable @typescript-eslint/naming-convention */
    /**
     * Create a new instance of the renderer's render info object.
     *
     * @param block The block to measure.
     * @return The render info object.
     */
    protected makeRenderInfo_(block: Blockly.BlockSvg):
        InlineRenderInfo {
      /* eslint-enable @typescript-eslint/naming-convention */
      return new InlineRenderInfo(this, block);
    }
  };
}

export const InlineRenderer = addInlineRowSeparators(
    Blockly.thrasos.Renderer, Blockly.thrasos.RenderInfo);

Blockly.blockRendering.register(
    'thrasos-inline-row-separators', InlineRenderer);
