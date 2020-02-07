/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview An object that owns a block's rendering SVG elements.
 * @author samelh@google.com (Sam El-Husseini)
 */

'use strict';

/**
 * An object that handles creating and setting each of the SVG elements
 * used by the renderer.
 * @param {!SVGElement} root The root SVG element.
 * @param {!Blockly.Theme.BlockStyle} style The style object to use for
 *     colouring.
 * @param {!Blockly.zelos.ConstantProvider} constants The renderer's constants.
 * @constructor
 * @extends {Blockly.zelos.PathObject}
 * @package
 */
Blockly.snap.PathObject = function(root, style, constants) {
  Blockly.snap.PathObject.superClass_.constructor.call(this, root, style,
      constants);
  
  /**
   * A cache of the associated block height.
   * @type {number}
   * @private
   */
  this.height_ = 0;
  
  /**
   * A cache of the associated block width.
   * @type {number}
   * @private
   */
  this.width_ = 0;

  this.svgReplacementPath_ = Blockly.utils.dom.createSvgElement('rect',
    {
      'class': 'blocklyReplacementPath',
      'style': 'display:none',
      'x': -this.constants_.INSERTION_MARKER_HOVER_OFFSET,
      'y': -this.constants_.INSERTION_MARKER_HOVER_OFFSET,
      'rx': this.constants_.INSERTION_MARKER_HOVER_RADIUS,
      'ry': this.constants_.INSERTION_MARKER_HOVER_RADIUS
    },
    this.svgRoot);

  this.outlineDimensions_ = {};
};
Blockly.utils.object.inherits(Blockly.snap.PathObject,
    Blockly.zelos.PathObject);


/**
 * @override
 */
Blockly.snap.PathObject.prototype.setPath = function(pathString) {
  Blockly.snap.PathObject.superClass_.setPath.call(this, pathString);
  if (this.svgPathDragging_) {
    this.svgPathDragging_.setAttribute('d', pathString);
  }
};

/**
 * @override
 */
Blockly.snap.PathObject.prototype.applyColour = function(block) {
  Blockly.snap.PathObject.superClass_.applyColour.call(this, block);
  var heightWidth = block.getHeightWidth();
  this.height_ = heightWidth.height;
  this.width_ = heightWidth.width;
};

/**
 * @override
 */
Blockly.snap.PathObject.prototype.updateSelected = function(enable) {
  this.setClass_('blocklySelected', enable);
};

/**
 * @override
 */
Blockly.snap.PathObject.prototype.updateReplacementHighlight = function(
    enable) {
  this.setClass_('blocklyReplaceable', enable);
  var offset = this.constants_.INSERTION_MARKER_HOVER_OFFSET;
  if (enable) {
    this.svgReplacementPath_.style.display = 'block';
    this.svgReplacementPath_.setAttribute('x', -offset);
    this.svgReplacementPath_.setAttribute('y', -offset);
    this.svgReplacementPath_.setAttribute('width', this.width_ + offset * 2);
    this.svgReplacementPath_.setAttribute('height', this.height_ + offset * 2);
  } else {
    this.svgReplacementPath_.style.display = 'none';
  }
};

/**
 * Add or remove styling showing that a block is an insertion marker.
 * @param {boolean} enable True if the block is an insertion marker, false
 *     otherwise.
 * @package
 */
Blockly.snap.PathObject.prototype.setOutlineDimensions = function(name, x, y, width, height) {
  this.outlineDimensions_[name] = [x, y, width, height];
};

/**
 * @override
 */
Blockly.snap.PathObject.prototype.updateShapeForInputHighlight = function(
    conn, enable) {
  var name = conn.getParentInput().name;
  if (this.outlineDimensions_[name]) {
    var dimensions = this.outlineDimensions_[name];
    var offset = this.constants_.INSERTION_MARKER_HOVER_OFFSET;
    if (enable) {
      this.svgReplacementPath_.style.display = 'block';
      this.svgReplacementPath_.setAttribute('x', dimensions[0] - offset);
      this.svgReplacementPath_.setAttribute('y', dimensions[1] - offset);
      this.svgReplacementPath_.setAttribute('width', dimensions[2] + offset * 2);
      this.svgReplacementPath_.setAttribute('height', dimensions[3] + offset * 2);
    } else {
      this.svgReplacementPath_.style.display = 'none';
    }
  }
};

/**
 * CSS for angle field.  See css.js for use.
 */
Blockly.Css.register([
  /* eslint-disable indent */
  '.blocklyReplacementPath {',
    'stroke: #fff;',
    'stroke-width: 2;',
    'fill: #fff;',
    'fill-opacity: .5;',
  '}',
  /* eslint-enable indent */
]);
