author: Rachel Fenichel
summary: Codelab to create a custom renderer
id: custom-renderer
categories: codelab,blockly,rendering,customization
status: Draft
Feedback Link: https://github.com/google/blockly-samples/issues/new

# Custom renderers

## Codelab overview

### What you'll learn
In this codelab you will learn:
1. How to define and register a custom renderer.
1. How to override renderer constants.
1. How to change the shape of connection notches.
1. How to set a connection's shape based on its type checks.

### What you'll build

Over the course of this codelab you will build and use four renderers.

1. A minimal custom renderer.
![](assets/custom-renderer/custom_renderer.png)
1. A renderer with custom constants.
![](assets/custom-renderer/custom_constants.png)
1. A renderer with custom notches.
![](assets/custom-renderer/custom_notches.png)
1. A renderer with connection shapes that depend on the type checks of each connection.
![](assets/custom-renderer/typed_connection_shapes.png)
### What you'll need
This codelab assumes that you are already comfortable with using the Blockly playground locally.  You can find it in `tests/playground.html`.

## Setup

In this codelab you will add code to the Blockly playground to create and use a new renderer. The playgound contains all of Blockly's base blocks, as well as some that exist only to test rendering code. You can find the playground at `tests/playground.html`.

To start, create a file named `custom_renderer.js` in the same folder as the playground.  Include it with a script tag.

```
<script src="custom_renderer.js"></script>
```

Note: you must include your custom code *after* including the Blockly library.

## Define and register a renderer

A **Renderer** is the interface between your custom rendering code and the rest of Blockly. Blockly provides a base renderer with all required fields set to default values.

Your new renderer must extend the base renderer:
```js
CustomRenderer = function(name) {
  CustomRenderer.superClass_.constructor.call(this, name);
};
Blockly.utils.object.inherits(CustomRenderer,
    Blockly.blockRendering.Renderer);
```

After defining your renderer you need to tell Blockly that it exists. Register your renderer by name:
```js
Blockly.blockRendering.register('custom_renderer', CustomRenderer);
```

To use your custom renderer, set the `renderer` property in the configuration struct in `playground.html`:
```js
Blockly.inject('blocklyDiv', {
    renderer: 'custom_renderer'
  }
);
```

### The result

To test, open the playground in your browser and drag out a repeat block. The resulting block looks close to normal, but with slightly different alignment than Geras or Thrasos.

![](assets/custom-renderer/custom_renderer.png)

## Override constants

A **ConstantsProvider** holds all rendering-related constants.  This includes sizing information and colours.  Blockly provides a base **ConstantsProvider** with all required fields set to default values.

