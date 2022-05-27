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
import { assert } from 'chai';


export const DEFAULT_HEIGHT = 5;
export const DEFAULT_WIDTH = 5;
const PIXEL_SIZE = 15;
const FILLED_PIXEL_COLOR = '#363d80';
const EMPTY_PIXEL_COLOR = 'white';

/**
 * Field for inputting a small bitmap image.
 * Includes a grid of clickable pixels that's exported as a bitmap.
 */
export class FieldBitmap extends Blockly.Field {
  /** Constructor for the bitmap field. */
  constructor(value = undefined, validator = undefined, config = undefined) {
    super(value, validator, config);

    // Configure value, height, and width
    if (this.getValue() !== null) {
      this.imgHeight_ = this.getValue().length;
      this.imgWidth_ = this.getValue()[0].length || 0;
    } else {
      this.imgHeight_ = (config && config['height']) || DEFAULT_HEIGHT;
      this.imgWidth_ = (config && config['width']) || DEFAULT_WIDTH;
    }

    // Set a default empty value
    if (this.getValue() === null) {
      this.setValue(this.getEmptyArray_());
    }

    /**
     * Array holding info needed to unbind events.
     * Used for disposing.
     * Ex: [[node, name, func], [node, name, func]].
     * @type {!Array.<Array<?>>}
     * @private
     */
    this.boundEvents_ = [];

    /** References to UI elements */
    this.editorPixels_ = null;
    this.fieldGroup_ = null;
    this.blockDisplayPixels_ = null;

    /** Stateful variables */
    this.mouseIsDown_ = false;
    this.valToPaintWith_ = undefined;
  }

  /**
   * Constructs a FieldBitmap from a JSON arg object.
   * @param {!Object} options A JSON object with options.
   * @return {!FieldBitmap} The new field instance.
   * @package
   * @nocollapse
   */
  static fromJson(options) {
    return new FieldBitmap((options && options['value']), undefined, options);
  }

  /** 
   * Returns the width of the image in pixels. 
   * @return {number} The width in pixels
   */
  getImageWidth() {
    return this.imgWidth_;
  }

  /** 
   * Returns the height of the image in pixels. 
   * @return {number} The height in pixels
   */
  getImageHeight() {
    return this.imgHeight_;
  }

