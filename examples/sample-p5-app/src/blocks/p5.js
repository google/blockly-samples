import * as Blockly from 'blockly/core';

// p5 Basic Setup Blocks

const p5SetupJson = {
  'type': 'p5_setup',
  'message0': 'setup %1',
  'args0': [
    {
      'type': 'input_statement',
      'name': 'STATEMENTS',
    },
  ],
  'colour': 300,
  'tooltip': 'Setup the p5 canvas. This code is run once.',
  'helpUrl': '',
};

const p5Setup = {
  init: function() {
    this.jsonInit(p5SetupJson);
    // The setup block can't be removed.
    this.setDeletable(false);
  },
};

const p5DrawJson = {
  'type': 'p5_draw',
  'message0': 'draw %1',
  'args0': [
    {
      'type': 'input_statement',
      'name': 'STATEMENTS',
    },
  ],
  'colour': 300,
  'tooltip': 'Draw on the canvas. This code is run continuously.',
  'helpUrl': '',
};

const p5Draw = {
  init: function() {
    this.jsonInit(p5DrawJson);
    // The draw block can't be removed.
    this.setDeletable(false);
  },
};

const p5CanvasJson = {
  'type': 'p5_canvas',
  'message0': 'create canvas with width %1 height %2',
  'args0': [
    {
      'type': 'field_number',
      'name': 'WIDTH',
      'value': 400,
      'max': 400,
      'precision': 1,
    },
    {
      'type': 'field_number',
      'name': 'HEIGHT',
      'value': 400,
      'max': 400,
      'precision': 1,
    },
  ],
  'previousStatement': null,
  'nextStatement': null,
  'colour': 300,
  'tooltip': 'Create a p5 canvas of the specified size.',
  'helpUrl': '',
};

const p5Canvas = {
  init: function() {
    this.jsonInit(p5CanvasJson);
    // The canvas block can't be moved or disconnected from its parent.
    this.setMovable(false);
    this.setDeletable(false);
  },
};

const background = {
  'type': 'p5_background_color',
  'message0': 'Set background color to %1',
  'args0': [
    {
      'type': 'input_value',
      'name': 'COLOR',
    },
  ],
  'previousStatement': null,
  'nextStatement': null,
  'colour': 195,
  'tooltip': 'Set the background color of the canvas',
  'helpUrl': '',
};


const stroke = {
  'type': 'p5_stroke',
  'message0': 'Set stroke color to %1',
  'args0': [
    {
      'type': 'input_value',
      'name': 'COLOR',
    },
  ],
  'previousStatement': null,
  'nextStatement': null,
  'colour': 195,
  'tooltip': 'Set the stroke color',
  'helpUrl': '',
};


const fill = {
  'type': 'p5_fill',
  'message0': 'Set fill color to %1',
  'args0': [
    {
      'type': 'input_value',
      'name': 'COLOR',
    },
  ],
  'previousStatement': null,
  'nextStatement': null,
  'colour': 195,
  'tooltip': 'Set the fill color',
  'helpUrl': '',
};


const ellipse = {
  'type': 'p5_ellipse',
  'message0': 'draw ellipse %1 x %2 y %3 width %4 height %5',
  'args0': [
    {
      'type': 'input_dummy',
    },
    {
      'type': 'input_value',
      'name': 'X',
      'check': 'Number',
    },
    {
      'type': 'input_value',
      'name': 'Y',
      'check': 'Number',
    },
    {
      'type': 'input_value',
      'name': 'WIDTH',
      'check': 'Number',
    },
    {
      'type': 'input_value',
      'name': 'HEIGHT',
      'check': 'Number',
    },
  ],
  'previousStatement': null,
  'nextStatement': null,
  'colour': 230,
  'tooltip': 'Draw an ellipse on the canvas.',
  'helpUrl': 'https://p5js.org/reference/#/p5/ellipse',
};

// Create the block definitions for all the JSON-only blocks.
// This does not register their definitions with Blockly.
const jsonBlocks = Blockly.common.createBlockDefinitionsFromJsonArray(
    [background, stroke, fill, ellipse]);

export const blocks = {
  'p5_setup': p5Setup, 'p5_draw': p5Draw, 'p5_canvas': p5Canvas, ...jsonBlocks,
};
