/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A field test helper that generates blocks with the field in
 * various configurations.
 * @author samelh@google.com (Sam El-Husseini)
 */

import * as Blockly from 'blockly/core';


/**
 * Generates a number of field testing blocks for a specific field and returns
 * the toolbox xml string.
 * @param {string} fieldName The name of the field.
 * @param {Object|Array.<Object>=} options An options object containing a label
 *     and an args map that is passed to the field during initialization.  If an
 *     array is passed, multiple groups of blocks are created each with
 *     different initialization arguments.
 * @return {string} The toolbox XML string.
 */
export default function generateFieldTestBlocks(fieldName, options) {
  if (!Array.isArray(options)) {
    options = [options || {}];
  }

  let id = 0;
  let toolboxXml = '';
  const blocks = [];

  options.forEach((m) => {
    if (m.label) {
      // Add label.
      toolboxXml += `<label text="${m.label}"></label>`;
    }

    // Define a single field block.
    blocks.push(
        {
          'type': `${++id}test_${fieldName}_single`,
          'message0': '%1',
          'args0': [
            {
              'type': fieldName,
              'name': 'FIELDNAME',
              ...m.args,
              'alt': {
                'type': 'field_label',
                'text': `No ${fieldName}`,
              },
            },
          ],
          'output': null,
          'style': 'math_blocks',
        });
    toolboxXml += `<block type="${id}test_${fieldName}_single"></block>`;
    toolboxXml += `<sep gap="10"></sep>`;

    // Define a block and add the 'single field block' as a shadow.
    blocks.push(
        {
          'type': `${++id}test_${fieldName}_parent`,
          'message0': 'in parent %1',
          'args0': [
            {
              'type': 'input_value',
              'name': 'INPUT',
            },
          ],
          'previousStatement': null,
          'nextStatement': null,
          'style': 'loop_blocks',
        });

    toolboxXml += `
  <block type="${id}test_${fieldName}_parent">
      <value name="INPUT">
        <shadow type="${id-1}test_${fieldName}_single"></shadow>
      </value>
  </block>`;
    toolboxXml += `<sep gap="10"></sep>`;

    // Define a block with the field on it.
    blocks.push(
        {
          'type': `${++id}test_${fieldName}_block`,
          'message0': 'on block %1',
          'args0': [
            {
              'type': fieldName,
              'name': 'FIELDNAME',
              ...m.args,
              'alt': {
                'type': 'field_label',
                'text': `No ${fieldName}`,
              },
            },
          ],
          'output': null,
          'style': 'math_blocks',
        });
    toolboxXml += `<block type="${id}test_${fieldName}_block"></block>`;
    toolboxXml += `<sep gap="10"></sep>`;

    // Define a block and add the 'block with the field' as a shadow.
    blocks.push(
        {
          'type': `${++id}test_${fieldName}_parent_block`,
          'message0': 'in parent %1',
          'args0': [
            {
              'type': 'input_value',
              'name': 'INPUT',
            },
          ],
          'previousStatement': null,
          'nextStatement': null,
          'style': 'loop_blocks',
        });

    toolboxXml += `
  <block type="${id}test_${fieldName}_parent_block">
      <value name="INPUT">
        <shadow type="${id-1}test_${fieldName}_block"></shadow>
      </value>
  </block>`;
  });

  Blockly.defineBlocksWithJsonArray(blocks);

  return `<xml xmlns="https://developers.google.com/blockly/xml">
    ${toolboxXml}
    </xml>`;
}
