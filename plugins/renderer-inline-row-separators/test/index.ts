/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Shadow block conversion test playground.
 */

import * as Blockly from 'blockly';
import {createPlayground} from '@blockly/dev-tools';
import {overrideOldBlockDefinitions} from '../src/index';

overrideOldBlockDefinitions();

const toolbox: Blockly.utils.toolbox.ToolboxDefinition = {
  'kind': 'categoryToolbox',
  'contents': [
    {
      'kind': 'category',
      'name': 'Inline',
      'contents': [
        {
          'kind': 'block',
          'type': 'inline_text_join',
        },
        {
          'kind': 'block',
          'type': 'inline_lists_create_with',
        },
        {
          'kind': 'block',
          'type': 'inline_procedures_defreturn',
          'extraState': {
            'hasStatements': false,
          },
        },
      ],
    },
    {
      'kind': 'category',
      'name': 'Text',
      'categorystyle': 'text_category',
      'contents': [
        {
          'kind': 'block',
          'type': 'text',
        },
        {
          'kind': 'block',
          'type': 'text_join',
        },
      ],
    },
    {
      'kind': 'category',
      'name': 'Lists',
      'categorystyle': 'list_category',
      'contents': [
        {
          'kind': 'block',
          'type': 'lists_create_with',
          'extraState': {
            'itemCount': 0,
          },
        },
        {
          'kind': 'block',
          'type': 'lists_create_with',
        },
      ],
    },
    {
      'kind': 'sep',
    },
    {
      'kind': 'category',
      'name': 'Variables',
      'categorystyle': 'variable_category',
      'custom': 'VARIABLE',
    },
    {
      'kind': 'category',
      'name': 'Functions',
      'categorystyle': 'procedure_category',
      'custom': 'PROCEDURE',
    },
  ],
};

/**
 * Create a workspace.
 * @param blocklyDiv The blockly container div.
 * @param options The Blockly options.
 * @return The created workspace.
 */
function createWorkspace(blocklyDiv: HTMLElement,
    options: Blockly.BlocklyOptions): Blockly.WorkspaceSvg {
  return Blockly.inject(blocklyDiv, options);
}

document.addEventListener('DOMContentLoaded', function() {
  const defaultOptions: Blockly.BlocklyOptions = {
    toolbox,
    renderer: 'thrasos-inline-row-separators',
  };
  const rootElement = document.getElementById('root');
  if (rootElement) {
    createPlayground(rootElement, createWorkspace, defaultOptions);
  }
});
