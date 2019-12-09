[Home](../README.md)

# blockly-rendering-sample [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

This sample shows how to customize Blockly's rendering.

`index.html` contains three panels:
- The left side is a basic Blockly playground, using the currently selected renderer.
- The top right quadrant describes the code changes needed to create the selected renderer.
- The bottom right quadrant displays the code of the selected renderer.

There are five renderers.  Switch between them with the links at the top or with the buttons at the end of each description.
- Default Renderer: Geras, Blockly's default renderer.
- Custom Renderer: Extends the base renderer with no additional changes.
- Custom Constants: Extends the base renderer and changes constants.
- Custom Notches: Extends the base renderer and overrides notch shapes.
- Typed Connection Shapes: Extends the base renderer and sets connection shapes based on connection types.

Each renderer builds on the structure of the previous example.

## Installation

```
npm install
```

## Running

```
npm run start
```

## Browse

Open [http://localhost:3000/index.html](http://localhost:3000/index.html)
