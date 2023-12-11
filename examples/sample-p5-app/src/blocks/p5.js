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
  'type': 'p5_background_colour',
  'message0': 'set background colour to %1',
  'args0': [
    {
      'type': 'input_value',
      'name': 'COLOUR',
    },
  ],
  'previousStatement': null,
  'nextStatement': null,
  'style': 'colour_blocks',
  'tooltip': 'Set the background colour of the canvas',
  'helpUrl': '',
};


const stroke = {
  'type': 'p5_stroke',
  'message0': 'set stroke colour to %1',
  'args0': [
    {
      'type': 'input_value',
      'name': 'COLOUR',
    },
  ],
  'previousStatement': null,
  'nextStatement': null,
  'style': 'colour_blocks',
  'tooltip': 'Set the stroke colour',
  'helpUrl': '',
};


const fill = {
  'type': 'p5_fill',
  'message0': 'set fill colour to %1',
  'args0': [
    {
      'type': 'input_value',
      'name': 'COLOUR',
    },
  ],
  'previousStatement': null,
  'nextStatement': null,
  'style': 'colour_blocks',
  'tooltip': 'Set the fill colour',
  'helpUrl': '',
};


const point = {
  'type': 'p5_point',
  'message0': 'draw point %1 x %2 y %3',
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
  ],
  'previousStatement': null,
  'nextStatement': null,
  'colour': 230,
  'tooltip': 'Draw a point on the canvas.',
  'helpUrl': 'https://p5js.org/reference/#/p5/point',
};


const line = {
  'type': 'p5_line',
  'message0': 'draw line %1 x1 %2 y1 %3 x2 %4 y2 %5',
  'args0': [
    {
      'type': 'input_dummy',
    },
    {
      'type': 'input_value',
      'name': 'X1',
      'check': 'Number',
    },
    {
      'type': 'input_value',
      'name': 'Y1',
      'check': 'Number',
    },
    {
      'type': 'input_value',
      'name': 'X2',
      'check': 'Number',
    },
    {
      'type': 'input_value',
      'name': 'Y2',
      'check': 'Number',
    },
  ],
  'previousStatement': null,
  'nextStatement': null,
  'colour': 230,
  'tooltip': 'Draw a line on the canvas.',
  'helpUrl': 'https://p5js.org/reference/#/p5/line',
};


const triangle = {
  'type': 'p5_triangle',
  'message0': 'draw triangle %1 x1 %2 y1 %3 x2 %4 y2 %5 x3 %6 y3 %7',
  'args0': [
    {
      'type': 'input_dummy',
    },
    {
      'type': 'input_value',
      'name': 'X1',
      'check': 'Number',
    },
    {
      'type': 'input_value',
      'name': 'Y1',
      'check': 'Number',
    },
    {
      'type': 'input_value',
      'name': 'X2',
      'check': 'Number',
    },
    {
      'type': 'input_value',
      'name': 'Y2',
      'check': 'Number',
    },
    {
      'type': 'input_value',
      'name': 'X3',
      'check': 'Number',
    },
    {
      'type': 'input_value',
      'name': 'Y3',
      'check': 'Number',
    },
  ],
  'previousStatement': null,
  'nextStatement': null,
  'colour': 230,
  'tooltip': 'Draw a triangle on the canvas.',
  'helpUrl': 'https://p5js.org/reference/#/p5/triangle',
};


const rect = {
  'type': 'p5_rect',
  'message0': 'draw rectangle %1 x %2 y %3 width %4 height %5',
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
  'tooltip': 'Draw a rectangle on the canvas.',
  'helpUrl': 'https://p5js.org/reference/#/p5/rect',
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

const arc = {
  'type': 'p5_arc',
  'message0': 'draw arc %1 x %2 y %3 width %4 height %5 start %6 stop %7',
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
    {
      'type': 'input_value',
      'name': 'START',
      'check': 'Number',
    },
    {
      'type': 'input_value',
      'name': 'STOP',
      'check': 'Number',
    },
  ],
  'previousStatement': null,
  'nextStatement': null,
  'colour': 230,
  'tooltip': 'Draw an arc on the canvas.',
  'helpUrl': 'https://p5js.org/reference/#/p5/arc',
};


const print = {
  'type': 'p5_print',
  'message0': 'print text %1 x %2 y %3',
  'args0': [
    {
      'type': 'input_value',
      'name': 'TEXT',
      'check': 'String',
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
  ],
  'previousStatement': null,
  'nextStatement': null,
  'style': 'text_blocks',
  'tooltip': 'Draw text on the canvas.',
  'helpUrl': 'https://p5js.org/reference/#/p5/text',
};

// Create the block definitions for all the JSON-only blocks.
// This does not register their definitions with Blockly.
const jsonBlocks = Blockly.common.createBlockDefinitionsFromJsonArray(
    [background, stroke, fill, point, line, triangle, rect, ellipse, arc, print]);

export const blocks = {
  'p5_setup': p5Setup, 'p5_draw': p5Draw, 'p5_canvas': p5Canvas, ...jsonBlocks,
};
