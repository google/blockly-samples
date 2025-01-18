/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Deuteranopia theme.
 */

import * as Blockly from 'blockly/core';

const defaultBlockStyles = {
  colourBlocks: {
    colourPrimary: '#f2a72c',
    colourSecondary: '#f1c172',
    colourTertiary: '#da921c',
  },
  listBlocks: {
    colourPrimary: '#7d65ab',
    colourSecondary: '#a88be0',
    colourTertiary: '#66518e',
  },
  logicBlocks: {
    colourPrimary: '#9fd2f1',
    colourSecondary: '#c0e0f4',
    colourTertiary: '#74bae5',
  },
  loopBlocks: {
    colourPrimary: '#795a07',
    colourSecondary: '#ac8726',
    colourTertiary: '#c4a03f',
  },
  mathBlocks: {
    colourPrimary: '#e6da39',
    colourSecondary: '#f3ec8e',
    colourTertiary: '#f2eeb7',
  },
  procedureBlocks: {
    colourPrimary: '#590721',
    colourSecondary: '#8c475d',
    colourTertiary: '#885464',
  },
  textBlocks: {
    colourPrimary: '#058863',
    colourSecondary: '#5ecfaf',
    colourTertiary: '#04684c',
  },
  variableBlocks: {
    colourPrimary: '#47025a',
    colourSecondary: '#820fa1',
    colourTertiary: '#8e579d',
  },
  variableDynamicBlocks: {
    colourPrimary: '#47025a',
    colourSecondary: '#820fa1',
    colourTertiary: '#8e579d',
  },
};

const categoryStyles = {
  colourCategory: {
    colour: '#f2a72c',
  },
  listCategory: {
    colour: '#7d65ab',
  },
  logicCategory: {
    colour: '#9fd2f1',
  },
  loopCategory: {
    colour: '#795a07',
  },
  mathCategory: {
    colour: '#e6da39',
  },
  procedureCategory: {
    colour: '#590721',
  },
  textCategory: {
    colour: '#058863',
  },
  variableCategory: {
    colour: '#47025a',
  },
  variableDynamicCategory: {
    colour: '#47025a',
  },
};

/**
 * Deuteranopia theme.
 * A colour palette for people that have deuteranopia (the inability to perceive
 * green light). This can also be used for people that have protanopia (the
 * inability to perceive red light).
 */
export default Blockly.Theme.defineTheme('deuteranopia', {
  name: 'deuteranopia',
  base: Blockly.Themes.Classic,
  blockStyles: defaultBlockStyles,
  categoryStyles: categoryStyles,
  componentStyles: {},
  fontStyle: {},
  startHats: undefined,
});
