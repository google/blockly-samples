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

1. A minimal custom renderer
![](assets/custom-renderer/custom_renderer.png)
1. A renderer with custom constants
![](assets/custom-renderer/custom_constants.png)
1. A renderer with custom notches
![](assets/custom-renderer/custom_notches.png)
1. A renderer with connection shapes that depend on the type checks of each connection.
![](assets/custom-renderer/typed_connection_shapes.png)
### What you'll need
This codelab assumes that you are already comfortable with using the Blockly playground locally.

## Setup

In this codelab you will add code to the Blockly playground to create and use a new renderer.

When the instructions say to "create and include a new file", you should place that file in the same folder as the playground and include it with a script tag.

```
<script src="custom_renderer.js"></script>
```

Note: you must include your custom code *after* including the Blockly library.

## Minimal custom renderer

This is the minimum code needed to define a new renderer.

Create and include a new file named `custom_renderer.js`.

Define a renderer that extends the base renderer.
```js
CustomRenderer = function(name) {
  CustomRenderer.superClass_.constructor.call(this, name);
};
Blockly.utils.object.inherits(CustomRenderer,
    Blockly.blockRendering.Renderer);
```

Register the renderer by name:
```js
Blockly.blockRendering.register('custom_renderer', CustomRenderer);
```

Add your renderer to the "Renderer" dropdown in `playground.html`.
```html
<select name="renderer" onchange="document.forms.options.submit()">
  <option value="custom_renderer">Custom Renderer</option>
  <option value="geras">Geras</option>
  <option value="thrasos">Thrasos</option>
  <option value="zelos">Zelos</option>
  <option value="minimalist">Minimalist</option>
</select>
```

To test, open the playground in a browser and select your new renderer from the dropdown.
### The result

The resulting block looks close to normal, but with slightly different alignment than Geras or Thrasos.

![](assets/custom-renderer/custom_renderer.png)

## Custom constants

This sample shows the minumum code needed to define a new renderer that overrides constants from the base renderer.

### Define your renderer
Create and include a new file named `custom_constants.js`, and add it to the renderer dropdown.

Define a renderer that extends the base renderer: `CustomConstantsRenderer`
```js
CustomConstantsRenderer = function(name) {
  CustomConstantsRenderer.superClass_.constructor.call(this, name);
};
Blockly.utils.object.inherits(CustomConstantsRenderer,
    Blockly.blockRendering.Renderer);
```

Register the renderer by name: `custom_constants`.
```js
Blockly.blockRendering.register('custom_constants',
    CustomConstantsRenderer);
```

Define a constants provider that extends the base constants provider: `CustomConstantsProvider`. It contains all of the constants needed to size a block during rendering. Call the superclass constructor to set default property values, then override specific properties directly:
  - `NOTCH_WIDTH`: the width of previous and next connection notches.
  - `NOTCH_HEIGHT`: the height of previous and next connection notches.
  - `CORNER_RADIUS`: the radius of all rounded corners on the block.
  - `TAB_HEIGHT`: the height of the puzzle tab used for input and output connections.


```js
CustomConstantsProvider = function() {
  // Set up all of the constants from the base provider.
  CustomConstantsProvider.superClass_.constructor.call(this);

  // Override a few properties.
  this.NOTCH_WIDTH = 20;
  this.NOTCH_HEIGHT = 10;
  this.CORNER_RADIUS = 2;
  this.TAB_HEIGHT = 8;
};
Blockly.utils.object.inherits(CustomConstantsProvider,
    Blockly.blockRendering.ConstantProvider);
```

Override `makeConstants_` to tell the custom renderer to use the custom constants provider.
```js
CustomConstantsRenderer.prototype.makeConstants_ = function() {
  return new CustomConstantsProvider();
};
```

### The result

The resulting block has triangular previous and next connections, and skinny input and output connections.

![](assets/custom-renderer/custom_constants.png)

For a more complete list of constants, look at the base constants.js file.

## Custom notches

This sample shows the minumum code needed to define a new renderer that overrides connection shapes from the base renderer.

### Define your renderer
Create and include a new file named `custom_notches.js`, and add it to the renderer dropdown.

Define a renderer that extends the base renderer: `CustomNotchRenderer` and register it with the name `custom_notch`.

```js
CustomNotchRenderer = function(name) {
  CustomNotchRenderer.superClass_.constructor.call(this, name);
};
Blockly.utils.object.inherits(CustomNotchRenderer,
    Blockly.blockRendering.Renderer);

Blockly.blockRendering.register('custom_notch',
    CustomNotchRenderer);
```

### Define your ConstantProvider
Define a constants provider named `CustomNotchProvider` that extends the base constants provider.  It will contain all of the constants needed to size a block during rendering.

Call the superclass constructor to set default property values, then override specific properties:
  * `NOTCH_WIDTH`: the width of previous and next connection notches.
  * `NOTCH_HEIGHT`: the height of previous and next connection notches.

```js
CustomNotchProvider = function() {
  CustomNotchProvider.superClass_.constructor.call(this);
  this.NOTCH_WIDTH = 20;
  this.NOTCH_HEIGHT = 10;
};
Blockly.utils.object.inherits(CustomNotchProvider,
    Blockly.blockRendering.ConstantProvider);
```

Override `makeConstants_` to tell the custom renderer to use the custom constants provider.

```js
CustomNotchRenderer.prototype.makeConstants_ = function() {
  return new CustomNotchProvider();
};
```

### Override notch shapes

`makeNotch` and `makePuzzleTab` are two functions that are called by the constants provider during initialization.


Override the `makeNotch` function to return a rectangular notch shape for previous and next connections.

```js
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
```
Override the `makePuzzleTab` function to return a rectangular tab for input and output connections.

```js
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
```

### The result

The resulting block has rectangular connections for all four connection types.

![A repeat block with squared-off connections](assets/custom-renderer/custom_notches.png)

## Typed connection shapes

In this step we will create a renderer that sets connection shapes are runtime based on a connection's type checks.


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
Override the `init` function on the `TypedConnectionShapeProvider`.  Call the superclass `init` function to set up default properties, then create and save the new connection shapes in `this.SQUARED` and `this.ROUNDED`.

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
* Return a rounded tab for inputs and outputs that accept numbers and strings.
* Return a squared tab for other inputs and outputs.
* Return the normal notch for previous and next connections.

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
