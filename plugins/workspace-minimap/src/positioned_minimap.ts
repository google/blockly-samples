/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A positionable version of the minimap.
 * @author cesarades@google.com (Cesar Ades)
 */

import * as Blockly from 'blockly/core';
import {Minimap} from './minimap';

/**
 * A positionable version of minimap that implements IPositionable.
 */
export class PositionedMinimap implements Blockly.IPositionable {
    protected minimap: Minimap;
    protected primaryWorkspace: Blockly.WorkspaceSvg;
    protected margin: number;
    protected top: number;
    protected left: number;
    protected width: number;
    protected height: number;
    id: string;
    /**
     * Constructor for a positionable minimap.
     * @param workspace The workspace to mirror.
     */
    constructor(workspace: Blockly.WorkspaceSvg) {
      this.primaryWorkspace = workspace;
      this.minimap = new Minimap(this.primaryWorkspace);
      this.id = 'minimap';
      this.margin = 20;
      this.top = 0;
      this.left = 0;
      this.width = 225; // TODO: Bumping size responsiveness to future branch.
      this.height = 150;
    }

    /**
     * Initialize.
     */
    init(): void {
      this.minimap.init();
      this.primaryWorkspace.getComponentManager().addComponent({
        component: this,
        weight: 3,
        capabilities: [Blockly.ComponentManager.Capability.POSITIONABLE],
      });
      this.primaryWorkspace.resize();
    }

    /**
     * Returns the bounding rectangle of the UI element in pixel units
     * relative to the Blockly injection div.
     * @returns The component’s bounding box.
     */
    getBoundingRectangle(): Blockly.utils.Rect {
      return new Blockly.utils.Rect(
          this.top, this.top + this.height,
          this.left, this.left + this.width);
    }

    /**
     * Positions the minimap.
     * @param metrics The workspace metrics.
     * @param savedPositions List of rectangles already on the workspace.
     */
    position(metrics: Blockly.MetricsManager.UiMetrics,
        savedPositions: Blockly.utils.Rect[]): void {
      const hasVerticalScrollbars = this.primaryWorkspace.scrollbar &&
          this.primaryWorkspace.scrollbar.canScrollHorizontally();
      const hasHorizontalScrollbars = this.primaryWorkspace.scrollbar &&
          this.primaryWorkspace.scrollbar.canScrollVertically();

      if (metrics.toolboxMetrics.position === Blockly.TOOLBOX_AT_LEFT ||
           (this.primaryWorkspace.horizontalLayout &&
            !this.primaryWorkspace.RTL)) {
        // Right edge placement.
        this.left = metrics.absoluteMetrics.left + metrics.viewMetrics.width -
            this.width - this.margin;
        if (hasVerticalScrollbars && !this.primaryWorkspace.RTL) {
          this.left -= Blockly.Scrollbar.scrollbarThickness;
        }
      } else {
        // Left edge placement.
        this.left = this.margin;
        if (hasVerticalScrollbars && this.primaryWorkspace.RTL) {
          this.left += Blockly.Scrollbar.scrollbarThickness;
        }
      }

      const startAtBottom =
          metrics.toolboxMetrics.position === Blockly.TOOLBOX_AT_BOTTOM;
      if (startAtBottom) {
        // Bottom edge placement.
        this.top = metrics.absoluteMetrics.top + metrics.viewMetrics.height -
            this.height - this.margin;
        if (hasHorizontalScrollbars) {
          // The horizontal scrollbars are always positioned on the bottom.
          this.top -= Blockly.Scrollbar.scrollbarThickness;
        }
      } else {
        // Upper edge placement.
        this.top = metrics.absoluteMetrics.top + this.margin;
      }

      // Check for collision and bump if needed.
      let boundingRect = this.getBoundingRectangle();
      for (let i = 0; i < savedPositions.length; i++) {
        if (boundingRect.intersects(savedPositions[i])) {
          if (startAtBottom) {
            this.top = savedPositions[i].top - this.height - this.margin;
          } else {
            this.top = savedPositions[i].bottom + this.margin;
          }
          // Recheck other savedPositions.
          boundingRect = this.getBoundingRectangle();
          i = -1;
        }
      }
      this.setMinimapCss();
    }

    /**
     * Updates the CSS attribute for the minimap.
     */
    private setMinimapCss(): void {
      const injectDiv = this.minimap.getMinimapInjectionDiv();
      // TODO: Styling properties will be added later this is a placeholder.
      injectDiv.parentElement.setAttribute('style',
          `z-index: 2;
          position: absolute;
          width: ${this.width}px;
          height: ${this.height}px;
          top: ${this.top}px;
          left: ${this.left}px;
          box-shadow: 2px 2px 10px grey;`);
      this.minimap.svgResize();
    }
}
