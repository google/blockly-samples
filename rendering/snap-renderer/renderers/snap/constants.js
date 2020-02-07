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
 * @fileoverview An object that provides constants for rendering blocks in Zelos
 * mode.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

/**
 * An object that provides constants for rendering blocks in Zelos mode.
 * @constructor
 * @package
 * @extends {Blockly.blockRendering.ConstantProvider}
 */
Blockly.snap.ConstantProvider = function () {
  Blockly.snap.ConstantProvider.superClass_.constructor.call(this);

  /**
   * @override
   */
  this.FIELD_BORDER_RECT_RADIUS = 0;

  /**
   * @override
   */
  this.FIELD_DROPDOWN_SVG_ARROW = false;

  /**
   * @override
   */
  this.FIELD_TEXTINPUT_BOX_SHADOW = false;

  /**
   * @override
   */
  this.FIELD_DROPDOWN_COLOURED_DIV = false;

  /**
   * @override
   */
  this.FIELD_DROPDOWN_BORDER_RECT_HEIGHT = 6 * this.GRID_UNIT;

  /**
   * @override
   */
  this.MIN_BLOCK_HEIGHT = 10 * this.GRID_UNIT;

  /**
   * @override
   */
  this.DUMMY_INPUT_MIN_HEIGHT = 6 * this.GRID_UNIT;

  /**
   * @override
   */
  this.DUMMY_INPUT_SHADOW_MIN_HEIGHT = 3 * this.GRID_UNIT;

  this.INSERTION_MARKER_HOVER_OFFSET = 10;

  this.INSERTION_MARKER_HOVER_RADIUS = 4;

  /**
   * @override
   */
  this.NOTCH_WIDTH = 7 * this.GRID_UNIT;

  this.NOTCH_HEIGHT = this.GRID_UNIT * 1.5;
};
Blockly.utils.object.inherits(Blockly.snap.ConstantProvider,
  Blockly.zelos.ConstantProvider);


/**
 * @override
 */
Blockly.snap.ConstantProvider.prototype.makeNotch = function() {
  var width = this.NOTCH_WIDTH;
  var height = this.NOTCH_HEIGHT;

  var innerWidth = width / 2;
  var curveWidth = width / 4;

  var halfHeight = height / 2;
  var quarterHeight = halfHeight / 2;

  function makeMainPath(dir) {
    return (
      Blockly.utils.svgPaths.line([
        Blockly.utils.svgPaths.point(0, 0)
      ]) +
      Blockly.utils.svgPaths.line([
        Blockly.utils.svgPaths.point(dir * curveWidth,
            height)
      ]) +
      Blockly.utils.svgPaths.lineOnAxis('h', dir * innerWidth) +
      
      Blockly.utils.svgPaths.line([
        Blockly.utils.svgPaths.point(dir * curveWidth, -height)
      ])
    );
  }

  var pathLeft = makeMainPath(1);
  var pathRight = makeMainPath(-1);

  return {
    type: this.SHAPES.NOTCH,
    width: width,
    height: height,
    pathLeft: pathLeft,
    pathRight: pathRight
  };
};

/**
 * Create sizing and path information about a rounded shape.
 * @return {!Object} An object containing sizing and path information about
 *     a rounded shape for connections.
 * @package
 */
Blockly.snap.ConstantProvider.prototype.makeRounded = function () {
  var maxHeight = 40;
  // The main path for the rounded connection shape is made out of a single arc.
  // The arc is defined with relative positions and requires the block height.
  // The 'up' and 'down' versions of the paths are the same, but the Y sign
  // flips.  The 'up' and 'right' versions of the path flip the sweep-flag
  // which moves the arc at negative angles.
  function makeMainPath(blockHeight, up, right) {
    var height = blockHeight > maxHeight ? maxHeight : blockHeight;
    var innerHeight = blockHeight > maxHeight ? blockHeight - maxHeight : 0;
    var radius = height / 2;
    return Blockly.utils.svgPaths.arc('a', '0 0,1', radius,
      Blockly.utils.svgPaths.point((up ? -1 : 1) * radius, (up ? -1 : 1) * radius)) +
      Blockly.utils.svgPaths.lineOnAxis('v', (right ? 1 : -1) * innerHeight) +
      Blockly.utils.svgPaths.arc('a', '0 0,1', radius,
        Blockly.utils.svgPaths.point((up ? 1 : -1) * radius, (up ? -1 : 1) * radius));
  }

  return {
    type: this.SHAPES.ROUND,
    isDynamic: true,
    width: function (height) {
      return height / 2;
    },
    height: function (height) {
      return height;
    },
    connectionOffsetY: function (connectionHeight) {
      return connectionHeight / 2;
    },
    connectionOffsetX: function (connectionWidth) {
      return - connectionWidth;
    },
    pathDown: function (height) {
      return makeMainPath(height, false, false);
    },
    pathUp: function (height) {
      return makeMainPath(height, true, false);
    },
    pathRightDown: function (height) {
      return makeMainPath(height, false, true);
    },
    pathRightUp: function (height) {
      return makeMainPath(height, false, true);
    },
  };
};

