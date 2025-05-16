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
  colour_blocks: { // eslint-disable-line camelcase
    colourPrimary: '#0c0d0d',
    colourSecondary: '#0c0d0d',
    colourTertiary: '#edf2f2',
  },
  list_blocks: {  // eslint-disable-line camelcase
    colourPrimary: '#0c0d0d',
    colourSecondary: '#0c0d0d',
    colourTertiary: '#edf2f2',
  },
  logic_blocks: {  // eslint-disable-line camelcase
    colourPrimary: '#0c0d0d',
    colourSecondary: '#0c0d0d',
    colourTertiary: '#edf2f2',
  },
  loop_blocks: {  // eslint-disable-line camelcase
    colourPrimary: '#0c0d0d',
    colourSecondary: '#0c0d0d',
    colourTertiary: '#edf2f2',
  },
  math_blocks: {  // eslint-disable-line camelcase
    colourPrimary: '#0c0d0d',
    colourSecondary: '#0c0d0d',
    colourTertiary: '#edf2f2',
  },
  procedure_blocks: {  // eslint-disable-line camelcase
    colourPrimary: '#0c0d0d',
    colourSecondary: '#0c0d0d',
    colourTertiary: '#edf2f2',
  },
  text_blocks: {  // eslint-disable-line camelcase
    colourPrimary: '#0c0d0d',
    colourSecondary: '#0c0d0d',
    colourTertiary: '#edf2f2',
  },
  variable_blocks: {  // eslint-disable-line camelcase
    colourPrimary: '#0c0d0d',
    colourSecondary: '#0c0d0d',
    colourTertiary: '#edf2f2',
  },
  variable_dynamic_blocks: {  // eslint-disable-line camelcase
    colourPrimary: '#0c0d0d',
    colourSecondary: '#0c0d0d',
    colourTertiary: '#edf2f2',
  },
};

const categoryStyles = {
  colour_category: {  // eslint-disable-line camelcase
    colour: '#0c0d0d',
  },
  list_category: {  // eslint-disable-line camelcase
    colour: '#0c0d0d',
  },
  logic_category: {  // eslint-disable-line camelcase
    colour: '#0c0d0d',
  },
  loop_category: {  // eslint-disable-line camelcase
    colour: '#0c0d0d',
  },
  math_category: {  // eslint-disable-line camelcase
    colour: '#0c0d0d',
  },
  procedure_category: {  // eslint-disable-line camelcase
    colour: '#0c0d0d',
  },
  text_category: {  // eslint-disable-line camelcase
    colour: '#0c0d0d',
  },
  variable_category: {  // eslint-disable-line camelcase
    colour: '#0c0d0d',
  },
  variable_dynamic_category: {  // eslint-disable-line camelcase
    colour: '#0c0d0d',
  },
};

export default Blockly.Theme.defineTheme('hackermode', {
  name: 'hackermode',
  base: Blockly.Themes.Classic,
  blockStyles: defaultBlockStyles,
  categoryStyles: categoryStyles,
  componentStyles: {
    workspaceBackgroundColour: '#1e1e1e',
    toolboxBackgroundColour: '#333',
    toolboxForegroundColour: '#73ed58',
    flyoutBackgroundColour: '#252526',
    flyoutForegroundColour: '#73ed58',
    flyoutOpacity: 1,
    scrollbarColour: '#797979',
    insertionMarkerColour: '#fff',
    insertionMarkerOpacity: 0.3,
    scrollbarOpacity: 0.4,
    cursorColour: '#d0d0d0',
  },
  fontStyle: {
    family: 'monospace',
    weight: undefined,
    size: undefined,
  },
  startHats: undefined,
});