  /**
   * Validates that a new value meets the requirements for a valid bitmap array.
   * @param {*} newValue the new value to be tested
   * @return {Object} the new value if it's valid, or null
   */
  doClassValidation_(newValue = undefined) {
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
    // already has a value
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
   * @param {*} newValue the value that's about to be set
   */
  doValueUpdate_(newValue) {
    super.doValueUpdate_(newValue);
    if (newValue) {
      const newHeight = newValue.length;
      const newWidth = newValue[0] ? newValue[0].length : 0;
      if (this.imgHeight_ !== newHeight || this.imgWidth_ !== newWidth) {
        this.imgHeight_ = newHeight;
        this.imgWidth_ = newWidth;
      }

      this.imgHeight_ = newValue.length;
      this.imgWidth_ = newValue[0] ? newValue[0].length : 0;
    }
  }

  /**
   * Show the bitmap editor dialog
   * @param {!Event=} e Optional mouse event that triggered the field to
   *     open, or undefined if triggered programmatically.
   * @param {boolean=} _quietInput Quiet input.
   * @protected
   */
  showEditor_(e = undefined, _quietInput = undefined) {
    const editor = this.dropdownCreate_();
    Blockly.DropDownDiv.getContentDiv().appendChild(editor);
    Blockly.DropDownDiv.showPositionedByField(
        this, this.dropdownDispose_.bind(this));
  }

  /**
   * Updates the block display and editor dropdown when the field re-renders.
   * @protected
   * @override
   */
  render_() {
    super.render_();

    if (!this.getValue()) {
      return;
    }

    if (this.blockDisplayPixels_) {
      this.forAllCells_((r, c) => {
        const pixel = this.getValue()[r][c];

        if (this.blockDisplayPixels_) {
          this.blockDisplayPixels_[r][c].style.fill =
            pixel ? FILLED_PIXEL_COLOR : EMPTY_PIXEL_COLOR;
        }
        if (this.editorPixels_) {
          this.editorPixels_[r][c].style.background =
            pixel ? FILLED_PIXEL_COLOR : EMPTY_PIXEL_COLOR;
        }
      });
    }
  }

  /**
   * Determines whether the field is editable
   * @return {boolean} true since it is always editable. 
   */
  updateEditable() {
    return true;
  }

  /**
   * Creates the bitmap editor and add event listeners.
   * @return {!Element} The newly created dropdown menu.
   * @private
   */
  dropdownCreate_() {
    const dropdownEditor =
        this.createElementWithClassname_('div', 'dropdownEditor');
    const pixelContainer =
        this.createElementWithClassname_('div', 'pixelContainer');
    dropdownEditor.appendChild(pixelContainer);

    this.bindEvent_(dropdownEditor, 'mouseup', this.onMouseUp_);
    this.bindEvent_(dropdownEditor, 'mouseleave', this.onMouseUp_);

    this.editorPixels_ = [];
    for (let r = 0; r < this.imgHeight_; r++) {
      this.editorPixels_.push([]);
      const rowDiv = this.createElementWithClassname_('div', 'pixelRow');
      for (let c = 0; c < this.imgWidth_; c++) {
        // Add the button to the UI and save a reference to it
        const button = this.createElementWithClassname_('div', 'pixelButton');
        this.editorPixels_[r].push(button);
        rowDiv.appendChild(button);

        // Load the current pixel color
        const pixel = this.getValue()[r][c];
        button.style.background = pixel ? FILLED_PIXEL_COLOR : EMPTY_PIXEL_COLOR;

        // Handle clicking a pixel
        this.bindEvent_(button, 'mousedown', () => {
          this.onMouseDownInPixel_(r, c);
          return true;
        });

        // Handle dragging into a pixel when mouse is down
        this.bindEvent_(button, 'mouseenter', () => {
          this.onMouseEnterPixel_(r, c);
        });
      }
      pixelContainer.appendChild(rowDiv);
    }

    // Add control buttons below the pixel grid
    this.addControlButton_(dropdownEditor, 'Randomize', this.randomizePixels_);
    this.addControlButton_(dropdownEditor, 'Clear', this.clearPixels_);

    if (this.blockDisplayPixels_) {
      this.forAllCells_((r, c) => {
        const pixel = this.getValue()[r][c];

        // if (this.blockDisplayPixels_) {
        //   this.blockDisplayPixels_[r][c].style.fill =
        //     pixel ? FILLED_PIXEL_COLOR : EMPTY_PIXEL_COLOR;
        // }
        if (this.editorPixels_) {
          this.editorPixels_[r][c].style.background =
            pixel ? FILLED_PIXEL_COLOR : EMPTY_PIXEL_COLOR;
        }
      });
    }

    return dropdownEditor;
  }

  /**
   * Initializes the on-block display.
   * @override
   */
  initView() {
    this.blockDisplayPixels_ = [];
    for (let r = 0; r < this.imgHeight_; r++) {
      const row = [];
      for (let c = 0; c < this.imgWidth_; c++) {
        const square = Blockly.utils.dom.createSvgElement(
            'rect', {
              'x': c * PIXEL_SIZE,
              'y': r * PIXEL_SIZE,
              'width': PIXEL_SIZE,
              'height': PIXEL_SIZE,
              'fill': EMPTY_PIXEL_COLOR,
              'fill_opacity': 1,
            },
          this.fieldGroup_);
        
        row.push(square);
      }
      this.blockDisplayPixels_.push(row);
    }
  }

  /**
   * Updates the size of the block based on the size of the underlying image.
   * @override
   * @protected
   */
  updateSize_() {
    {
      const newWidth = PIXEL_SIZE * this.imgWidth_;
      const newHeight = PIXEL_SIZE * this.imgHeight_;
      if (this.borderRect_) {
        this.borderRect_.setAttribute('width', String(newWidth));
        this.borderRect_.setAttribute('height', String(newHeight));
      }

      this.size_.width = newWidth;
      this.size_.height = newHeight;
    }
  }

  /**
   * Creates a button with specified text and action, and adds it to the
   * parent view.
   */
  addControlButton_(parent, buttonText, onClick) {
    const button = this.createElementWithClassname_('button', 'controlButton');
    button.innerHTML = buttonText;
    parent.appendChild(button);
    this.bindEvent_(button, 'click', onClick);
  }

  /**
   * Disposes of events belonging to the bitmap editor.
   * @private
   */
  dropdownDispose_() {
    for (const event of this.boundEvents_) {
      Blockly.browserEvents.unbind(event);
    }
    this.editorPixels_ = null;
  }

  /**
   * Constructs an array of zeros with the specified width and height
   * @return the new value
   */
  getEmptyArray_() {
    const newVal = [];
    for (let r = 0; r < this.imgWidth_; r++) {
      newVal.push([]);
      for (let c = 0; c < this.imgHeight_; c++) {
        newVal[r].push(0);
      }
    }
    return newVal;
  }

  /**
   * Called when a mousedown event occurs within the bounds of a pixel.
   * @private
   */
  onMouseDownInPixel_(r, c) {
    // Toggle that pixel to the opposite of its value
    const newPixelValue = 1 - this.getValue()[r][c];
    this.setPixel_(r, c, newPixelValue);
    this.mouseIsDown_ = true;
    this.valToPaintWith_ = newPixelValue;
  }

  /**
   * Called when the mouse drags over a pixel in the editor.
   * @private
   */
  onMouseEnterPixel_(r, c) {
    if (!this.mouseIsDown_) {
      return;
    }
    if (this.getValue()[r][c] !== this.valToPaintWith_) {
      this.setPixel_(r, c, this.valToPaintWith_);
    }
  }

  /**
   * Resets mouse state (e.g. after either a mouseup event or if the mouse
   * leaves the editor area).
   * @private
   */
  onMouseUp_() {
    this.mouseIsDown_ = false;
    this.valToPaintWith_ = undefined;
  }

  /**
   * Sets all the pixels in the image to a random value
   * @private
   */
  randomizePixels_() {
    const getRandBinary = () => Math.floor(Math.random() * 2);
    const newVal = this.getEmptyArray_();
    this.forAllCells_((r, c) => {
      newVal[r][c] = getRandBinary();
    });
    this.setValue(newVal);
  }

  /**
   * Sets all the pixels to 0
   * @private
   */
  clearPixels_() {
    const newVal = this.getEmptyArray_();
    this.forAllCells_((r, c) => {
      newVal[r][c] = 0;
    });
    this.setValue(newVal);
  }

  /**
   * Sets the value of a particular pixel
   * @private
   */
  setPixel_(r, c, newValue) {
    const newGrid = JSON.parse(JSON.stringify(this.getValue()));
    newGrid[r][c] = newValue;
    this.setValue(newGrid);
  }

  /**
   * Calls a given function for all cells in the image, with the cell
   * coordinates as the arguments.
   * @param {*} func a function to be applied
   */
  forAllCells_(func) {
    for (let r = 0; r < this.imgHeight_; r++) {
      for (let c = 0; c < this.imgWidth_; c++) {
        func(r, c);
      }
    }
  }

  /**
   * Creates a new element with the specified type and class
   * @return the created element
   */
  createElementWithClassname_(elementType, className) {
    const newElt = document.createElement(elementType);
    newElt.className = className;
    return newElt;
  }

  /** Binds an event listener to the specified element */
  bindEvent_(element, eventName, callback) {
    this.boundEvents_.push(Blockly.browserEvents.conditionalBind(
        element, eventName, this, callback));
  }
}

FieldBitmap.prototype.SERIALIZABLE = true;

Blockly.fieldRegistry.register('field_bitmap', FieldBitmap);

/**
 * CSS for bitmap field.
 */
Blockly.Css.register([
  /* eslint-disable indent */
  `.dropdownEditor {
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
    border: 1px solid black;
  }
  .pixelDisplay {
    white-space:pre-wrap;
  }
  .controlButton {
    margin: 5px 0;
  }`,
  /* eslint-enable indent */
]);
