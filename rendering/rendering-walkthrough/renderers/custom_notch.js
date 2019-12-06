
CustomNotchRenderer = function(name) {
  CustomNotchRenderer.superClass_.constructor.call(this, name);
};
Blockly.utils.object.inherits(CustomNotchRenderer,
    Blockly.blockRendering.Renderer);

Blockly.blockRendering.register('custom_notch',
    CustomNotchRenderer);

CustomNotchProvider = function() {
  CustomNotchProvider.superClass_.constructor.call(this);
  this.NOTCH_WIDTH = 20;
  this.NOTCH_HEIGHT = 10;
};
Blockly.utils.object.inherits(CustomNotchProvider,
    Blockly.blockRendering.ConstantProvider);

CustomNotchRenderer.prototype.makeConstants_ = function() {
  return new CustomNotchProvider();
};

// New code is below this line.

/**
 * Override the `makeNotch` function to return a rectangular notch for previous
 * and next connections.
 * @override
 */
CustomNotchProvider.prototype.makeNotch = function() {
  var width = this.NOTCH_WIDTH;
  var height = this.NOTCH_HEIGHT;
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
 * Override the `makePuzzleTab` function to return a rectangular puzzle tab for
 * input and output connections.
 * @override
 */
CustomNotchProvider.prototype.makePuzzleTab = function() {
  var width = this.TAB_WIDTH;
  var height = this.TAB_HEIGHT;

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
