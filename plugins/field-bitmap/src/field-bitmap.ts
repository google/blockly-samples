/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Bitmap input field.
 * @author gregoryc@outlook.com (Greg Cannon)
 */

import Blockly from 'blockly/core';

export const DEFAULT_HEIGHT = 5;
export const DEFAULT_WIDTH = 5;
const PIXEL_SIZE = 15;
const FILLED_PIXEL_COLOR = '#363d80';
const EMPTY_PIXEL_COLOR = '#fff';

/**
 * Field for inputting a small bitmap image.
 * Includes a grid of clickable pixels that's exported as a bitmap.
 */
export class FieldBitmap extends Blockly.Field<number[][]> {
  private initialValue: number[][] | null = null;
  private imgHeight: number;
  private imgWidth: number;
  /**
   * Array holding info needed to unbind events.
   * Used for disposing.
   */
  private boundEvents: Blockly.browserEvents.Data[] = [];
  /** References to UI elements */
  private editorPixels: HTMLElement[][] | null = null;
  private blockDisplayPixels: SVGElement[][] | null = null;
  /** Stateful variables */
  private mouseIsDown = false;
  private valToPaintWith?: number;

  /**
   * Constructor for the bitmap field.
   *
   * @param value 2D rectangular array of 1s and 0s.
   * @param validator A function that is called to validate.
   * @param config Config A map of options used to configure the field.
   */
  constructor(
    value: number[][] | typeof Blockly.Field.SKIP_SETUP,
    validator?: Blockly.FieldValidator<number[][]>,
    config?: FieldBitmapFromJsonConfig,
  ) {
    super(value, validator, config);

    this.SERIALIZABLE = true;
    this.CURSOR = 'default';

    // Configure value, height, and width
    const currentValue = this.getValue();
    if (currentValue !== null) {
      this.imgHeight = currentValue.length;
      this.imgWidth = currentValue[0].length || 0;
    } else {
      this.imgHeight = config?.height ?? DEFAULT_HEIGHT;
      this.imgWidth = config?.width ?? DEFAULT_WIDTH;
      // Set a default empty value
      this.setValue(this.getEmptyArray());
    }
  }

  /**
   * Constructs a FieldBitmap from a JSON arg object.
   *
   * @param options A JSON object with options.
   * @returns The new field instance.
   */
  static fromJson(options: FieldBitmapFromJsonConfig) {
    // `this` might be a subclass of FieldBitmap if that class doesn't override the static fromJson method.
    return new this(
      options.value ?? Blockly.Field.SKIP_SETUP,
      undefined,
      options,
    );
  }

  /**
   * Returns the width of the image in pixels.
   *
   * @returns The width in pixels.
   */
  getImageWidth() {
    return this.imgWidth;
  }

  /**
   * Returns the height of the image in pixels.
   *
   * @returns The height in pixels.
   */
  getImageHeight() {
    return this.imgHeight;
  }

  /**
   * Validates that a new value meets the requirements for a valid bitmap array.
   *
   * @param newValue The new value to be tested.
   * @returns The new value if it's valid, or null.
   */
  protected override doClassValidation_(newValue: unknown = undefined) {
    if (!newValue) {
      return null;
    }
    // Check if the new value is an array
    if (!Array.isArray(newValue)) {
      return null;
    }
    const newHeight = newValue.length;
    // The empty list is not an acceptable bitmap
    if (newHeight == 0) {
      return null;
    }

    // Check that the width matches the existing width of the image if it
    // already has a value.
    const newWidth = newValue[0].length;
    for (const row of newValue) {
      if (!Array.isArray(row)) {
        return null;
      }
      if (row.length !== newWidth) {
        return null;
      }
    }

    // Check if all contents of the arrays are either 0 or 1
    for (const row of newValue) {
      for (const cell of row) {
        if (cell !== 0 && cell !== 1) {
          return null;
        }
      }
    }
    return newValue;
  }

  /**
   * Called when a new value has been validated and is about to be set.
   *
   * @param newValue The value that's about to be set.
   */
  protected override doValueUpdate_(newValue: number[][]) {
    super.doValueUpdate_(newValue);
    if (newValue) {
      this.imgHeight = newValue.length;
      this.imgWidth = newValue[0] ? newValue[0].length : 0;
    }
  }