The **ConstantsProvider** constructor sets all static properties, such as `NOTCH_WIDTH` and `NOTCH_HEIGHT`. For a full list of properties, see [constants.js](https://github.com/google/blockly/blob/master/core/renderers/common/constants.js).

In general you will want to override a subset of the constants, rather than all of them. To do so:
- Define a constants provider that extends the base provider.
- Call the superclass constructor in your constructor.
- Set individual properties.

```js
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
```

To use your new **ConstantsProvider**, you must override `makeConstants_` on your custom renderer:
```js
CustomRenderer.prototype.makeConstants_ = function() {
  return new CustomConstantsProvider();
};
```

### The result

The resulting block has triangular previous and next connections, and skinny input and output connections. Note that the general shapes of the connections have not changed--only parameters such as width and height.

![](assets/custom-renderer/custom_constants.png)

## Change connection shapes

A common use case of a custom renderer is changing the shape of connections. This requires a more detailed understanding of how a block is drawn and how SVG paths are defined.

### The block outline

The outline of the block is a single [SVG path](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path). The outline is built out of many sub-paths (e.g. the path for a previous connection; the path for the top of the block; and the path for an input connection).

Each sub-path is a string of [path commands](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d#Path_commands) that describe the appropriate shape. These commands must use relative (rather than absolute) coordinates.

While you can write SVG path commands as strings, Blockly provides a set of [utility functions](https://developers.google.com/blockly/reference/js/Blockly.utils.svgPaths) to make writing and reading paths easier.

### Changing previous/next connection shape

The outline path is drawn clockwise around the block, starting at the top left. As a result the previous connection is drawn from left to right, while the next connection is drawn from right to left.

Previous and next connections are defined by the same object. The object has four properties:
- `width`: The width of the connection.
- `height`: The height of the connection.
- `pathLeft`: The sub-path that describes the connection when drawn from left to right.
- `pathRight`: The sub-path that describes the connection when drawn from right to left.

The constants provider calls `makeNotch()` during initialization to create this object. You can override the function on your `CustomConstantsProvider`. Note that `NOTCH_WIDTH` and `NOTCH_HEIGHT` have already been overridden in the constructor.

```js
/**
 * Override the `makeNotch` function to return a rectangular notch for previous
 * and next connections.
 * @override
 */
CustomConstantsProvider.prototype.makeNotch = function() {
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
```

### Changing input/output connection shape

By the same logic input and output connections are drawn in two directions: top to bottom, and bottom to top. The object contains four properties:
- `width`
- `height`
- `pathUp`
- `pathDown`

The function to override is `makePuzzleTab()`:

```js
/**
 * Override the `makePuzzleTab` function to return a rectangular puzzle tab for
 * input and output connections.
 * @override
 */
CustomConstantsProvider.prototype.makePuzzleTab = function() {
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
```

### The result

The resulting block has rectangular connections for all four connection types.

![A repeat block with squared-off connections](assets/custom-renderer/custom_notches.png)

## Typed connection shapes

In this step we will create a renderer that sets connection shapes at runtime based on a connection's type checks.


### Define your renderer and constants provider
Create and include a new file named `typed_connection_shapes.js`, and add it to the renderer dropdown.

Define a renderer named `TypedConnectionShapeRenderer` and a constants provider named `TypedConnectionShapeProvider`.

```js
TypedConnectionShapeRenderer = function(name) {
  TypedConnectionShapeRenderer.superClass_.constructor.call(this, name);
};
Blockly.utils.object.inherits(TypedConnectionShapeRenderer,
    Blockly.blockRendering.Renderer);

Blockly.blockRendering.register('typed_connection_shapes',
    TypedConnectionShapeRenderer);

TypedConnectionShapeProvider = function() {
  TypedConnectionShapeProvider.superClass_.constructor.call(this);
};
Blockly.utils.object.inherits(TypedConnectionShapeProvider,
    Blockly.blockRendering.ConstantProvider);

TypedConnectionShapeRenderer.prototype.makeConstants_ = function() {
  return new TypedConnectionShapeProvider();
};
```

### Define shapes

Define the `makeSquared` and `makeRounded` functions to return rectangular and rounded shapes respectively.

```js
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
```

### Use the shapes
* Override the `init` function on the `TypedConnectionShapeProvider`.
* Call the superclass `init` function to set up default properties.
* Create and save the new connection shapes in `this.SQUARED` and `this.ROUNDED`.

```js
/**
 * @override
 */
TypedConnectionShapeProvider.prototype.init = function() {
  TypedConnectionShapeProvider.superClass_.init.call(this);
  // Add calls to create shape objects for the new connection shapes.
  this.SQUARED = this.makeSquared();
  this.ROUNDED = this.makeRounded();
};
```
Override the shapeFor function to inspect the connection's type checks array and return the correct connection shape:
- Return a rounded tab for inputs and outputs that accept numbers and strings.
- Return a squared tab for other inputs and outputs.
- Return the normal notch for previous and next connections.

```js
/**
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
```

### The result

In this screenshot, the number inputs and outputs are semicircular.  The boolean input on the if block is rectangular.
![](assets/custom-renderer/typed_connection_shapes.png)

## Summary

Custom renderers are a powerful way to change the look and feel of Blockly.  In this codelab you worked through four different levels of customization of a renderer.
