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

forBlock['text_print'] = function(block, generator) {
  const msg = generator.valueToCode(block, 'TEXT',
      Order.NONE) || '\'\'';
  return `sketch.text(${msg}, 20, 20);\n`;
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

forBlock['p5_background_color'] = function(block, generator) {
  const color = generator.valueToCode(block, 'COLOR',
      Order.ATOMIC) || `'#fff'`;
  // TODO: Assemble JavaScript into code variable.
  const code = `sketch.background(${color});\n`;
  return code;
};

forBlock['p5_stroke'] = function(block, generator) {
  const color = generator.valueToCode(block, 'COLOR',
      Order.ATOMIC) || `'#fff'`;
  // TODO: Assemble JavaScript into code variable.
  const code = `sketch.stroke(${color});\n`;
  return code;
};

forBlock['p5_fill'] = function(block, generator) {
  const color = generator.valueToCode(block, 'COLOR',
      Order.ATOMIC) || `'#fff'`;
  // TODO: Assemble JavaScript into code variable.
  const code = `sketch.fill(${color});\n`;
  return code;
};

forBlock['p5_ellipse'] = function(block, generator) {
  const x = generator.valueToCode(block, 'X',
      Order.NONE) || 0;
  const y = generator.valueToCode(block, 'Y',
      Order.NONE) || 0;
  const width = generator.valueToCode(block, 'WIDTH',
      Order.NONE) || 0;
  const height = generator.valueToCode(block, 'HEIGHT',
      Order.NONE) || 0;
  return `sketch.ellipse(${x}, ${y}, ${width}, ${height});\n`;
};
