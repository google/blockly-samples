Blockly.defineBlocksWithJsonArray([
  {
    'type': 'p5_setup',
    'message0': 'Setup %1 %2 %3',
    'args0': [
      {'type': 'field_variable', 'name': 'CANVAS_NAME', 'variable': 'sketch'},
      {'type': 'input_dummy'},
      {'type': 'input_statement', 'name': 'SETUP'},
    ],
    'colour': 50,
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
    'colour': 50,
    'tooltip': '',
    'helpUrl': '',
  },
  {
    'type': 'p5_background_color',
    'message0': 'Set background to %1',
    'args0': [{'type': 'input_value', 'name': 'COLOUR'}],
    'previousStatement': null,
    'nextStatement': null,
    'colour': 50,
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
    'previousStatement': null,
    'nextStatement': null,
    'colour': 50,
    'tooltip': '',
    'helpUrl': '',
  },
]);

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
      block, 'COLOUR', Blockly.JavaScript.ORDER_ATOMIC);
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
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['p5_ellipse'] = function(block) {
  const center = Blockly.JavaScript.valueToCode(
      block, 'CENTER', Blockly.JavaScript.ORDER_ATOMIC) ||
      {x: 0, y: 0};
  const width = Blockly.JavaScript.valueToCode(
      block, 'WIDTH', Blockly.JavaScript.ORDER_ATOMIC) ||
      0;
  const height = Blockly.JavaScript.valueToCode(
      block, 'HEIGHT', Blockly.JavaScript.ORDER_ATOMIC) ||
      0;
  const canvasName = getCanvasName(block);
  var centerVar = Blockly.JavaScript.variableDB_.getDistinctName(
    'center', Blockly.Variables.NAME_TYPE);
  const code =
      `var ${centerVar} = ${center};
${canvasName}.ellipse(${centerVar}.x, ${centerVar}.y, ${width}, ${height})`;
  return code;
};

const getCanvasName = function(block) {
  const rootInput = block.getRootBlock().getFieldValue('CANVAS_NAME');
  if (!rootInput) {
    return 'sketch';
  }
  return Blockly.JavaScript.nameDB_.getName(
      rootInput, Blockly.Variables.NAME_TYPE);
};
