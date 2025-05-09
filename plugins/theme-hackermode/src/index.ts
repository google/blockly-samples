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
  listBlocks: {
    colourPrimary: '#0c0d0d',
    colourSecondary: '#0c0d0d',
    colourTertiary: '#edf2f2',
  },
  logicBlocks: {
    colourPrimary: '#0c0d0d',
    colourSecondary: '#0c0d0d',
    colourTertiary: '#edf2f2',
  },
  loopBlocks: {
    colourPrimary: '#0c0d0d',
    colourSecondary: '#0c0d0d',
    colourTertiary: '#edf2f2',
  },
  mathBlocks: {
    colourPrimary: '#0c0d0d',
    colourSecondary: '#0c0d0d',
    colourTertiary: '#edf2f2',
  },
  procedureBlocks: {
    colourPrimary: '#0c0d0d',
    colourSecondary: '#0c0d0d',
    colourTertiary: '#edf2f2',
  },
  textBlocks: {
    colourPrimary: '#0c0d0d',
    colourSecondary: '#0c0d0d',
    colourTertiary: '#edf2f2',
  },
  variableBlocks: {
    colourPrimary: '#0c0d0d',
    colourSecondary: '#0c0d0d',
    colourTertiary: '#edf2f2',
  },
  variableDynamicBlocks: {
    colourPrimary: '#0c0d0d',
    colourSecondary: '#0c0d0d',
    colourTertiary: '#edf2f2',
  },
};

const categoryStyles = {
  colourCategory: {
    colour: '#0c0d0d',
  },
  listCategory: {
    colour: '#0c0d0d',
  },
  logicCategory: {
    colour: '#0c0d0d',
  },
  loopCategory: {
    colour: '#0c0d0d',
  },
  mathCategory: {
    colour: '#0c0d0d',
  },
  procedureCategory: {
    colour: '#0c0d0d',
  },
  textCategory: {
    colour: '#0c0d0d',
  },
  variableCategory: {
    colour: '#0c0d0d',
  },
  variableDynamicCategory: {
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
