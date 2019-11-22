

// Define a custom renderer that extends the base renderer.
TypedConnectionShapeRenderer = function(name) {
  TypedConnectionShapeRenderer.superClass_.constructor.call(this, name);
};
Blockly.utils.object.inherits(TypedConnectionShapeRenderer,
    Blockly.blockRendering.Renderer);

// Register your renderer by name.
Blockly.blockRendering.register('typed_connection_shapes',
    TypedConnectionShapeRenderer);

// Define a custom constants provider that extends the base constants provider.
TypedConnectionShapeProvider = function() {
  // Set up all of the constants from the base provider.
  TypedConnectionShapeProvider.superClass_.constructor.call(this);
};
Blockly.utils.object.inherits(TypedConnectionShapeProvider,
    Blockly.blockRendering.ConstantProvider);

// Tell the custom renderer to use the custom constants provider instead of the
// base constants provider.
TypedConnectionShapeRenderer.prototype.makeConstants_ = function() {
  return new TypedConnectionShapeProvider();
};

// New code is below this line.

/**
 * Create a new function to return a rectangular puzzle tab that works for input
 * and output connections.
 */
TypedConnectionShapeProvider.prototype.makeSquared = function() {
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

/**
 * Create a new function to return a rounded puzzle tab that works for input and
 * output connections.
 */
TypedConnectionShapeProvider.prototype.makeRounded = function() {
  var height = this.TAB_HEIGHT;

  // The 'up' and 'down' versions of the paths are the same, but the Y sign
  // flips.
  function makeMainPath(up) {
    var width = height / 2;
    return Blockly.utils.svgPaths.arc(
        'a',
        '0 0 ' + (up ? 1 : 0),
        width,
        Blockly.utils.svgPaths.point(0, (up ? -1 : 1) * height)
    );
  }

  var pathUp = makeMainPath(true);
  var pathDown = makeMainPath(false);

  return {
    width: height / 2,
    height: height,
    pathDown: pathDown,
    pathUp: pathUp
  };
};

/**
 * Override the init function.
 * @override
 */
TypedConnectionShapeProvider.prototype.init = function() {
  TypedConnectionShapeProvider.superClass_.init.call(this);
  // Add calls to create shape objects for the new connection shapes.
  this.SQUARED = this.makeSquared();
  this.ROUNDED = this.makeRounded();
};

/**
 * Override the shapeFor function to inspect the connection's type checks.
 * Return a rounded tab for inputs and outputs that accept numbers and strings.
 * Return a squared tab for other inputs and outputs.
 * Return the normal notch for previous and next connections.
 * @override
 */
TypedConnectionShapeProvider.prototype.shapeFor = function(connection) {
  var checks = connection.getCheck();
  switch (connection.type) {
    case Blockly.INPUT_VALUE:
    case Blockly.OUTPUT_VALUE:
      // Includes doesn't work in IE.
      if (checks && checks.indexOf('Number') != -1) {
        return this.ROUNDED;
      }
      if (checks && checks.indexOf('String') != -1) {
        return this.ROUNDED;
      }
      return this.SQUARED;
    case Blockly.PREVIOUS_STATEMENT:
    case Blockly.NEXT_STATEMENT:
      return this.NOTCH;
    default:
      throw Error('Unknown type');
  }
};
