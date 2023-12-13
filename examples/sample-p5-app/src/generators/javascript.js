/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {Order} from 'blockly/javascript';

// Export all the code generators for our custom blocks,
// but don't register them with Blockly yet.
// This file has no side effects!
export const forBlock = Object.create(null);

forBlock['collapse'] = function(block, generator) {
  return generator.statementToCode(block, 'COLLAPSE');
}

forBlock['p5_print'] = function(block, generator) {
  const msg = generator.valueToCode(block, 'TEXT',
      Order.NONE) || '\'\'';
  const x = generator.valueToCode(block, 'X', Order.NONE) || 0;
  const y = generator.valueToCode(block, 'Y', Order.NONE) || 0;
  return `sketch.text(${msg}, ${x}, ${y});\n`;
};

forBlock['p5_setup'] = function(block, generator) {
  const statements = generator.statementToCode(block, 'STATEMENTS');
  const code = `sketch.setup = function() {
${statements}};\n`;
  return code;
};

forBlock['p5_draw'] = function(block, generator) {
  const statements = generator.statementToCode(block, 'STATEMENTS');
  const code = `sketch.draw = function() {
${statements}};\n`;
  return code;
};

forBlock['p5_canvas'] = function(block) {
  const width = block.getFieldValue('WIDTH') || 400;
  const height = block.getFieldValue('HEIGHT') || 400;
  return `sketch.createCanvas(${width}, ${height});\n`;
};

forBlock['p5_background_colour'] = function(block, generator) {
  const colour = generator.valueToCode(block, 'COLOUR',
      Order.ATOMIC) || `'#fff'`;
  const code = `sketch.background(${colour});\n`;
  return code;
};

forBlock['p5_stroke'] = function(block, generator) {
  const colour = generator.valueToCode(block, 'COLOUR',
      Order.ATOMIC) || `'#fff'`;
  const code = `sketch.stroke(${colour});\n`;
  return code;
};

forBlock['p5_fill'] = function(block, generator) {
  const colour = generator.valueToCode(block, 'COLOUR',
      Order.ATOMIC) || `'#fff'`;
  const code = `sketch.fill(${colour});\n`;
  return code;
};

forBlock['p5_point'] = function(block, generator) {
  const x = generator.valueToCode(block, 'X', Order.NONE) || 0;
  const y = generator.valueToCode(block, 'Y', Order.NONE) || 0;
  return `sketch.point(${x}, ${y});\n`;
};

forBlock['p5_line'] = function(block, generator) {
  const x1 = generator.valueToCode(block, 'X1', Order.NONE) || 0;
  const y1 = generator.valueToCode(block, 'Y1', Order.NONE) || 0;
  const x2 = generator.valueToCode(block, 'X2', Order.NONE) || 0;
  const y2 = generator.valueToCode(block, 'Y2', Order.NONE) || 0;
  return `sketch.line(${x1}, ${y1}, ${x2}, ${y2});\n`;
};

forBlock['p5_triangle'] = function(block, generator) {
  const x1 = generator.valueToCode(block, 'X1', Order.NONE) || 0;
  const y1 = generator.valueToCode(block, 'Y1', Order.NONE) || 0;
  const x2 = generator.valueToCode(block, 'X2', Order.NONE) || 0;
  const y2 = generator.valueToCode(block, 'Y2', Order.NONE) || 0;
  const x3 = generator.valueToCode(block, 'X3', Order.NONE) || 0;
  const y3 = generator.valueToCode(block, 'Y3', Order.NONE) || 0;
  return `sketch.triangle(${x1}, ${y1}, ${x2}, ${y2}, ${x3}, ${y3});\n`;
};

forBlock['p5_rect'] = function(block, generator) {
  const x = generator.valueToCode(block, 'X', Order.NONE) || 0;
  const y = generator.valueToCode(block, 'Y', Order.NONE) || 0;
  const width = generator.valueToCode(block, 'WIDTH',
      Order.NONE) || 0;
  const height = generator.valueToCode(block, 'HEIGHT',
      Order.NONE) || 0;
  return `sketch.rect(${x}, ${y}, ${width}, ${height});\n`;
};

forBlock['p5_ellipse'] = function(block, generator) {
  const x = generator.valueToCode(block, 'X', Order.NONE) || 0;
  const y = generator.valueToCode(block, 'Y', Order.NONE) || 0;
  const width = generator.valueToCode(block, 'WIDTH',
      Order.NONE) || 0;
  const height = generator.valueToCode(block, 'HEIGHT',
      Order.NONE) || 0;
  return `sketch.ellipse(${x}, ${y}, ${width}, ${height});\n`;
};

forBlock['p5_arc'] = function(block, generator) {
  const x = generator.valueToCode(block, 'X', Order.NONE) || 0;
  const y = generator.valueToCode(block, 'Y', Order.NONE) || 0;
  const width = generator.valueToCode(block, 'WIDTH',
      Order.NONE) || 0;
  const height = generator.valueToCode(block, 'HEIGHT',
      Order.NONE) || 0;
  const start = generator.valueToCode(block, 'START',
      Order.NONE) || 0;
  const stop = generator.valueToCode(block, 'STOP',
      Order.NONE) || 0;
  return `sketch.arc(${x}, ${y}, ${width}, ${height}, ${start}, ${stop});\n`;
};
