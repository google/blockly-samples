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
  colour_blocks: { // eslint-disable-line camelcase
    colourPrimary: '#05427f',
    colourSecondary: '#2974c0',
    colourTertiary: '#2d74bb',
  },
  list_blocks: { // eslint-disable-line camelcase
    colourPrimary: '#b69ce8',
    colourSecondary: '#ccbaef',
    colourTertiary: '#9176c5',
  },
  logic_blocks: { // eslint-disable-line camelcase
    colourPrimary: '#9fd2f1',
    colourSecondary: '#c0e0f4',
    colourTertiary: '#74bae5',
  },
  loop_blocks: { // eslint-disable-line camelcase
    colourPrimary: '#aa1846',
    colourSecondary: '#d36185',
    colourTertiary: '#7c1636',
  },
  math_blocks: { // eslint-disable-line camelcase
    colourPrimary: '#e6da39',
    colourSecondary: '#f3ec8e',
    colourTertiary: '#f2eeb7',
  },
  procedure_blocks: { // eslint-disable-line camelcase
    colourPrimary: '#590721',
    colourSecondary: '#8c475d',
    colourTertiary: '#885464',
  },
  text_blocks: { // eslint-disable-line camelcase
    colourPrimary: '#058863',
    colourSecondary: '#5ecfaf',
    colourTertiary: '#04684c',
  },
  variable_blocks: { // eslint-disable-line camelcase
    colourPrimary: '#4b2d84',
    colourSecondary: '#816ea7',
    colourTertiary: '#83759e',
  },
  variableDynamic_blocks: { // eslint-disable-line camelcase
    colourPrimary: '#4b2d84',
    colourSecondary: '#816ea7',
    colourTertiary: '#83759e',
  },
};

const categoryStyles = {
  colour_category: { // eslint-disable-line camelcase
    colour: '#05427f',
  },
  list_category: { // eslint-disable-line camelcase
    colour: '#b69ce8',
  },
  logic_category: { // eslint-disable-line camelcase
    colour: '#9fd2f1',
  },
  loop_category: { // eslint-disable-line camelcase
    colour: '#aa1846',
  },
  math_category: { // eslint-disable-line camelcase
    colour: '#e6da39',
  },
  procedure_category: { // eslint-disable-line camelcase
    colour: '#590721',
  },
  text_category: { // eslint-disable-line camelcase
    colour: '#058863',
  },
  variable_category: { // eslint-disable-line camelcase
    colour: '#4b2d84',
  },
  variable_dynamic_category: { // eslint-disable-line camelcase
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