  /**
   * Show the bitmap editor dialog.
   *
   * @param e Optional mouse event that triggered the field to open, or
   *    undefined if triggered programmatically.
   */
  protected override showEditor_(e?: Event) {
    const editor = this.dropdownCreate_();
    Blockly.DropDownDiv.getContentDiv().appendChild(editor);
    Blockly.DropDownDiv.showPositionedByField(
      this,
      this.dropdownDispose.bind(this),
    );
  }

  /**
   * Updates the block display and editor dropdown when the field re-renders.
   */
  protected override render_() {
    super.render_();

    if (!this.getValue()) {
      return;
    }

    if (this.blockDisplayPixels) {
      this.forAllCells((r, c) => {
        const pixel = this.getPixel(r, c);

        if (this.blockDisplayPixels) {
          this.blockDisplayPixels[r][c].style.fill = pixel
            ? FILLED_PIXEL_COLOR
            : EMPTY_PIXEL_COLOR;
        }
        if (this.editorPixels) {
          this.editorPixels[r][c].style.background = pixel
            ? FILLED_PIXEL_COLOR
            : EMPTY_PIXEL_COLOR;
        }
      });
    }
  }

  /**
   * Determines whether the field is editable.
   *
   * @returns True since it is always editable.
   */
  override updateEditable() {
    const editable = super.updateEditable();
    // Blockly.Field's implementation sets these classes as appropriate, but
    // since this field has no text they just mess up the rendering of the grid
    // lines.
    const svgRoot = this.getSvgRoot();
    if (svgRoot) {
      Blockly.utils.dom.removeClass(svgRoot, 'blocklyNonEditableText');
      Blockly.utils.dom.removeClass(svgRoot, 'blocklyEditableText');
    }
    return editable;
  }

  /**
   * Gets the rectangle built out of dimensions matching SVG's <g> element.
   *
   * @returns The newly created rectangle of same size as the SVG element.
   */
  override getScaledBBox() {
    const boundingBox = this.getSvgRoot()?.getBoundingClientRect();
    if (!boundingBox) {
      throw new Error('Tried to retrieve a bounding box without a rect');
    }
    return new Blockly.utils.Rect(
      boundingBox.top,
      boundingBox.bottom,
      boundingBox.left,
      boundingBox.right,
    );
  }

  /**
   * Creates the bitmap editor and add event listeners.
   *
   * @returns The newly created dropdown menu.
   */
  private dropdownCreate_() {
    const dropdownEditor = this.createElementWithClassname(
      'div',
      'dropdownEditor',
    );
    const pixelContainer = this.createElementWithClassname(
      'div',
      'pixelContainer',
    );
    dropdownEditor.appendChild(pixelContainer);

    this.bindEvent(dropdownEditor, 'mouseup', this.onMouseUp);
    this.bindEvent(dropdownEditor, 'mouseleave', this.onMouseUp);
    this.bindEvent(dropdownEditor, 'dragstart', (e: Event) => {
      e.preventDefault();
    });

    this.editorPixels = [];
    for (let r = 0; r < this.imgHeight; r++) {
      this.editorPixels.push([]);
      const rowDiv = this.createElementWithClassname('div', 'pixelRow');
      for (let c = 0; c < this.imgWidth; c++) {
        // Add the button to the UI and save a reference to it
        const button = this.createElementWithClassname('div', 'pixelButton');
        this.editorPixels[r].push(button);
        rowDiv.appendChild(button);

        // Load the current pixel color
        const isOn = this.getPixel(r, c);
        button.style.background = isOn ? FILLED_PIXEL_COLOR : EMPTY_PIXEL_COLOR;

        // Handle clicking a pixel
        this.bindEvent(button, 'mousedown', () => {
          this.onMouseDownInPixel(r, c);
          return true;
        });

        // Handle dragging into a pixel when mouse is down
        this.bindEvent(button, 'mouseenter', () => {
          this.onMouseEnterPixel(r, c);
        });
      }
      pixelContainer.appendChild(rowDiv);
    }

    // Add control buttons below the pixel grid
    this.addControlButton(dropdownEditor, 'Randomize', this.randomizePixels);
    this.addControlButton(dropdownEditor, 'Clear', this.clearPixels);

    if (this.blockDisplayPixels) {
      this.forAllCells((r, c) => {
        const pixel = this.getPixel(r, c);
        if (this.editorPixels) {
          this.editorPixels[r][c].style.background = pixel
            ? FILLED_PIXEL_COLOR
            : EMPTY_PIXEL_COLOR;
        }
      });
    }

    // Store the initial value at the start of the edit.
    this.initialValue = this.getValue();

    return dropdownEditor;
  }

