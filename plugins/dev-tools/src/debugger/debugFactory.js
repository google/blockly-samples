/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';
import {DebugRenderer as DebugVisualizer} from './debugRenderer';

// TODO: How can someone just change the debug renderer and still have it work?
// TODO: Remove everything from core

/**
 * The name that the debug renderer is registered under.
 * @type {string}
 */
export const debugRendererName = 'debugRenderer';

/**
 * Registers a new renderer.
 * @param {function(new: Blockly.blockRendering.Renderer)} Renderer The original
 *     renderer.
 */
export function registerDebugRenderer(Renderer) {
  const NewRenderer = createNewRenderer(Renderer);

  Blockly.registry.register(Blockly.registry.Type.RENDERER,
      debugRendererName, NewRenderer, true);
}

/**
 * Creates and registers a renderer that draws debug rectangles on top of the
 * blocks. This renderer extends the renderer with the given name.
 * @param {string} name The name of the renderer we want to debug.
 */
export function registerDebugRendererFromName(name) {
  const rendererName = name;
  const RendererClass =
      Blockly.registry.getClass(Blockly.registry.Type.RENDERER, rendererName);
  registerDebugRenderer(RendererClass);
}

/**
 * Creates a new debug renderer.
 * @param {function(new: Blockly.blockRendering.Renderer)} Renderer The
 *     original renderer we are going to extend to add the drawer to.
 * @return {function(new: Blockly.blockRendering.Renderer)} The debug renderer.
 */
function createNewRenderer(Renderer) {
  /**
   * The debug renderer.
   */
  class DebugRenderer extends Renderer {
    /**
     * Maps the id of a block to the object that draws
     * the debug rectangles.
     * @type {!Object<string, DebugVisualizer>}
     */
    debuggerToblock = Object.create(null);

    /**
     * Maps the workspace to the workspace event listener.
     * @type {!Object<string, Function>}
     */
    workspaceListeners = Object.create(null);

    /** @override */
    render(block) {
      super.render(block);
      const debugVisualizer = this.getDebugger_(block);
      const info = this.makeRenderInfo_(block);
      info.measure();
      debugVisualizer.drawDebug(block, info);
    }

    /**
     * If we have already created a debugger for this block, use that debugger
     * so that it can remove any previously created elements.
     * @param {Blockly.BlockSvg} block The block that is about to be rendered.
     * @return {DebugVisualizer} The object used to draw the debug rectangles
     *     on the block.
     * @protected
     */
    getDebugger_(block) {
      let debugDrawer = this.debuggerToblock[block.id];

      if (!debugDrawer) {
        this.regiserWorkspaceListener_(block.workspace);
        debugDrawer = new DebugVisualizer(this.getConstants());
        this.debuggerToblock[block.id] = debugDrawer;
      }
      return debugDrawer;
    }

    /**
     * Adds a change listener to remove the block from the debuggers object.
     * @param {*} workspace The workspace to add the change listener to.
     */
    regiserWorkspaceListener_(workspace) {
      const workspaceListener = this.workspaceListeners[workspace.id];

      if (!workspaceListener) {
        this.workspaceListeners[workspace.id] =
        workspace.addChangeListener((event) => {
          if (event.type === Blockly.Events.DELETE) {
            for (let i = 0; i < event.ids.length; i++) {
              if (this.debuggerToblock[event.ids[i]]) {
                delete this.debuggerToblock[event.ids[i]];
              }
            }
          }
        });
      }
    }
  }
  return DebugRenderer;
}
