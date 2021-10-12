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
    'type': 'p5_fill_color',
    'message0': 'Set shape fill to %1',
    'args0': [{'type': 'input_value', 'name': 'COLOUR'}],
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

Blockly.JavaScript['p5_fill_color'] = function(block) {
  const colour = Blockly.JavaScript.valueToCode(
      block, 'COLOUR', Blockly.JavaScript.ORDER_ATOMIC);
  const canvasName = getCanvasName(block);
  const code = `${canvasName}.fill(${colour});\n`;
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
