private:true 
/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Hacker Mode theme.
 * Black background and blocks with lime green text to simulate a hacker screen. 
 */

import * as Blockly from 'blockly/core';

const defaultBlockStyles = {
  'colour_blocks': {
    'colourPrimary': '#0c0d0d',
    'colourSecondary': '#0c0d0d',
    'colourTertiary': '#edf2f2',
  },
  'list_blocks': {
    'colourPrimary': '#0c0d0d',
    'colourSecondary': '#0c0d0d',
    'colourTertiary': '#edf2f2',
  },
  'logic_blocks': {
    'colourPrimary': '#0c0d0d',
    'colourSecondary': '#0c0d0d',
    'colourTertiary': '#edf2f2',
  },
  'loop_blocks': {
    'colourPrimary': '#0c0d0d',
    'colourSecondary': '#0c0d0d',
    'colourTertiary': '#edf2f2',
  },
  'math_blocks': {
    'colourPrimary': '#0c0d0d',
    'colourSecondary': '#0c0d0d',
    'colourTertiary': '#edf2f2',
  },
  'procedure_blocks': {
    'colourPrimary': '#0c0d0d',
    'colourSecondary': '#0c0d0d',
    'colourTertiary': '#edf2f2',
  },
  'text_blocks': {
    'colourPrimary': '#0c0d0d',
    'colourSecondary': '#0c0d0d',
    'colourTertiary': '#edf2f2',
  },
  'variable_blocks': {
    'colourPrimary': '#0c0d0d',
    'colourSecondary': '#0c0d0d',
    'colourTertiary': '#edf2f2',
  },
  'variable_dynamic_blocks': {
    'colourPrimary': '#0c0d0d',
    'colourSecondary': '#0c0d0d',
    'colourTertiary': '#edf2f2',
  },
};


const categoryStyles = {
  'colour_category': {
    'colour': '#0c0d0d',
  },
  'list_category': {
    'colour': '#0c0d0d',
  },
  'logic_category': {
    'colour': '#0c0d0d',
  },
  'loop_category': {
    'colour': '#0c0d0d',
  },
  'math_category': {
    'colour': '#0c0d0d',
  },
  'procedure_category': {
    'colour': '#0c0d0d',
  },
  'text_category': {
    'colour': '#0c0d0d',
  },
  'variable_category': {
    'colour': '#0c0d0d',
  },
  'variable_dynamic_category': {
    'colour': '#0c0d0d',
  },
};

export default Blockly.Theme.defineTheme('hackermode', {
  'base': Blockly.Themes.Classic,
  'blockStyles': defaultBlockStyles,
  'categoryStyles': categoryStyles,
  'componentStyles': {'workspaceBackgroundColour': '#1e1e1e',
  'toolboxBackgroundColour': 'blackBackground',
  'toolboxForegroundColour': '#73ed58',
  'flyoutBackgroundColour': '#252526',
  'flyoutForegroundColour': '#73ed58',
  'flyoutOpacity': 1,
  'scrollbarColour': '#797979',
  'insertionMarkerColour': '#fff',
  'insertionMarkerOpacity': 0.3,
  'scrollbarOpacity': 0.4,
  'cursorColour': '#d0d0d0',
  'blackBackground': '#333',},
  'fontStyle': {
  'family': 'monospace', 
  'weight': null,   
  'size': null,
  },
  'startHats': null,
});
