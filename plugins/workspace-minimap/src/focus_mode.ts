/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A class that highlights the user's
 * viewport on the minimap.
 * @author cesarades@google.com (Cesar Ades)
 */

import * as Blockly from 'blockly/core';

const BlockEvents = new Set([
  Blockly.Events.VIEWPORT_CHANGE,
  Blockly.Events.BLOCK_CHANGE,
  Blockly.Events.BLOCK_CREATE,
  Blockly.Events.BLOCK_DELETE,
  Blockly.Events.BLOCK_DRAG,
  Blockly.Events.BLOCK_MOVE]);

const BorderRadius = 6;

/**
 * A class that highlights the user's viewport on the minimap.
 */
export class FocusMode {
    private onChangeWrapper: (e: Blockly.Events.Abstract) => void;
    private svgGroup: SVGElement;
    private rect: SVGElement;
    private background: SVGElement;
    private id: string;


    /**
     * Constructor for focus mode.
     * @param primaryWorkspace The primary workspaceSvg.
     * @param minimapWorkspace The minimap workspaceSvg.
     */
    constructor(private primaryWorkspace: Blockly.WorkspaceSvg,
        private minimapWorkspace: Blockly.WorkspaceSvg) {
      this.id = String(Math.random()).substring(2);
    }


    /**
     * Initializes focus mode.
     */
    init() {
      // Make the svg group element.
      this.svgGroup = Blockly.utils.dom.createSvgElement(
          Blockly.utils.Svg.G, {'class': 'focusMode'}, null);

      // Make the mask under the svg group.
      const mask = Blockly.utils.dom.createSvgElement(
          new Blockly.utils.Svg('mask'),
          {'id': 'focusModeMask' + this.id},
          this.svgGroup);

      // Make the backround under the svg group.
      this.background = Blockly.utils.dom.createSvgElement(
          Blockly.utils.Svg.RECT, {
            'x': 0,
            'y': 0,
            'width': '100%',
            'height': '100%',
            'mask': 'url(#focusModeMask' + this.id + ')',
          }, this.svgGroup);

      // Make the white layer under the svg mask.
      Blockly.utils.dom.createSvgElement(
          Blockly.utils.Svg.RECT, {
            'x': 0,
            'y': 0,
            'width': '100%',
            'height': '100%',
            'fill': 'white',
          }, mask);

      // Make the black layer under the mask.
      this.rect = Blockly.utils.dom.createSvgElement(
          Blockly.utils.Svg.RECT, {
            'x': 0,
            'y': 0,
            'rx': BorderRadius,
            'ry': BorderRadius,
            'fill': 'black',
          }, mask);

      // Theme.
      this.background.setAttribute('fill', '#e6e6e6');

      // Add the svg group to the minimap.
      const parentSvg = this.minimapWorkspace.getParentSvg();
      if (parentSvg.firstChild) {
        parentSvg.insertBefore(this.svgGroup, parentSvg.firstChild);
      } else {
        parentSvg.appendChild(this.svgGroup);
      }

      window.addEventListener('resize', () => void this.update());
      this.onChangeWrapper = this.onChange.bind(this);
      this.primaryWorkspace.addChangeListener(this.onChangeWrapper);

      this.update();
    }


    /**
     * Disposes of the focus mode.
     * Unlinks from all DOM elements and remove all event listeners
     * to prevent memory leaks.
     */
    dispose() {
      if (this.onChangeWrapper) {
        this.primaryWorkspace.removeChangeListener(this.onChangeWrapper);
      }
      if (this.svgGroup) {
        Blockly.utils.dom.removeNode(this.svgGroup);
      }
      this.svgGroup = null;
      this.rect = null;
      this.background = null;
    }


    /**
     * Handles events triggered on the primary workspace.
     * @param event The event.
     */
    private onChange(event: Blockly.Events.Abstract): void {
      if (BlockEvents.has(event.type)) {
        this.update();
      }
    }


    /**
     * Positions and sizes the highlight on the minimap
     * based on the primary workspace.
     */
    private update(): void {
      // Get the metrics.
      const primaryMetrics = this.primaryWorkspace.getMetricsManager();
      const minimapMetrics = this.minimapWorkspace.getMetricsManager();

      const primaryView = primaryMetrics.getViewMetrics();
      const primaryContent = primaryMetrics.getContentMetrics();
      const minimapContent = minimapMetrics.getContentMetrics();
      const minimapSvg = minimapMetrics.getSvgMetrics();

      // Get the workscape to pixel scale on the minimap.
      const scale = minimapContent.width /
        minimapMetrics.getContentMetrics(true).width;

      // Get the viewport size on a minimap scale.
      const width = primaryView.width * scale;
      const height = primaryView.height * scale;

      // Get the viewport position in relation to the content.
      let left = (primaryView.left - primaryContent.left) * scale;
      let top = (primaryView.top - primaryContent.top) * scale;

      // Account for the padding outside the content on the minimap.
      left += (minimapSvg.width - minimapContent.width) / 2;
      top += (minimapSvg.height - minimapContent.height) / 2;

      // Set the svg attributes.
      this.rect.setAttribute('transform',
          'translate(' + left + ',' + top + ')');
      this.rect.setAttribute('width', width.toString());
      this.rect.setAttribute('height', height.toString());
    }
}
