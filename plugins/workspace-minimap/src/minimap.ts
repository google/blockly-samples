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
    private onMouseMoveWrapper: Blockly.browserEvents.Data;
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
      window.addEventListener('resize', () => {
        this.minimapWorkspace.zoomToFit();
      });
      Blockly.browserEvents.bind(
          this.minimapWorkspace.svgGroup_, 'mousedown', this, this.onClickDown);
      Blockly.browserEvents.bind(
          this.minimapWorkspace.svgGroup_, 'mouseup', this, this.onClickUp);
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
     * Converts the coorindates from a mouse event on the minimap
     * into scroll coordinates for the primary viewport.
     * @param primaryMetrics The metrics from the primary workspace.
     * @param minimapMetrics The metrics from the minimap workspace.
     * @param offsetX The x offset of the mouse event.
     * @param offsetY The y offset of the mouse event.
     * @returns (x, y) primary workspace scroll coordinates.
     */
    static minimapToPrimaryCoords(
        primaryMetrics: Blockly.utils.Metrics,
        minimapMetrics: Blockly.utils.Metrics,
        offsetX: number,
        offsetY: number): [number, number] {
      // Gets the coordinate relative to the top left of the minimap content.
      offsetX -= (minimapMetrics.svgWidth - minimapMetrics.contentWidth) / 2;
      offsetY -= (minimapMetrics.svgHeight - minimapMetrics.contentHeight) / 2;

      // Scales the coordinate to the primary workspace.
      const scale =
          primaryMetrics.contentWidth / minimapMetrics.contentWidth;
      offsetX *= scale;
      offsetY *= scale;

      // Gets the coordinate relative to the top left of the primary content.
      let x = -primaryMetrics.contentLeft - offsetX;
      let y = -primaryMetrics.contentTop - offsetY;

      // Centers the coordinate in the primary viewport.
      x += primaryMetrics.viewWidth / 2;
      y += primaryMetrics.viewHeight / 2;

      return [x, y];
    }

    /**
     * Scrolls the primary workspace viewport based on a minimap event.
     * @param event The minimap browser event.
     */
    private primaryScroll(event: PointerEvent): void {
      const [x, y] = Minimap.minimapToPrimaryCoords(
          this.primaryWorkspace.getMetrics(),
          this.minimapWorkspace.getMetrics(),
          event.offsetX,
          event.offsetY);
      this.primaryWorkspace.scroll(x, y);
    }

    /**
     * Updates the primary workspace viewport based on a click in the minimap.
     * @param event The minimap browser event.
     */
    private onClickDown(event: PointerEvent): void {
      this.onMouseMoveWrapper = Blockly.browserEvents.bind(
          this.minimapWorkspace.svgGroup_, 'mousemove', this, this.onMouseMove);
      this.primaryScroll(event);
    }

    /**
     * Unbinds the minimap mousemove when the mouse is not clicked.
     */
    private onClickUp(): void {
      // TODO: If you start the click in the minimap and end it in the primary
      //       the then this function is never unbinded
      Blockly.browserEvents.unbind(this.onMouseMoveWrapper);
    }

    /**
     * Updates the primary workspace viewport based on a drag in the minimap.
     * @param event The minimap browser event.
     */
    private onMouseMove(event: PointerEvent): void {
      this.primaryScroll(event);
    }
}
