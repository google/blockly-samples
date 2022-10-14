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
import {shadowBlockConversionChangeListener} from '../src/index';

const toolbox = {
  'kind': 'flyoutToolbox',
  'contents': [
    {
      'kind': 'block',
      'type': 'colour_blend',
      'inputs': {
        'COLOUR1': {
          'shadow': {'type': 'colour_picker', 'fields': {'COLOUR': '#ff0000'}},
        },
        'COLOUR2': {
          'shadow': {'type': 'colour_picker', 'fields': {'COLOUR': '#3333ff'}},
        },
        'RATIO': {'shadow': {'type': 'math_number', 'fields': {'NUM': 0.5}}},
      },
    },
    {
      'kind': 'block',
      'type': 'colour_picker',
    },
    {
      'kind': 'block',
      'type': 'text_print',
      'inputs': {
        'TEXT': {
          'shadow': {'type': 'text', 'fields': {'TEXT': 'Example Text 1'}},
        },
      },
      'next': {
        'shadow': {
          'kind': 'block',
          'type': 'text_print',
          'inputs': {
            'TEXT': {
              'shadow': {'type': 'text', 'fields': {'TEXT': 'Example Text 2'}},
            },
          },
        },
      },
    },
    {
      'kind': 'block',
      'type': 'text',
    },
    {
      'kind': 'block',
      'type': 'controls_if',
      'inputs': {
        'IF0': {'shadow': {'type': 'logic_boolean'}},
        'DO0': {
          'shadow': {
            'type': 'controls_ifelse',
            'inputs': {
              'IF0': {'shadow': {'type': 'logic_boolean'}},
              'DO0': {'shadow': {'type': 'controls_if'}},
              'ELSE': {
                'shadow': {
                  'type': 'controls_if',
                  'inputs': {
                    'IF0': {'shadow': {'type': 'logic_boolean'}},
                  },
                },
              },
            },
            'next': {
              'shadow': {
                'type': 'controls_if',
                'inputs': {
                  'IF0': {'shadow': {'type': 'logic_boolean'}},
                },
              },
            },
          },
        },
      },
    },
    {
      'kind': 'block',
      'type': 'logic_boolean',
    },
  ],
};

/**
 * Create a workspace.
 * @param {HTMLElement} blocklyDiv The blockly container div.
 * @param {!Blockly.BlocklyOptions} options The Blockly options.
 * @return {!Blockly.WorkspaceSvg} The created workspace.
 */
function createWorkspace(blocklyDiv, options) {
  const workspace = Blockly.inject(blocklyDiv, options);
  workspace.addChangeListener(shadowBlockConversionChangeListener);
  return workspace;
}

document.addEventListener('DOMContentLoaded', function() {
  const defaultOptions = {
    toolbox,
  };
  createPlayground(document.getElementById('root'), createWorkspace,
      defaultOptions);
});
