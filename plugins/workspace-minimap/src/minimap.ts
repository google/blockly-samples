/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A minimap is a miniature version of your blocks that
 * appears on top of your main workspace. This gives you an overview
 * of what your code looks like, and how it is organized.
 * @author cesarades@google.com (Cesar Ades)
 */

import * as Blockly from 'blockly/core';

// Events that should be send over to the minimap from the primary workspace
const BlockEvents = new Set([
  Blockly.Events.BLOCK_CHANGE,
  Blockly.Events.BLOCK_CREATE,
  Blockly.Events.BLOCK_DELETE,
  Blockly.Events.BLOCK_DRAG,
  Blockly.Events.BLOCK_MOVE]);

/**
 * A minimap is a miniature version of your blocks that appears on
 * top of your main workspace. This gives you an overview of what
 * your code looks like, and how it is organized.
 */
export class Minimap {
    protected primaryWorkspace: Blockly.WorkspaceSvg;
    protected minimapWorkspace: Blockly.WorkspaceSvg;
    /**
     * Constructor for a minimap
     * @param workspace The workspace to mirror
     */
    constructor(workspace: Blockly.WorkspaceSvg) {
      this.primaryWorkspace = workspace;
      const options = {
        readOnly: true,
        move: {
          scrollbars: {
            vertical: true,
            horizontal: true,
          },
          drag: false,
          wheel: false,
        },
      };
      this.minimapWorkspace = Blockly.inject('minimapDiv', options);
    }

    /**
     * Initialize.
     */
    init(): void {
      this.minimapWorkspace.scrollbar.setContainerVisible(false);
      this.primaryWorkspace.addChangeListener((e) => void this.mirror(e));
      Blockly.browserEvents.bind(this.minimapWorkspace.svgGroup_,
          'mousedown', this, this.controls);
      window.addEventListener('resize', (e) => {
        this.minimapWorkspace.zoomToFit();
      });
    }

    /**
     * Creates the mirroring between workspaces. Passes on all desired events
     * to the minimap from the primary workspace.
     * @param event The primary workspace event.
     */
    private mirror(event: Blockly.Events.Abstract): void {
      // TODO: shadow blocks get mirrored too (not supposed to happen)

      if (!BlockEvents.has(event.type)) {
        return; // Filter out events.
      }
      // Run the event in the minimap.
      const json = event.toJson();
      const duplicate = Blockly.Events.fromJson(json, this.minimapWorkspace);
      duplicate.run(true);

      // Resize and center the minimap.
      // We need to wait for the event to finish rendering to do the zoom.
      Blockly.renderManagement.finishQueuedRenders().then(() => {
        this.minimapWorkspace.zoomToFit();
      });
    }

    /**
     * Changes the primary workspace viewport when interacting with the minimap
     * @param event The minimap browser event.
     */
    private controls(event: PointerEvent): void {
      // Calculates the scale between the minimap and primary workspace.
      const primaryMetrics = this.primaryWorkspace.getMetrics();
      const contentDiv = this.minimapWorkspace.svgBlockCanvas_.
          getBoundingClientRect();
      const scale = primaryMetrics.contentWidth / contentDiv.width;

      // Calculates the location of the click in the minimap.
      const wsDiv = this.minimapWorkspace.svgGroup_.
          getBoundingClientRect();
      const offsetX = event.offsetX - (wsDiv.width - contentDiv.width) / 2;
      const offsetY = event.offsetY - (wsDiv.height - contentDiv.height) / 2;

      // Converts the click from the minimap to the primary worskspace.
      const x = -primaryMetrics.scrollLeft - offsetX * scale;
      const y = -primaryMetrics.scrollTop - offsetY * scale;
      this.primaryWorkspace.scroll(x, y);
    }
}
