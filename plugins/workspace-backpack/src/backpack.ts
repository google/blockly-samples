/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A backpack that lives on top of the workspace.
 * @author kozbial@google.com (Monica Kozbial)
 */

import * as Blockly from 'blockly/core';

import {registerContextMenus} from './backpack_helpers';
import {BackpackOptions, parseOptions} from './options';
import {BackpackChange, BackpackOpen} from './ui_events';

/**
 * Class for backpack that can be used save blocks from the workspace for
 * future use.
 */
export class Backpack extends Blockly.DragTarget implements
    Blockly.IAutoHideable, Blockly.IPositionable {
  /**
   * The unique id for this component.
   */
  id = 'backpack';

  /**
   * The backpack options.
   */
  private options: BackpackOptions;

  /**
   * The backpack flyout. Initialized during init.
   */
  protected flyout: Blockly.IFlyout|null = null;

  /**
   * A list of JSON (stored as strings) representing blocks in the backpack.
   */
  protected contents: string[] = [];

  /**
   * Array holding info needed to unbind events.
   * Used for disposing.
   */
  private boundEvents: Blockly.browserEvents.Data[] = [];

  /**
   * Left coordinate of the backpack.
   */
  protected left = 0;

  /**
   * Top coordinate of the backpack.
   */
  protected top = 0;

  /**
   * Width of the backpack. Used for clip path.
   */
  protected readonly WIDTH = 40;

  /**
   * Height of the backpack. Used for clip path.
   */
  protected readonly HEIGHT = 60;

  /**
   * Distance between backpack and bottom or top edge of workspace.
   */
  protected readonly MARGIN_VERTICAL = 20;

  /**
   * Distance between backpack and right or left edge of workspace.
   */
  protected readonly MARGIN_HORIZONTAL = 20;

  /**
   * Extent of hotspot on all sides beyond the size of the image.
   */
  protected readonly HOTSPOT_MARGIN = 10;

  /**
   * The SVG group containing the backpack.
   */
  protected svgGroup: SVGElement|null = null;

  protected svgImg: SVGImageElement|null = null;

  /**
   * Top offset for backpack in svg.
   */
  private SPRITE_TOP = 10;

  /**
   * Left offset for backpack in svg.
   */
  private SPRITE_LEFT = 20;

  /**
   * Width/Height of svg.
   */
  private readonly SPRITE_SIZE = 80;

  protected initialized = false;

  /**
   * Constructor for a backpack.
   * @param targetWorkspace The target workspace that
   *     the backpack will be added to.
   * @param backpackOptions The backpack options to use.
   */
  constructor(
      protected workspace: Blockly.WorkspaceSvg,
      backpackOptions: BackpackOptions) {
    super();
    this.options = parseOptions(backpackOptions);
    this.registerSerializer();
  }

  /**
   * Registers serializer if options.skipSerializerRegistration is false
   * and it hasn't been registered already.
   */
  private registerSerializer() {
    if (this.options.skipSerializerRegistration) {
      return;
    }

    if (Blockly.registry.hasItem(
            Blockly.registry.Type.SERIALIZER, 'backpack')) {
      return;
    }

    Blockly.serialization.registry.register(
        'backpack', new BackpackSerializer());
  }

  /**
   * Initializes the backpack.
   */
  init() {
    this.workspace.getComponentManager().addComponent({
      component: this,
      weight: 2,
      capabilities: [
        Blockly.ComponentManager.Capability.AUTOHIDEABLE,
        Blockly.ComponentManager.Capability.DRAG_TARGET,
        Blockly.ComponentManager.Capability.POSITIONABLE,
      ],
    });
    this.initFlyout();
    this.createDom();
    this.attachListeners();
    registerContextMenus(this.options.contextMenu, this.workspace);
    this.initialized = true;
    this.workspace.resize();
  }

  /**
   * Disposes of workspace search.
   * Unlink from all DOM elements and remove all event listeners
   * to prevent memory leaks.
   */
  dispose() {
    if (this.svgGroup) {
      Blockly.utils.dom.removeNode(this.svgGroup);
    }
    for (const event of this.boundEvents) {
      Blockly.browserEvents.unbind(event);
    }
    this.boundEvents.length = 0;
  }

  /**
   * Creates and initializes the flyout and inserts it into the dom.
   */
  protected initFlyout() {
    // Create flyout options.
    const flyoutWorkspaceOptions = new Blockly.Options({
      'scrollbars': true,
      'parentWorkspace': this.workspace,
      'rtl': this.workspace.RTL,
      'oneBasedIndex': this.workspace.options.oneBasedIndex,
      'renderer': this.workspace.options.renderer,
      'rendererOverrides': this.workspace.options.rendererOverrides,
      'move': {
        'scrollbars': true,
      },
    });
    // Create vertical or horizontal flyout.
    if (this.workspace.horizontalLayout) {
      flyoutWorkspaceOptions.toolboxPosition =
          (this.workspace.toolboxPosition ===
           Blockly.utils.toolbox.Position.TOP) ?
          Blockly.utils.toolbox.Position.BOTTOM :
          Blockly.utils.toolbox.Position.TOP;
      const HorizontalFlyout = Blockly.registry.getClassFromOptions(
          Blockly.registry.Type.FLYOUTS_HORIZONTAL_TOOLBOX,
          this.workspace.options, true);
      this.flyout = new HorizontalFlyout(flyoutWorkspaceOptions);
    } else {
      flyoutWorkspaceOptions.toolboxPosition =
          (this.workspace.toolboxPosition ===
           Blockly.utils.toolbox.Position.RIGHT) ?
          Blockly.utils.toolbox.Position.LEFT :
          Blockly.utils.toolbox.Position.RIGHT;
      const VerticalFlyout = Blockly.registry.getClassFromOptions(
          Blockly.registry.Type.FLYOUTS_VERTICAL_TOOLBOX,
          this.workspace.options, true);
      this.flyout = new VerticalFlyout(flyoutWorkspaceOptions);
    }
    // Add flyout to DOM.
    const parentNode = this.workspace.getParentSvg().parentNode;
    parentNode.appendChild(this.flyout.createDom(Blockly.utils.Svg.SVG));
    this.flyout.init(this.workspace);
  }

  /**
   * Creates DOM for UI element.
   */
  protected createDom() {
    this.svgGroup =
        Blockly.utils.dom.createSvgElement(Blockly.utils.Svg.G, {}, null);
    const rnd = Blockly.utils.idGenerator.genUid();
    const clip = Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.CLIPPATH, {'id': 'blocklyBackpackClipPath' + rnd},
        this.svgGroup);
    Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.RECT, {
          'width': this.WIDTH,
          'height': this.HEIGHT,
        },
        clip);
    this.svgImg = Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.IMAGE, {
          'class': 'blocklyBackpack',
          'clip-path': 'url(#blocklyBackpackClipPath' + rnd + ')',
          'width': this.SPRITE_SIZE + 'px',
          'x': -this.SPRITE_LEFT,
          'height': this.SPRITE_SIZE + 'px',
          'y': -this.SPRITE_TOP,
        },
        this.svgGroup);
    this.svgImg.setAttributeNS(
        Blockly.utils.dom.XLINK_NS, 'xlink:href', BACKPACK_SVG_DATAURI);

    Blockly.utils.dom.insertAfter(
        this.svgGroup, this.workspace.getBubbleCanvas());
  }

  /**
   * Attaches event listeners.
   */
  protected attachListeners() {
    this.addEvent(
        this.svgGroup, 'mousedown', this, this.blockMouseDownWhenOpenable);
    this.addEvent(this.svgGroup, 'mouseup', this, this.onClick);
    this.addEvent(this.svgGroup, 'mouseover', this, this.onMouseOver);
    this.addEvent(this.svgGroup, 'mouseout', this, this.onMouseOut);
  }

  /**
   * Helper method for adding an event.
   * @param node Node upon which to listen.
   * @param name Event name to listen to (e.g. 'mousedown').
   * @param thisObject The value of 'this' in the function.
   * @param func Function to call when event is triggered.
   */
  private addEvent(
      node: Element, name: string, thisObject: object,
      func: (event: Event) => void) {
    const event = Blockly.browserEvents.bind(node, name, thisObject, func);
    this.boundEvents.push(event);
  }

  /**
   * Returns the backpack flyout.
   * @returns The backpack flyout.
   */
  getFlyout(): Blockly.IFlyout|null {
    return this.flyout;
  }

  /**
   * Returns the bounding rectangle of the drag target area in pixel units
   * relative to viewport.
   * @returns The component's bounding box. Null if drag
   *   target area should be ignored.
   */
  getClientRect(): Blockly.utils.Rect|null {
    if (!this.svgGroup) {
      return null;
    }

    const clientRect = this.svgGroup.getBoundingClientRect();
    const top = clientRect.top + this.SPRITE_TOP - this.HOTSPOT_MARGIN;
    const bottom = top + this.HEIGHT + 2 * this.HOTSPOT_MARGIN;
    const left = clientRect.left + this.SPRITE_LEFT - this.HOTSPOT_MARGIN;
    const right = left + this.WIDTH + 2 * this.HOTSPOT_MARGIN;
    return new Blockly.utils.Rect(top, bottom, left, right);
  }

  /**
   * Returns the bounding rectangle of the UI element in pixel units relative to
   * the Blockly injection div.
   * @returns The component’s bounding box.
   */
  getBoundingRectangle(): Blockly.utils.Rect {
    return new Blockly.utils.Rect(
        this.top, this.top + this.HEIGHT, this.left, this.left + this.WIDTH);
  }

  /**
   * Positions the backpack.
   * It is positioned in the opposite corner to the corner the
   * categories/toolbox starts at.
   * @param metrics The workspace metrics.
   * @param savedPositions List of rectangles that
   *     are already on the workspace.
   */
  position(
      metrics: Blockly.MetricsManager.UiMetrics,
      savedPositions: Blockly.utils.Rect[]) {
    if (!this.initialized) {
      return;
    }

    const scrollbars = this.workspace.scrollbar;
    const hasVerticalScrollbars = scrollbars && scrollbars.isVisible() &&
        scrollbars.canScrollVertically();
    const hasHorizontalScrollbars = scrollbars && scrollbars.isVisible() &&
        scrollbars.canScrollHorizontally();

    if (metrics.toolboxMetrics.position === Blockly.TOOLBOX_AT_LEFT ||
        (this.workspace.horizontalLayout && !this.workspace.RTL)) {
      // Right corner placement.
      this.left = metrics.absoluteMetrics.left + metrics.viewMetrics.width -
          this.WIDTH - this.MARGIN_HORIZONTAL;
      if (hasVerticalScrollbars && !this.workspace.RTL) {
        this.left -= Blockly.Scrollbar.scrollbarThickness;
      }
    } else {
      // Left corner placement.
      this.left = this.MARGIN_HORIZONTAL;
      if (hasVerticalScrollbars && this.workspace.RTL) {
        this.left += Blockly.Scrollbar.scrollbarThickness;
      }
    }

    const startAtBottom =
        metrics.toolboxMetrics.position === Blockly.TOOLBOX_AT_BOTTOM;
    if (startAtBottom) {
      // Bottom corner placement
      this.top = metrics.absoluteMetrics.top + metrics.viewMetrics.height -
          this.HEIGHT - this.MARGIN_VERTICAL;
      if (hasHorizontalScrollbars) {
        // The horizontal scrollbars are always positioned on the bottom.
        this.top -= Blockly.Scrollbar.scrollbarThickness;
      }
    } else {
      // Upper corner placement
      this.top = metrics.absoluteMetrics.top + this.MARGIN_VERTICAL;
    }

    // Check for collision and bump if needed.
    let boundingRect = this.getBoundingRectangle();
    for (let i = 0, otherEl; (otherEl = savedPositions[i]); i++) {
      if (boundingRect.intersects(otherEl)) {
        if (startAtBottom) {  // Bump up.
          this.top = otherEl.top - this.HEIGHT - this.MARGIN_VERTICAL;
        } else {  // Bump down.
          this.top = otherEl.bottom + this.MARGIN_VERTICAL;
        }
        // Recheck other savedPositions
        boundingRect = this.getBoundingRectangle();
        i = -1;
      }
    }

    this.svgGroup.setAttribute(
        'transform', `translate(${this.left},${this.top})`);
  }

  /**
   * Returns the count of items in the backpack.
   * @returns The count of items.
   */
  getCount(): number {
    return this.contents.length;
  }

  /**
   * Returns backpack contents.
   * @returns The backpack contents.
   */
  getContents(): string[] {
    // Return a shallow copy of the contents array.
    return [...this.contents];
  }

  /**
   * Handles when a block or bubble is dropped on this component.
   * Should not handle delete here.
   * @param dragElement The block or bubble currently
   *   being dragged.
   */
  onDrop(dragElement: Blockly.IDraggable) {
    if (dragElement instanceof Blockly.BlockSvg) {
      this.addBlock(dragElement);
    }
  }

  /**
   * Converts the provided block into a JSON string and
   * cleans the JSON of any unnecessary attributes
   * @param block The block to convert.
   * @returns The JSON object as a string.
   */
  private blockToJsonString(block: Blockly.Block): string {
    const json = Blockly.serialization.blocks.save(block);

    // Add a 'kind' key so the flyout can recognize it as a block.
    (json as any).kind = 'BLOCK';

    // The keys to remove.
    const keys = ['id', 'height', 'width', 'pinned', 'enabled'];

    // Traverse the JSON recursively.
    const traverseJson = function(json, keys) {
      for (const key in json) {
        if (key) {
          if (keys.includes(key)) {
            delete json[key];
          }
          if (json[key] && typeof json[key] === 'object') {
            traverseJson(json[key], keys);
          }
        }
      }
    };

    traverseJson(json, keys);
    return JSON.stringify(json);
  }

  /**
   * Converts serialized XML to its equivalent serialized JSON string
   * @param blockXml The XML serialized block.
   * @returns The JSON object as a string.
   */
  private blockXmlToJsonString(blockXml: string): string {
    if (!blockXml.startsWith('<block')) {
      throw new Error('Unrecognized XML format');
    }

    const workspace = new Blockly.Workspace();
    try {
      const block = Blockly.Xml.domToBlock(
          Blockly.utils.xml.textToDom(blockXml),
          workspace,
      );
      return this.blockToJsonString(block);
    } finally {
      workspace.dispose();
    }
  }

  /**
   * Returns whether the backpack contains a duplicate of the provided Block.
   * @param block The block to check.
   * @returns Whether the backpack contains a duplicate of the
   *     provided block.
   */
  containsBlock(block: Blockly.Block): boolean {
    return this.contents.indexOf(this.blockToJsonString(block)) !== -1;
  }

  /**
   * Adds the specified block to backpack.
   * @param block The block to be added to the backpack.
   */
  addBlock(block: Blockly.Block) {
    this.addItem(this.blockToJsonString(block));
  }


  /**
   * Adds the provided blocks to backpack.
   * @param blocks The blocks to be added to the
   *     backpack.
   */
  addBlocks(blocks: Blockly.Block[]) {
    this.addItems(blocks.map(this.blockToJsonString));
  }


  /**
   * Removes the specified block from the backpack.
   * @param block The block to be removed from the backpack.
   */
  removeBlock(block: Blockly.Block) {
    this.removeItem(this.blockToJsonString(block));
  }

  /**
   * Adds item to backpack.
   * @param item Text representing the JSON of a block to add,
   *     cleaned of all unnecessary attributes.
   */
  addItem(item: string) {
    this.addItems([item]);
  }

  /**
   * Adds multiple items to the backpack.
   * @param items The backpack contents to add.
   */
  addItems(items: string[]) {
    const addedItems = this.filterDuplicates(items);
    if (addedItems.length) {
      this.contents.unshift(...addedItems);
      this.onContentChange();
    }
  }

  /**
   * Removes item from the backpack.
   * @param item Text representing the JSON of a block to remove,
   * cleaned of all unnecessary attributes.
   */
  removeItem(item: string) {
    const itemIndex = this.contents.indexOf(item);
    if (itemIndex !== -1) {
      this.contents.splice(itemIndex, 1);
      this.onContentChange();
    }
  }

  /**
   * Sets backpack contents.
   * @param contents The new backpack contents.
   */
  setContents(contents: string[]) {
    this.contents = [];
    this.contents = this.filterDuplicates(
        // Support XML serialized content for backwards compatiblity:
        // https://github.com/google/blockly-samples/issues/1827
        contents.map(
            (content) => content.startsWith('<block') ?
                this.blockXmlToJsonString(content) :
                content));
    this.onContentChange();
  }

  /**
   * Empties the backpack's contents. If the contents-flyout is currently open
   * it will be closed.
   */
  empty() {
    if (!this.getCount()) {
      return;
    }
    if (this.contents.length) {
      this.contents = [];
      this.onContentChange();
    }
    this.close();
  }

  /**
   * Handles content change.
   */
  protected onContentChange() {
    this.maybeRefreshFlyoutContents();
    Blockly.Events.fire(new BackpackChange(this.workspace.id));

    if (!this.options.useFilledBackpackImage) return;
    if (this.contents.length > 0) {
      this.svgImg.setAttributeNS(
          Blockly.utils.dom.XLINK_NS, 'xlink:href',
          BACKPACK_FILLED_SVG_DATAURI);
    } else {
      this.svgImg.setAttributeNS(
          Blockly.utils.dom.XLINK_NS, 'xlink:href', BACKPACK_SVG_DATAURI);
    }
  }

  /**
   * Returns a filtered list without duplicates within itself and without any
   * shared elements with this.contents.
   * @param array The array of items to filter.
   * @returns The filtered list.
   */
  private filterDuplicates(array: string[]): string[] {
    return array.filter((item, idx) => {
      return array.indexOf(item) === idx && this.contents.indexOf(item) === -1;
    });
  }

  /**
   * Returns whether the backpack is open-able.
   * @returns Whether the backpack is open-able.
   */
  protected isOpenable(): boolean {
    return !this.isOpen() && this.options.allowEmptyBackpackOpen ?
        true :
        this.getCount() > 0;
  }

  /**
   * Returns whether the backpack is open.
   * @returns Whether the backpack is open.
   */
  isOpen(): boolean {
    return this.flyout.isVisible();
  }

  /**
   * Opens the backpack flyout.
   */
  open() {
    if (!this.isOpenable()) {
      return;
    }
    const jsons = this.contents.map((text) => JSON.parse(text));
    this.flyout.show(jsons);
    // TODO: We can remove the setVisible check when updating from ^10.0.0 to
    //    ^11.
    if (this.workspace.scrollbar &&
    /** @type {*} */ (this.workspace.scrollbar).setVisible) {
      /** @type {*} */ (this.workspace.scrollbar).setVisible(false);
    }
    Blockly.Events.fire(new BackpackOpen(true, this.workspace.id));
  }

  /**
   * Refreshes backpack flyout contents if the flyout is open.
   */
  protected maybeRefreshFlyoutContents() {
    if (!this.isOpen()) {
      return;
    }
    const json = this.contents.map((text) => JSON.parse(text));
    this.flyout.show(json);
  }

  /**
   * Closes the backpack flyout.
   */
  close() {
    if (!this.isOpen()) {
      return;
    }
    this.flyout.hide();
    // TODO: We can remove the setVisible check when updating from ^10.0.0 to
    //    ^11.
    if (this.workspace.scrollbar &&
    /** @type {*} */ (this.workspace.scrollbar).setVisible) {
      /** @type {*} */ (this.workspace.scrollbar).setVisible(true);
    }
    Blockly.Events.fire(new BackpackOpen(false, this.workspace.id));
  }

  /**
   * Hides the component. Called in Blockly.hideChaff.
   * @param onlyClosePopups Whether only popups should be closed.
   *     Flyouts should not be closed if this is true.
   */
  autoHide(onlyClosePopups: boolean) {
    // The backpack flyout always autocloses because it overlays the backpack UI
    // (no backpack to click to close it).
    if (!onlyClosePopups) {
      this.close();
    }
  }

  /**
   * Handle click event.
   * @param e Mouse event.
   */
  protected onClick(e: MouseEvent) {
    if (Blockly.browserEvents.isRightButton(e)) {
      return;
    }
    this.open();
    const uiEvent = new (Blockly.Events.get(Blockly.Events.CLICK))(
        null, this.workspace.id, 'backpack');
    Blockly.Events.fire(uiEvent);
  }

  /**
   * Handles when a cursor with a block or bubble enters this drag target.
   * @param dragElement The block or bubble currently
   *   being dragged.
   */
  onDragEnter(dragElement: Blockly.IDraggable) {
    if (dragElement instanceof Blockly.BlockSvg) {
      this.updateHoverStying(true);
    }
  }

  /**
   * Handles when a cursor with a block or bubble exits this drag target.
   * @param _dragElement The block or bubble currently
   *   being dragged.
   */
  onDragExit(_dragElement: Blockly.IDraggable) {
    this.updateHoverStying(false);
  }

  /**
   * Handles a mouseover event.
   */
  private onMouseOver() {
    if (this.isOpenable()) {
      this.updateHoverStying(true);
    }
  }

  /**
   * Handles a mouseout event.
   */
  private onMouseOut() {
    this.updateHoverStying(false);
  }

  /**
   * Adds or removes styling to darken the backpack to show it is interactable.
   * @param addClass True to add styling, false to remove.
   */
  protected updateHoverStying(addClass: boolean) {
    const backpackDarken = 'blocklyBackpackDarken';
    if (addClass) {
      Blockly.utils.dom.addClass(this.svgImg, backpackDarken);
    } else {
      Blockly.utils.dom.removeClass(this.svgImg, backpackDarken);
    }
  }

  /**
   * Returns whether the provided block or bubble should not be moved after
   * being dropped on this component. If true, the element will return to where
   * it was when the drag started.
   * @param dragElement The block or bubble currently
   *   being dragged.
   * @returns Whether the block or bubble provided should be returned
   *   to drag start.
   */
  shouldPreventMove(dragElement: Blockly.IDraggable): boolean {
    return dragElement instanceof Blockly.BlockSvg;
  }

  /**
   * Prevents a workspace scroll and click event if the backpack is openable.
   * @param e A mouse down event.
   */
  protected blockMouseDownWhenOpenable(e: MouseEvent) {
    if (!Blockly.browserEvents.isRightButton(e) && this.isOpenable()) {
      e.stopPropagation();  // Don't start a workspace scroll.
    }
  }
}

