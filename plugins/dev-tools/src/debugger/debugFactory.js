// TODO: Should these be static? 
// Debugger.startDebugger();
// Debugger.stopDebugger();
// Debugger.isEnabled();
// Debugger.name();

/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';
import {DebugRenderer} from './debugRenderer';

// TODO: Go through all the comments.
// TODO: Remove all console logs.
// TODO: How can someone just change the debug renderer and still have it work?
// TODO: Types
// TODO: Do we need a start/stop?
// TODO: Remove everything from core
// TODO: Get options to work correctly.

/**
 * The name that the debug renderer is registered under.
 * @type {string}
 */
export const debugRendererName = 'debugRenderer';

/**
 * Registers a new renderer.
 * @param {function(new: Blockly.blockRendering.Renderer)} Renderer The original
 *     renderer.
 * @param {function(new: Blockly.blockRendering.Drawer)} Drawer The original
 *     drawer.
 */
export function registerDebugRenderer(Renderer) {
  const NewDrawer = createNewDrawer(Renderer.Drawer);
  const NewRenderer = createNewRenderer(Renderer, NewDrawer);
  Blockly.registry.register(Blockly.registry.Type.RENDERER,
      debugRendererName, NewRenderer, true);
}

export function registerDebugRendererFromName(name) {
  // Geras is the default renderer name.
  const rendererName = name || 'geras';
  // TODO: Catch if it fails.
  const RendererClass =
      Blockly.registry.getClass(Blockly.registry.Type.RENDERER, rendererName);
  registerDebugRenderer(RendererClass);
}

/**
 * Creates a new debug drawer class.
 * @param {function(new: Blockly.blockRendering.Drawer)} OldDrawer The original
 *     drawer.
 * @return {function(new: DebugDrawer)} The drawer that adds debug rectangles
 *     to the block.
 */
function createNewDrawer(OldDrawer) {
  class DebugDrawer extends OldDrawer {
    /**
     * An object that draws a block based on the given rendering information.
     * @param {!Blockly.BlockSvg} block The block to render.
     * @param {!Blockly.blockRendering.RenderInfo} info An object containing all
     *   information needed to render this block.
     * @package
     * @constructor
     * @alias Blockly.blockRendering.Drawer
     */
    constructor(block, info) {
      super(block, info);
      this.debugger_ = new DebugRenderer(this.constants_);
    }
    /**
     * @override
     */
    draw() {
      super.draw();
      this.debugger_.drawDebug(this.block_, this.info_);
    }
  }
  return DebugDrawer;
}

/**
 * Creates a new debug renderer.
 * @param {function(new: Blockly.blockRendering.Renderer)} Renderer The
 *     renderer.
 * @param {function(new: Blockly.blockRendering.Drawer)} NewDrawer The drawer.
 * @return {function(new: DebugRenderer)} The drawer that adds debug rectangles
 *     to the block.
 */
function createNewRenderer(Renderer, NewDrawer) {
  /**
   * 
   */
  class NewRenderer extends Renderer {
    /**
     * @override
     */
    makeDrawer_(block, info) {
      return new NewDrawer(block, info);
    }
  }
  return NewRenderer;
}