/**
 * @override
 */
Blockly.snap.ConstantProvider.prototype.createDom = function (svg) {
  Blockly.snap.ConstantProvider.superClass_.createDom.call(this, svg);

  var defs = Blockly.utils.dom.createSvgElement('defs', {}, svg);
  var draggingShadowFilter = Blockly.utils.dom.createSvgElement('filter',
    {
      'id': 'blocklyDraggingShadowFilter' + this.randomIdentifier_,
    },
    defs);
  Blockly.utils.dom.createSvgElement('feDropShadow',
    {
      'result': 'offOut',
      'in': 'SourceGraphic',
      'dx': 5,
      'dy': 5,
      'stdDeviation': 0.5
    },
    draggingShadowFilter);

  this.draggingShadowFilterId = draggingShadowFilter.id;
};

/**
 * @override
 */
Blockly.snap.ConstantProvider.prototype.getCSS_ = function (name) {
  var selector = '.' + name + '-renderer';
  return [
    /* eslint-disable indent */
    // Fields.
    selector + ' .blocklyText {',
    'fill: #fff;',
    'font-family: ' + this.FIELD_TEXT_FONTFAMILY + ';',
    'font-size: ' + this.FIELD_TEXT_FONTSIZE + 'pt;',
    'font-weight: ' + this.FIELD_TEXT_FONTWEIGHT + ';',
    '}',
    selector + ' .blocklyNonEditableText>rect:not(.blocklyDropdownRect),',
    selector + ' .blocklyEditableText>rect:not(.blocklyDropdownRect) {',
    'fill: ' + this.FIELD_BORDER_RECT_COLOUR + ';',
    '}',
    selector + ' .blocklyNonEditableText>rect.blocklyDropdownRect,',
    selector + ' .blocklyEditableText>rect.blocklyDropdownRect {',
    'fill: rgba(0,0,0,0.3);',
    '}',
    selector + ' .blocklyNonEditableText>text,',
    selector + ' .blocklyEditableText>text,',
    selector + ' .blocklyNonEditableText>g>text,',
    selector + ' .blocklyEditableText>g>text {',
    'fill: #000;',
    '}',

    // Text field input.
    selector + ' .blocklyHtmlInput {',
    'font-family: ' + this.FIELD_TEXT_FONTFAMILY + ';',
    'font-weight: ' + this.FIELD_TEXT_FONTWEIGHT + ';',
    'color: #000;',
    '}',
    // Text field input selection.
    selector + ' .blocklyHtmlInput::selection {',
    'background: #3C3C78;',
    'color: #fff;',
    '}',

    // Dropdown field.
    selector + ' .blocklyDropdownText {',
    'fill: #fff !important;',
    '}',
    // Widget and Dropdown Div
    selector + '.blocklyWidgetDiv .goog-menuitem,',
    selector + '.blocklyDropDownDiv .goog-menuitem {',
    'font-family: ' + this.FIELD_TEXT_FONTFAMILY + ';',
    '}',

    // Connection highlight.
    selector + ' .blocklyHighlightedConnectionPath {',
    'stroke: #fff200;',
    '}',

    // Disabled outline paths.
    selector + ' .blocklyDisabled > .blocklyOutlinePath {',
      'fill: url(#blocklyDisabledPattern' + this.randomIdentifier_ + ')',
    '}',

    // Dragging
    selector + ' .blocklyDragging>.blocklyPath {',
      'filter: url(#blocklyDraggingShadowFilter' + this.randomIdentifier_ + ')',
    '}',
    selector + ' .blocklyDragging .blocklyDragging>.blocklyPath {',
      'filter: none;',
    '}',
    /* eslint-enable indent */
  ];
};
