/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The full custom renderer built during the custom renderer
 * codelab, in ES5 syntax.
 * @author fenichel@google.com (Rachel Fenichel)
 */

CustomRenderer = function(name) {
  CustomRenderer.superClass_.constructor.call(this, name);
};
Blockly.utils.object.inherits(CustomRenderer,
    Blockly.blockRendering.Renderer);

CustomRenderer.prototype.makeConstants_ = function() {
  return new CustomConstantsProvider();
};
Blockly.blockRendering.register('custom_renderer', CustomRenderer);


CustomConstantsProvider = function() {
  // Set up all of the constants from the base provider.
  CustomConstantsProvider.superClass_.constructor.call(this);

  // Override a few properties.
  /**
   * The width of the notch used for previous and next connections.
   * @type {number}
   * @override
   */
  this.NOTCH_WIDTH = 20;

  /**
   * The height of the notch used for previous and next connections.
   * @type {number}
   * @override
   */
  this.NOTCH_HEIGHT = 10;

  /**
   * Rounded corner radius.
   * @type {number}
   * @override
   */
  this.CORNER_RADIUS = 2;
  /**
   * The height of the puzzle tab used for input and output connections.
   * @type {number}
   * @override
   */
  this.TAB_HEIGHT = 8;
};
Blockly.utils.object.inherits(CustomConstantsProvider,
    Blockly.blockRendering.ConstantProvider);

/**
 * @override
 */
CustomConstantsProvider.prototype.init = function() {
  CustomConstantsProvider.superClass_.init.call(this);
  // Add calls to create shape objects for the new connection shapes.
  this.RECT_PREV_NEXT = this.makeRectangularPreviousConn();
  this.RECT_INPUT_OUTPUT = this.makeRectangularInputConn();
};

/**
 * @override
 */
CustomConstantsProvider.prototype.shapeFor = function(connection) {
  var checks = connection.getCheck();
  switch (connection.type) {
    case Blockly.INPUT_VALUE:
    case Blockly.OUTPUT_VALUE:
      // Includes doesn't work in IE.
      if (checks && checks.indexOf('Number') != -1) {
        return this.RECT_INPUT_OUTPUT;
      }
      if (checks && checks.indexOf('String') != -1) {
        return this.RECT_INPUT_OUTPUT;
      }
      return this.PUZZLE_TAB;
    case Blockly.PREVIOUS_STATEMENT:
    case Blockly.NEXT_STATEMENT:
      return this.NOTCH;
    default:
      throw Error('Unknown type');
  }
};

/**
 * Return a rectangular notch for use with previous and next connections.
 */
CustomConstantsProvider.prototype.makeRectangularPreviousConn = function() {
  var width = this.NOTCH_WIDTH;
  var height = this.NOTCH_HEIGHT;

  /**
   * Since previous and next connections share the same shape
   * you can define a function to generate the path for both.
   */
  function makeMainPath(dir) {
    return Blockly.utils.svgPaths.line(
        [
          Blockly.utils.svgPaths.point(0, height),
          Blockly.utils.svgPaths.point(dir * width, 0),
          Blockly.utils.svgPaths.point(0, -height)
        ]);
  }
  var pathLeft = makeMainPath(1);
  var pathRight = makeMainPath(-1);

  return {
    width: width,
    height: height,
    pathLeft: pathLeft,
    pathRight: pathRight
  };
};

/**
 * Return a rectangular puzzle tab for use with input and output connections.
 */
CustomConstantsProvider.prototype.makeRectangularInputConn = function() {
  var width = this.TAB_WIDTH;
  var height = this.TAB_HEIGHT;

  /**
   * Since input and output connections share the same shape you can
   * define a function to generate the path for both.
   */
  function makeMainPath(up) {
    return Blockly.utils.svgPaths.line(
        [
          Blockly.utils.svgPaths.point(-width, 0),
          Blockly.utils.svgPaths.point(0, -1 * up * height),
          Blockly.utils.svgPaths.point(width, 0)
        ]);
  }

  var pathUp = makeMainPath(1);
  var pathDown = makeMainPath(-1);

  return {
    width: width,
    height: height,
    pathDown: pathDown,
    pathUp: pathUp
  };
};
