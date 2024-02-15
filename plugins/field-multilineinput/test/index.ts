/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview MultilineInput field test playground.
 */

import * as Blockly from 'blockly';
import {javascriptGenerator} from 'blockly/javascript';
import {dartGenerator} from 'blockly/dart';
import {phpGenerator} from 'blockly/php';
import {pythonGenerator} from 'blockly/python';
import {luaGenerator} from 'blockly/lua';
import {createPlayground} from '@blockly/dev-tools';
import {installAllBlocks} from '../src/index';

/**
 * An array of blocks that are defined only for the purposes of
 * manually and visually testing the multiline text input field.
 */
const testBlockDefinitions = [
  {
    type: 'test_spellchecked_field',
    message0: '%1',
    args0: [
      {
        type: 'field_multilinetext',
        name: 'FIELDNAME',
        spellcheck: true,
        text: `’Twas brillig, and the slithy toves
  Did gyre and gimble in the wabe:
All mimsy were the borogoves,
  And the mome raths outgrabe.`,
      },
    ],
    output: null,
    style: 'math_blocks',
  },
  {
    type: 'test_unspellchecked_field',
    message0: '%1',
    args0: [
      {
        type: 'field_multilinetext',
        name: 'FIELDNAME',
        spellcheck: false,
        text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
      },
    ],
    output: null,
    style: 'math_blocks',
  },
  {
    type: 'test_spellchecked_field_and_label',
    message0: 'block %1',
    args0: [
      {
        type: 'field_multilinetext',
        name: 'FIELDNAME',
        spellcheck: true,
        text: `’Twas brillig, and the slithy toves
  Did gyre and gimble in the wabe:
All mimsy were the borogoves,
  And the mome raths outgrabe.`,
      },
    ],
    output: null,
    style: 'math_blocks',
  },
  {
    type: 'test_unspellchecked_field_and_label',
    message0: 'block %1',
    args0: [
      {
        type: 'field_multilinetext',
        name: 'FIELDNAME',
        spellcheck: false,
        text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
      },
    ],
    output: null,
    style: 'math_blocks',
  },
  {
    type: 'test_parent_block',
    message0: 'parent %1',
    args0: [
      {
        type: 'input_value',
        name: 'INPUT',
      },
    ],
    previousStatement: null,
    nextStatement: null,
    style: 'loop_blocks',
  },
];

Blockly.defineBlocksWithJsonArray(testBlockDefinitions);

/**
 * A test toolbox containing the exported blocks and a variety of
 * test blocks to exercise the multiline text input field in different
 * contexts (on a shadow block, as the only field on a block, etc).
 * These are in a simple toolbox, rather than a category toolbox, so that
 * they are all instantiated every time the test page is opened.
 */
const jsonToolbox = {
  contents: [
    {
      kind: 'label',
      text: 'Exported blocks',
    },
    {
      kind: 'block',
      type: 'text_multiline',
    },
    {
      kind: 'label',
      text: 'Test blocks: spellchecked field',
    },
    {
      kind: 'block',
      type: 'test_spellchecked_field',
    },
    {
      kind: 'block',
      type: 'test_parent_block',
      inputs: {
        INPUT: {
          shadow: {
            type: 'test_spellchecked_field',
          },
        },
      },
    },
    {
      kind: 'block',
      type: 'test_spellchecked_field_and_label',
    },
    {
      kind: 'block',
      type: 'test_parent_block',
      inputs: {
        INPUT: {
          shadow: {
            type: 'test_spellchecked_field_and_label',
          },
        },
      },
    },
    {
      kind: 'label',
      text: 'Test blocks: unspellchecked field',
    },
    {
      kind: 'block',
      type: 'test_unspellchecked_field',
    },
    {
      kind: 'block',
      type: 'test_parent_block',
      inputs: {
        INPUT: {
          shadow: {
            type: 'test_unspellchecked_field',
          },
        },
      },
    },
    {
      kind: 'block',
      type: 'test_unspellchecked_field_and_label',
    },
    {
      kind: 'block',
      type: 'test_parent_block',
      inputs: {
        INPUT: {
          shadow: {
            type: 'test_unspellchecked_field_and_label',
          },
        },
      },
    },
  ],
};

/**
 * Uninstall the base multiline text block and its associated generators.
 * TODO(#2194): remove this when those blocks are removed from the core library.
 */
function uninstallBlock() {
  delete Blockly.Blocks['text_multiline'];
  delete javascriptGenerator.forBlock['text_multiline'];
  delete dartGenerator.forBlock['text_multiline'];
  delete luaGenerator.forBlock['text_multiline'];
  delete pythonGenerator.forBlock['text_multiline'];
  delete phpGenerator.forBlock['text_multiline'];
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
  uninstallBlock();
  installAllBlocks({
    javascript: javascriptGenerator,
    dart: dartGenerator,
    lua: luaGenerator,
    python: pythonGenerator,
    php: phpGenerator,
  });
  const workspace = Blockly.inject(blocklyDiv, options);
  return workspace;
}

document.addEventListener('DOMContentLoaded', function () {
  const defaultOptions: Blockly.BlocklyOptions = {
    toolbox: jsonToolbox,
  };
  const rootElement = document.getElementById('root');
  if (rootElement) {
    createPlayground(rootElement, createWorkspace, defaultOptions);
  }
});
