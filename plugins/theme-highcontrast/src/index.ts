/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview High contrast theme.
 *
 * Darker colours to contrast the white font.
 */

import * as Blockly from 'blockly/core';

const defaultBlockStyles = {
  colour_blocks: { // eslint-disable-line camelcase
    colourPrimary: '#a52714',
    colourSecondary: '#FB9B8C',
    colourTertiary: '#FBE1DD',
  },
  listBlocks: {
    colourPrimary: '#4a148c',
    colourSecondary: '#AD7BE9',
    colourTertiary: '#CDB6E9',
  },
  logicBlocks: {
    colourPrimary: '#01579b',
    colourSecondary: '#64C7FF',
    colourTertiary: '#C5EAFF',
  },
  loopBlocks: {
    colourPrimary: '#33691e',
    colourSecondary: '#9AFF78',
    colourTertiary: '#E1FFD7',
  },
  mathBlocks: {
    colourPrimary: '#1a237e',
    colourSecondary: '#8A9EFF',
    colourTertiary: '#DCE2FF',
  },
  procedureBlocks: {
    colourPrimary: '#006064',
    colourSecondary: '#77E6EE',
    colourTertiary: '#CFECEE',
  },
  textBlocks: {
    colourPrimary: '#004d40',
    colourSecondary: '#5ae27c',
    colourTertiary: '#D2FFDD',
  },
  variableBlocks: {
    colourPrimary: '#880e4f',
    colourSecondary: '#FF73BE',
    colourTertiary: '#FFD4EB',
  },
  variableDynamicBlocks: {
    colourPrimary: '#880e4f',
    colourSecondary: '#FF73BE',
    colourTertiary: '#FFD4EB',
  },
  hatBlocks: {
    colourPrimary: '#880e4f',
    colourSecondary: '#FF73BE',
    colourTertiary: '#FFD4EB',
    hat: 'cap',
  },
};

const categoryStyles = {
  colourCategory: {colour: '#a52714'},
  listCategory: {colour: '#4a148c'},
  logicCategory: {colour: '#01579b'},
  loopCategory: {colour: '#33691e'},
  mathCategory: {colour: '#1a237e'},
  procedureCategory: {colour: '#006064'},
  textCategory: {colour: '#004d40'},
  variableCategory: {colour: '#880e4f'},
  variableDynamicCategory: {colour: '#880e4f'},
};

/**
 * High contrast theme.
 */
export default Blockly.Theme.defineTheme('highcontrast', {
  name: 'highcontrast',
  blockStyles: defaultBlockStyles,
  categoryStyles: categoryStyles,
  componentStyles: {
    selectedGlowColour: '#000000',
    // selectedGlowSize: 1,
    replacementGlowColour: '#000000',
  },
  fontStyle: {
    family: undefined, // Use default font-family.
    weight: undefined, // Use default font-weight.
    size: 16,
  },
  startHats: undefined,
});
