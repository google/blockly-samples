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


/**
 * A class that highlights the user's viewport on the minimap.
 */
export class FocusMode {
    private primaryWorkspace: Blockly.WorkspaceSvg;
    private minimapWorkspace: Blockly.WorkspaceSvg;
    private onChangeWrapper: (e: Blockly.Events.Abstract) => void;
    private svgGroup: SVGElement;
    private rect: SVGElement;
    private background: SVGElement;
    private id: string;

    /**
     * Constructor for focus mode.
     * @param primary The primary workspaceSvg.
     * @param minimap The minimap workspaceSvg.
     */
    constructor(primary: Blockly.WorkspaceSvg, minimap: Blockly.WorkspaceSvg) {
      this.primaryWorkspace = primary;
      this.minimapWorkspace = minimap;
      this.id = this.minimapWorkspace.id;
    }

    /**
     * Initializes focus mode.
     */
    init() {
      // Make the group element.
      this.svgGroup = Blockly.utils.dom.createSvgElement(
          Blockly.utils.Svg.G, {'class': 'focusMode'}, null);

      // Mask under group.
      const mask = Blockly.utils.dom.createSvgElement(
          new Blockly.utils.Svg('mask'),
          {'id': 'focusModeMask' + this.id},
          this.svgGroup);

      // Backround under group.
      this.background = Blockly.utils.dom.createSvgElement(
          Blockly.utils.Svg.RECT, {
            'x': 0,
            'y': 0,
            'width': '100%',
            'height': '100%',
            'mask': 'url(#focusModeMask' + this.id + ')',
          }, this.svgGroup);

      // White layer under mask.
      Blockly.utils.dom.createSvgElement(
          Blockly.utils.Svg.RECT, {
            'x': 0,
            'y': 0,
            'width': '100%',
            'height': '100%',
            'fill': 'white',
          }, mask);

      // Black layer under mask.
      this.rect = Blockly.utils.dom.createSvgElement(
          Blockly.utils.Svg.RECT, {
            'x': 0,
            'y': 0,
            'rx': Blockly.Bubble.BORDER_WIDTH,
            'ry': Blockly.Bubble.BORDER_WIDTH,
            'fill': 'black',
          }, mask);

      // Theme.
      this.background.setAttribute('fill', '#e6e6e6');
      this.svgGroup.setAttribute('opacity', '1');
      this.svgGroup.style.transition = 'opacity ' + .25 + 's';

      // Add the group to the minimap.
      const parentSvg = this.minimapWorkspace.getParentSvg();
      if (parentSvg.firstChild) {
        parentSvg.insertBefore(this.svgGroup, parentSvg.firstChild);
      } else {
        parentSvg.appendChild(this.svgGroup);
      }

      this.onChangeWrapper = this.onChange.bind(this);
      this.primaryWorkspace.addChangeListener(this.onChangeWrapper);

      const primaryMetrics = this.primaryWorkspace.getMetricsManager();
      const minimapMetrics = this.minimapWorkspace.getMetricsManager();

      this.position(primaryMetrics, minimapMetrics);
      this.resize(primaryMetrics, minimapMetrics);

      window.addEventListener('resize', () => {
        this.resize(this.primaryWorkspace.getMetricsManager(),
            this.minimapWorkspace.getMetricsManager());
      });
    }

    /**
     * Disposes of the focus mode.
     * Unlinks from all DOM elements and remove all event listeners
     * to prevent memory leaks.
     */
    dispose() {
      if (this.svgGroup) {
        Blockly.utils.dom.removeNode(this.svgGroup);
      }
      if (this.onChangeWrapper) {
        this.primaryWorkspace.removeChangeListener(this.onChangeWrapper);
      }
    }

    /**
     * Handles events triggered on the primary workspace.
     * @param event The event.
     */
    private onChange(event: Blockly.Events.Abstract): void {
      if (event.type === Blockly.Events.VIEWPORT_CHANGE) {
        const primary = this.primaryWorkspace.getMetricsManager();
        const minimap = this.minimapWorkspace.getMetricsManager();
        this.resize(primary, minimap);
        this.position(primary, minimap);
      }
    }


    /**
     * Resizes the content highlight.
     * @param primaryMetrics Primary workspace metrics.
     * @param minimapMetrics Minimap workspace metrics.
     */
    private resize(primaryMetrics: Blockly.IMetricsManager,
        minimapMetrics: Blockly.IMetricsManager): void {
      const scale = primaryMetrics.getContentMetrics(true).width /
          primaryMetrics.getViewMetrics(true).width;
      const width = minimapMetrics.getContentMetrics(false).width / scale;
      const height = minimapMetrics.getContentMetrics(false).height / scale;

      console.log('scale ', scale);
      console.log('width, height: ', width, height);

      this.rect.setAttribute('width', width.toString());
      this.rect.setAttribute('height', height.toString());
      this.print();
    }


    /**
     * Positions the highlight on the minimap based on the primary viewport.
     * @param primaryMetrics Primary workspace metrics.
     * @param minimapMetrics Minimap workspace metrics.
     */
    private position(primaryMetrics: Blockly.IMetricsManager,
        minimapMetrics: Blockly.IMetricsManager): void {
      const scale = minimapMetrics.getContentMetrics(false).width /
        minimapMetrics.getContentMetrics(true).width;
      const left = primaryMetrics.getViewMetrics(false).left * scale;
      const top = primaryMetrics.getViewMetrics(false).top * scale;
      this.rect.setAttribute('transform',
          'translate(' + left + ',' + top + ') scale(' + 1 +')');
      this.print();
    }

    /**
     * Prints stuff.
     */
    private print(): void {
      const p = this.primaryWorkspace.getMetricsManager();
      const m = this.minimapWorkspace.getMetricsManager();
      console.log('Primaty Viewport width (w,p): ',
          p.getViewMetrics(true).width, p.getViewMetrics(false).width);
      console.log('Primaty Viewport left (w,p): ',
          p.getViewMetrics(true).left, p.getViewMetrics(false).left);

      console.log('Primary contet width (w,p): ',
          p.getContentMetrics(true).width, p.getContentMetrics(false).width);
      console.log('Minimap contet width (w,p): ',
          m.getContentMetrics(true).width, m.getContentMetrics(false).width);
      console.log('------------------------------');
    }
}