/**
 * Base64 encoded data uri for backpack  icon.
 */
const BACKPACK_SVG_DATAURI =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC' +
    '9zdmciIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDI0IDI0IiBoZWlnaHQ9IjI0cHgiIH' +
    'ZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0cHgiIGZpbGw9IiM0NTVBNjQiPjxnPjxyZW' +
    'N0IGZpbGw9Im5vbmUiIGhlaWdodD0iMjQiIHdpZHRoPSIyNCIvPjwvZz48Zz48Zy8+PGc+PH' +
    'BhdGggZD0iTTEzLjk3LDUuMzRDMTMuOTgsNS4yMywxNCw1LjEyLDE0LDVjMC0xLjEtMC45LT' +
    'ItMi0ycy0yLDAuOS0yLDJjMCwwLjEyLDAuMDIsMC4yMywwLjAzLDAuMzRDNy42OSw2LjE1LD' +
    'YsOC4zOCw2LDExdjggYzAsMS4xLDAuOSwyLDIsMmg4YzEuMSwwLDItMC45LDItMnYtOEMxOC' +
    'w4LjM4LDE2LjMxLDYuMTUsMTMuOTcsNS4zNHogTTExLDVjMC0wLjU1LDAuNDUtMSwxLTFzMS' +
    'wwLjQ1LDEsMSBjMCwwLjAzLTAuMDEsMC4wNi0wLjAyLDAuMDlDMTIuNjYsNS4wMywxMi4zNC' +
    'w1LDEyLDVzLTAuNjYsMC4wMy0wLjk4LDAuMDlDMTEuMDEsNS4wNiwxMSw1LjAzLDExLDV6IE' +
    '0xNiwxM3YxdjAuNSBjMCwwLjI4LTAuMjIsMC41LTAuNSwwLjVTMTUsMTQuNzgsMTUsMTQuNV' +
    'YxNHYtMUg4di0xaDdoMVYxM3oiLz48L2c+PC9nPjwvc3ZnPg==';

