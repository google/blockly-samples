/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Tritanopia theme.
 */

import * as Blockly from 'blockly/core';

const defaultBlockStyles = {
  colourBlocks: {
    colourPrimary: '#05427f',
    colourSecondary: '#2974c0',
    colourTertiary: '#2d74bb',
  },
  listBlocks: {
    colourPrimary: '#b69ce8',
    colourSecondary: '#ccbaef',
    colourTertiary: '#9176c5',
  },
  logicBlocks: {
    colourPrimary: '#9fd2f1',
    colourSecondary: '#c0e0f4',
    colourTertiary: '#74bae5',
  },
  loopBlocks: {
    colourPrimary: '#aa1846',
    colourSecondary: '#d36185',
    colourTertiary: '#7c1636',
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
    colourPrimary: '#4b2d84',
    colourSecondary: '#816ea7',
    colourTertiary: '#83759e',
  },
  variableDynamicBlocks: {
    colourPrimary: '#4b2d84',
    colourSecondary: '#816ea7',
    colourTertiary: '#83759e',
  },
};

const categoryStyles = {
  colourCategory: {
    colour: '#05427f',
  },
  listCategory: {
    colour: '#b69ce8',
  },
  logicCategory: {
    colour: '#9fd2f1',
  },
  loopCategory: {
    colour: '#aa1846',
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
    colour: '#4b2d84',
  },
  variableDynamicCategory: {
    colour: '#4b2d84',
  },
};

/**
 * Tritanopia theme.
 * A colour palette for people that have tritanopia (the inability to perceive
 * blue light).
 */
export default Blockly.Theme.defineTheme('tritanopia', {
  name: 'tritanopia',
  blockStyles: defaultBlockStyles,
  categoryStyles: categoryStyles,
  componentStyles: {},
  fontStyle: {},
  startHats: undefined,
});
