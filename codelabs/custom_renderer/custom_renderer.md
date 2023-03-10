author: Rachel Fenichel
summary: Codelab showing how to create custom renderers.
id: custom-renderer
categories: blockly,codelab,rendering,customization
status: Published
Feedback Link: https://github.com/google/blockly-samples/issues/new/choose

# Build custom renderers

## Codelab overview

### What you'll learn
- How to define and register a custom renderer.
- How to override renderer constants.
- How to change the shape of connection notches.
- How to set a connection's shape based on its type checks.

### What you'll build

You will build and use four renderers:

1. A minimal custom renderer that extends `Blockly.blockRendering.Renderer` but makes no modifications to the default rendering style.
![Screenshot of a renderer with a default appearance.](./custom_renderer.png)
1. A custom renderer which sets new values for the rendering-related constants `NOTCH_WIDTH`, `NOTCH_HEIGHT`,`CORNER_RADIUS`, and `TAB_HEIGHT` found in `Blockly.blockRendering.ConstantProvider`.
![Screenshot of a custom renderer with notches, corners, and tabs that have similar shapes as the default but with different widths, heights, and radiuses.](./custom_constants.png)
1. A custom renderer which overrides the functions `Blockly.blockRendering.ConstantProvider.init()` and `Blockly.blockRendering.ConstantProvider.shapeFor(connection)` to define and return custom [SVG paths](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path).
![Screenshot of a custom renderer with notches, corners, and tabs with fundamentally different shapes than the defaults.](./custom_notches.png)
1. A custom renderer which overrides the function `Blockly.blockRendering.ConstantProvider.shapeFor(connection)` to return different shapes for the input/output connections depending on whether the their type is a `Number`, `String`, or `Boolean`.
![Screenshot of a custom renderer with rectangles for the Number input/outputs and a puzzle tab for the Boolean input/output attached to an "if" block](./typed_connection_shapes.png)

### What you'll need

- Comfort with the Blockly playground.
- NPM installed ([instructions](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)).
- Comfort using the command line/terminal.

## Setup

In this codelab you will add code to the Blockly playground to create and use a new custom renderer.

### The application

You will make all of your changes in a sample Blockly app, which you can find in blockly-samples at [`examples/sample-app`](https://github.com/google/blockly-samples/tree/master/examples/sample-app). This application contains a sample setup of Blockly, including custom blocks and a display of the generated code and output.
  1) Clone or download the blockly-samples repository if you haven't already.
  2) Navigate to the `examples/sample-app` directory (or a copy of it) via the command line.
  3) Run `npm install` to install the required dependencies.
  4) Run `npm run start` to start the server and run the sample application.
  5) The sample app will automatically run in the browser window that opens.

The initial application uses the default renderer and contains no code or definitions for a custom renderer.