/**
 * Base64 encoded data uri for backpack  icon when filled.
 */
const BACKPACK_FILLED_SVG_DATAURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2' +
    'lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYX' +
    'RlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgoKPHN2Zw' +
    'ogICB3aWR0aD0iMjQiCiAgIGhlaWdodD0iMjQiCiAgIHZpZXdCb3g9IjAgMCAyNCAyNCIKIC' +
    'AgdmVyc2lvbj0iMS4xIgogICBpZD0ic3ZnNSIKICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3' +
    'JnLzIwMDAvc3ZnIgogICB4bWxuczpzdmc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj' +
    '4KICA8ZGVmcwogICAgIGlkPSJkZWZzMiIgLz4KICA8ZwogICAgIGlkPSJsYXllcjEiPgogIC' +
    'AgPGcKICAgICAgIHN0eWxlPSJmaWxsOiM0NTVhNjQiCiAgICAgICBpZD0iZzg0OCIKICAgIC' +
    'AgIHRyYW5zZm9ybT0ibWF0cml4KDAuMjY0NTgzMzMsMCwwLDAuMjY0NTgzMzMsOC44MjQ5OT' +
    'k3LDguODI0OTk5NykiPgogICAgICA8ZwogICAgICAgICBpZD0iZzgyNiI+CiAgICAgICAgPH' +
    'JlY3QKICAgICAgICAgICBmaWxsPSJub25lIgogICAgICAgICAgIGhlaWdodD0iMjQiCiAgIC' +
    'AgICAgICAgd2lkdGg9IjI0IgogICAgICAgICAgIGlkPSJyZWN0ODI0IgogICAgICAgICAgIH' +
    'g9IjAiCiAgICAgICAgICAgeT0iMCIgLz4KICAgICAgPC9nPgogICAgICA8ZwogICAgICAgIC' +
    'BpZD0iZzgzNCI+CiAgICAgICAgPGcKICAgICAgICAgICBpZD0iZzgyOCIgLz4KICAgICAgIC' +
    'A8ZwogICAgICAgICAgIGlkPSJnMjIyMyI+CiAgICAgICAgICA8ZwogICAgICAgICAgICAgaW' +
    'Q9ImcyMTAxNiI+CiAgICAgICAgICAgIDxnCiAgICAgICAgICAgICAgIHN0eWxlPSJmaWxsOi' +
    'M0NTVhNjQiCiAgICAgICAgICAgICAgIGlkPSJnMTQ5MyIKICAgICAgICAgICAgICAgdHJhbn' +
    'Nmb3JtPSJtYXRyaXgoMy43Nzk1Mjc2LDAsMCwzLjc3OTUyNzYsLTMzLjM1NDMzLC0zMy4zNT' +
    'QzMykiPgogICAgICAgICAgICAgIDxnCiAgICAgICAgICAgICAgICAgaWQ9ImcxNDcxIj4KIC' +
    'AgICAgICAgICAgICAgIDxwYXRoCiAgICAgICAgICAgICAgICAgICBpZD0icmVjdDE0NjkiCi' +
    'AgICAgICAgICAgICAgICAgICBzdHlsZT0iZmlsbDpub25lIgogICAgICAgICAgICAgICAgIC' +
    'AgZD0iTSAwLDAgSCAyNCBWIDI0IEggMCBaIiAvPgogICAgICAgICAgICAgIDwvZz4KICAgIC' +
    'AgICAgICAgICA8ZwogICAgICAgICAgICAgICAgIGlkPSJnMTQ3OSI+CiAgICAgICAgICAgIC' +
    'AgICA8ZwogICAgICAgICAgICAgICAgICAgaWQ9ImcxNDczIiAvPgogICAgICAgICAgICAgIC' +
    'AgPGcKICAgICAgICAgICAgICAgICAgIGlkPSJnMTQ3NyI+CiAgICAgICAgICAgICAgICAgID' +
    'xwYXRoCiAgICAgICAgICAgICAgICAgICAgIGlkPSJwYXRoMTQ3NSIKICAgICAgICAgICAgIC' +
    'AgICAgICAgZD0ibSAxMiwzIGMgLTEuMSwwIC0yLDAuOSAtMiwyIDAsMC4xMiAwLjAxOTMsMC' +
    '4yMjk4NDM4IDAuMDI5MywwLjMzOTg0MzggQyA3LjY4OTI5NjUsNi4xNDk4NDMzIDYsOC4zOC' +
    'A2LDExIHYgOCBjIDAsMS4xIDAuOSwyIDIsMiBoIDggYyAxLjEsMCAyLC0wLjkgMiwtMiBWID' +
    'ExIEMgMTgsOC4zOCAxNi4zMTA3MDMsNi4xNDk4NDMzIDEzLjk3MDcwMyw1LjMzOTg0MzggMT' +
    'MuOTgwNzAzLDUuMjI5ODQzOCAxNCw1LjEyIDE0LDUgMTQsMy45IDEzLjEsMyAxMiwzIFogbS' +
    'AwLDEgYyAwLjU1LDAgMSwwLjQ1IDEsMSAwLDAuMDMgLTAuMDA5NSwwLjA1OTg0NCAtMC4wMT' +
    'k1MywwLjA4OTg0NCBDIDEyLjY2MDQ2OSw1LjAyOTg0MzggMTIuMzQsNSAxMiw1IDExLjY2LD' +
    'UgMTEuMzM5NTMxLDUuMDI5ODQzOCAxMS4wMTk1MzEsNS4wODk4NDM4IDExLjAwOTUzMSw1Lj' +
    'A1OTg0MzggMTEsNS4wMyAxMSw1IDExLDQuNDUgMTEuNDUsNCAxMiw0IFogbSAtMy40NzI2NT' +
    'YyLDYuMzk4NDM4IGggMS4xNTYyNSB2IDIuNjQwNjI0IGggMC4zMDkzMzU0IGwgLTIuMzdlLT' +
    'UsLTEuMTcxMTQ2IDEuMDgyNzEwNSwtMTBlLTcgMC4wMTEsMS4xNzExNDYgaCAwLjMzMzMwNC' +
    'BsIC0wLjAzNTA0LC0yLjU4NzMxNSBoIDAuNTc4MTI1IDAuNTc4MTI1IGwgMC4wMTEwNSwyLj' +
    'U4NzMxNSBoIDAuMzU2MDI0IFYgMTIuMDYwNTQ3IEggMTQuMDYyNSB2IDAuOTc4NTE1IGggMC' +
    '4zMzAwNzggdiAtMi41NTI3MzQgaCAxLjE1NjI1IHYgMi41NTI3MzQgaCAwLjk2Njc5NyB2ID' +
    'AuMzU3NDIyIEggOS42ODM1OTM4IDguNTI3MzQzOCA3LjYwMzUxNTYgdiAtMC4zNTc0MjIgaC' +
    'AwLjkyMzgyODIgeiIKICAgICAgICAgICAgICAgICAgICAgLz4KICAgICAgICAgICAgICAgID' +
    'wvZz4KICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgIDwvZz4KICAgICAgICAgIDwvZz' +
    '4KICAgICAgICA8L2c+CiAgICAgIDwvZz4KICAgIDwvZz4KICA8L2c+Cjwvc3ZnPgo=';

