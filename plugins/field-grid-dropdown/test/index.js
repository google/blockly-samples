/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Field test.
 */

import * as Blockly from 'blockly';
import {generateFieldTestBlocks, createPlayground} from '@blockly/dev-tools';
import '../src/index';

const toolbox = generateFieldTestBlocks('field_grid_dropdown', [
  {
    'label': 'Different text length',
    'args': {
      'options': [
        ['A', 'A'],
        ['long text ', 'long text'],
        ['B', 'B'],
        ['C', 'C'],
        ['really really really loooooong text',
          'really really really loooooong text'],
        ['D', 'D'],
        ['E', 'E'],
      ],
    },
  },
  {
    'label': 'Long text list',
    'args': {
      'options': [
        ['A', 'A'],
        ['B', 'B'],
        ['C', 'C'],
        ['D', 'D'],
        ['E', 'E'],
        ['D', 'F'],
        ['G', 'G'],
        ['H', 'H'],
        ['I', 'I'],
        ['J', 'J'],
        ['K', 'K'],
        ['L', 'L'],
        ['M', 'M'],
        ['N', 'N'],
        ['O', 'O'],
        ['P', 'P'],
        ['Q', 'Q'],
        ['R', 'R'],
        ['S', 'S'],
        ['T', 'T'],
        ['U', 'U'],
        ['V', 'V'],
        ['W', 'W'],
        ['X', 'X'],
        ['Y', 'Y'],
        ['Z', 'Z'],
      ],
    },
  },
  {
    'label': 'Images',
    'args': {
      'options': [
        [
          {
            'src':
                'https://blockly-demo.appspot.com/static/tests/media/a.png',
            'width': 32,
            'height': 32,
            'alt': 'A',
          },
          'A',
        ],
        [
          {
            'src':
                'https://blockly-demo.appspot.com/static/tests/media/b.png',
            'width': 32,
            'height': 32,
            'alt': 'B',
          },
          'B',
        ],
        [
          {
            'src':
                'https://blockly-demo.appspot.com/static/tests/media/c.png',
            'width': 32,
            'height': 32,
            'alt': 'C',
          },
          'C',
        ],
        [
          {
            'src':
                'https://blockly-demo.appspot.com/static/tests/media/d.png',
            'width': 32,
            'height': 32,
            'alt': 'D',
          },
          'D',
        ],
        [
          {
            'src':
                'https://blockly-demo.appspot.com/static/tests/media/e.png',
            'width': 32,
            'height': 32,
            'alt': 'E',
          },
          'E',
        ],
        [
          {
            'src':
                'https://blockly-demo.appspot.com/static/tests/media/f.png',
            'width': 32,
            'height': 32,
            'alt': 'F',
          },
          'F',
        ],
        [
          {
            'src':
                'https://blockly-demo.appspot.com/static/tests/media/g.png',
            'width': 32,
            'height': 32,
            'alt': 'G',
          },
          'G',
        ],
        [
          {
            'src':
                'https://blockly-demo.appspot.com/static/tests/media/h.png',
            'width': 32,
            'height': 32,
            'alt': 'H',
          },
          'H',
        ],
        [
          {
            'src':
                'https://blockly-demo.appspot.com/static/tests/media/i.png',
            'width': 32,
            'height': 32,
            'alt': 'I',
          },
          'I',
        ],
        [
          {
            'src':
                'https://blockly-demo.appspot.com/static/tests/media/j.png',
            'width': 32,
            'height': 32,
            'alt': 'J',
          },
          'J',
        ],
        [
          {
            'src':
                'https://blockly-demo.appspot.com/static/tests/media/k.png',
            'width': 32,
            'height': 32,
            'alt': 'K',
          },
          'K',
        ],
        [
          {
            'src':
                'https://blockly-demo.appspot.com/static/tests/media/l.png',
            'width': 32,
            'height': 32,
            'alt': 'L',
          },
          'L',
        ],
        [
          {
            'src':
                'https://blockly-demo.appspot.com/static/tests/media/m.png',
            'width': 32,
            'height': 32,
            'alt': 'M',
          },
          'M',
        ],
      ],
    },
  },
  {
    'label': '4 columns',
    'args': {
      'columns': '4',
      'options': [
        ['A', 'A'],
        ['B', 'B'],
        ['C', 'C'],
        ['D', 'D'],
        ['E', 'E'],
        ['F', 'F'],
        ['G', 'G'],
        ['H', 'H'],
      ],
    },
  },
  {
    'label': 'custom colours',
    'args': {
      'primaryColour': '#783105',
      'borderColour': '#d6a587',
      'options': [
        ['A', 'A'],
        ['B', 'B'],
        ['C', 'C'],
        ['D', 'D'],
        ['E', 'E'],
        ['F', 'F'],
        ['G', 'G'],
        ['H', 'H'],
      ],
    },
  },
]);

/**
 * Create a workspace.
 * @param {HTMLElement} blocklyDiv The blockly container div.
 * @param {!Blockly.BlocklyOptions} options The Blockly options.
 * @return {!Blockly.WorkspaceSvg} The created workspace.
 */
function createWorkspace(blocklyDiv, options) {
  const workspace = Blockly.inject(blocklyDiv, options);
  return workspace;
}

document.addEventListener('DOMContentLoaded', function() {
  const defaultOptions = {
    toolbox,
  };
  createPlayground(document.getElementById('root'), createWorkspace,
      defaultOptions);
});