You can view the complete code used in this codelab in blockly-samples under [`examples/custom-renderer-codelab`](https://github.com/google/blockly-samples/tree/master/examples/custom-renderer-codelab).

Before setting up the rest of the application, let's change the storage key used for this codelab application. This will ensure that the workspace is saved in its own storage, separate from the regular sample app, so that we don't interfere with other demos. In `serialization.js`, change the value of `storageKey` to some unique string:

```js
// Use a unique storage key for this codelab
const storageKey = 'customRenderersWorkspace';
```

## Define and register a custom renderer

A **Renderer** is the interface between your custom rendering code and the rest of Blockly. Blockly provides a base renderer with all required fields set to default values.

To start, create a new directory at `src/renderers` and add a file inside named `custom.js`.

At the top of the file, you first need to import `blockly/core`:

```js
import * as Blockly from 'blockly/core';
```

Then define your new custom renderer and have it extend the base renderer:

```js
class CustomRenderer extends Blockly.blockRendering.Renderer {
  constructor() {
    super();
  }
}
```

After defining your renderer you need to tell Blockly that it exists. Register your renderer and give it the name `custom_renderer`:

```js
Blockly.blockRendering.register('custom_renderer', CustomRenderer);
```

To use your custom renderer, you first need to import your new file into `src/index.js`.  Add this import at the top of `src/index.js`:

```js
import './renderers/javascript';
```

Now, add the the `renderer` property into the configuration struct passed to `Blockly.inject` so that it now looks like this:

```js
const ws = Blockly.inject(blocklyDiv, {renderer: 'custom_renderer', toolbox});
```

### The result

If the server is already running, you can refresh the page to see your changes. Otherwise, run `npm run start` to start the server. Once the server is running, click on the `Loops` entry in your browser and drag out a repeat block. The resulting block will look the same as normal, since your custom renderer has merely extended the default renderer without changing anything.

![Screenshot of a renderer with a default appearance.](./custom_renderer.png)

## Override constants

A **ConstantsProvider** holds all rendering-related constants.  This includes sizing information and colors. Blockly provides a base **ConstantsProvider** with all required fields set to default values.

The **ConstantsProvider** `constructor()` sets all static properties, such as `NOTCH_WIDTH` and `NOTCH_HEIGHT`. For a full list of properties, see [constants.ts](https://github.com/google/blockly/blob/master/core/renderers/common/constants.ts).

In general you will want to override a subset of the constants, rather than all of them. To do so:
- Define a constants provider that extends the base `ConstantProvider`.
- Call the superclass `constructor()` in your `constructor()`.
- Set individual properties.

Add this above the `CustomRenderer` definition in `src/renderers/custom.js`:

```js
class CustomConstantProvider extends Blockly.blockRendering.ConstantProvider {
  constructor() {
    // Set up all of the constants from the base provider.
    super();

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
  }
}
```

To use your new **CustomConstantProvider**, you must override `makeConstants_()` inside your `CustomRenderer` class. Below the `constructor()`, add:

```js
  /**
   * @override
   */
  makeConstants_() {
    return new CustomConstantProvider();
  }
```

### The result

If you return to your browser, click on the `Loops` entry and drag out a repeat block, you'll see the resulting block has triangular previous and next connections, and skinny input and output connections. Note that the general shapes of the connections have not changed--only parameters such as width and height.

![Screenshot of a custom renderer with notches, corners, and tabs that have similar shapes as the default but with different widths, heights, and radiuses.](./custom_constants.png)

## Understand connection shapes

A common use case of a custom renderer is changing the shape of connections. This requires a more detailed understanding of how a block is drawn and how SVG paths are defined.

### The block outline

The outline of the block is a single [SVG path](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path). The outline is built out of many sub-paths (e.g. the path for a previous connection; the path for the top of the block; and the path for an input connection).

Each sub-path is a string of [path commands](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d#path_commands) that describe the appropriate shape. These commands must use relative (rather than absolute) coordinates.

While you can write SVG path commands as strings, Blockly provides a set of [utility functions](https://developers.google.com/blockly/reference/js/blockly.utils_namespace.svgpaths_namespace) to make writing and reading paths easier.

### `init()`

A connection's shape is stored as an object with information about its width, height, and sub-path. These objects are created in the `ConstantProvider`s `init()` function. Here is the start of the default implementation. You can find the complete definition inside [`constants.ts`](https://github.com/google/blockly/blob/develop/core/renderers/common/constants.ts).

```js
/**
 * Initialize shape objects based on the constants set in the constructor.
 *
 * @internal
 */
init() {
  /**
   * An object containing sizing and path information about collapsed block
   * indicators.
   */
  this.JAGGED_TEETH = this.makeJaggedTeeth();

  /** An object containing sizing and path information about notches. */
  this.NOTCH = this.makeNotch();

  // Additional code has been removed for brevity.
}
```

**Properties that are primitives should be set in the `constructor()`, while objects should be set in `init()`**. This separation allows a subclass to override a constant such as `NOTCH_WIDTH` and see the change reflected in objects that depend on the constant.

### `shapeFor(connection)`

The `shapeFor(connection)` function maps from connection to connection shape. Here is the default implementation, which you can find inside [`constants.ts`](https://github.com/google/blockly/blob/develop/core/renderers/common/constants.ts). It returns a puzzle tab for input/output connections and a notch for previous/next connections:

```js
/**
 * Get an object with connection shape and sizing information based on the
 * type of the connection.
 *
 * @param connection The connection to find a shape object for
 * @returns The shape object for the connection.
 * @internal
 */
shapeFor(connection: RenderedConnection): Shape {
  switch (connection.type) {
    case ConnectionType.INPUT_VALUE:
    case ConnectionType.OUTPUT_VALUE:
      return this.PUZZLE_TAB;
    case ConnectionType.PREVIOUS_STATEMENT:
    case ConnectionType.NEXT_STATEMENT:
      return this.NOTCH;
    default:
      throw Error('Unknown connection type');
  }
}
```

## Change connection shapes

In this step you will define and use new shapes for previous/next connections and input/output connections. This takes three steps:
1. Define new shape objects.
1. Override `init()` to store the new shape objects.
1. Override `shapeFor(connection)` to return the new objects.

### Define a previous/next connection shape

An outline path is drawn clockwise around the block, starting at the top left. As a result the previous connection is drawn from left-to-right, while the next connection is drawn from right-to-left.

Previous and next connections are defined by the same object. The object has four properties:
- `width`: The width of the connection.
- `height`: The height of the connection.
- `pathLeft`: The sub-path that describes the connection when drawn from left-to-right.
- `pathRight`: The sub-path that describes the connection when drawn from right-to-left.

Define a new function called `makeRectangularPreviousConn()` and put it inside your `CustomConstantProvider` class definition. Note that `NOTCH_WIDTH` and `NOTCH_HEIGHT` have already been overridden in the `constructor()` so you'll reuse them in your implementation.

```js
  /**
   * @returns Rectangular notch for use with previous and next connections.
   */
  makeRectangularPreviousConn() {
    const width = this.NOTCH_WIDTH;
    const height = this.NOTCH_HEIGHT;

    /**
     * Since previous and next connections share the same shape you can define
     * a function to generate the path for both.
     *
     * @param dir Multiplier for the horizontal direction of the path (-1 or 1)
     * @returns SVGPath line for use with previous and next connections.
     */
    function makeMainPath(dir) {
      return Blockly.utils.svgPaths.line(
          [
            Blockly.utils.svgPaths.point(0, height),
            Blockly.utils.svgPaths.point(dir * width, 0),
            Blockly.utils.svgPaths.point(0, -height),
          ]);
    }
    const pathLeft = makeMainPath(1);
    const pathRight = makeMainPath(-1);

    return {
      width: width,
      height: height,
      pathLeft: pathLeft,
      pathRight: pathRight,
    };
  }
```

### Define an input/output connection shape

Just as previous/next connection shapes are drawn from left-to-right and right-to-left, input/output connection shapes are drawn from top-to-bottom and bottom-to-top.

Input and output connections are defined by the same object. The object has four properties:
- `width`: The width of the connection.
- `height`: The height of the connection.
- `pathUp`: The sub-path that describes the connection when drawn from top-to-bottom.
- `pathDown`: The sub-path that describes the connection when drawn from bottom-to-top.

Define a new function called `makeRectangularInputConn()` and put it inside your `CustomConstantProvider` class definition. Note that `TAB_WIDTH` and `TAB_HEIGHT` have already been overridden in the `constructor()` so you'll reuse them in your implementation.

```js
  /**
   * @returns Rectangular puzzle tab for use with input and output connections.
   */
  makeRectangularInputConn() {
    const width = this.TAB_WIDTH;
    const height = this.TAB_HEIGHT;

    /**
     * Since input and output connections share the same shape you can define
     * a function to generate the path for both.
     *
     * @param dir Multiplier for the vertical direction of the path (-1 or 1)
     * @returns SVGPath line for use with input and output connections.
     */
    function makeMainPath(dir) {
      return Blockly.utils.svgPaths.line(
          [
            Blockly.utils.svgPaths.point(-width, 0),
            Blockly.utils.svgPaths.point(0, dir * height),
            Blockly.utils.svgPaths.point(width, 0),
          ]);
    }
    const pathUp = makeMainPath(-1);
    const pathDown = makeMainPath(1);

    return {
      width: width,
      height: height,
      pathUp: pathUp,
      pathDown: pathDown,
    };
  }
```

### Override init()

Override the `init()` function in your `CustomConstantProvider` class definition and store the new shape objects as `RECT_PREV_NEXT` and `RECT_INPUT_OUTPUT`. Make sure you call the superclass `init()` function to store other objects that you have not overridden.

```js
  /**
   * @override
   */
  init() {
    // First, call init() in the base provider to store the default objects.
    super.init();

    // Add calls to create shape objects for the new connection shapes.
    this.RECT_PREV_NEXT = this.makeRectangularPreviousConn();
    this.RECT_INPUT_OUTPUT = this.makeRectangularInputConn();
  }
```

### Override shapeFor(connection)

Next, override the `shapeFor(connection)` function in your `CustomConstantProvider` class definition and return your new custom objects:

```js
  /**
   * @override
   */
  shapeFor(connection) {
    switch (connection.type) {
      case Blockly.INPUT_VALUE:
      case Blockly.OUTPUT_VALUE:
        return this.RECT_INPUT_OUTPUT;
      case Blockly.PREVIOUS_STATEMENT:
      case Blockly.NEXT_STATEMENT:
        return this.RECT_PREV_NEXT;
      default:
        throw Error('Unknown connection type');
    }
  }
```

### The result

If you return to your browser, click on the `Loops` entry and drag out a repeat block, you'll see the resulting block has rectangular connections for all four connection types.

![[Screenshot of a custom renderer with notches, corners, and tabs with fundamentally different shapes than the defaults.]](./custom_notches.png)

## Typed connection shapes

In this step you will create a renderer that sets connection shapes at runtime based on a connection's type checks. You will use the default connection shapes and the shapes defined in the previous steps.

### Override `shapeFor(connection)`

Override the `shapeFor(connection)` function in your `CustomConstantProvider` class definition to return a different connection shape based on the `checks` returned from `connection.getCheck()`. Note you will need to delete the previous definition of `shapeFor(connection)` created in previous steps.

The new definition of `shapeFor(connection)` will:
- Return a rectangular tab for inputs and outputs that accept `Number`s and `String`s.
- Return the default puzzle tab for all other inputs and outputs.
- Return the normal notch for all previous and next connections.

```js
/**
 * @override
 */
shapeFor(connection) {
  var checks = connection.getCheck();
  switch (connection.type) {
    case Blockly.INPUT_VALUE:
    case Blockly.OUTPUT_VALUE:
      if (checks && checks.includes('Number')) {
        return this.RECT_INPUT_OUTPUT;
      }
      if (checks && checks.includes('String')) {
        return this.RECT_INPUT_OUTPUT;
      }
      return this.PUZZLE_TAB;
    case Blockly.PREVIOUS_STATEMENT:
    case Blockly.NEXT_STATEMENT:
      return this.NOTCH;
    default:
      throw Error('Unknown connection type');
  }
```

### The result

In order to fully test this change, you'll need to take a few steps in the browser:
1. Click on the `Loops` entry and drag out a repeat block.
1. Click on the `Logic` entry and drag the conditional `if` block into the repeat block that you placed on the workspace in the previous step.

You should now see an entry similar to the screenshot below, in which the `Number` inputs and outputs are rectangular, but the boolean input on the `if` block is a puzzle tab.
![Screenshot of a custom renderer with rectangles for the Number input/outputs and a puzzle tab for the Boolean input/output attached to an "if" block](./typed_connection_shapes.png)

## Summary

Custom renderers are a powerful way to change the look and feel of Blockly.  In this codelab you:
- Declared and registered a custom renderer by extending `Blockly.blockRendering.Renderer`.
- Overrode renderer constants such as `NOTCH_HEIGHT` in `Blockly.blockRendering.ConstantProvider`.
- Modified connection shapes by creating custom [SVG paths](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path), storing them in `init()`, and finally returning them in `shapeFor(connection)`.
- Updated the mapping from connection to connection shape by adding logic in `shapeFor(connection)`.