Blockly.Css.register(`
.blocklyBackpack {
  opacity: 0.4;
}
.blocklyBackpackDarken {
  opacity: 0.6;
}
.blocklyBackpack:active {
  opacity: 0.8;
}
`);


/**
 * Custom serializer so that the backpack can save and later recall which
 * blocks have been saved in a workspace.
 */
class BackpackSerializer {
  /**
   * The priority for deserializing block suggestion data.
   * Should be after blocks, procedures, and variables.
   */
  priority = Blockly.serialization.priorities.BLOCKS - 10;

  /**
   * Saves a target workspace's state to serialized JSON.
   * @param workspace the workspace to save
   * @returns the serialized JSON if present
   */
  save(workspace: Blockly.WorkspaceSvg): object[] {
    const componentManager = workspace.getComponentManager();
    const backpack = componentManager.getComponent('backpack') as Backpack;
    return backpack?.getContents().map((text) => JSON.parse(text));
  }

  /**
   * Loads a serialized state into the target workspace.
   * @param state the serialized state JSON
   * @param workspace the workspace to load into
   */
  load(state: object[], workspace: Blockly.WorkspaceSvg) {
    const jsonStrings = state.map((j) => JSON.stringify(j));
    const componentManager = workspace.getComponentManager();
    const backpack = componentManager.getComponent('backpack') as Backpack;
    backpack?.setContents(jsonStrings);
  }

  /**
   * Resets the state of a workspace.
   * @param workspace the workspace to reset
   */
  clear(workspace: Blockly.WorkspaceSvg) {
    const componentManager = workspace.getComponentManager();
    const backpack = componentManager.getComponent('backpack') as Backpack;
    backpack?.empty();
  }
}
