/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Colour field test playground.
 */

import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { dartGenerator } from 'blockly/dart';
import { phpGenerator } from 'blockly/php';
import { pythonGenerator } from 'blockly/python';
import { luaGenerator } from 'blockly/lua';

import {generateFieldTestBlocks, createPlayground} from '@blockly/dev-tools';
import * as FieldColour from '../src/index';

const toolbox = generateFieldTestBlocks('field_colour', [
  {
    label: 'Standard',
    args: {},
  },
  {
    label: 'Custom',
    args: {
      colour: '#ff4040',
      colourOptions: [
        '#ff4040',
        '#ff8080',
        '#ffc0c0',
        '#4040ff',
        '#8080ff',
        '#c0c0ff',
      ],
      colourTitles: [
        'dark pink',
        'pink',
        'light pink',
        'dark blue',
        'blue',
        'light blue',
      ],
      columns: 3,
    },
  },
]);

const jsonToolbox = {
  contents: [
    {
      kind: 'block',
      type: 'colour_blend'
    },
    {
      kind: 'block',
      type: 'colour_picker'
    },
    {
      kind: 'block',
      type: 'colour_random'
    },
    {
      kind: 'block',
      type: 'colour_rgb'
    }
  ],
};

/**
 * Uninstall the base colour blocks and their associated generators.
 * TODO(#2194): remove this when those blocks are removed from the core library.
 */
function uninstallBlocks() {
  delete Blockly.Blocks['colour_blend'];
  delete Blockly.Blocks['colour_rgb'];
  delete Blockly.Blocks['colour_random'];
  delete Blockly.Blocks['colour_picker'];
  
  const blockNames = ['colour_blend', 'colour_rgb', 'colour_random', 'colour_picker'];
  for (const name in blockNames) {
    delete javascriptGenerator.forBlock[name];
    delete dartGenerator.forBlock[name];
    delete luaGenerator.forBlock[name];
    delete pythonGenerator.forBlock[name];
    delete phpGenerator.forBlock[name];
  }
}

/**
 * Create a workspace.
 *
 * @param blocklyDiv The blockly container div.
 * @param options The Blockly options.
 * @returns The created workspace.
 */
function createWorkspace(
  blocklyDiv: HTMLElement,
  options: Blockly.BlocklyOptions,
): Blockly.WorkspaceSvg {
  const workspace = Blockly.inject(blocklyDiv, options);
  return workspace;
}

document.addEventListener('DOMContentLoaded', function () {
  uninstallBlocks();
  FieldColour.installAllBlocks({
    javascript: javascriptGenerator,
    dart: dartGenerator,
    lua: luaGenerator,
    python: pythonGenerator,
    php: phpGenerator
  });

  const defaultOptions: Blockly.BlocklyOptions = {
    toolbox: jsonToolbox,
  };
  const rootElement = document.getElementById('root');
  if (rootElement) {
    createPlayground(rootElement, createWorkspace, defaultOptions);
  }
});
