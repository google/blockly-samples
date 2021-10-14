Blockly.defineBlocksWithJsonArray([
  {
    'type': 'p5_setup',
    'message0': 'Setup %1 %2 %3',
    'args0': [
      {'type': 'field_variable', 'name': 'CANVAS_NAME', 'variable': 'sketch'},
      {'type': 'input_dummy'},
      {'type': 'input_statement', 'name': 'SETUP'},
    ],
    'colour': 100,
    'tooltip': '',
    'helpUrl': '',
  },
  {
    'type': 'p5_draw',
    'message0': 'Draw on %1 %2 %3',
    'args0': [
      {'type': 'field_variable', 'name': 'CANVAS_NAME', 'variable': 'sketch'},
      {'type': 'input_dummy'},
      {'type': 'input_statement', 'name': 'DRAW'},
    ],
    'colour': 100,
    'tooltip': '',
    'helpUrl': '',
  },
  {
    'type': 'p5_background_color',
    'message0': 'Set background to %1',
    'args0': [{'type': 'input_value', 'name': 'COLOUR'}],
    'previousStatement': null,
    'nextStatement': null,
    'colour': 100,
    'tooltip': '',
    'helpUrl': '',
  },
  {
    'type': 'p5_coordinate',
    'message0': 'x %1 , y %2',
    'args0': [
      {'type': 'input_value', 'name': 'X'},
      {'type': 'input_value', 'name': 'Y'},
    ],
    'inputsInline': true,
    'output': 'coordinate',
    'colour': 50,
    'tooltip': '',
    'helpUrl': '',
  },
  {
    'type': 'p5_ellipse',
    'message0':
        'Create an ellipse with %1 center at x, y %2 width %3 height %4',
    'args0': [
      {
        'type': 'input_dummy',
      },
      {
        'type': 'input_value',
        'name': 'CENTER',
        'check': 'coordinate',
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
    'inputsInline': false,
    'previousStatement': null,
    'nextStatement': null,
    'colour': 50,
    'tooltip': '',
    'helpUrl': '',
  },
  {
    'type': 'p5_create_canvas',
    'message0': 'Create canvas with %1 width %2 height %3',
    'args0': [
      {
        'type': 'input_dummy',
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
    'inputsInline': false,
    'previousStatement': null,
    'nextStatement': null,
    'colour': 50,
    'tooltip': 'Creates an area to draw on',
    'helpUrl': '',
  },
  {
    'type': 'p5_fill_color',
    'message0': 'Set shape fill to %1',
    'args0': [{'type': 'input_value', 'name': 'COLOUR'}],
    'previousStatement': null,
    'nextStatement': null,
    'colour': 50,
    'tooltip': '',
    'helpUrl': '',
  },
  {
    'type': 'create_snowflake',
    'message0': 'Add Snowflake',
    'colour': 230,
    'output': null,
    'tooltip': '',
    'helpUrl': '',
  },
  {
    'type': 'display_snowflake',
    'message0': 'display %1 snowflake %2',
    'args0':
        [{'type': 'input_dummy'}, {'type': 'input_value', 'name': 'Snowflake'}],
    'previousStatement': null,
    'nextStatement': null,
    'colour': 230,
    'tooltip': '',
    'helpUrl': '',
  },
  {
    'type': 'update_snowflake',
    'message0': 'Update %1 snowflake %2 snowflake list %3 time %4',
    'args0': [
      {'type': 'input_dummy'},
      {'type': 'input_value', 'name': 'snowflake'},
      {'type': 'input_value', 'name': 'snowflake_list'},
      {'type': 'input_value', 'name': 'time'},
    ],
    'colour': 230,
    'previousStatement': null,
    'nextStatement': null,
    'tooltip': '',
    'helpUrl': '',
  },
  {
    'type': 'p5_get_frame_count',
    'message0': 'frame count',
    'colour': 50,
    'output': null,
    'tooltip': '',
    'helpUrl': '',
  },
  {
    'type': 'p5_no_stroke',
    'message0': 'No stroke',
    'inputsInline': false,
    'previousStatement': null,
    'nextStatement': null,
    'colour': 50,
    'tooltip': 'Prevents drawing outlines around shapes',
    'helpUrl': '',
  },
  {
    'type': 'p5_mouse_x',
    'message0': 'mouseX',
    'output': 'Number',
    'colour': 50,
    'tooltip': '',
    'helpUrl': '',
  },
  {
    'type': 'p5_mouse_y',
    'message0': 'mouseY',
    'output': 'Number',
    'colour': 50,
    'tooltip': '',
    'helpUrl': '',
  },
  {
    'type': 'p5_mouse_is_pressed',
    'message0': 'mouse is pressed',
    'output': 'Boolean',
    'colour': 50,
    'tooltip': '',
    'helpUrl': '',
  },
  {
    'type': 'p5_mouse_clicked_event',
    'message0': 'When the mouse is clicked on canvas %1 , do %2 %3',
    'args0': [
      {'type': 'field_variable', 'name': 'CANVAS_NAME', 'variable': 'sketch'},
      {'type': 'input_dummy'},
      {'type': 'input_statement', 'name': 'DO'},
    ],
    'colour': 50,
    'tooltip': '',
    'helpUrl': '',
  },
  {
    'type': 'p5_dist',
    'message0': 'distance between %1 and %2',
    'args0': [
      {'type': 'input_value', 'name': 'POINT_A', 'check': 'coordinate'},
      {
        'type': 'input_value',
        'name': 'POINT_B',
        'check': 'coordinate',
        'align': 'RIGHT',
      },
    ],
    'output': 'Number',
    'colour': 50,
    'tooltip': '',
    'helpUrl': '',
  },
  {
    'type': 'p5_width',
    'message0': 'canvas width',
    'output': null,
    'colour': 50,
    'tooltip': '',
    'helpUrl': '',
  },
  {
    'type': 'p5_height',
    'message0': 'canvas height',
    'output': null,
    'colour': 50,
    'tooltip': '',
    'helpUrl': '',
  },
]);

/**
 * @param sketch
 */
function snowflake(sketch) {
  // initialize coordinates
  this.posX = 0;
  this.posY = sketch.random(-50, 0);
  this.initialangle = sketch.random(0, 2 * sketch.PI);
  this.size = sketch.random(2, 5);
  this.name = sketch.random(0, 100);

  // radius of snowflake spiral
  // chosen so the snowflakes are uniformly spread out in area
  this.radius = sketch.sqrt(sketch.random(sketch.pow(sketch.width / 2, 2)));

  this.update = function(snowflakes, time) {
    // x position follows a circle
    const w = 0.6; // angular speed
    const angle = w * time + this.initialangle;
    this.posX = sketch.width / 2 + this.radius * sketch.sin(angle);

    // different size snowflakes fall at slightly different y speeds
    this.posY += sketch.pow(this.size, 0.5);
    // delete snowflake if past end of screen
    if (this.posY > sketch.height) {
      const index = snowflakes.indexOf(this);
      snowflakes.splice(index, 1);
    }
  };

  this.display = function() {
    sketch.ellipse(this.posX, this.posY, this.size);
  };
}

Blockly.JavaScript.addReservedWords('snowflake');
Blockly.JavaScript.addReservedWords('snowflakes');

Blockly.JavaScript['p5_setup'] = function(block) {
  const canvasName = getCanvasName(block);
  const statementsSetup = Blockly.JavaScript.statementToCode(block, 'SETUP');
  const code =
      `${canvasName}.setup = function setup() {\n${statementsSetup}\n};`;
  return code;
};

Blockly.JavaScript['p5_draw'] = function(block) {
  const canvasName = getCanvasName(block);
  const statementsDraw = Blockly.JavaScript.statementToCode(block, 'DRAW');
  const code = `${canvasName}.draw = function draw() {\n${statementsDraw}\n};`;
  return code;
};

Blockly.JavaScript['p5_background_color'] = function(block) {
  const colour = Blockly.JavaScript.valueToCode(
      block, 'COLOUR', Blockly.JavaScript.ORDER_NONE);
  const canvasName = getCanvasName(block);
  const code = `${canvasName}.background(${colour});\n`;
  return code;
};

Blockly.JavaScript['p5_coordinate'] = function(block) {
  const valueX = Blockly.JavaScript.valueToCode(
      block, 'X', Blockly.JavaScript.ORDER_NONE) ||
      0;
  const valueY = Blockly.JavaScript.valueToCode(
      block, 'Y', Blockly.JavaScript.ORDER_NONE) ||
      0;
  const code = `{x: ${valueX}, y: ${valueY}}`;
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['p5_ellipse'] = function(block) {
  const center = Blockly.JavaScript.valueToCode(
      block, 'CENTER', Blockly.JavaScript.ORDER_NONE) ||
      {x: 0, y: 0};
  const width = Blockly.JavaScript.valueToCode(
      block, 'WIDTH', Blockly.JavaScript.ORDER_NONE) ||
      0;
  const height = Blockly.JavaScript.valueToCode(
      block, 'HEIGHT', Blockly.JavaScript.ORDER_NONE) ||
      0;
  const canvasName = getCanvasName(block);
  const centerVar = Blockly.JavaScript.variableDB_.getDistinctName(
      'center', Blockly.Variables.NAME_TYPE);
  const code = `var ${centerVar} = ${center};
${canvasName}.ellipse(${centerVar}.x, ${centerVar}.y, ${width}, ${height});\n`;
  return code;
};

Blockly.JavaScript['p5_create_canvas'] = function(block) {
  const canvasName = getCanvasName(block);
  const width = Blockly.JavaScript.valueToCode(
      block, 'WIDTH', Blockly.JavaScript.ORDER_NONE);
  const height = Blockly.JavaScript.valueToCode(
      block, 'HEIGHT', Blockly.JavaScript.ORDER_NONE);
  return `${canvasName}.createCanvas(${width}, ${height});\n`;
};

Blockly.JavaScript['p5_fill_color'] = function(block) {
  const colour = Blockly.JavaScript.valueToCode(
      block, 'COLOUR', Blockly.JavaScript.ORDER_NONE);
  const canvasName = getCanvasName(block);
  const code = `${canvasName}.fill(${colour});\n`;
  return code;
};

Blockly.JavaScript['p5_add_snowflake'] = function(block) {
  const code = `snowflakes.push(new snowflake(sketch))`;
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['p5_no_stroke'] = function(block) {
  const canvasName = getCanvasName(block);
  const code = `${canvasName}.noStroke();\n`;
  return code;
};

Blockly.JavaScript['create_snowflake'] = function(block) {
  const code = `new snowflake(sketch)`;
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['p5_get_frame_count'] = function(block) {
  const code = `sketch.frameCount`;
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['update_snowflake'] = function(block) {
  const valueSnowflake = Blockly.JavaScript.valueToCode(
      block, 'snowflake', Blockly.JavaScript.ORDER_ATOMIC);
  const valueTime = Blockly.JavaScript.valueToCode(
      block, 'time', Blockly.JavaScript.ORDER_ATOMIC);
  const valueSnowflakes = Blockly.JavaScript.valueToCode(
      block, 'snowflake_list', Blockly.JavaScript.ORDER_ATOMIC);

  const code = `${valueSnowflake}.update(${valueSnowflakes},${valueTime});\n`;
  return code;
};

Blockly.JavaScript['display_snowflake'] = function(block) {
  const valueSnowflakes = Blockly.JavaScript.valueToCode(
      block, 'Snowflake', Blockly.JavaScript.ORDER_ATOMIC);
  const code = `${valueSnowflakes}.display();\n`;
  return code;
};

Blockly.JavaScript['p5_mouse_x'] = function(block) {
  const canvasName = getCanvasName(block);
  const code = `${canvasName}.mouseX`;
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['p5_mouse_y'] = function(block) {
  const canvasName = getCanvasName(block);
  const code = `${canvasName}.mouseY`;
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['p5_mouse_is_pressed'] = function(block) {
  const canvasName = getCanvasName(block);
  const code = `${canvasName}.mouseIsPressed`;
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['p5_mouse_clicked_event'] = function(block) {
  const canvasName = getCanvasName(block);
  const statements = Blockly.JavaScript.statementToCode(block, 'DO');
  const code = `${canvasName}.mousePressed = function mousePressed() {\n${
    statements}\n};\n`;
  return code;
};

Blockly.JavaScript['p5_dist'] = function(block) {
  const pointA = Blockly.JavaScript.valueToCode(
      block, 'POINT_A', Blockly.JavaScript.ORDER_NONE) ||
      {x: 0, y: 0};
  const pointB = Blockly.JavaScript.valueToCode(
      block, 'POINT_B', Blockly.JavaScript.ORDER_NONE) ||
      {x: 0, y: 0};
  const canvasName = getCanvasName(block);
  const pointAVar = Blockly.JavaScript.variableDB_.getDistinctName(
      'pointA', Blockly.Variables.NAME_TYPE);
  const pointBVar = Blockly.JavaScript.variableDB_.getDistinctName(
      'pointB', Blockly.Variables.NAME_TYPE);

  // Provide utility function since you can't have multiline code for a value
  const functionName =
      Blockly.JavaScript.provideFunction_('p5_dist', [`function ${Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_}(pointA, pointB, canvas) {
  return canvas.dist(pointA.x, pointA.y, pointB.x, pointB.y);
}`]);

  const code = `${functionName}(${pointA}, ${pointB}, ${canvasName})`;
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['p5_width'] = function(block) {
  return ['sketch.width', Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['p5_height'] = function(block) {
  return ['sketch.height', Blockly.JavaScript.ORDER_ATOMIC];
};

const getCanvasName = function(block) {
  const rootInput = block.getRootBlock().getFieldValue('CANVAS_NAME');
  if (!rootInput) {
    return 'sketch';
  }
  return Blockly.JavaScript.nameDB_.getName(
      rootInput, Blockly.Variables.NAME_TYPE);
};