  /**
   * Initializes the on-block display.
   */
  override initView() {
    this.blockDisplayPixels = [];
    for (let r = 0; r < this.imgHeight; r++) {
      const row = [];
      for (let c = 0; c < this.imgWidth; c++) {
        const square = Blockly.utils.dom.createSvgElement(
          'rect',
          {
            x: c * PIXEL_SIZE,
            y: r * PIXEL_SIZE,
            width: PIXEL_SIZE,
            height: PIXEL_SIZE,
            fill: EMPTY_PIXEL_COLOR,
            fill_opacity: 1,
          },
          this.getSvgRoot(),
        );
        row.push(square);
      }
      this.blockDisplayPixels.push(row);
    }
  }

  /**
   * Updates the size of the block based on the size of the underlying image.
   */
  protected override updateSize_() {
    {
      const newWidth = PIXEL_SIZE * this.imgWidth;
      const newHeight = PIXEL_SIZE * this.imgHeight;
      if (this.borderRect_) {
        this.borderRect_.setAttribute('width', String(newWidth));
        this.borderRect_.setAttribute('height', String(newHeight));
      }

      this.size_.width = newWidth;
      this.size_.height = newHeight;
    }
  }

  /**
   * Create control button.
   *
   * @param parent Parent HTML element to which control button will be added.
   * @param buttonText Text of the control button.
   * @param onClick Callback that will be attached to the control button.
   */
  private addControlButton(
    parent: HTMLElement,
    buttonText: string,
    onClick: () => void,
  ) {
    const button = this.createElementWithClassname('button', 'controlButton');
    button.innerText = buttonText;
    parent.appendChild(button);
    this.bindEvent(button, 'click', onClick);
  }

  /**
   * Disposes of events belonging to the bitmap editor.
   */
  private dropdownDispose() {
    if (
      this.getSourceBlock() &&
      this.initialValue !== null &&
      this.initialValue !== this.getValue()
    ) {
      Blockly.Events.fire(
        new (Blockly.Events.get(Blockly.Events.BLOCK_CHANGE))(
          this.sourceBlock_,
          'field',
          this.name || null,
          this.initialValue,
          this.getValue(),
        ),
      );
    }

    for (const event of this.boundEvents) {
      Blockly.browserEvents.unbind(event);
    }
    this.boundEvents.length = 0;
    this.editorPixels = null;
    // Set this.initialValue back to null.
    this.initialValue = null;
  }

  /**
   * Constructs an array of zeros with the specified width and height.
   *
   * @returns The new value.
   */
  private getEmptyArray(): number[][] {
    const newVal: number[][] = [];
    for (let r = 0; r < this.imgHeight; r++) {
      newVal.push([]);
      for (let c = 0; c < this.imgWidth; c++) {
        newVal[r].push(0);
      }
    }
    return newVal;
  }

  /**
   * Called when a mousedown event occurs within the bounds of a pixel.
   *
   * @param r Row number of grid.
   * @param c Column number of grid.
   */
  private onMouseDownInPixel(r: number, c: number) {
    // Toggle that pixel to the opposite of its value
    const newPixelValue = 1 - this.getPixel(r, c);
    this.setPixel(r, c, newPixelValue);
    this.mouseIsDown = true;
    this.valToPaintWith = newPixelValue;
  }

  /**
   * Called when the mouse drags over a pixel in the editor.
   *
   * @param r Row number of grid.
   * @param c Column number of grid.
   */
  private onMouseEnterPixel(r: number, c: number) {
    if (!this.mouseIsDown) {
      return;
    }
    if (
      this.valToPaintWith !== undefined &&
      this.getPixel(r, c) !== this.valToPaintWith
    ) {
      this.setPixel(r, c, this.valToPaintWith);
    }
  }

  /**
   * Resets mouse state (e.g. After either a mouseup event or if the mouse
   * leaves the editor area).
   */
  private onMouseUp() {
    this.mouseIsDown = false;
    this.valToPaintWith = undefined;
  }

  /**
   * Sets all the pixels in the image to a random value.
   */
  private randomizePixels() {
    const getRandBinary = () => Math.floor(Math.random() * 2);
    this.forAllCells((r, c) => {
      this.setPixel(r, c, getRandBinary());
    });
  }

  /**
   * Sets all the pixels to 0.
   */
  private clearPixels() {
    const cleared = this.getEmptyArray();
    this.fireIntermediateChangeEvent(cleared);
    this.setValue(cleared, false);
  }

  /**
   * Sets the value of a particular pixel.
   *
   * @param r Row number of grid.
   * @param c Column number of grid.
   * @param newValue Value of the pixel.
   */
  private setPixel(r: number, c: number, newValue: number) {
    const newGrid = JSON.parse(JSON.stringify(this.getValue()));
    newGrid[r][c] = newValue;
    this.fireIntermediateChangeEvent(newGrid);
    this.setValue(newGrid, false);
  }

  private getPixel(row: number, column: number): number {
    const value = this.getValue();
    if (!value) {
      throw new Error(
        'Attempted to retrieve a pixel value when no value is set',
      );
    }

    return value[row][column];
  }

  /**
   * Calls a given function for all cells in the image, with the cell
   * coordinates as the arguments.
   *
   * @param func A function to be applied.
   */
  private forAllCells(func: (row: number, col: number) => void) {
    for (let r = 0; r < this.imgHeight; r++) {
      for (let c = 0; c < this.imgWidth; c++) {
        func(r, c);
      }
    }
  }

  /**
   * Creates a new element with the specified type and class.
   *
   * @param elementType Type of html element.
   * @param className ClassName of html element.
   * @returns The created element.
   */
  private createElementWithClassname(elementType: string, className: string) {
    const newElt = document.createElement(elementType);
    newElt.className = className;
    return newElt;
  }

  /**
   * Binds an event listener to the specified element.
   *
   * @param element Specified element.
   * @param eventName Name of the event to bind.
   * @param callback Function to be called on specified event.
   */
  private bindEvent(
    element: HTMLElement,
    eventName: string,
    callback: (e: Event) => void,
  ) {
    this.boundEvents.push(
      Blockly.browserEvents.conditionalBind(element, eventName, this, callback),
    );
  }

  private fireIntermediateChangeEvent(newValue: number[][]) {
    if (this.getSourceBlock()) {
      Blockly.Events.fire(
        new (Blockly.Events.get(
          Blockly.Events.BLOCK_FIELD_INTERMEDIATE_CHANGE,
        ))(this.getSourceBlock(), this.name || null, this.getValue(), newValue),
      );
    }
  }
}

export interface FieldBitmapFromJsonConfig extends Blockly.FieldConfig {
  value?: number[][];
  width?: number;
  height?: number;
}

Blockly.fieldRegistry.register('field_bitmap', FieldBitmap);

/**
 * CSS for bitmap field.
 */
Blockly.Css.register(`
.dropdownEditor {
  align-items: center;
  flex-direction: column;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
.pixelContainer {
  margin: 20px;
}
.pixelRow {
  display: flex;
  flex-direction: row;
  padding: 0;
  margin: 0;
  height: ${PIXEL_SIZE}
}
.pixelButton {
  width: ${PIXEL_SIZE}px;
  height: ${PIXEL_SIZE}px;
  border: 1px solid #000;
}
.pixelDisplay {
  white-space:pre-wrap;
}
.controlButton {
  margin: 5px 0;
}
`);
